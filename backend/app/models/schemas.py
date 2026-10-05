from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
from datetime import datetime

# --- TOPIC & SUBJECT SCHEMAS ---

class Topic(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    name: str
    difficulty: str = "Medium"  # Easy, Medium, Hard
    confidence: str = "Medium"  # Low, Medium, High
    last_studied: Optional[str] = None
    mastery_score: int = 50  # 0 to 100

class Subject(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    name: str
    exam_date: str  # YYYY-MM-DD
    topics: List[Topic] = []
    difficulty: str = "Medium"
    confidence: str = "Medium"
    daily_available_hours: float = 2.0
    progress_percentage: float = 0.0

class SubjectCreate(BaseModel):
    name: str
    exam_date: str
    topics: List[Topic] = []
    difficulty: str = "Medium"
    confidence: str = "Medium"
    daily_available_hours: float = 2.0

class SubjectUpdate(BaseModel):
    name: Optional[str] = None
    exam_date: Optional[str] = None
    topics: Optional[List[Topic]] = None
    difficulty: Optional[str] = None
    confidence: Optional[str] = None

# --- STUDY SESSION & PLAN SCHEMAS ---

class StudySession(BaseModel):
    id: str
    date: str  # YYYY-MM-DD
    subject_id: Optional[str] = None
    subject_name: str
    topic_name: str
    duration_minutes: int = 45
    priority: str = "MEDIUM"  # HIGH, MEDIUM, LOW
    type: str = "LEARNING"  # LEARNING, REVISION, PRACTICE
    status: str = "PENDING"  # PENDING, COMPLETED, SKIPPED
    skip_reason: Optional[str] = None
    completion_confidence: Optional[str] = None  # Low, Medium, High
    scheduled_time: Optional[str] = "09:00 AM"

class StudyPlan(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    created_at: str = Field(default_factory=lambda: datetime.now().isoformat())
    sessions: List[StudySession] = []
    ai_recommendation: str = ""
    adaptation_history: List[str] = []

class GeneratePlanRequest(BaseModel):
    daily_hours: float = 3.0
    preferred_time: str = "Morning"
    study_days: List[str] = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

class CompleteSessionRequest(BaseModel):
    confidence: str = "Medium"  # Low, Medium, High

class SkipSessionRequest(BaseModel):
    reason: str  # "Didn't understand", "No time", "Too difficult", "Other"
    notes: Optional[str] = ""

class AdaptPlanRequest(BaseModel):
    session_id: str
    reason: str

# --- QUIZ SCHEMAS ---

class QuizRequest(BaseModel):
    subject_name: str
    topic_name: str
    num_questions: int = 5
    difficulty: str = "Medium"

class QuizQuestion(BaseModel):
    id: int
    question: str
    options: List[str]
    correct_answer_index: int
    explanation: str

class QuizSubmitRequest(BaseModel):
    subject_name: str
    topic_name: str
    user_answers: List[int]
    questions: List[QuizQuestion]

class QuizResult(BaseModel):
    id: str = Field(default_factory=lambda: str(datetime.now().timestamp()))
    subject_name: str
    topic_name: str
    score: int
    total: int
    percentage: float
    feedback: str
    weak_topics: List[str] = []

# --- TUTOR SCHEMAS ---

class TutorChatMessage(BaseModel):
    sender: str  # "user" or "ai"
    text: str
    timestamp: str = Field(default_factory=lambda: datetime.now().strftime("%H:%M"))

class TutorChatRequest(BaseModel):
    subject_name: Optional[str] = "General"
    topic_name: Optional[str] = "General Study"
    message: str
    history: List[TutorChatMessage] = []

# --- SYLLABUS PDF ---

class SyllabusParseResponse(BaseModel):
    extracted_text_preview: str
    subjects: List[SubjectCreate]
    summary: str
