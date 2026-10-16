from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime
from app.core.database import Base

class SecurityTip(Base):
    __tablename__ = "security_tips"

    id = Column(Integer, primary_key=True, index=True)
    category = Column(String(50), nullable=False, index=True) # e.g. 'Banking', 'UPI', 'General', 'Password'
    tip_text = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
