from typing import Literal

from pydantic import BaseModel, Field, model_validator


Direction = Literal["UP", "DOWN"]


class Station(BaseModel):
    id: str
    code: str
    name: str
    sequence: int
    mileage_km: float


class Track(BaseModel):
    id: str
    station_id: str
    code: str
    type: str = "ARRIVAL_DEPARTURE"
    direction: Direction | Literal["BOTH"] = "BOTH"
    capacity: int = 1


class Section(BaseModel):
    id: str
    from_station_id: str
    to_station_id: str
    direction: Direction
    min_run_sec: int = Field(gt=0)
    min_headway_sec: int = Field(gt=0)


class StopPlan(BaseModel):
    station_id: str
    arr_sec: int | None = Field(default=None, ge=0)
    dep_sec: int | None = Field(default=None, ge=0)
    track_id: str | None = None
    stop_type: Literal["ORIGIN", "STOP", "PASS", "DESTINATION"] = "STOP"

    @model_validator(mode="after")
    def validate_times(self) -> "StopPlan":
        if self.arr_sec is None and self.dep_sec is None:
            raise ValueError("到达和出发时刻不能同时为空")
        if self.arr_sec is not None and self.dep_sec is not None and self.dep_sec < self.arr_sec:
            raise ValueError("出发时刻不能早于到达时刻；跨日时刻请转换为次日秒数")
        return self


class Train(BaseModel):
    id: str
    train_no: str
    category: str
    direction: Direction
    priority: int = Field(ge=0, le=100)
    stops: list[StopPlan]


class Dataset(BaseModel):
    id: str
    name: str
    service_date: str
    source_type: Literal["SAMPLE", "IMPORTED"] = "SAMPLE"
    status: Literal["READY", "DRAFT"] = "READY"
    created_at: str
    stations: list[Station]
    tracks: list[Track]
    sections: list[Section]
    trains: list[Train]
    disclaimer: str


class DatasetSummary(BaseModel):
    id: str
    name: str
    service_date: str
    status: str
    train_count: int
    station_count: int
    created_at: str


class SampleDatasetRequest(BaseModel):
    sample_key: str = "demo-central-01"

