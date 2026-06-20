# Agent Integration Guide

## Overview

AgentShield provides a REST API gateway that any AI agent can call before processing external content.

## Primary Endpoint

```
POST /api/v1/inspect
```

### Request

```json
{
  "content": "string — raw content from external source",
  "source_type": "telegram | email | slack | pdf | web | ...",
  "agent_id": "optional agent identifier"
}
```

### Response

```json
{
  "safe": false,
  "risk_score": 78,
  "classification": "malicious",
  "block": true,
  "sanitized_content": "[REMOVED PROMPT INJECTION]...",
  "findings": [...],
  "scan_id": 42
}
```

## Integration Flow

1. Agent receives content from external source
2. Agent calls `POST /api/v1/inspect` with raw content
3. If `block: true` → reject content, log threat, alert dashboard
4. If `block: false` → pass `sanitized_content` to LLM context

## Python Example

```python
import httpx

async def safe_content(content: str, source: str) -> str | None:
    async with httpx.AsyncClient() as client:
        r = await client.post(
            "http://localhost:8000/api/v1/inspect",
            json={"content": content, "source_type": source, "agent_id": "my-agent"},
        )
        data = r.json()
        if data["block"]:
            return None
        return data["sanitized_content"]
```

## OpenClaw Integration

Add AgentShield as a pre-processing middleware in your agent's message handler. Intercept all tool inputs and user messages from external channels before they enter the agent context window.
