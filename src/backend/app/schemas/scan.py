from enum import Enum
from typing import Optional

from pydantic import BaseModel, Field


class ThreatCategory(str, Enum):
    PROMPT_INJECTION = "prompt_injection"
    INDIRECT_INJECTION = "indirect_injection"
    AI_PHISHING = "ai_phishing"
    DATA_EXFILTRATION = "data_exfiltration"
    TOOL_ABUSE = "tool_abuse"
    MEMORY_EXTRACTION = "memory_extraction"
    JAILBREAK = "jailbreak"
    SOCIAL_ENGINEERING = "social_engineering"


class Classification(str, Enum):
    SAFE = "safe"
    SUSPICIOUS = "suspicious"
    MALICIOUS = "malicious"


class ThreatLevel(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Finding(BaseModel):
    category: ThreatCategory
    severity: str
    matched_text: str
    layer: str
    explanation: str
    weight: int = 0


class ScanRequest(BaseModel):
    content: str = Field(..., min_length=1)
    source_type: str = "text"
    agent_id: Optional[str] = None
    save: bool = True


class SanitizeRequest(BaseModel):
    content: str = Field(..., min_length=1)
    source_type: str = "text"


class InspectRequest(BaseModel):
    content: str = Field(..., min_length=1)
    source_type: str = "text"
    agent_id: Optional[str] = None


class SimulateRequest(BaseModel):
    scenario_id: str


class ScanResponse(BaseModel):
    id: Optional[int] = None
    risk_score: float
    threat_level: ThreatLevel
    classification: Classification
    findings: list[Finding]
    sanitized_content: str
    removed_segments: list[str]
    blocked: bool
    layers_used: list[str]
    source_type: str
    original_preview: str


class InspectResponse(BaseModel):
    safe: bool
    risk_score: float
    threat_level: ThreatLevel
    classification: Classification
    block: bool
    sanitized_content: str
    findings: list[Finding]
    scan_id: Optional[int] = None


class StatsResponse(BaseModel):
    total_scans: int
    total_threats: int
    avg_risk_score: float
    blocked_count: int
    categories: dict[str, int]
    sources: dict[str, int]
    recent_threats: int
    unread_notifications: int


class ScanListItem(BaseModel):
    id: int
    source_type: str
    risk_score: float
    threat_level: ThreatLevel
    classification: str
    blocked: bool
    original_preview: str
    created_at: str
    findings_count: int


class SimulateResponse(BaseModel):
    scenario_id: str
    scenario_name: str
    steps: list[str]
    scan: ScanResponse
    timeline: list[dict]


class HealthResponse(BaseModel):
    status: str
    llm_available: bool


class NotificationResponse(BaseModel):
    id: int
    scan_id: int
    title: str
    message: str
    threat_level: ThreatLevel
    is_read: bool
    created_at: str


class IncidentReportResponse(BaseModel):
    scan_id: int
    title: str
    generated_at: str
    source_type: str
    threat_level: ThreatLevel
    risk_score: float
    classification: str
    blocked: bool
    summary: str
    findings: list[Finding]
    recommended_actions: list[str]
