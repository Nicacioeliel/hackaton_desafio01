from fastapi import APIRouter

from app.api.v1.endpoints import analyses, arts, cnpj, dashboard, uploads

api_router = APIRouter(prefix="/api/v1")
api_router.include_router(arts.router, prefix="/arts", tags=["arts"])
api_router.include_router(uploads.router, prefix="/uploads", tags=["uploads"])
api_router.include_router(analyses.router, prefix="/analyses", tags=["analyses"])
api_router.include_router(cnpj.router, prefix="/cnpj", tags=["cnpj"])
api_router.include_router(dashboard.router, tags=["dashboard"])
