import hashlib
import json
from datetime import UTC, datetime

from sqlalchemy.orm import Session

from app.engine.risk_engine import threat_level_for_score
from app.models.scan import Notification, Scan
from app.schemas.scan import ScanResponse


def content_hash(content: str) -> str:
    return hashlib.sha256(content.encode()).hexdigest()


def save_scan(
    db: Session,
    result: ScanResponse,
    content: str,
    agent_id: str | None = None,
) -> Scan:
    scan = Scan(
        content_hash=content_hash(content),
        source_type=result.source_type,
        agent_id=agent_id,
        risk_score=result.risk_score,
        classification=result.classification.value,
        findings_json=json.dumps([f.model_dump() for f in result.findings], default=str),
        sanitized_content=result.sanitized_content,
        original_preview=result.original_preview,
        blocked=result.blocked,
        created_at=datetime.now(UTC).replace(tzinfo=None),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    if result.risk_score > 30:
        notification = Notification(
            scan_id=scan.id,
            title=f"{result.threat_level.value.upper()} threat detected",
            message=(
                f"{result.source_type} source produced a {result.risk_score:.0f}/100 risk score "
                f"and was {'blocked' if result.blocked else 'flagged for review'}."
            ),
            threat_level=result.threat_level.value,
        )
        db.add(notification)
        db.commit()
    return scan


def scan_to_response(scan: Scan) -> ScanResponse:
    findings_data = json.loads(scan.findings_json or "[]")
    from app.schemas.scan import Finding
    findings = [Finding(**f) for f in findings_data]
    return ScanResponse(
        id=scan.id,
        risk_score=scan.risk_score,
        threat_level=threat_level_for_score(scan.risk_score),
        classification=scan.classification,
        findings=findings,
        sanitized_content=scan.sanitized_content or "",
        removed_segments=[],
        blocked=scan.blocked,
        layers_used=[],
        source_type=scan.source_type,
        original_preview=scan.original_preview,
    )
