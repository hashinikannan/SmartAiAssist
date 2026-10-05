from fastapi import APIRouter
from typing import Dict, Any, List
import datetime

from app.database import in_memory_db, is_mongo_connected, mongo_db

router = APIRouter(prefix="/progress", tags=["Progress"])

@router.get("")
async def get_progress_summary():
    subjects = list(in_memory_db.subjects.values())
    plans = list(in_memory_db.study_plans.values())

    all_sessions = []
    for p in plans:
        all_sessions.extend(p.get("sessions", []))

    completed_sessions = [s for s in all_sessions if s.get("status") == "COMPLETED"]

    total_sessions_count = len(all_sessions)
    overall_progress = round((len(completed_sessions) / max(1, total_sessions_count)) * 100, 1) if total_sessions_count > 0 else 0.0

    # Calculate actual weekly study hours
    total_minutes = sum(s.get("duration_minutes", 45) for s in completed_sessions)
    weekly_study_hours = round(total_minutes / 60.0, 1)

    days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
    weekly_hours = [{"day": d, "hours": 0.0, "target": 3.0} for d in days]

    subject_progress = []
    needs_attention = []

    for sub in subjects:
        s_name = sub.get("name", "Subject")
        topics = sub.get("topics", [])
        total_topics = len(topics)
        
        sub_completed_count = 0
        for top in topics:
            if top.get("confidence") == "High" or top.get("mastery_score", 0) > 70:
                sub_completed_count += 1
            
            if top.get("confidence") == "Low":
                needs_attention.append({
                    "subject": s_name,
                    "topic": top.get("name"),
                    "reason": "Low student confidence rating",
                    "severity": "HIGH",
                    "exam_date": sub.get("exam_date", "")
                })

        pct = round((sub_completed_count / max(1, total_topics)) * 100) if total_topics > 0 else 0
        subject_progress.append({
            "id": sub.get("id"),
            "name": s_name,
            "exam_date": sub.get("exam_date", ""),
            "topics_count": total_topics,
            "progress": pct,
            "color": "#4f46e5"
        })

    return {
        "overall_progress_percentage": overall_progress,
        "weekly_study_hours": weekly_study_hours,
        "completed_topics_count": len(completed_sessions),
        "streak_days": in_memory_db.user_profile.get("streak", 0),
        "weekly_hours_chart": weekly_hours,
        "subject_progress": subject_progress,
        "needs_attention": needs_attention
    }
