from collections import defaultdict
from uuid import uuid4

from app.domain.recommendation import headway_suggestion, track_overlap_suggestion
from app.schemas.analysis import AnalysisRules, Conflict, Occupancy
from app.schemas.dataset import Dataset


def detect_overlaps(occupancies: list[Occupancy]) -> list[Conflict]:
    grouped: dict[str, list[Occupancy]] = defaultdict(list)
    for occupancy in occupancies:
        grouped[occupancy.resource_id].append(occupancy)
    conflicts: list[Conflict] = []
    for intervals in grouped.values():
        ordered = sorted(intervals, key=lambda item: (item.start_sec, item.end_sec))
        for index, current in enumerate(ordered):
            for previous in reversed(ordered[:index]):
                if previous.end_sec <= current.start_sec:
                    break
                overlap_start = max(previous.start_sec, current.start_sec)
                overlap_end = min(previous.end_sec, current.end_sec)
                if overlap_start < overlap_end:
                    conflicts.append(
                        Conflict(
                            id=str(uuid4()), type="TRACK_OVERLAP",
                            resource_id=current.resource_id, resource_name=f"股道 {current.resource_code}",
                            start_sec=overlap_start, end_sec=overlap_end, severity="HIGH",
                            train_ids=[previous.train_id, current.train_id],
                            train_nos=[previous.train_no, current.train_no], gap_sec=overlap_end - overlap_start,
                            suggestion=track_overlap_suggestion(
                                [previous.train_no, current.train_no], overlap_end - overlap_start
                            ),
                        )
                    )
    return conflicts


def detect_headway_conflicts(dataset: Dataset, rules: AnalysisRules) -> list[Conflict]:
    sections_by_pair = {
        (section.from_station_id, section.to_station_id, section.direction): section
        for section in dataset.sections
    }
    entries: dict[str, list[tuple[int, str, str]]] = defaultdict(list)
    for train in dataset.trains:
        for first, second in zip(train.stops, train.stops[1:]):
            section = sections_by_pair.get((first.station_id, second.station_id, train.direction))
            if section and first.dep_sec is not None:
                entries[section.id].append((first.dep_sec, train.id, train.train_no))
    conflicts: list[Conflict] = []
    sections = {section.id: section for section in dataset.sections}
    for section_id, runs in entries.items():
        ordered = sorted(runs)
        section = sections[section_id]
        minimum = max(rules.min_headway_sec, section.min_headway_sec)
        for previous, current in zip(ordered, ordered[1:]):
            actual_gap = current[0] - previous[0]
            if actual_gap < minimum:
                shortage = minimum - actual_gap
                conflicts.append(
                    Conflict(
                        id=str(uuid4()), type="HEADWAY_SHORT", resource_id=section_id,
                        resource_name=f"区间 {section.from_station_id} → {section.to_station_id}",
                        start_sec=previous[0], end_sec=current[0], severity="HIGH",
                        train_ids=[previous[1], current[1]], train_nos=[previous[2], current[2]],
                        gap_sec=shortage, suggestion=headway_suggestion(current[2], shortage),
                    )
                )
    return conflicts


def detect_duration_conflicts(dataset: Dataset, rules: AnalysisRules) -> list[Conflict]:
    sections = {
        (section.from_station_id, section.to_station_id, section.direction): section
        for section in dataset.sections
    }
    conflicts: list[Conflict] = []
    for train in dataset.trains:
        for stop in train.stops:
            if stop.arr_sec is not None and stop.dep_sec is not None:
                dwell = stop.dep_sec - stop.arr_sec
                if stop.stop_type == "STOP" and dwell < rules.min_dwell_sec:
                    conflicts.append(
                        Conflict(
                            id=str(uuid4()), type="DWELL_TOO_SHORT", resource_id=stop.station_id,
                            resource_name=f"车站 {stop.station_id}", start_sec=stop.arr_sec,
                            end_sec=stop.dep_sec, severity="MEDIUM", train_ids=[train.id],
                            train_nos=[train.train_no], gap_sec=rules.min_dwell_sec - dwell,
                            suggestion="建议延长计划停站时分。算法建议，仅用于模拟分析。",
                        )
                    )
        for first, second in zip(train.stops, train.stops[1:]):
            section = sections.get((first.station_id, second.station_id, train.direction))
            if section and first.dep_sec is not None and second.arr_sec is not None:
                runtime = second.arr_sec - first.dep_sec
                if runtime < section.min_run_sec:
                    conflicts.append(
                        Conflict(
                            id=str(uuid4()), type="RUN_TOO_SHORT", resource_id=section.id,
                            resource_name=f"区间 {first.station_id} → {second.station_id}",
                            start_sec=first.dep_sec, end_sec=second.arr_sec, severity="MEDIUM",
                            train_ids=[train.id], train_nos=[train.train_no],
                            gap_sec=section.min_run_sec - runtime,
                            suggestion="建议校正区间运行时分。算法建议，仅用于模拟分析。",
                        )
                    )
    return conflicts

