# 🎓 StudyMate AI — Personal AI Study Assistant
> **GenAI Hackathon Solution for Adaptive Study Scheduling**

StudyMate AI is a production-quality, AI-powered study assistant designed to solve a common problem for students: **creating and continuously adapting a personalized study schedule based on syllabus, exam dates, topic difficulty, and daily available study time.**

---

## 🌟 Key Differentiating Feature: Adaptive AI Scheduling

Unlike static timetable generators or plain AI chatbots, **StudyMate AI dynamically adapts the remaining study plan whenever a student skips a session or reports low confidence.**

```
Original Plan:
  Monday    ➔ DBMS — Normalization
  Tuesday   ➔ DSA — Binary Trees
  Wednesday ➔ Computer Architecture — Pipelining

Student skips Monday's session ("Didn't understand").

⚡ StudyMate AI Adaptation Engine:
  • Reschedules DBMS Normalization for Tuesday morning with HIGH Priority (+15 min extra focus time)
  • Rebalances lower-priority topics across remaining days without overloading daily hours
  • Retains hard exam target dates while preventing burnout
```

---

## 🛠️ Technology Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS (v4), Lucide React Icons, Recharts |
| **Backend** | Python 3.13, FastAPI, Pydantic (v2), Uvicorn |
| **AI Integration** | Google Gemini API (`google-genai` SDK) with robust fallback service abstraction (`AIService`, `GeminiAIService`, `MockAIService`) |
| **PDF Extraction** | PyPDF (`pypdf`) for syllabus document text parsing |
| **Database** | MongoDB (`pymongo`, `motor`) with auto-detecting In-Memory Fallback for out-of-the-box execution |

---

## 📁 Repository Structure

```
ai assistant/
├── backend/
│   ├── app/
│   │   ├── main.py              # FastAPI Application entry point & CORS configuration
│   │   ├── config.py            # Environment settings & Gemini API status checks
│   │   ├── database.py          # MongoDB client + In-Memory Fallback DB Store
│   │   ├── models/
│   │   │   └── schemas.py       # Pydantic domain models (Subject, Session, Quiz, Tutor)
│   │   ├── services/
│   │   │   ├── ai_service.py    # Abstract AIService base class & factory
│   │   │   ├── gemini_ai_service.py # Real Gemini API implementation
│   │   │   ├── mock_ai_service.py   # Intelligent fallback AI service
│   │   │   ├── priority_service.py  # Deterministic Priority Scoring Engine
│   │   │   └── pdf_service.py   # PyPDF text extraction
│   │   └── routers/
│   │       ├── subjects.py      # CRUD for subjects & syllabus topics
│   │       ├── study_plan.py    # Study plan generation, completion & adaptation
│   │       ├── syllabus.py      # PDF syllabus parsing endpoint
│   │       ├── tutor.py         # AI Tutor chat endpoint
│   │       ├── quiz.py          # AI Quiz generation & submission evaluation
│   │       ├── progress.py      # Learning analytics & progress metrics
│   │       └── demo.py          # Hackathon 1-click seed data endpoint
│   ├── .env.example
│   └── requirements.txt
│
└── frontend/
    ├── src/
    │   ├── components/
    │   │   ├── LandingPage.tsx   # Professional hero landing page
    │   │   ├── Dashboard.tsx     # Modern SaaS dashboard with AI Recommendation card & Today's Plan
    │   │   ├── SubjectsPage.tsx  # My Subjects card view & topic list
    │   │   ├── AddSubjectModal.tsx # Subject & topic form with difficulty/confidence options
    │   │   ├── SyllabusUploadModal.tsx # PyPDF upload dropzone & AI extraction preview
    │   │   ├── PlanGeneratorPage.tsx   # Study Plan Generator configuration page
    │   │   ├── StudyPlanPage.tsx # 7-day date-grouped schedule view
    │   │   ├── AdaptiveModal.tsx # Skip session reason modal & AI adaptation trigger
    │   │   ├── StudySessionModal.tsx   # Daily Study Focus Mode (25:00 Pomodoro timer)
    │   │   ├── AITutorPage.tsx   # 24/7 AI Tutor chat interface
    │   │   ├── QuizPage.tsx      # AI MCQ Quiz generator & interactive test player
    │   │   ├── ProgressPage.tsx  # Analytics page with Recharts bar chart & Needs Attention list
    │   │   ├── CalendarPage.tsx  # Interactive study calendar
    │   │   ├── Sidebar.tsx       # Responsive navigation sidebar
    │   │   └── Navbar.tsx        # Top navbar with quick actions
    │   ├── services/
    │   │   └── api.ts            # Client API service layer with fallbacks
    │   ├── types.ts              # TypeScript interface definitions
    │   └── App.tsx               # Main application controller
    ├── vite.config.ts
    └── package.json
```

