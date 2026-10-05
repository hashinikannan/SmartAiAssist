from fastapi import APIRouter, HTTPException
from typing import List, Dict, Any
import uuid

from app.models.schemas import QuizRequest, QuizSubmitRequest, QuizResult, QuizQuestion
from app.services.ai_service import get_ai_service
from app.database import in_memory_db, is_mongo_connected, mongo_db

router = APIRouter(prefix="/quiz", tags=["Quiz"])

@router.post("/generate", response_model=List[QuizQuestion])
async def generate_quiz(req: QuizRequest):
    ai_service = get_ai_service()
    questions = await ai_service.generate_quiz(req)
    return questions

@router.post("/submit", response_model=QuizResult)
async def submit_quiz(req: QuizSubmitRequest):
    correct_count = 0
    total = len(req.questions)
    weak_topics = []

    for i, q in enumerate(req.questions):
        user_ans = req.user_answers[i] if i < len(req.user_answers) else -1
        if user_ans == q.correct_answer_index:
            correct_count += 1

    pct = round((correct_count / total) * 100, 1) if total > 0 else 0.0

    if pct >= 80:
        feedback = f"🌟 Outstanding Performance! You scored {pct}%. You have a strong grasp of {req.topic_name}."
    elif pct >= 50:
        feedback = f"👍 Good Effort! You scored {pct}%. A quick revision of missed questions will get you to 100%."
        weak_topics.append(req.topic_name)
    else:
        feedback = f"⚠️ Topic Needs Attention. You scored {pct}%. We recommend re-scheduling a 45m study session on {req.topic_name}."
        weak_topics.append(req.topic_name)

    result = QuizResult(
        id=f"quiz-{uuid.uuid4().hex[:8]}",
        subject_name=req.subject_name,
        topic_name=req.topic_name,
        score=correct_count,
        total=total,
        percentage=pct,
        feedback=feedback,
        weak_topics=weak_topics
    )

    in_memory_db.quiz_results.append(result.dict())
    if is_mongo_connected:
        try:
            await mongo_db.quiz_results.insert_one(result.dict())
        except Exception:
            pass

    return result
