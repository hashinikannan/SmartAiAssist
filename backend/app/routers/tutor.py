from fastapi import APIRouter
from app.models.schemas import TutorChatRequest, TutorChatMessage
from app.services.ai_service import get_ai_service

router = APIRouter(prefix="/tutor", tags=["AI Tutor"])

@router.post("/chat")
async def tutor_chat(req: TutorChatRequest):
    ai_service = get_ai_service()
    answer_text = await ai_service.tutor_chat(req)
    
    response_msg = TutorChatMessage(
        sender="ai",
        text=answer_text
    )
    return {
        "reply": response_msg,
        "suggested_prompts": [
            "Explain this topic simply",
            "Give me an example",
            "Quiz me on this",
            "What are common exam traps?"
        ]
    }
