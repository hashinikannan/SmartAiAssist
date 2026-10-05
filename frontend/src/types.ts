export interface Topic {
  id?: string;
  name: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  confidence: 'Low' | 'Medium' | 'High';
  last_studied?: string;
  mastery_score?: number;
}

export interface Subject {
  id: string;
  name: string;
  exam_date: string;
  topics: Topic[];
  difficulty: 'Easy' | 'Medium' | 'Hard';
  confidence: 'Low' | 'Medium' | 'High';
  daily_available_hours: number;
  progress_percentage?: number;
}

export interface StudySession {
  id: string;
  date: string; // YYYY-MM-DD
  subject_id?: string;
  subject_name: string;
  topic_name: string;
  duration_minutes: number;
  priority: 'HIGH' | 'MEDIUM' | 'LOW';
  type: 'LEARNING' | 'REVISION' | 'PRACTICE';
  status: 'PENDING' | 'COMPLETED' | 'SKIPPED';
  skip_reason?: string;
  completion_confidence?: 'Low' | 'Medium' | 'High';
  scheduled_time?: string;
}

export interface StudyPlan {
  id: string;
  created_at: string;
  sessions: StudySession[];
  ai_recommendation: string;
  adaptation_history?: string[];
}

export interface QuizQuestion {
  id: number;
  question: string;
  options: string[];
  correct_answer_index: number;
  explanation: string;
}

export interface QuizResult {
  id: string;
  subject_name: string;
  topic_name: string;
  score: number;
  total: number;
  percentage: number;
  feedback: string;
  weak_topics: string[];
}

export interface TutorMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

export interface ProgressSummary {
  overall_progress_percentage: number;
  weekly_study_hours: number;
  completed_topics_count: number;
  streak_days: number;
  weekly_hours_chart: Array<{ day: string; hours: number; target: number }>;
  subject_progress: Array<{
    id: string;
    name: string;
    exam_date: string;
    topics_count: number;
    progress: number;
    color: string;
  }>;
  needs_attention: Array<{
    subject: string;
    topic: string;
    reason: string;
    severity: 'HIGH' | 'MEDIUM' | 'LOW';
    exam_date: string;
  }>;
}

export interface SyllabusParseResponse {
  extracted_text_preview: string;
  summary: string;
  subjects: Array<{
    name: string;
    exam_date: string;
    difficulty: 'Easy' | 'Medium' | 'Hard';
    confidence: 'Low' | 'Medium' | 'High';
    daily_available_hours: number;
    topics: Topic[];
  }>;
}
