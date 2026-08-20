from collections import defaultdict
from copy import deepcopy

from app.schemas.analysis import AnalysisRules, Metrics
from app.schemas.dataset import Dataset
from app.schemas.simulation import DelaySimulationResponse, SimulatedStop, SimulatedTrain


def _shift_from(stops: list[dict], start_index: int, delay: int) -> None:
    if delay <= 0:
        return
    for stop in stops[start_index:]:
        if stop["actual_arr"] is not None:
            stop["actual_arr"] += delay
        if stop["actual_dep"] is not None:
            stop["actual_dep"] += delay


def simulate_delay(
    dataset: Dataset,
    target_train_id: str,
    delay_sec: int,
    rules: AnalysisRules,
    run_id: str,
) -> DelaySimulationResponse:
    if not any(train.id == target_train_id for train in dataset.trains):
        raise ValueError("未找到要注入晚点的列车")

    state: dict[str, list[dict]] = {}
    for train in dataset.trains:
        state[train.id] = [
            {
                "station_id": stop.station_id,
                "track_id": stop.track_id,
                "planned_arr": stop.arr_sec,
                "planned_dep": stop.dep_sec,
                "actual_arr": stop.arr_sec,
                "actual_dep": stop.dep_sec,
                "stop_type": stop.stop_type,
            }
            for stop in deepcopy(train.stops)
        ]

    _shift_from(state[target_train_id], 0, delay_sec)
    train_map = {train.id: train for train in dataset.trains}
    section_map = {
        (section.from_station_id, section.to_station_id, section.direction): section
        for section in dataset.sections
    }

    for _ in range(12):
        before = tuple(
            (item["actual_arr"], item["actual_dep"])
            for train_id in sorted(state)
            for item in state[train_id]
        )

        # Preserve minimum dwell and running time inside each train path.
        for train in dataset.trains:
            stops = state[train.id]
            for index, stop in enumerate(stops):
                if stop["actual_arr"] is not None and stop["actual_dep"] is not None:
                    minimum_dwell = rules.min_dwell_sec if stop["stop_type"] == "STOP" else 0
                    required_dep = max(stop["planned_dep"], stop["actual_arr"] + minimum_dwell)
                    if required_dep > stop["actual_dep"]:
                        _shift_from(stops, index, required_dep - stop["actual_dep"])
                if index + 1 >= len(stops):
                    continue
                following = stops[index + 1]
                section = section_map.get(
                    (stop["station_id"], following["station_id"], train.direction)
                )
                if section and stop["actual_dep"] is not None and following["actual_arr"] is not None:
                    required_arr = stop["actual_dep"] + section.min_run_sec
                    if required_arr > following["actual_arr"]:
                        _shift_from(stops, index + 1, required_arr - following["actual_arr"])

        # Keep the planned order on each station track and propagate occupation delay.
        track_calls: dict[str, list[tuple[int, str, int]]] = defaultdict(list)
        for train in dataset.trains:
            for index, stop in enumerate(state[train.id]):
                if stop["track_id"] and stop["planned_arr"] is not None:
                    track_calls[stop["track_id"]].append((stop["planned_arr"], train.id, index))
        for calls in track_calls.values():
            ordered = sorted(calls)
            for previous, current in zip(ordered, ordered[1:]):
                previous_stop = state[previous[1]][previous[2]]
                current_stop = state[current[1]][current[2]]
                if previous_stop["actual_dep"] is None or current_stop["actual_arr"] is None:
                    continue
                required_arr = previous_stop["actual_dep"] + rules.track_clearance_sec
                if required_arr > current_stop["actual_arr"]:
                    _shift_from(
                        state[current[1]], current[2], required_arr - current_stop["actual_arr"]
                    )

        # Keep planned order at section entrances and enforce minimum headway.
        section_entries: dict[str, list[tuple[int, str, int, int]]] = defaultdict(list)
        for train in dataset.trains:
            stops = state[train.id]
            for index, (first, second) in enumerate(zip(stops, stops[1:])):
                section = section_map.get((first["station_id"], second["station_id"], train.direction))
                if section and first["planned_dep"] is not None:
                    minimum = max(rules.min_headway_sec, section.min_headway_sec)
                    section_entries[section.id].append((first["planned_dep"], train.id, index, minimum))
        for entries in section_entries.values():
            ordered = sorted(entries)
            for previous, current in zip(ordered, ordered[1:]):
                previous_dep = state[previous[1]][previous[2]]["actual_dep"]
                current_dep = state[current[1]][current[2]]["actual_dep"]
                if previous_dep is None or current_dep is None:
                    continue
                required_dep = previous_dep + current[3]
                if required_dep > current_dep:
                    _shift_from(state[current[1]], current[2], required_dep - current_dep)

        after = tuple(
            (item["actual_arr"], item["actual_dep"])
            for train_id in sorted(state)
            for item in state[train_id]
        )
        if before == after:
            break

    station_names = {station.id: station.name for station in dataset.stations}
    simulated_trains: list[SimulatedTrain] = []
    max_delays: list[int] = []
    for train_id, stops in state.items():
        train = train_map[train_id]
        output_stops: list[SimulatedStop] = []
        train_delay = 0
        for stop in stops:
            delays = []
            if stop["planned_arr"] is not None and stop["actual_arr"] is not None:
                delays.append(stop["actual_arr"] - stop["planned_arr"])
            if stop["planned_dep"] is not None and stop["actual_dep"] is not None:
                delays.append(stop["actual_dep"] - stop["planned_dep"])
            stop_delay = max(delays, default=0)
            train_delay = max(train_delay, stop_delay)
            output_stops.append(
                SimulatedStop(
                    station_id=stop["station_id"], station_name=station_names[stop["station_id"]],
                    planned_arr_sec=stop["planned_arr"], actual_arr_sec=stop["actual_arr"],
                    planned_dep_sec=stop["planned_dep"], actual_dep_sec=stop["actual_dep"],
                    delay_sec=stop_delay,
                )
            )
        max_delays.append(train_delay)
        simulated_trains.append(
            SimulatedTrain(
                train_id=train.id, train_no=train.train_no, direction=train.direction,
                max_delay_sec=train_delay, stops=output_stops,
            )
        )

    affected = [delay for delay in max_delays if delay > 0]
    metrics = Metrics(
        train_count=len(dataset.trains), conflict_count=0, high_severity_count=0,
        on_time_rate=round((len(max_delays) - len(affected)) / len(max_delays) * 100, 1),
        average_delay_sec=round(sum(max_delays) / len(max_delays), 1),
        affected_train_count=len(affected),
    )
    return DelaySimulationResponse(
        run_id=run_id, dataset_id=dataset.id, injected_train_id=target_train_id,
        injected_delay_sec=delay_sec, metrics=metrics, trains=simulated_trains,
        disclaimer=dataset.disclaimer,
    )

