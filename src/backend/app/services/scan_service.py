import hashlib
import json
from datetime import datetime

from sqlalchemy.orm import Session

from app.models.scan import Scan
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
        created_at=datetime.utcnow(),
    )
    db.add(scan)
    db.commit()
    db.refresh(scan)
    return scan


def scan_to_response(scan: Scan) -> ScanResponse:
    findings_data = json.loads(scan.findings_json or "[]")
    from app.schemas.scan import Finding
    findings = [Finding(**f) for f in findings_data]
    return ScanResponse(
        id=scan.id,
        risk_score=scan.risk_score,
        classification=scan.classification,
        findings=findings,
        sanitized_content=scan.sanitized_content or "",
        removed_segments=[],
        blocked=scan.blocked,
        layers_used=[],
        source_type=scan.source_type,
        original_preview=scan.original_preview,
    )
