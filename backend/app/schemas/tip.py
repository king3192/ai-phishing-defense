from pydantic import BaseModel
from datetime import datetime

class TipCreate(BaseModel):
    category: str
    tip_text: str

class TipOut(BaseModel):
    id: int
    category: str
    tip_text: str
    created_at: datetime

    class Config:
        from_attributes = True
