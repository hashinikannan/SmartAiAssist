from fastapi import APIRouter
from app.database import in_memory_db

router = APIRouter(prefix="/demo", tags=["Demo Mode"])

@router.post("/reset")
@router.post("/seed")
async def reset_student_account():
    # Clear all stored data
    in_memory_db.subjects.clear()
    in_memory_db.study_plans.clear()
    in_memory_db.study_sessions.clear()
    in_memory_db.quiz_results.clear()
    in_memory_db.user_profile = {
        "id": "usr-clean",
        "name": "Student",
        "avatar_initials": "ST",
        "total_study_hours": 0.0,
        "streak_days": 0
    }

    return {
        "message": "Account reset to clean brand-new student state.",
        "subjects": [],
        "plan": None
    }
