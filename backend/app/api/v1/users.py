import os
import time
from typing import Optional
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, status, Body
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.action_plan import ActionPlanProgress
from app.models.notification import Notification
from app.models.report import Report

router = APIRouter(prefix="/users", tags=["Users"])

# In-memory rate limiting map: user_id -> last_reset_timestamp
_RESET_RATE_LIMIT = {}
RESET_COOLDOWN_SECONDS = 10

class ResetDataRequest(BaseModel):
    password: str

@router.delete("/me/data")
def reset_all_user_data(
    payload: Optional[ResetDataRequest] = Body(None),
    password: Optional[str] = None,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Deletes all scans, action plan progress, notifications, and reports for the logged-in user.
    Maintains the user account, email preferences, and login credentials.
    Strictly scoped to current_user.id.
    """
    # Rate limiting check
    now = time.time()
    last_reset = _RESET_RATE_LIMIT.get(current_user.id, 0)
    if now - last_reset < RESET_COOLDOWN_SECONDS:
        remaining = int(RESET_COOLDOWN_SECONDS - (now - last_reset))
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Rate limit exceeded. Please wait {remaining} seconds before resetting data again."
        )

    # Extract password
    req_password = None
    if payload and payload.password:
        req_password = payload.password
    elif password:
        req_password = password

    if not req_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Account password is required to confirm data reset."
        )

    # Verify password
    if not verify_password(req_password, current_user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password. Data reset aborted and all records preserved."
        )

    # Atomic single database transaction
    try:
        # 1. Fetch user's report records to remove disk files if any exist
        reports = db.query(Report).filter(Report.user_id == current_user.id).all()
        for r in reports:
            if r.file_path and os.path.exists(r.file_path):
                try:
                    os.remove(r.file_path)
                except OSError:
                    pass

        # 2. Delete action plan progress
        db.query(ActionPlanProgress).filter(ActionPlanProgress.user_id == current_user.id).delete(synchronize_session=False)

        # 3. Delete scans
        db.query(Scan).filter(Scan.user_id == current_user.id).delete(synchronize_session=False)

        # 4. Delete notifications
        db.query(Notification).filter(Notification.user_id == current_user.id).delete(synchronize_session=False)

        # 5. Delete report history records
        db.query(Report).filter(Report.user_id == current_user.id).delete(synchronize_session=False)

        # 6. Reset user's gamified security score back to baseline default
        current_user.security_score = 75

        # Commit everything in one atomic transaction
        db.commit()
        _RESET_RATE_LIMIT[current_user.id] = now

        return {
            "success": True,
            "message": "All personal scan history, action progress, alerts, and reports have been permanently reset.",
            "security_score": current_user.security_score
        }
    except Exception as e:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Transaction failed during data reset: {str(e)}. No data was deleted."
        )
