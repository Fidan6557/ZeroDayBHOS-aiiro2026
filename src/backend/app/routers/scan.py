import json
from pathlib import Path

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile
from sqlalchemy.orm import Session

from app.database import get_db
from app.engine.pipeline import run_pipeline
from app.schemas.scan import (
    InspectRequest,
    InspectResponse,
    SanitizeRequest,
    ScanRequest,
    ScanResponse,
)
from app.services.file_parser import extract_text_from_file
from app.services.scan_service import save_scan
from app.services.url_fetcher import fetch_url_content

router = APIRouter(prefix="/api/v1", tags=["scan"])


@router.post("/scan", response_model=ScanResponse)
async def scan_text(req: ScanRequest, db: Session = Depends(get_db)):
    result = await run_pipeline(req.content, req.source_type)
    if req.save:
        scan = save_scan(db, result, req.content, req.agent_id)
        result.id = scan.id
    return result


@router.post("/scan/file", response_model=ScanResponse)
async def scan_file(
    file: UploadFile = File(...),
    source_type: str = "file",
    db: Session = Depends(get_db),
):
    data = await file.read()
    if len(data) > 5_000_000:
        raise HTTPException(400, "File too large (max 5MB)")
    try:
        content = extract_text_from_file(file.filename or "upload.txt", data)
    except ValueError as e:
        raise HTTPException(400, str(e))
    if not content.strip():
        raise HTTPException(400, "No text content extracted from file")
    result = await run_pipeline(content, source_type)
    scan = save_scan(db, result, content)
    result.id = scan.id
    return result


@router.post("/scan/url", response_model=ScanResponse)
async def scan_url(url: str, db: Session = Depends(get_db)):
    try:
        content = await fetch_url_content(url)
    except ValueError as e:
        raise HTTPException(400, str(e))
    except Exception:
        raise HTTPException(400, "Failed to fetch URL")
    result = await run_pipeline(content, "web")
    scan = save_scan(db, result, content)
    result.id = scan.id
    return result


@router.post("/sanitize", response_model=ScanResponse)
async def sanitize(req: SanitizeRequest):
    return await run_pipeline(req.content, req.source_type)


@router.post("/inspect", response_model=InspectResponse)
async def inspect(req: InspectRequest, db: Session = Depends(get_db)):
    result = await run_pipeline(req.content, req.source_type)
    scan = save_scan(db, result, req.content, req.agent_id)
    return InspectResponse(
        safe=result.classification.value == "safe",
        risk_score=result.risk_score,
        classification=result.classification,
        block=result.blocked,
        sanitized_content=result.sanitized_content,
        findings=result.findings,
        scan_id=scan.id,
    )
