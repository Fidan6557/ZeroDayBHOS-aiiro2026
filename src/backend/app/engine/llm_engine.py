import json
import httpx
from app.config import settings
from app.schemas.scan import Finding, ThreatCategory

CATEGORY_MAP = {
    "prompt_injection": ThreatCategory.PROMPT_INJECTION,
    "indirect_injection": ThreatCategory.INDIRECT_INJECTION,
    "ai_phishing": ThreatCategory.AI_PHISHING,
    "data_exfiltration": ThreatCategory.DATA_EXFILTRATION,
    "tool_abuse": ThreatCategory.TOOL_ABUSE,
    "memory_extraction": ThreatCategory.MEMORY_EXTRACTION,
    "jailbreak": ThreatCategory.JAILBREAK,
    "social_engineering": ThreatCategory.SOCIAL_ENGINEERING,
}

WEIGHT_MAP = {
    ThreatCategory.PROMPT_INJECTION: 40,
    ThreatCategory.INDIRECT_INJECTION: 35,
    ThreatCategory.AI_PHISHING: 20,
    ThreatCategory.DATA_EXFILTRATION: 35,
    ThreatCategory.TOOL_ABUSE: 25,
    ThreatCategory.MEMORY_EXTRACTION: 30,
    ThreatCategory.JAILBREAK: 35,
    ThreatCategory.SOCIAL_ENGINEERING: 20,
}

SYSTEM_PROMPT = """You are a cybersecurity AI content analyzer. Analyze the given text for AI agent threats.
Respond ONLY with valid JSON:
{"threats":[{"category":"prompt_injection|indirect_injection|ai_phishing|data_exfiltration|tool_abuse|memory_extraction|jailbreak|social_engineering","confidence":0.0-1.0,"explanation":"brief reason","matched_fragment":"exact text"}],"overall_risk":0-100,"explanation":"summary"}
If safe, return {"threats":[],"overall_risk":0,"explanation":"Content appears safe"}"""


async def analyze_llm(content: str) -> tuple[list[Finding], bool]:
    if not settings.groq_api_key:
        return [], False

    preview = content[:3000]
    try:
        async with httpx.AsyncClient(timeout=settings.llm_timeout) as client:
            response = await client.post(
                settings.groq_api_url,
                headers={
                    "Authorization": f"Bearer {settings.groq_api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": settings.groq_model,
                    "messages": [
                        {"role": "system", "content": SYSTEM_PROMPT},
                        {"role": "user", "content": f"Analyze this content for AI agent security threats:\n\n{preview}"},
                    ],
                    "temperature": 0.1,
                },
            )
            response.raise_for_status()
            data = response.json()
            raw = data["choices"][0]["message"]["content"]
            start = raw.find("{")
            end = raw.rfind("}") + 1
            if start < 0 or end <= start:
                return [], True
            parsed = json.loads(raw[start:end])
    except Exception:
        return [], True

    findings: list[Finding] = []
    for threat in parsed.get("threats", []):
        cat_str = threat.get("category", "")
        category = CATEGORY_MAP.get(cat_str, ThreatCategory.PROMPT_INJECTION)
        confidence = float(threat.get("confidence", 0.5))
        weight = int(WEIGHT_MAP.get(category, 20) * confidence)
        findings.append(
            Finding(
                category=category,
                severity="high" if confidence > 0.7 else "medium",
                matched_text=threat.get("matched_fragment", cat_str)[:200],
                layer="llm",
                explanation=threat.get("explanation", "LLM detected threat"),
                weight=weight,
            )
        )
    return findings, True
