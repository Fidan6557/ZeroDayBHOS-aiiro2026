from app.engine.heuristic_engine import analyze_heuristic
from app.engine.llm_engine import analyze_llm
from app.engine.regex_engine import analyze_regex
from app.engine.risk_engine import compute_risk
from app.engine.sanitizer import sanitize_content
from app.schemas.scan import Classification, Finding, ScanResponse


def _dedupe_findings(findings: list[Finding]) -> list[Finding]:
    seen: set[str] = set()
    result: list[Finding] = []
    for f in findings:
        key = f"{f.category}:{f.matched_text.lower()[:50]}:{f.layer}"
        if key not in seen:
            seen.add(key)
            result.append(f)
    return result


async def run_pipeline(content: str, source_type: str = "text") -> ScanResponse:
    layers_used: list[str] = []
    all_findings: list[Finding] = []

    regex_findings = analyze_regex(content)
    if regex_findings:
        layers_used.append("regex")
    all_findings.extend(regex_findings)

    heuristic_findings = analyze_heuristic(content)
    if heuristic_findings:
        layers_used.append("heuristic")
    all_findings.extend(heuristic_findings)

    llm_findings, llm_called = await analyze_llm(content)
    if llm_findings:
        layers_used.append("llm")
    all_findings.extend(llm_findings)
    if llm_called and "llm" not in layers_used and settings_has_llm():
        layers_used.append("llm")

    all_findings = _dedupe_findings(all_findings)
    if not layers_used:
        layers_used = ["regex"]

    risk_score, threat_level, classification, blocked = compute_risk(all_findings)
    sanitized, removed = sanitize_content(content, all_findings)
    preview = content[:200] + ("..." if len(content) > 200 else "")

    return ScanResponse(
        risk_score=risk_score,
        threat_level=threat_level,
        classification=classification,
        findings=all_findings,
        sanitized_content=sanitized,
        removed_segments=removed,
        blocked=blocked,
        layers_used=layers_used,
        source_type=source_type,
        original_preview=preview,
    )


def settings_has_llm() -> bool:
    from app.config import settings
    return bool(settings.groq_api_key)
