from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime

class ScanRequest(BaseModel):
    scan_type: str = Field(..., description="url, email, sms, or qr")
    content: str = Field(..., description="URL string or message text or base64 QR code image")
    interaction_level: Optional[str] = Field("none", description="none, clicked, or entered_info")

class ActionStepOut(BaseModel):
    id: int
    step_index: int
    step_text: str
    is_checked: bool

    class Config:
        from_attributes = True

class ScanOut(BaseModel):
    id: int
    user_id: int
    scan_type: str
    input_content: str
    verdict: str
    threat_score: float
    scam_type: str
    explainability: List[str]
    action_plan: List[ActionStepOut]
    created_at: datetime

    class Config:
        from_attributes = True

class ActionStepToggle(BaseModel):
    step_id: int
    is_checked: bool
