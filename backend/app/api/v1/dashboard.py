from datetime import datetime, timedelta
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.core.database import get_db
from app.api.v1.auth import get_current_user
from app.models.user import User
from app.models.scan import Scan
from app.schemas.dashboard import DashboardMetrics, TrendPoint, RecentThreatItem

router = APIRouter(prefix="/dashboard", tags=["Dashboard"])

@router.get("/", response_model=DashboardMetrics)
def get_dashboard_metrics(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    scans_query = db.query(Scan).filter(Scan.user_id == current_user.id)
    total_scans = scans_query.count()
    safe_count = scans_query.filter(Scan.verdict == "Safe").count()
    phishing_count = scans_query.filter(Scan.verdict == "Phishing").count()
    suspicious_count = scans_query.filter(Scan.verdict == "Suspicious").count()

    # Personal risk level calculation
    recent_flagged = scans_query.filter(Scan.verdict.in_(["Phishing", "Suspicious"])).count()
    if total_scans == 0 or (recent_flagged / max(1, total_scans)) < 0.2:
        risk_level = "Low"
    elif (recent_flagged / max(1, total_scans)) < 0.5:
        risk_level = "Medium"
    else:
        risk_level = "High"

    # Top scam type encountered
    top_scam_query = db.query(
        Scan.scam_type, func.count(Scan.id).label("count")
    ).filter(
        Scan.user_id == current_user.id,
        Scan.scam_type != "None"
    ).group_by(Scan.scam_type).order_by(func.count(Scan.id).desc()).first()

    top_scam_type = top_scam_query[0] if top_scam_query else "None"

    # 7-day trend chart data
    trends = []
    now = datetime.utcnow()
    for i in range(6, -1, -1):
        day_date = now - timedelta(days=i)
        day_str = day_date.strftime("%Y-%m-%d")
        
        start_day = datetime(day_date.year, day_date.month, day_date.day, 0, 0, 0)
        end_day = datetime(day_date.year, day_date.month, day_date.day, 23, 59, 59)

        day_scans = scans_query.filter(Scan.created_at >= start_day, Scan.created_at <= end_day).all()
        t_total = len(day_scans)
        t_phish = sum(1 for s in day_scans if s.verdict in ["Phishing", "Suspicious"])
        t_safe = sum(1 for s in day_scans if s.verdict == "Safe")

        trends.append(TrendPoint(
            date=day_date.strftime("%b %d"),
            total=t_total,
            phishing=t_phish,
            safe=t_safe
        ))

    # Recent threats feed (last 10 flagged scans)
    recent_threats_objs = scans_query.filter(
        Scan.verdict.in_(["Phishing", "Suspicious"])
    ).order_by(Scan.created_at.desc()).limit(10).all()

    recent_threats = [
        RecentThreatItem(
            id=s.id,
            scan_type=s.scan_type,
            input_content=s.input_content,
            verdict=s.verdict,
            threat_score=s.threat_score,
            scam_type=s.scam_type,
            created_at=s.created_at
        ) for s in recent_threats_objs
    ]

    return DashboardMetrics(
        total_scans=total_scans,
        safe_count=safe_count,
        phishing_count=phishing_count,
        suspicious_count=suspicious_count,
        personal_risk_level=risk_level,
        personal_security_score=current_user.security_score,
        top_scam_type=top_scam_type,
        trends=trends,
        recent_threats=recent_threats
    )
