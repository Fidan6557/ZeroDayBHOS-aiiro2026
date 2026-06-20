import re
from app.schemas.scan import Finding, ThreatCategory

URGENCY = ["urgent", "immediately", "asap", "right now", "extremely urgent", "do not delay"]
AUTHORITY = ["ceo", "management", "administrator", "system admin", "authorized by"]
MANIPULATION = ["without telling", "do not notify", "secret", "confidential", "bypass"]
ACTIONS = ["export", "send", "execute", "download", "upload", "transfer", "reveal", "dump", "zip", "give"]


def analyze_heuristic(content: str) -> list[Finding]:
    findings: list[Finding] = []
    lower = content.lower()

    urgency_count = sum(1 for w in URGENCY if w in lower)
    if urgency_count >= 2:
        findings.append(
            Finding(
                category=ThreatCategory.SOCIAL_ENGINEERING,
                severity="medium",
                matched_text="multiple urgency indicators",
                layer="heuristic",
                explanation=f"Detected {urgency_count} urgency pressure signals",
                weight=15,
            )
        )
    elif urgency_count == 1:
        findings.append(
            Finding(
                category=ThreatCategory.SOCIAL_ENGINEERING,
                severity="low",
                matched_text=next(w for w in URGENCY if w in lower),
                layer="heuristic",
                explanation="Urgency pressure detected",
                weight=8,
            )
        )

    for term in AUTHORITY:
        if term in lower:
            findings.append(
                Finding(
                    category=ThreatCategory.AI_PHISHING,
                    severity="medium",
                    matched_text=term,
                    layer="heuristic",
                    explanation="Authority pressure / impersonation detected",
                    weight=15,
                )
            )
            break

    for term in MANIPULATION:
        if term in lower:
            findings.append(
                Finding(
                    category=ThreatCategory.SOCIAL_ENGINEERING,
                    severity="medium",
                    matched_text=term,
                    layer="heuristic",
                    explanation="Manipulation or secrecy instruction detected",
                    weight=12,
                )
            )
            break

    action_hits = [a for a in ACTIONS if a in lower]
    if len(action_hits) >= 3:
        findings.append(
            Finding(
                category=ThreatCategory.TOOL_ABUSE,
                severity="high",
                matched_text=", ".join(action_hits[:3]),
                layer="heuristic",
                explanation="Suspicious action chain detected",
                weight=20,
            )
        )

    if re.search(r"[\u200b-\u200f\u202a-\u202e\ufeff]", content):
        findings.append(
            Finding(
                category=ThreatCategory.INDIRECT_INJECTION,
                severity="high",
                matched_text="zero-width characters",
                layer="heuristic",
                explanation="Hidden unicode characters detected",
                weight=25,
            )
        )

    if re.search(r"\s{20,}", content):
        findings.append(
            Finding(
                category=ThreatCategory.INDIRECT_INJECTION,
                severity="medium",
                matched_text="excessive whitespace",
                layer="heuristic",
                explanation="Possible hidden text via whitespace padding",
                weight=15,
            )
        )

    exfil_chain = ("export" in lower or "dump" in lower) and ("send" in lower or "post" in lower or "email" in lower)
    if exfil_chain:
        findings.append(
            Finding(
                category=ThreatCategory.DATA_EXFILTRATION,
                severity="high",
                matched_text="export+send chain",
                layer="heuristic",
                explanation="Data exfiltration action chain detected",
                weight=25,
            )
        )

    if re.search(r"ignore\s+all", lower) and re.search(r"inst\w+|instruct", lower):
        findings.append(
            Finding(
                category=ThreatCategory.PROMPT_INJECTION,
                severity="high",
                matched_text="ignore all + instructions variant",
                layer="heuristic",
                explanation="Prompt injection phrase detected",
                weight=30,
            )
        )

    if re.search(r"(give|show|send|reveal|list|print|provide)\s+(me\s+)?(all\s+)?", lower) and re.search(
        r"credentials|passwords|api\s*keys?|secrets?", lower
    ):
        findings.append(
            Finding(
                category=ThreatCategory.DATA_EXFILTRATION,
                severity="high",
                matched_text="credential extraction request",
                layer="heuristic",
                explanation="Request to disclose credentials or secrets",
                weight=30,
            )
        )

    return findings
