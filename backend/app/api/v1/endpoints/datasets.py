from fastapi import APIRouter, HTTPException, Response, status

from app.schemas.analysis import DiagramResponse
from app.schemas.dataset import Dataset, DatasetSummary, SampleDatasetRequest, Train
from app.services.dataset_service import ensure_demo_dataset, get_dataset, get_diagram, list_datasets


router = APIRouter(prefix="/datasets")


@router.get("", response_model=list[DatasetSummary])
def datasets_list() -> list[DatasetSummary]:
    return list_datasets()


@router.post("/sample", response_model=Dataset, status_code=status.HTTP_201_CREATED)
def create_sample(request: SampleDatasetRequest) -> Dataset:
    if request.sample_key != "demo-central-01":
        raise HTTPException(status_code=404, detail="未找到指定的预置案例")
    return ensure_demo_dataset()


@router.get("/{dataset_id}", response_model=Dataset)
def dataset_detail(dataset_id: str) -> Dataset:
    dataset = get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    return dataset


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(dataset_id: str) -> Response:
    if dataset_id == "demo-central-01":
        raise HTTPException(status_code=409, detail="内置演示数据不可删除")
    raise HTTPException(status_code=404, detail="数据集不存在")


@router.get("/{dataset_id}/trains", response_model=list[Train])
def dataset_trains(dataset_id: str, train_no: str | None = None) -> list[Train]:
    dataset = get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    if train_no:
        return [train for train in dataset.trains if train.train_no == train_no]
    return dataset.trains


@router.get("/{dataset_id}/diagram", response_model=DiagramResponse)
def dataset_diagram(dataset_id: str) -> DiagramResponse:
    dataset = get_dataset(dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    return get_diagram(dataset)

