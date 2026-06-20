import re
from app.schemas.scan import Finding, ThreatCategory

PATTERNS: list[tuple[str, ThreatCategory, int, str]] = [
    (r"ignore\s+(all\s+)?(previous|prior)\s+instructions?", ThreatCategory.PROMPT_INJECTION, 40, "Direct prompt injection attempt"),
    (r"ignore\s+(all\s+)?(\w+\s+){0,2}inst\w*", ThreatCategory.PROMPT_INJECTION, 40, "Direct prompt injection attempt (variant spelling)"),
    (r"disregard\s+(all\s+)?(\w+\s+){0,3}(rules?|instructions?|prompts?|guidelines?)", ThreatCategory.PROMPT_INJECTION, 40, "Instruction override attempt"),
    (r"forget\s+(your\s+)?(rules|instructions|guidelines)", ThreatCategory.PROMPT_INJECTION, 40, "Instruction override attempt"),
    (r"new\s+system\s+prompt", ThreatCategory.PROMPT_INJECTION, 40, "System prompt replacement"),
    (r"override\s+(developer|system)\s+instructions?", ThreatCategory.PROMPT_INJECTION, 40, "Developer instruction override"),
    (r"you\s+are\s+now\s+(DAN|unrestricted|jailbroken)", ThreatCategory.JAILBREAK, 35, "Jailbreak persona assignment"),
    (r"do\s+anything\s+now", ThreatCategory.JAILBREAK, 35, "DAN jailbreak pattern"),
    (r"reveal\s+(your\s+)?(system\s+prompt|instructions)", ThreatCategory.MEMORY_EXTRACTION, 30, "System prompt extraction"),
    (r"(show|give|send|list|print|provide)\s+(me\s+)?(all\s+)?(the\s+)?(credentials|passwords|api\s*keys?|secrets?)", ThreatCategory.DATA_EXFILTRATION, 35, "Credential disclosure request"),
    (r"show\s+(stored\s+)?(credentials|passwords|api\s+keys?)", ThreatCategory.DATA_EXFILTRATION, 35, "Credential disclosure request"),
    (r"export\s+(the\s+)?(database|customer\s+data|all\s+data)", ThreatCategory.DATA_EXFILTRATION, 35, "Data export attempt"),
    (r"export\s+(?:the\s+)?[\w-]*\s*(credentials|api\s*keys?|secrets?)", ThreatCategory.DATA_EXFILTRATION, 35, "Sensitive credential export attempt"),
    (r"send\s+(all\s+)?(customer\s+data|credentials|records)", ThreatCategory.DATA_EXFILTRATION, 35, "Data exfiltration via send"),
    (r"transfer\s+(all\s+)?(api\s*keys?|credentials|customer\s+data)", ThreatCategory.DATA_EXFILTRATION, 35, "Sensitive data transfer request"),
    (r"dump\s+(configuration|config|memory)", ThreatCategory.DATA_EXFILTRATION, 35, "Configuration dump request"),
    (r"execute\s+command", ThreatCategory.TOOL_ABUSE, 25, "Command execution request"),
    (r"curl\s+.*?(POST|GET)", ThreatCategory.TOOL_ABUSE, 25, "HTTP exfiltration command"),
    (r"open\s+browser", ThreatCategory.TOOL_ABUSE, 25, "Browser tool abuse"),
    (r"call\s+api\s+endpoint", ThreatCategory.TOOL_ABUSE, 25, "Unauthorized API call"),
    (r"download\s+(all\s+)?files?", ThreatCategory.TOOL_ABUSE, 25, "Mass file download"),
    (r"print\s+stored\s+context", ThreatCategory.MEMORY_EXTRACTION, 30, "Context memory extraction"),
    (r"reveal\s+memory", ThreatCategory.MEMORY_EXTRACTION, 30, "Memory reveal attempt"),
    (r"show\s+conversation\s+history", ThreatCategory.MEMORY_EXTRACTION, 30, "Conversation history extraction"),
    (r"bypass\s+(approval|security|authentication)", ThreatCategory.AI_PHISHING, 20, "Security bypass request"),
    (r"confidential\s+operation", ThreatCategory.AI_PHISHING, 20, "Fake confidential operation"),
    (r"from\s+(the\s+)?CEO", ThreatCategory.SOCIAL_ENGINEERING, 20, "Authority impersonation"),
    (r"do\s+not\s+(ask|notify|tell)\s+(the\s+)?user", ThreatCategory.SOCIAL_ENGINEERING, 20, "User deception instruction"),
    (r"<!--\s*AI:", ThreatCategory.INDIRECT_INJECTION, 35, "Hidden HTML comment injection"),
    (r"SYSTEM\s+OVERRIDE", ThreatCategory.INDIRECT_INJECTION, 35, "Embedded system override"),
]


def analyze_regex(content: str) -> list[Finding]:
    findings: list[Finding] = []
    seen: set[str] = set()
    for pattern, category, weight, explanation in PATTERNS:
        for match in re.finditer(pattern, content, re.IGNORECASE):
            matched = match.group(0)
            key = f"{category}:{matched.lower()}"
            if key in seen:
                continue
            seen.add(key)
            findings.append(
                Finding(
                    category=category,
                    severity="high" if weight >= 35 else "medium",
                    matched_text=matched,
                    layer="regex",
                    explanation=explanation,
                    weight=weight,
                )
            )
    return findings
