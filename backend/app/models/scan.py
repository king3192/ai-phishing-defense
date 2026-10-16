from datetime import datetime
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Float
from sqlalchemy.orm import relationship
from app.core.database import Base

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False, index=True)
    scan_type = Column(String(20), nullable=False) # 'url', 'email', 'sms', 'qr'
    input_content = Column(Text, nullable=False)
    verdict = Column(String(20), nullable=False) # 'Safe', 'Suspicious', 'Phishing'
    threat_score = Column(Float, nullable=False) # 0.0 - 100.0
    scam_type = Column(String(50), nullable=False) # Banking, UPI, OTP, etc.
    explainability_json = Column(Text, nullable=False) # JSON array of signals
    created_at = Column(DateTime, default=datetime.utcnow, index=True)

    user = relationship("User", back_populates="scans")
    action_steps = relationship("ActionPlanProgress", back_populates="scan", cascade="all, delete-orphan")
