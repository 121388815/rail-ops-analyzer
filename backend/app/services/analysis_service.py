from uuid import uuid4

from app.domain.conflict_detector import (
    detect_duration_conflicts,
    detect_headway_conflicts,
    detect_overlaps,
)
from app.domain.delay_simulator import simulate_delay
from app.domain.occupancy import build_track_occupancies
from app.schemas.analysis import ConflictAnalysisResponse, ConflictAnalysisRequest, Metrics
from app.schemas.dataset import Dataset
from app.schemas.simulation import DelaySimulationRequest, DelaySimulationResponse


_analysis_runs: dict[str, ConflictAnalysisResponse] = {}
_simulation_runs: dict[str, DelaySimulationResponse] = {}


def run_conflict_analysis(dataset: Dataset, request: ConflictAnalysisRequest) -> ConflictAnalysisResponse:
    occupancies = build_track_occupancies(dataset, request.rules)
    conflicts = [
        *detect_overlaps(occupancies),
        *detect_headway_conflicts(dataset, request.rules),
        *detect_duration_conflicts(dataset, request.rules),
    ]
    run_id = str(uuid4())
    result = ConflictAnalysisResponse(
        run_id=run_id, dataset_id=dataset.id, rules=request.rules,
        metrics=Metrics(
            train_count=len(dataset.trains), conflict_count=len(conflicts),
            high_severity_count=sum(item.severity == "HIGH" for item in conflicts),
        ),
        occupancies=occupancies, conflicts=conflicts, disclaimer=dataset.disclaimer,
    )
    _analysis_runs[run_id] = result
    return result


def get_analysis(run_id: str) -> ConflictAnalysisResponse | None:
    return _analysis_runs.get(run_id)


def run_delay_simulation(dataset: Dataset, request: DelaySimulationRequest) -> DelaySimulationResponse:
    run_id = str(uuid4())
    result = simulate_delay(dataset, request.train_id, request.delay_sec, request.rules, run_id)
    _simulation_runs[run_id] = result
    return result


def get_simulation(run_id: str) -> DelaySimulationResponse | None:
    return _simulation_runs.get(run_id)


def get_any_run(run_id: str) -> ConflictAnalysisResponse | DelaySimulationResponse | None:
    return _analysis_runs.get(run_id) or _simulation_runs.get(run_id)

