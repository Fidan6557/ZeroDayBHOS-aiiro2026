from app.schemas.scan import Classification, Finding, ThreatCategory, ThreatLevel

CATEGORY_WEIGHTS = {
    ThreatCategory.PROMPT_INJECTION: 40,
    ThreatCategory.INDIRECT_INJECTION: 35,
    ThreatCategory.AI_PHISHING: 20,
    ThreatCategory.DATA_EXFILTRATION: 35,
    ThreatCategory.TOOL_ABUSE: 25,
    ThreatCategory.MEMORY_EXTRACTION: 30,
    ThreatCategory.JAILBREAK: 35,
    ThreatCategory.SOCIAL_ENGINEERING: 20,
}


def threat_level_for_score(risk_score: float) -> ThreatLevel:
    if risk_score <= 30:
        return ThreatLevel.LOW
    if risk_score <= 60:
        return ThreatLevel.MEDIUM
    return ThreatLevel.HIGH


def compute_risk(findings: list[Finding]) -> tuple[float, ThreatLevel, Classification, bool]:
    if not findings:
        return 0.0, ThreatLevel.LOW, Classification.SAFE, False

    category_scores: dict[ThreatCategory, int] = {}
    for f in findings:
        base = CATEGORY_WEIGHTS.get(f.category, 15)
        score = max(f.weight, base // 2) if f.weight else base // 2
        category_scores[f.category] = max(category_scores.get(f.category, 0), score)

    total = sum(category_scores.values())
    risk_score = min(100.0, float(total))
    threat_level = threat_level_for_score(risk_score)

    high_impact_categories = {
        ThreatCategory.PROMPT_INJECTION,
        ThreatCategory.INDIRECT_INJECTION,
        ThreatCategory.DATA_EXFILTRATION,
        ThreatCategory.TOOL_ABUSE,
        ThreatCategory.MEMORY_EXTRACTION,
        ThreatCategory.JAILBREAK,
    }
    high_impact_detected = any(f.category in high_impact_categories for f in findings)
    blocked = risk_score > 60 or (risk_score >= 35 and high_impact_detected)

    if blocked:
        classification = Classification.MALICIOUS
    elif risk_score <= 30:
        classification = Classification.SAFE
    else:
        classification = Classification.SUSPICIOUS

    return risk_score, threat_level, classification, blocked
