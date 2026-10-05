from abc import ABC, abstractmethod
from typing import List, Dict, Any
from app.config import settings
from app.models.schemas import (
    Subject, StudySession, StudyPlan, GeneratePlanRequest, 
    AdaptPlanRequest, QuizRequest, QuizQuestion, TutorChatRequest, SyllabusParseResponse
)

class AIService(ABC):
    @abstractmethod
    async def generate_study_plan(
        self, subjects: List[Subject], req: GeneratePlanRequest
    ) -> Dict[str, Any]:
        """Generates a structured daily study plan based on subjects, exam dates, daily hours."""
        pass

    @abstractmethod
    async def adapt_study_plan(
        self, 
        current_plan: Dict[str, Any], 
        skipped_session: Dict[str, Any], 
        reason: str,
        subjects: List[Subject]
    ) -> Dict[str, Any]:
        """Recalculates and adjusts the study plan when a session is skipped or low-confidence."""
        pass

    @abstractmethod
    async def generate_quiz(self, req: QuizRequest) -> List[QuizQuestion]:
        """Generates MCQs for a given subject and topic."""
        pass

    @abstractmethod
    async def tutor_chat(self, req: TutorChatRequest) -> str:
        """Answers student queries as an empathetic, expert AI Tutor."""
        pass

    @abstractmethod
    async def parse_syllabus_text(self, text: str) -> SyllabusParseResponse:
        """Extracts subjects, topics, and difficulty from raw syllabus text."""
        pass

    @abstractmethod
    async def get_daily_recommendation(self, subjects: List[Subject], sessions_today: List[Dict[str, Any]]) -> str:
        """Generates a personalized daily AI recommendation banner."""
        pass

def get_ai_service() -> AIService:
    if settings.is_gemini_available:
        try:
            from app.services.gemini_ai_service import GeminiAIService
            return GeminiAIService()
        except Exception:
            from app.services.mock_ai_service import MockAIService
            return MockAIService()
    else:
        from app.services.mock_ai_service import MockAIService
        return MockAIService()
