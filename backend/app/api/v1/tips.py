from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.models.tip import SecurityTip
from app.schemas.tip import TipOut, TipCreate
from app.api.v1.auth import get_current_user
from app.models.user import User

router = APIRouter(prefix="/tips", tags=["Security Tips"])

DEFAULT_TIPS = [
    ("Banking", "Banks will NEVER contact you over SMS or phone asking for your online banking password, ATM PIN, or OTP."),
    ("UPI", "Entering your 4-digit or 6-digit UPI PIN is ONLY required when SENDING money, never when receiving money or cashback."),
    ("OTP", "Never forward or dictate OTP verification codes to anyone claiming to be customer care, delivery executive, or bank officer."),
    ("Job", "Be skeptical of work-from-home job offers promising high daily income with zero experience that require paying an advance registration or equipment fee."),
    ("Delivery", "Always check package tracking status by visiting the official courier app/website directly rather than clicking links inside delivery failure text messages."),
    ("KYC", "Telecom operators or digital wallets will never deactivate your SIM or account abruptly without official in-app notifications. Avoid unverified third-party video KYC links."),
    ("Investment", "Verify whether an investment firm is registered with financial regulators (SEBI, RBI) before transferring any funds to individual bank accounts or crypto wallets."),
    ("Password", "Use strong, unique passwords for each critical account and enable Two-Factor Authentication (2FA) via authenticator apps where available.")
]

def seed_default_tips(db: Session):
    count = db.query(SecurityTip).count()
    if count == 0:
        for cat, text in DEFAULT_TIPS:
            db.add(SecurityTip(category=cat, tip_text=text))
        db.commit()

@router.get("/", response_model=List[TipOut])
def get_tips(
    category: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    seed_default_tips(db)
    query = db.query(SecurityTip)
    if category and category != "All":
        query = query.filter(SecurityTip.category == category)
    return query.order_by(SecurityTip.created_at.desc()).all()

@router.get("/contextual")
def get_contextual_tip(
    scam_type: str = Query(...),
    db: Session = Depends(get_db)
):
    seed_default_tips(db)
    cat_map = {
        "Banking scam": "Banking",
        "UPI/Payment scam": "UPI",
        "OTP scam": "OTP",
        "Job scam": "Job",
        "Delivery scam": "Delivery",
        "Fake KYC scam": "KYC",
        "Investment scam": "Investment"
    }
    target_cat = cat_map.get(scam_type, "General")
    tip = db.query(SecurityTip).filter(SecurityTip.category == target_cat).first()
    if not tip:
        tip = db.query(SecurityTip).first()
    return tip
