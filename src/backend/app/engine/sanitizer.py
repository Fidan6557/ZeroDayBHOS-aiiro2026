import re
from app.schemas.scan import Finding, ThreatCategory

REPLACEMENTS = {
    ThreatCategory.PROMPT_INJECTION: "[REMOVED PROMPT INJECTION]",
    ThreatCategory.INDIRECT_INJECTION: "[REMOVED HIDDEN INSTRUCTION]",
    ThreatCategory.AI_PHISHING: "[REMOVED PHISHING ATTEMPT]",
    ThreatCategory.DATA_EXFILTRATION: "[REMOVED DATA EXFILTRATION]",
    ThreatCategory.TOOL_ABUSE: "[REMOVED TOOL ABUSE]",
    ThreatCategory.MEMORY_EXTRACTION: "[REMOVED MEMORY EXTRACTION]",
    ThreatCategory.JAILBREAK: "[REMOVED JAILBREAK]",
    ThreatCategory.SOCIAL_ENGINEERING: "[REMOVED SOCIAL ENGINEERING]",
}


def sanitize_content(content: str, findings: list[Finding]) -> tuple[str, list[str]]:
    sanitized = content
    removed: list[str] = []

    for finding in findings:
        if not finding.matched_text or finding.matched_text in (
            "multiple urgency indicators",
            "export+send chain",
            "zero-width characters",
            "excessive whitespace",
        ):
            continue
        replacement = REPLACEMENTS.get(finding.category, "[REMOVED THREAT]")
        pattern = re.escape(finding.matched_text)
        new_sanitized, count = re.subn(pattern, replacement, sanitized, flags=re.IGNORECASE)
        if count > 0:
            sanitized = new_sanitized
            removed.append(finding.matched_text)

    return sanitized, removed
