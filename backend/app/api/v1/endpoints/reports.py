from fastapi import APIRouter, HTTPException
from fastapi.responses import JSONResponse, Response

from app.schemas.analysis import ConflictAnalysisResponse
from app.services.analysis_service import get_any_run
from app.services.report_service import conflicts_to_csv


router = APIRouter(prefix="/reports")


@router.get("/{run_id}.json")
def export_json(run_id: str) -> JSONResponse:
    result = get_any_run(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="分析任务不存在")
    return JSONResponse(
        result.model_dump(mode="json"),
        headers={"Content-Disposition": f'attachment; filename="railops-{run_id}.json"'},
    )


@router.get("/{run_id}.csv")
def export_csv(run_id: str) -> Response:
    result = get_any_run(run_id)
    if not result:
        raise HTTPException(status_code=404, detail="分析任务不存在")
    if not isinstance(result, ConflictAnalysisResponse):
        raise HTTPException(status_code=409, detail="CSV 导出仅适用于冲突分析结果")
    return Response(
        conflicts_to_csv(result), media_type="text/csv; charset=utf-8",
        headers={"Content-Disposition": f'attachment; filename="railops-{run_id}.csv"'},
    )

