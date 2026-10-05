import datetime
from typing import List, Dict, Any
import uuid
import random

from app.services.ai_service import AIService
from app.services.priority_service import calculate_topic_priority_score
from app.models.schemas import (
    Subject, GeneratePlanRequest, AdaptPlanRequest, 
    QuizRequest, QuizQuestion, TutorChatRequest, SyllabusParseResponse, SubjectCreate, Topic
)

class MockAIService(AIService):
    """
    Intelligent mock AI service that produces realistic, dynamic study plans,
    adaptive schedule updates, subject-specific quizzes, and AI tutor explanations
    when Gemini API key is missing or unavailable.
    """

    async def generate_study_plan(
        self, subjects: List[Subject], req: GeneratePlanRequest
    ) -> Dict[str, Any]:
        today = datetime.date.today()
        all_sessions: List[Dict[str, Any]] = []

        if not subjects:
            return {
                "id": f"plan-{uuid.uuid4().hex[:8]}",
                "created_at": datetime.datetime.now().isoformat(),
                "sessions": [],
                "ai_recommendation": "Welcome to StudyMate AI! Add your subjects and exam dates, then click 'Generate Plan' to create your personalized study schedule.",
                "adaptation_history": []
            }

        # Calculate scores and sort all (subject, topic) pairs by urgency/weakness
        scored_topics = []
        for sub in subjects:
            for top in sub.topics:
                p_info = calculate_topic_priority_score(
                    exam_date_str=sub.exam_date,
                    difficulty=top.difficulty,
                    confidence=top.confidence,
                    last_studied_str=top.last_studied,
                    mastery_score=top.mastery_score
                )
                scored_topics.append({
                    "subject": sub.name,
                    "subject_id": sub.id,
                    "topic": top.name,
                    "difficulty": top.difficulty,
                    "confidence": top.confidence,
                    "priority_score": p_info["score"],
                    "priority_label": p_info["priority_label"],
                    "days_to_exam": p_info["days_to_exam"]
                })

        if not scored_topics:
            return {
                "id": f"plan-{uuid.uuid4().hex[:8]}",
                "created_at": datetime.datetime.now().isoformat(),
                "sessions": [],
                "ai_recommendation": "Add topics to your subjects to generate a detailed study schedule.",
                "adaptation_history": []
            }

        # Sort by priority score descending
        scored_topics.sort(key=lambda x: x["priority_score"], reverse=True)

        # Generate schedule across 7 days
        topic_idx = 0
        time_slots = ["09:00 AM", "11:30 AM", "03:00 PM", "05:30 PM", "08:00 PM"]

        for day_offset in range(7):
            current_date = today + datetime.timedelta(days=day_offset)
            date_str = current_date.isoformat()

            sessions_count = min(3, max(1, int(req.daily_hours // 1.2)))
            
            for s_idx in range(sessions_count):
                item = scored_topics[topic_idx % len(scored_topics)]
                topic_idx += 1

                session_type = "LEARNING"
                if item["confidence"] == "High" or (topic_idx > len(scored_topics)):
                    session_type = "REVISION" if (s_idx % 2 == 0) else "PRACTICE"

                duration = 45 if item["difficulty"] != "Hard" else 60

                all_sessions.append({
                    "id": f"sess-{uuid.uuid4().hex[:8]}",
                    "date": date_str,
                    "subject_id": item["subject_id"],
                    "subject_name": item["subject"],
                    "topic_name": item["topic"],
                    "duration_minutes": duration,
                    "priority": item["priority_label"],
                    "type": session_type,
                    "status": "PENDING",
                    "scheduled_time": time_slots[s_idx % len(time_slots)]
                })

        rec = (
            f"Based on your upcoming exams ({subjects[0].name}) and weak topics, "
            f"I have prioritized high-weightage topics like '{scored_topics[0]['topic']}'. "
            f"Follow this schedule to complete revision before your exam date!"
        )

        return {
            "id": f"plan-{uuid.uuid4().hex[:8]}",
            "created_at": datetime.datetime.now().isoformat(),
            "sessions": all_sessions,
            "ai_recommendation": rec,
            "adaptation_history": ["Initial AI Study Plan generated successfully."]
        }

    async def adapt_study_plan(
        self,
        current_plan: Dict[str, Any],
        skipped_session: Dict[str, Any],
        reason: str,
        subjects: List[Subject]
    ) -> Dict[str, Any]:
        sessions = current_plan.get("sessions", [])
        skipped_topic = skipped_session.get("topic_name", "Unknown Topic")
        skipped_subject = skipped_session.get("subject_name", "Unknown Subject")

        for s in sessions:
            if s["id"] == skipped_session.get("id"):
                s["status"] = "SKIPPED"
                s["skip_reason"] = reason

        today = datetime.date.today()
        reschedule_date = (today + datetime.timedelta(days=1)).isoformat()

        new_rescheduled_session = {
            "id": f"sess-{uuid.uuid4().hex[:8]}",
            "date": reschedule_date,
            "subject_id": skipped_session.get("subject_id"),
            "subject_name": skipped_subject,
            "topic_name": f"{skipped_topic} (Rescheduled)",
            "duration_minutes": skipped_session.get("duration_minutes", 45) + 15,
            "priority": "HIGH",
            "type": "REVISION" if "difficult" in reason.lower() or "understand" in reason.lower() else "LEARNING",
            "status": "PENDING",
            "scheduled_time": "08:00 AM"
        }

        sessions.append(new_rescheduled_session)

        explanation = (
            f"⚡ **AI Schedule Adaption Completed!**\n"
            f"You skipped **{skipped_subject}: {skipped_topic}** due to *'{reason}'*.\n"
            f"• Rescheduled **{skipped_topic}** for tomorrow with High Priority (+15m extra focus time).\n"
            f"• Rebalanced lower priority sessions down the line to ensure target exam dates remain intact."
        )

        history = current_plan.get("adaptation_history", [])
        history.append(f"Adapted on {datetime.date.today().isoformat()}: Rescheduled {skipped_topic} due to '{reason}'.")

        return {
            "id": current_plan.get("id", "plan-1"),
            "created_at": current_plan.get("created_at"),
            "sessions": sessions,
            "ai_recommendation": explanation,
            "adaptation_history": history
        }

    async def generate_quiz(self, req: QuizRequest) -> List[QuizQuestion]:
        s = req.subject_name.upper()
        t = req.topic_name

        return [
            QuizQuestion(
                id=1,
                question=f"What is the key core principle underlying {t} in {req.subject_name}?",
                options=[
                    "Structured decomposition and optimization",
                    "Random access with zero overhead",
                    "Sequential execution without state retention",
                    "Unbounded recursion"
                ],
                correct_answer_index=0,
                explanation=f"{t} relies on systematic decomposition and structured optimization principles."
            ),
            QuizQuestion(
                id=2,
                question=f"When analyzing efficiency in {t}, which factor plays the most critical role?",
                options=["Space and Time Trade-off", "Color depth", "Network ping", "Disk RPM"],
                correct_answer_index=0,
                explanation="Managing the trade-off between memory footprint (space) and computational execution cycles (time) is central to efficient design."
            ),
            QuizQuestion(
                id=3,
                question=f"Which strategy is recommended when encountering edge cases in {t}?",
                options=["Validate boundary conditions first", "Ignore zero values", "Use infinite loops", "Hardcode output"],
                correct_answer_index=0,
                explanation="Always validate boundary inputs (0, null, negative, overflow) before applying main algorithmic logic."
            )
        ]

    async def tutor_chat(self, req: TutorChatRequest) -> str:
        msg = req.message.lower()
        sub = req.subject_name or "General"
        top = req.topic_name or "Study Helper"

        if "explain" in msg or "simply" in msg or "what is" in msg:
            return (
                f"🧠 **AI Tutor Breakdown for {top} ({sub})**:\n\n"
                f"1. **Core Concept**: {top} structures concepts so you can search, understand, and apply them with minimum effort.\n"
                f"2. **Real-world Analogy**: Think of it like an index at the back of a textbook that lets you skip flipping every page.\n"
                f"3. **Exam Tip**: Always check boundary conditions and prime attributes first!"
            )
        elif "example" in msg:
            return (
                f"💡 **Practical Example for {top}**:\n\n"
                f"Suppose we have a set of data elements in {sub}.\n"
                f"Instead of processing every element linearly (O(N)), applying {top} allows structured binary lookup in O(log N) time!"
            )
        else:
            return (
                f"Hello! I am your **StudyMate AI Tutor** for **{sub} - {top}**.\n\n"
                f"I can help you:\n"
                f"• Simplify complex concepts in plain English\n"
                f"• Walk through step-by-step examples\n"
                f"• Point out common exam traps & pitfalls\n\n"
                f"What specific question do you have about {top}?"
            )

    async def parse_syllabus_text(self, text: str) -> SyllabusParseResponse:
        preview = text[:300] + "..." if len(text) > 300 else text
        
        # Split lines to extract topic candidates from uploaded text
        lines = [line.strip() for line in text.splitlines() if len(line.strip()) > 3]
        extracted_topics = []
        for line in lines[:6]:
            if not line.startswith("---"):
                extracted_topics.append(Topic(name=line[:50], difficulty="Medium", confidence="Medium"))
        
        if not extracted_topics:
            extracted_topics = [
                Topic(name="Unit 1: Overview & Core Principles", difficulty="Medium", confidence="Medium"),
                Topic(name="Unit 2: Advanced Topics & Practice", difficulty="Hard", confidence="Low")
            ]

        subjects = [
            SubjectCreate(
                name="Parsed Syllabus Subject",
                exam_date=(datetime.date.today() + datetime.timedelta(days=14)).isoformat(),
                difficulty="Medium",
                confidence="Medium",
                daily_available_hours=2.0,
                topics=extracted_topics
            )
        ]

        summary = f"Successfully parsed syllabus text! Extracted {len(extracted_topics)} topics into 1 subject model."

        return SyllabusParseResponse(
            extracted_text_preview=preview,
            subjects=subjects,
            summary=summary
        )

    async def get_daily_recommendation(self, subjects: List[Subject], sessions_today: List[Dict[str, Any]]) -> str:
        if not subjects:
            return "Welcome to StudyMate AI! Add your subjects and exam dates to get a personalized AI recommendation."

        sorted_subs = sorted(subjects, key=lambda s: s.exam_date)
        nearest = sorted_subs[0]
        
        weak_topics = [t for t in nearest.topics if t.confidence == "Low" or t.difficulty == "Hard"]
        target_topic = weak_topics[0].name if weak_topics else (nearest.topics[0].name if nearest.topics else "General Revision")

        return (
            f"Your **{nearest.name}** exam is approaching on **{nearest.exam_date}** and **{target_topic}** "
            f"is flagged as a high-priority topic. I recommend dedicating 45-60 minutes to it today."
        )
