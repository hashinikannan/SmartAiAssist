import json
import logging
import datetime
from typing import List, Dict, Any

from app.config import settings
from app.services.ai_service import AIService
from app.services.mock_ai_service import MockAIService
from app.models.schemas import (
    Subject, GeneratePlanRequest, QuizRequest, 
    QuizQuestion, TutorChatRequest, SyllabusParseResponse, SubjectCreate, Topic
)

logger = logging.getLogger(__name__)

class GeminiAIService(AIService):
    """
    Real Gemini AI Implementation using Google GenAI SDK with structured JSON output,
    automatic schema enforcement, and seamless fallback to MockAIService on API failure.
    """

    def __init__(self):
        self.fallback = MockAIService()
        self.client = None
        if settings.is_gemini_available:
            try:
                # Try google.genai or google.generativeai
                try:
                    from google import genai
                    self.client = genai.Client(api_key=settings.GEMINI_API_KEY)
                    self.genai_type = "new"
                except ImportError:
                    import google.generativeai as genai_old
                    genai_old.configure(api_key=settings.GEMINI_API_KEY)
                    self.client = genai_old.GenerativeModel("gemini-1.5-flash")
                    self.genai_type = "old"
            except Exception as e:
                logger.warning(f"Could not initialize Gemini Client: {e}. Falling back to MockAIService.")
                self.client = None

    async def generate_study_plan(
        self, subjects: List[Subject], req: GeneratePlanRequest
    ) -> Dict[str, Any]:
        if not self.client:
            return await self.fallback.generate_study_plan(subjects, req)

        prompt = f"""
        You are an expert AI Study Planner. Create a structured 7-day study plan based on:
        Subjects: {[s.dict() for s in subjects]}
        Daily Study Hours: {req.daily_hours}
        Preferred Time: {req.preferred_time}
        Study Days: {req.study_days}
        Current Date: {datetime.date.today().isoformat()}

        Return STRICT JSON matching:
        {{
          "id": "plan-123",
          "created_at": "{datetime.datetime.now().isoformat()}",
          "sessions": [
             {{
               "id": "sess-1",
               "date": "YYYY-MM-DD",
               "subject_id": "sub_id",
               "subject_name": "Subject Name",
               "topic_name": "Topic Name",
               "duration_minutes": 45,
               "priority": "HIGH",
               "type": "LEARNING",
               "status": "PENDING",
               "scheduled_time": "09:00 AM"
             }}
          ],
          "ai_recommendation": "Summary and strategic study tips"
        }}
        """
        try:
            raw_res = await self._call_gemini(prompt)
            data = json.loads(self._clean_json(raw_res))
            return data
        except Exception as e:
            logger.error(f"Gemini study plan generation failed: {e}. Using fallback.")
            return await self.fallback.generate_study_plan(subjects, req)

    async def adapt_study_plan(
        self, 
        current_plan: Dict[str, Any], 
        skipped_session: Dict[str, Any], 
        reason: str,
        subjects: List[Subject]
    ) -> Dict[str, Any]:
        if not self.client:
            return await self.fallback.adapt_study_plan(current_plan, skipped_session, reason, subjects)

        prompt = f"""
        Adapt the study plan because the student skipped a session.
        Skipped Session: {skipped_session}
        Reason: {reason}
        Current Plan Sessions: {current_plan.get('sessions', [])}
        Subjects: {[s.dict() for s in subjects]}

        Reallocate the skipped topic into upcoming days with HIGH priority.
        Return STRICT JSON with the updated sessions array and an "ai_recommendation" explaining the changes.
        """
        try:
            raw_res = await self._call_gemini(prompt)
            data = json.loads(self._clean_json(raw_res))
            data["adaptation_history"] = current_plan.get("adaptation_history", []) + [f"Adapted on {datetime.date.today()} for '{reason}'"]
            return data
        except Exception as e:
            logger.error(f"Gemini schedule adaptation failed: {e}. Using fallback.")
            return await self.fallback.adapt_study_plan(current_plan, skipped_session, reason, subjects)

    async def generate_quiz(self, req: QuizRequest) -> List[QuizQuestion]:
        if not self.client:
            return await self.fallback.generate_quiz(req)

        prompt = f"""
        Generate {req.num_questions} Multiple Choice Questions (MCQs) for:
        Subject: {req.subject_name}
        Topic: {req.topic_name}
        Difficulty: {req.difficulty}

        Return STRICT JSON array of objects with keys:
        "id" (int), "question" (str), "options" (list of 4 strings), "correct_answer_index" (int 0-3), "explanation" (str).
        """
        try:
            raw_res = await self._call_gemini(prompt)
            data = json.loads(self._clean_json(raw_res))
            return [QuizQuestion(**q) for q in data]
        except Exception as e:
            logger.error(f"Gemini quiz generation failed: {e}. Using fallback.")
            return await self.fallback.generate_quiz(req)

    async def tutor_chat(self, req: TutorChatRequest) -> str:
        if not self.client:
            return await self.fallback.tutor_chat(req)

        prompt = f"""
        You are an empathetic, expert AI Tutor assisting a student.
        Subject: {req.subject_name}
        Topic: {req.topic_name}
        User Query: {req.message}
        History: {[h.dict() for h in req.history[-3:]]}

        Respond warmly with markdown formatting, bold terms, bullet points, and an optional practice question or analogy.
        """
        try:
            return await self._call_gemini(prompt)
        except Exception as e:
            logger.error(f"Gemini tutor chat failed: {e}. Using fallback.")
            return await self.fallback.tutor_chat(req)

    async def parse_syllabus_text(self, text: str) -> SyllabusParseResponse:
        if not self.client:
            return await self.fallback.parse_syllabus_text(text)

        prompt = f"""
        Parse this raw syllabus text and extract subjects, topics, and estimated difficulty:
        ---
        {text[:4000]}
        ---

        Return STRICT JSON matching:
        {{
          "extracted_text_preview": "First 300 chars",
          "summary": "AI summary of parsed syllabus",
          "subjects": [
             {{
               "name": "Subject Name",
               "exam_date": "{datetime.date.today() + datetime.timedelta(days=14)}",
               "difficulty": "Medium",
               "confidence": "Medium",
               "daily_available_hours": 2.0,
               "topics": [
                  {{"name": "Topic 1", "difficulty": "Hard", "confidence": "Low"}}
               ]
             }}
          ]
        }}
        """
        try:
            raw_res = await self._call_gemini(prompt)
            data = json.loads(self._clean_json(raw_res))
            subjects = [SubjectCreate(**s) for s in data.get("subjects", [])]
            return SyllabusParseResponse(
                extracted_text_preview=data.get("extracted_text_preview", text[:300]),
                summary=data.get("summary", "Extracted syllabus topics successfully."),
                subjects=subjects
            )
        except Exception as e:
            logger.error(f"Gemini syllabus parsing failed: {e}. Using fallback.")
            return await self.fallback.parse_syllabus_text(text)

    async def get_daily_recommendation(self, subjects: List[Subject], sessions_today: List[Dict[str, Any]]) -> str:
        if not self.client or not subjects:
            return await self.fallback.get_daily_recommendation(subjects, sessions_today)
        return await self.fallback.get_daily_recommendation(subjects, sessions_today)

    async def _call_gemini(self, prompt: str) -> str:
        if hasattr(self.client, "models"):
            # New GenAI SDK
            res = self.client.models.generate_content(
                model="gemini-1.5-flash",
                contents=prompt
            )
            return res.text
        else:
            # Old GenAI SDK
            res = self.client.generate_content(prompt)
            return res.text

    def _clean_json(self, text: str) -> str:
        text = text.strip()
        if text.startswith("```json"):
            text = text[7:]
        elif text.startswith("```"):
            text = text[3:]
        if text.endswith("```"):
            text = text[:-3]
        return text.strip()
