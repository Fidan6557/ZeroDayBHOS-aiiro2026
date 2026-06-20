from app.schemas.scan import Classification, Finding, ThreatCategory

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


def compute_risk(findings: list[Finding]) -> tuple[float, Classification, bool]:
    if not findings:
        return 0.0, Classification.SAFE, False

    category_scores: dict[ThreatCategory, int] = {}
    for f in findings:
        base = CATEGORY_WEIGHTS.get(f.category, 15)
        score = max(f.weight, base // 2) if f.weight else base // 2
        category_scores[f.category] = max(category_scores.get(f.category, 0), score)

    total = sum(category_scores.values())
    risk_score = min(100.0, float(total))

    if risk_score <= 30:
        classification = Classification.SAFE
        blocked = False
    elif risk_score <= 60:
        classification = Classification.SUSPICIOUS
        blocked = False
    else:
        classification = Classification.MALICIOUS
        blocked = True

    return risk_score, classification, blocked
