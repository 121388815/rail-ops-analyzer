from app.domain.conflict_detector import detect_headway_conflicts, detect_overlaps
from app.domain.occupancy import build_track_occupancies
from app.schemas.analysis import AnalysisRules, Occupancy
from app.services.dataset_service import ensure_demo_dataset


def occupancy(train_id: str, start: int, end: int) -> Occupancy:
    return Occupancy(
        resource_id="track-1", resource_code="1道", train_id=train_id,
        train_no=train_id.upper(), start_sec=start, end_sec=end,
        planned_arr_sec=start, planned_dep_sec=end,
    )


def test_adjacent_half_open_intervals_do_not_conflict() -> None:
    assert detect_overlaps([occupancy("a", 0, 300), occupancy("b", 300, 600)]) == []


def test_triple_overlap_reports_every_pair() -> None:
    conflicts = detect_overlaps([
        occupancy("a", 0, 600), occupancy("b", 120, 480), occupancy("c", 240, 720)
    ])
    assert len(conflicts) == 3
    assert all(item.type == "TRACK_OVERLAP" for item in conflicts)


def test_demo_contains_track_and_headway_conflicts() -> None:
    dataset = ensure_demo_dataset()
    rules = AnalysisRules()
    occupancies = build_track_occupancies(dataset, rules)

    track_conflicts = detect_overlaps(occupancies)
    headway_conflicts = detect_headway_conflicts(dataset, rules)

    assert any(set(item.train_nos) == {"G101", "D205"} for item in track_conflicts)
    assert any(item.gap_sec == 120 for item in headway_conflicts)

