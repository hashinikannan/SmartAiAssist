from fastapi import APIRouter, HTTPException, Depends
from typing import List, Dict, Any, Optional
import datetime

from app.models.schemas import (
    StudyPlan, StudySession, GeneratePlanRequest, 
    CompleteSessionRequest, SkipSessionRequest, AdaptPlanRequest, Subject
)
from app.database import in_memory_db, is_mongo_connected, mongo_db
from app.services.ai_service import get_ai_service

router = APIRouter(tags=["Study Plan"])

async def _get_current_subjects() -> List[Subject]:
    subs = []
    if is_mongo_connected:
        try:
            cursor = mongo_db.subjects.find({})
            raw_subs = await cursor.to_list(length=100)
            subs = [Subject(**s) for s in raw_subs]
        except Exception:
            pass
    if not subs:
        subs = [Subject(**s) for s in in_memory_db.subjects.values()]
    return subs

@router.get("/study-plan")
async def get_study_plan():
    current_plan = None
    if is_mongo_connected:
        try:
            doc = await mongo_db.study_plans.find_one({}, sort=[("created_at", -1)])
            if doc:
                current_plan = doc
        except Exception:
            pass

    if not current_plan and in_memory_db.study_plans:
        current_plan = list(in_memory_db.study_plans.values())[-1]

    if not current_plan:
        subjects = await _get_current_subjects()
        if not subjects:
            return {
                "id": "plan-empty",
                "created_at": datetime.datetime.now().isoformat(),
                "sessions": [],
                "ai_recommendation": "Welcome to StudyMate AI! Add your subjects and exam dates, then click 'Generate Plan' to create your study schedule.",
                "adaptation_history": []
            }
        ai_service = get_ai_service()
        plan_data = await ai_service.generate_study_plan(subjects, GeneratePlanRequest())
        in_memory_db.study_plans[plan_data["id"]] = plan_data
        return plan_data

    return current_plan

@router.post("/study-plan/generate")
async def generate_study_plan(req: GeneratePlanRequest):
    subjects = await _get_current_subjects()
    if not subjects:
        raise HTTPException(status_code=400, detail="Please add at least one subject before generating a study plan.")

    ai_service = get_ai_service()
    plan_data = await ai_service.generate_study_plan(subjects, req)

    if is_mongo_connected:
        try:
            await mongo_db.study_plans.insert_one(plan_data)
        except Exception:
            pass

    in_memory_db.study_plans[plan_data["id"]] = plan_data
    return plan_data

@router.post("/study-session/{session_id}/complete")
async def complete_session(session_id: str, req: CompleteSessionRequest):
    current_plan = await get_study_plan()
    sessions = current_plan.get("sessions", [])

    found = False
    completed_session = None

    for s in sessions:
        if s["id"] == session_id:
            s["status"] = "COMPLETED"
            s["completion_confidence"] = req.confidence
            found = True
            completed_session = s
            break

    if not found:
        raise HTTPException(status_code=404, detail="Study session not found.")

    if completed_session:
        sub_name = completed_session.get("subject_name")
        top_name = completed_session.get("topic_name")
        for sub_id, sub_dict in in_memory_db.subjects.items():
            if sub_dict.get("name") == sub_name:
                for top in sub_dict.get("topics", []):
                    if top.get("name") == top_name:
                        top["confidence"] = req.confidence
                        top["last_studied"] = datetime.date.today().isoformat()

    in_memory_db.study_plans[current_plan["id"]] = current_plan
    if is_mongo_connected:
        try:
            await mongo_db.study_plans.replace_one({"id": current_plan["id"]}, current_plan)
        except Exception:
            pass

    return {
        "message": "Session completed!",
        "session": completed_session,
        "plan": current_plan
    }

@router.post("/study-session/{session_id}/skip")
async def skip_session(session_id: str, req: SkipSessionRequest):
    current_plan = await get_study_plan()
    sessions = current_plan.get("sessions", [])

    found = False
    skipped_session = None

    for s in sessions:
        if s["id"] == session_id:
            s["status"] = "SKIPPED"
            s["skip_reason"] = req.reason
            found = True
            skipped_session = s
            break

    if not found:
        raise HTTPException(status_code=404, detail="Study session not found.")

    in_memory_db.study_plans[current_plan["id"]] = current_plan
    if is_mongo_connected:
        try:
            await mongo_db.study_plans.replace_one({"id": current_plan["id"]}, current_plan)
        except Exception:
            pass

    return {
        "message": "Session marked as skipped.",
        "skipped_session": skipped_session,
        "prompt_adapt": True
    }

@router.post("/study-plan/adapt")
async def adapt_study_plan(req: AdaptPlanRequest):
    current_plan = await get_study_plan()
    sessions = current_plan.get("sessions", [])

    skipped_session = None
    for s in sessions:
        if s["id"] == req.session_id:
            skipped_session = s
            break

    if not skipped_session:
        for s in sessions:
            if s.get("status") == "SKIPPED":
                skipped_session = s
                break

    if not skipped_session:
        raise HTTPException(status_code=400, detail="No skipped session found to adapt plan.")

    ai_service = get_ai_service()
    subjects = await _get_current_subjects()
    updated_plan = await ai_service.adapt_study_plan(
        current_plan=current_plan,
        skipped_session=skipped_session,
        reason=req.reason,
        subjects=subjects
    )

    in_memory_db.study_plans[updated_plan["id"]] = updated_plan
    if is_mongo_connected:
        try:
            await mongo_db.study_plans.replace_one({"id": updated_plan["id"]}, updated_plan, upsert=True)
        except Exception:
            pass

    return updated_plan
