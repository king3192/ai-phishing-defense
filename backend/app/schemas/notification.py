from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class NotificationOut(BaseModel):
    id: int
    user_id: int
    message: str
    verdict: str
    scan_id: Optional[int] = None
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True
