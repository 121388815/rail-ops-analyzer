from typing import Literal

from pydantic import BaseModel, Field


Severity = Literal["HIGH", "MEDIUM", "LOW"]


class AnalysisRules(BaseModel):
    min_headway_sec: int = Field(default=300, ge=0)
    track_approach_sec: int = Field(default=120, ge=0)
    track_clearance_sec: int = Field(default=120, ge=0)
    min_dwell_sec: int = Field(default=120, ge=0)


class Occupancy(BaseModel):
    resource_id: str
    resource_code: str
    train_id: str
    train_no: str
    start_sec: int
    end_sec: int
    planned_arr_sec: int
    planned_dep_sec: int


class Conflict(BaseModel):
    id: str
    type: Literal["TRACK_OVERLAP", "HEADWAY_SHORT", "DWELL_TOO_SHORT", "RUN_TOO_SHORT"]
    resource_id: str
    resource_name: str
    start_sec: int
    end_sec: int
    severity: Severity
    train_ids: list[str]
    train_nos: list[str]
    gap_sec: int | None = None
    suggestion: str


class Metrics(BaseModel):
    train_count: int
    conflict_count: int
    high_severity_count: int
    on_time_rate: float = 100.0
    average_delay_sec: float = 0.0
    affected_train_count: int = 0


class ConflictAnalysisRequest(BaseModel):
    dataset_id: str
    rules: AnalysisRules = Field(default_factory=AnalysisRules)


class ConflictAnalysisResponse(BaseModel):
    run_id: str
    dataset_id: str
    status: str = "COMPLETED"
    rules: AnalysisRules
    metrics: Metrics
    occupancies: list[Occupancy]
    conflicts: list[Conflict]
    disclaimer: str


class DiagramPoint(BaseModel):
    station_id: str
    station_name: str
    mileage_km: float
    arr_sec: int | None
    dep_sec: int | None


class DiagramTrain(BaseModel):
    train_id: str
    train_no: str
    direction: str
    category: str
    points: list[DiagramPoint]


class DiagramResponse(BaseModel):
    dataset_id: str
    stations: list[dict]
    trains: list[DiagramTrain]
    occupancies: list[Occupancy]

