from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.tip import SecurityTip
from app.schemas.tip import TipCreate, TipOut

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

def get_current_admin(current_user: User = Depends(get_current_user)) -> User:
    if current_user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin privilege required to access this endpoint"
        )
    return current_user

@router.get("/stats")
def get_admin_platform_stats(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    total_users = db.query(User).count()
    total_scans = db.query(Scan).count()
    safe_scans = db.query(Scan).filter(Scan.verdict == "Safe").count()
    phishing_scans = db.query(Scan).filter(Scan.verdict == "Phishing").count()
    suspicious_scans = db.query(Scan).filter(Scan.verdict == "Suspicious").count()

    # Global scam breakdown
    scam_counts = db.query(
        Scan.scam_type, func.count(Scan.id).label("count")
    ).filter(
        Scan.scam_type != "None"
    ).group_by(Scan.scam_type).all()

    breakdown = [{"scam_type": row[0], "count": row[1]} for row in scam_counts]

    return {
        "total_users": total_users,
        "total_scans": total_scans,
        "safe_scans": safe_scans,
        "phishing_scans": phishing_scans,
        "suspicious_scans": suspicious_scans,
        "scam_breakdown": breakdown
    }

@router.get("/users")
def get_all_users(
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    users = db.query(User).order_by(User.created_at.desc()).all()
    return [
        {
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "role": u.role,
            "security_score": u.security_score,
            "created_at": u.created_at,
            "scan_count": len(u.scans)
        }
        for u in users
    ]

@router.post("/tips", response_model=TipOut)
def create_tip(
    tip_in: TipCreate,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    new_tip = SecurityTip(category=tip_in.category, tip_text=tip_in.tip_text)
    db.add(new_tip)
    db.commit()
    db.refresh(new_tip)
    return new_tip

@router.delete("/tips/{tip_id}")
def delete_tip(
    tip_id: int,
    admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    tip = db.query(SecurityTip).filter(SecurityTip.id == tip_id).first()
    if not tip:
        raise HTTPException(status_code=404, detail="Tip not found")
    db.delete(tip)
    db.commit()
    return {"message": "Tip deleted successfully"}
