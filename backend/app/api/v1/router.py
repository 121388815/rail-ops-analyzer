from fastapi import APIRouter

from app.api.v1.endpoints import analyses, datasets, health, reports, simulations


api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(datasets.router, tags=["datasets"])
api_router.include_router(analyses.router, tags=["analyses"])
api_router.include_router(simulations.router, tags=["simulations"])
api_router.include_router(reports.router, tags=["reports"])
