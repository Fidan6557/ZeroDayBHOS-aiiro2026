import json
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.scan import Scan
from app.schemas.scan import ScanListItem, StatsResponse

router = APIRouter(prefix="/api/v1", tags=["stats"])


@router.get("/stats", response_model=StatsResponse)
def get_stats(db: Session = Depends(get_db)):
    total = db.query(func.count(Scan.id)).scalar() or 0
    threats = db.query(func.count(Scan.id)).filter(Scan.risk_score > 30).scalar() or 0
    avg = db.query(func.avg(Scan.risk_score)).scalar() or 0.0
    blocked = db.query(func.count(Scan.id)).filter(Scan.blocked == True).scalar() or 0
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent = db.query(func.count(Scan.id)).filter(Scan.created_at >= week_ago, Scan.risk_score > 30).scalar() or 0

    categories: dict[str, int] = {}
    sources: dict[str, int] = {}
    scans = db.query(Scan).all()
    for scan in scans:
        sources[scan.source_type] = sources.get(scan.source_type, 0) + 1
        try:
            findings = json.loads(scan.findings_json or "[]")
            for f in findings:
                cat = f.get("category", "unknown")
                categories[cat] = categories.get(cat, 0) + 1
        except json.JSONDecodeError:
            pass

    return StatsResponse(
        total_scans=total,
        total_threats=threats,
        avg_risk_score=round(float(avg), 1),
        blocked_count=blocked,
        categories=categories,
        sources=sources,
        recent_threats=recent,
    )


@router.get("/scans", response_model=list[ScanListItem])
def list_scans(
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    db: Session = Depends(get_db),
):
    scans = db.query(Scan).order_by(Scan.created_at.desc()).offset(offset).limit(limit).all()
    items = []
    for s in scans:
        try:
            count = len(json.loads(s.findings_json or "[]"))
        except json.JSONDecodeError:
            count = 0
        items.append(
            ScanListItem(
                id=s.id,
                source_type=s.source_type,
                risk_score=s.risk_score,
                classification=s.classification,
                blocked=s.blocked,
                original_preview=s.original_preview,
                created_at=s.created_at.isoformat() if s.created_at else "",
                findings_count=count,
            )
        )
    return items
