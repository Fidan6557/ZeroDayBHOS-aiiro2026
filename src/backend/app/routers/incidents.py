from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.scan import Notification, Scan
from app.schemas.scan import (
    IncidentReportResponse,
    NotificationResponse,
)
from app.services.incident_service import build_incident_report

router = APIRouter(prefix="/api/v1", tags=["incidents"])


@router.get("/notifications", response_model=list[NotificationResponse])
def list_notifications(
    limit: int = Query(20, ge=1, le=100),
    unread_only: bool = False,
    db: Session = Depends(get_db),
):
    query = db.query(Notification)
    if unread_only:
        query = query.filter(Notification.is_read == False)
    rows = query.order_by(Notification.created_at.desc()).limit(limit).all()
    return [
        NotificationResponse(
            id=row.id,
            scan_id=row.scan_id,
            title=row.title,
            message=row.message,
            threat_level=row.threat_level,
            is_read=row.is_read,
            created_at=row.created_at.isoformat(),
        )
        for row in rows
    ]


@router.patch("/notifications/{notification_id}/read", response_model=NotificationResponse)
def mark_notification_read(notification_id: int, db: Session = Depends(get_db)):
    row = db.get(Notification, notification_id)
    if not row:
        raise HTTPException(404, "Notification not found")
    row.is_read = True
    db.commit()
    db.refresh(row)
    return NotificationResponse(
        id=row.id,
        scan_id=row.scan_id,
        title=row.title,
        message=row.message,
        threat_level=row.threat_level,
        is_read=row.is_read,
        created_at=row.created_at.isoformat(),
    )


@router.get("/reports/{scan_id}", response_model=IncidentReportResponse)
def generate_incident_report(scan_id: int, db: Session = Depends(get_db)):
    scan = db.get(Scan, scan_id)
    if not scan:
        raise HTTPException(404, "Scan not found")

    return build_incident_report(scan)
