import json
import base64
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import List, Optional

from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.models.action_plan import ActionPlanProgress
from app.models.notification import Notification
from app.schemas.scan import ScanRequest, ScanOut, ActionStepOut, ActionStepToggle
from app.services.ml_service import ml_service
import time
from collections import defaultdict
from app.services.qr_service import decode_qr_code
from app.services.action_engine import generate_action_plan

router = APIRouter(prefix="/scans", tags=["Scans"])

_SCAN_TIMESTAMPS = defaultdict(list)
SCAN_RATE_LIMIT_MAX = 30  # max 30 scans per minute
SCAN_RATE_LIMIT_WINDOW = 60  # seconds

@router.post("/", response_model=ScanOut)
def run_scan(
    req: ScanRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    now = time.time()
    user_timestamps = _SCAN_TIMESTAMPS[current_user.id]
    _SCAN_TIMESTAMPS[current_user.id] = [t for t in user_timestamps if now - t < SCAN_RATE_LIMIT_WINDOW]
    if len(_SCAN_TIMESTAMPS[current_user.id]) >= SCAN_RATE_LIMIT_MAX:
        raise HTTPException(
            status_code=429,
            detail=f"Scan rate limit exceeded ({SCAN_RATE_LIMIT_MAX} scans/min). Please wait a moment."
        )
    _SCAN_TIMESTAMPS[current_user.id].append(now)

    scan_content = req.content.strip()
    
    # 1. Decode QR if scan_type is 'qr'
    if req.scan_type == "qr":
        if scan_content.startswith("data:image"):
            # Extract base64 header
            scan_content = scan_content.split(",")[1]
        try:
            img_bytes = base64.b64decode(scan_content)
            scan_content = decode_qr_code(img_bytes)
        except Exception:
            scan_content = req.content # fallback to raw text if already decoded

    # 2. Run ML classification engine
    if req.scan_type == "url" or (req.scan_type == "qr" and scan_content.startswith(("http://", "https://", "www."))):
        result = ml_service.scan_url(scan_content)
    else:
        result = ml_service.scan_text(scan_content)

    # 3. Create Scan database record
    new_scan = Scan(
        user_id=current_user.id,
        scan_type=req.scan_type,
        input_content=scan_content,
        verdict=result["verdict"],
        threat_score=result["threat_score"],
        scam_type=result["scam_type"],
        explainability_json=json.dumps(result["explainability"])
    )
    db.add(new_scan)
    db.commit()
    db.refresh(new_scan)

    # 4. Generate Action Plan Checklist
    step_texts = generate_action_plan(result["verdict"], result["scam_type"], req.interaction_level or "none")
    action_steps_objs = []
    for idx, text in enumerate(step_texts):
        step = ActionPlanProgress(
            scan_id=new_scan.id,
            user_id=current_user.id,
            step_index=idx + 1,
            step_text=text,
            is_checked=False
        )
        db.add(step)
        action_steps_objs.append(step)
    
    # 5. Handle High-Risk Detections (Notification & Security Score)
    if result["verdict"] in ["Phishing", "Suspicious"]:
        notif_msg = f"SECURITY ALERT: High-risk {result['scam_type']} detected in your recent {req.scan_type.upper()} scan (Threat Score: {result['threat_score']}/100)."
        notif = Notification(
            user_id=current_user.id,
            message=notif_msg,
            verdict=result["verdict"],
            scan_id=new_scan.id
        )
        db.add(notif)
        
        # Adjust security score dynamically
        current_user.security_score = max(20, current_user.security_score - 5)
    else:
        current_user.security_score = min(100, current_user.security_score + 2)

    db.commit()
    db.refresh(new_scan)

    return {
        "id": new_scan.id,
        "user_id": new_scan.user_id,
        "scan_type": new_scan.scan_type,
        "input_content": new_scan.input_content,
        "verdict": new_scan.verdict,
        "threat_score": new_scan.threat_score,
        "scam_type": new_scan.scam_type,
        "explainability": json.loads(new_scan.explainability_json),
        "action_plan": action_steps_objs,
        "created_at": new_scan.created_at
    }

@router.get("/", response_model=List[ScanOut])
def get_scans_history(
    scan_type: Optional[str] = Query(None),
    verdict: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    limit: int = Query(20, ge=1, le=100),
    offset: int = Query(0, ge=0),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    query = db.query(Scan).filter(Scan.user_id == current_user.id)

    if scan_type:
        query = query.filter(Scan.scan_type == scan_type)
    if verdict:
        query = query.filter(Scan.verdict == verdict)
    if search:
        query = query.filter(Scan.input_content.ilike(f"%{search}%"))

    scans = query.order_by(Scan.created_at.desc()).offset(offset).limit(limit).all()

    res = []
    for s in scans:
        res.append({
            "id": s.id,
            "user_id": s.user_id,
            "scan_type": s.scan_type,
            "input_content": s.input_content,
            "verdict": s.verdict,
            "threat_score": s.threat_score,
            "scam_type": s.scam_type,
            "explainability": json.loads(s.explainability_json),
            "action_plan": s.action_steps,
            "created_at": s.created_at
        })
    return res

@router.get("/{scan_id}", response_model=ScanOut)
def get_scan_by_id(
    scan_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scan = db.query(Scan).filter(Scan.id == scan_id, Scan.user_id == current_user.id).first()
    if not scan:
        raise HTTPException(status_code=404, detail="Scan record not found")

    return {
        "id": scan.id,
        "user_id": scan.user_id,
        "scan_type": scan.scan_type,
        "input_content": scan.input_content,
        "verdict": scan.verdict,
        "threat_score": scan.threat_score,
        "scam_type": scan.scam_type,
        "explainability": json.loads(scan.explainability_json),
        "action_plan": scan.action_steps,
        "created_at": scan.created_at
    }

@router.post("/action-step/toggle")
def toggle_action_step(
    body: ActionStepToggle,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    step = db.query(ActionPlanProgress).filter(
        ActionPlanProgress.id == body.step_id,
        ActionPlanProgress.user_id == current_user.id
    ).first()
    if not step:
        raise HTTPException(status_code=404, detail="Action step not found")

    step.is_checked = body.is_checked
    
    # Reward user security score when completing action steps
    if body.is_checked:
        current_user.security_score = min(100, current_user.security_score + 1)
        
    db.commit()
    return {"message": "Action step status updated successfully", "is_checked": step.is_checked}
