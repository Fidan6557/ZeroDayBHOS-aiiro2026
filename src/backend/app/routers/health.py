from fastapi import APIRouter

from app.config import settings
from app.schemas.scan import HealthResponse

router = APIRouter(tags=["health"])


@router.get("/api/v1/health", response_model=HealthResponse)
def health():
    return HealthResponse(status="ok", llm_available=bool(settings.groq_api_key))
