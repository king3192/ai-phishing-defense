from pydantic import BaseModel
from typing import List, Dict
from datetime import datetime

class TrendPoint(BaseModel):
    date: str
    total: int
    phishing: int
    safe: int

class RecentThreatItem(BaseModel):
    id: int
    scan_type: str
    input_content: str
    verdict: str
    threat_score: float
    scam_type: str
    created_at: datetime

class DashboardMetrics(BaseModel):
    total_scans: int
    safe_count: int
    phishing_count: int
    suspicious_count: int
    personal_risk_level: str # Low, Medium, High
    personal_security_score: int # 0 - 100
    top_scam_type: str
    trends: List[TrendPoint]
    recent_threats: List[RecentThreatItem]
