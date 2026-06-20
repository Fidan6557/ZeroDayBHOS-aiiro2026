import json
from datetime import UTC, datetime

from app.engine.risk_engine import threat_level_for_score
from app.models.scan import Scan
from app.schemas.scan import Finding, IncidentReportResponse


def build_incident_report(scan: Scan) -> IncidentReportResponse:
    try:
        findings = [Finding(**item) for item in json.loads(scan.findings_json or "[]")]
    except (json.JSONDecodeError, TypeError, ValueError):
        findings = []

    categories = sorted({finding.category.value.replace("_", " ") for finding in findings})
    category_text = ", ".join(categories) if categories else "no malicious category"
    blocked_text = "automatically blocked" if scan.blocked else "flagged for administrator review"
    actions = [
        "Preserve the scan record and review the original content source.",
        "Validate the affected AI agent's tool permissions and recent activity.",
        "Block or isolate the source if the activity is confirmed malicious.",
    ]
    if scan.blocked:
        actions.insert(0, "Keep the content blocked and do not forward it to the AI agent.")
    if scan.risk_score <= 30:
        actions = ["No immediate action required; retain the record for monitoring."]

    return IncidentReportResponse(
        scan_id=scan.id,
        title=f"AgentShield Incident Report #{scan.id}",
        generated_at=datetime.now(UTC).isoformat(),
        source_type=scan.source_type,
        threat_level=threat_level_for_score(scan.risk_score),
        risk_score=scan.risk_score,
        classification=scan.classification,
        blocked=scan.blocked,
        summary=(
            f"Content from '{scan.source_type}' was {blocked_text}. "
            f"Detected categories: {category_text}. Risk score: {scan.risk_score:.0f}/100."
        ),
        findings=findings,
        recommended_actions=actions,
    )
