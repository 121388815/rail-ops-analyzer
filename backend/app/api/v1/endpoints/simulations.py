from fastapi import APIRouter, HTTPException

from app.schemas.simulation import DelaySimulationRequest, DelaySimulationResponse
from app.services.analysis_service import get_simulation, run_delay_simulation
from app.services.dataset_service import get_dataset


router = APIRouter(prefix="/simulations")


@router.post("/delay", response_model=DelaySimulationResponse)
def simulate(request: DelaySimulationRequest) -> DelaySimulationResponse:
    dataset = get_dataset(request.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    try:
        return run_delay_simulation(dataset, request)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc


@router.get("/{run_id}", response_model=DelaySimulationResponse)
def simulation_detail(run_id: str) -> DelaySimulationResponse:
    result = get_simulation(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="仿真任务不存在")
    return result

