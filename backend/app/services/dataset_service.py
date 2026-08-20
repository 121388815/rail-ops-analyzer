import json
from copy import deepcopy
from pathlib import Path

from app.domain.occupancy import build_track_occupancies
from app.schemas.analysis import AnalysisRules, DiagramPoint, DiagramResponse, DiagramTrain
from app.schemas.dataset import Dataset, DatasetSummary


DATA_FILE = Path(__file__).parents[1] / "data" / "demo_dataset.json"
_datasets: dict[str, Dataset] = {}


def _load_demo() -> Dataset:
    return Dataset.model_validate(json.loads(DATA_FILE.read_text(encoding="utf-8")))


def ensure_demo_dataset() -> Dataset:
    if "demo-central-01" not in _datasets:
        demo = _load_demo()
        _datasets[demo.id] = demo
    return deepcopy(_datasets["demo-central-01"])


def list_datasets() -> list[DatasetSummary]:
    ensure_demo_dataset()
    return [
        DatasetSummary(
            id=item.id, name=item.name, service_date=item.service_date, status=item.status,
            train_count=len(item.trains), station_count=len(item.stations), created_at=item.created_at,
        )
        for item in _datasets.values()
    ]


def get_dataset(dataset_id: str) -> Dataset | None:
    ensure_demo_dataset()
    dataset = _datasets.get(dataset_id)
    return deepcopy(dataset) if dataset else None


def get_diagram(dataset: Dataset) -> DiagramResponse:
    stations = {station.id: station for station in dataset.stations}
    trains = [
        DiagramTrain(
            train_id=train.id, train_no=train.train_no, direction=train.direction,
            category=train.category,
            points=[
                DiagramPoint(
                    station_id=stop.station_id, station_name=stations[stop.station_id].name,
                    mileage_km=stations[stop.station_id].mileage_km,
                    arr_sec=stop.arr_sec, dep_sec=stop.dep_sec,
                )
                for stop in train.stops
            ],
        )
        for train in dataset.trains
    ]
    return DiagramResponse(
        dataset_id=dataset.id,
        stations=[station.model_dump() for station in sorted(dataset.stations, key=lambda item: item.sequence)],
        trains=trains,
        occupancies=build_track_occupancies(dataset, AnalysisRules()),
    )

