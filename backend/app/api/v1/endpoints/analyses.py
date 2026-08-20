from fastapi import APIRouter, HTTPException

from app.schemas.analysis import ConflictAnalysisRequest, ConflictAnalysisResponse
from app.services.analysis_service import get_analysis, run_conflict_analysis
from app.services.dataset_service import get_dataset


router = APIRouter(prefix="/analyses")


@router.post("/conflicts", response_model=ConflictAnalysisResponse)
def analyze_conflicts(request: ConflictAnalysisRequest) -> ConflictAnalysisResponse:
    dataset = get_dataset(request.dataset_id)
    if not dataset:
        raise HTTPException(status_code=404, detail="数据集不存在")
    return run_conflict_analysis(dataset, request)


@router.get("/{run_id}", response_model=ConflictAnalysisResponse)
def analysis_detail(run_id: str) -> ConflictAnalysisResponse:
    result = get_analysis(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="分析任务不存在")
    return result