---

## ⚡ Priority Engine Algorithm

StudyMate AI calculates a **Priority Score (0 to 100)** for every topic using a combination of deterministic scoring and AI reasoning:

$$\text{Priority Score} = \text{Exam Urgency} + \text{Topic Difficulty} + \text{Weakness Score} + \text{Revision Need}$$

1. **Exam Urgency (0 - 40 pts)**: Higher score for exams in $\le 3$ days.
2. **Topic Difficulty (0 - 25 pts)**: Hard = 25 pts, Medium = 15 pts, Easy = 5 pts.
3. **Student Weakness (0 - 25 pts)**: Low Confidence = 25 pts, Medium = 12 pts, High = 3 pts.
4. **Revision Need (0 - 10 pts)**: Topics not revised in $> 7$ days receive top priority.

---

## 🚀 Running the Project

### 1. Backend (FastAPI)
```bash
cd backend
py -m uvicorn app.main:app --port 8000
```
*Backend API will be live at `http://localhost:8000` (Swagger docs available at `http://localhost:8000/docs`).*

### 2. Frontend (React + Vite)
```bash
cd frontend
npm run dev
```
*Frontend will be live at `http://localhost:5173`.*

---

## 🔑 Environment Variables Setup

Copy `backend/.env.example` to `backend/.env`:

```env
# Gemini API Key (Optional — auto-falls back to MockAIService if blank)
GEMINI_API_KEY=your_gemini_api_key_here

# MongoDB Connection String (Optional — auto-falls back to In-Memory DB if offline)
MONGODB_URI=mongodb://localhost:27017
MONGODB_DB_NAME=studymate_db

PORT=8000
ENVIRONMENT=development
```

---

## 🎯 14-Step Hackathon Demonstration Flow

1. Open `http://localhost:5173/`. View the clean **Landing Page**.
2. Click **"Try Demo"** to seed realistic subjects (DBMS, DSA, Computer Architecture).
3. View the **Dashboard** greeting, metric cards, and **Prominent AI Recommendation Card**.
4. Examine **TODAY'S STUDY PLAN** with session times, priorities, and duration.
5. Click **"Start Session"** on a topic to open **Daily Study Focus Mode** (Pomodoro 25:00 timer).
6. Click **"Finish"** and rate your post-session confidence (**Low / Medium / High**).
7. On another session, click **"Skip"**.
8. Select the skip reason: *"Didn't understand"*.
9. Click **"Adapt My Plan"**. Observe the **AI Adaptation Engine** recalculate and reschedule the skipped topic for tomorrow with High Priority.
10. Navigate to **"My Subjects"** to inspect topics, difficulty, and confidence levels.
11. Click **"Upload Syllabus PDF"** to test PyPDF text extraction and AI subject parsing.
12. Navigate to **"AI Tutor"** to ask questions or click prompt chips like *"Explain this topic simply"*.
13. Navigate to **"Quiz"** to generate an AI MCQ test, answer questions, and view explanations.
14. Navigate to **"Progress"** to view the Recharts weekly study hours chart and the **"Needs Attention"** flagged topics.
