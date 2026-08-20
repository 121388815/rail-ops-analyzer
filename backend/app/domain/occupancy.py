from app.schemas.analysis import AnalysisRules, Occupancy
from app.schemas.dataset import Dataset


def build_track_occupancies(dataset: Dataset, rules: AnalysisRules) -> list[Occupancy]:
    tracks = {track.id: track for track in dataset.tracks}
    occupancies: list[Occupancy] = []
    for train in dataset.trains:
        for stop in train.stops:
            if not stop.track_id or stop.track_id not in tracks:
                continue
            timestamp = stop.arr_sec if stop.arr_sec is not None else stop.dep_sec
            if timestamp is None:
                continue
            arrival = stop.arr_sec if stop.arr_sec is not None else timestamp
            departure = stop.dep_sec if stop.dep_sec is not None else timestamp
            occupancies.append(
                Occupancy(
                    resource_id=stop.track_id,
                    resource_code=tracks[stop.track_id].code,
                    train_id=train.id,
                    train_no=train.train_no,
                    start_sec=max(0, arrival - rules.track_approach_sec),
                    end_sec=departure + rules.track_clearance_sec,
                    planned_arr_sec=arrival,
                    planned_dep_sec=departure,
                )
            )
    return sorted(occupancies, key=lambda item: (item.resource_id, item.start_sec, item.end_sec))

