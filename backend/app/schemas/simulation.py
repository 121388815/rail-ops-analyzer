from pydantic import BaseModel, Field

from app.schemas.analysis import AnalysisRules, Metrics


class DelaySimulationRequest(BaseModel):
    dataset_id: str
    train_id: str
    delay_sec: int = Field(default=480, ge=60, le=7200)
    rules: AnalysisRules = Field(default_factory=AnalysisRules)


class SimulatedStop(BaseModel):
    station_id: str
    station_name: str
    planned_arr_sec: int | None
    actual_arr_sec: int | None
    planned_dep_sec: int | None
    actual_dep_sec: int | None
    delay_sec: int


class SimulatedTrain(BaseModel):
    train_id: str
    train_no: str
    direction: str
    max_delay_sec: int
    stops: list[SimulatedStop]


class DelaySimulationResponse(BaseModel):
    run_id: str
    dataset_id: str
    injected_train_id: str
    injected_delay_sec: int
    status: str = "COMPLETED"
    metrics: Metrics
    trains: list[SimulatedTrain]
    disclaimer: str

