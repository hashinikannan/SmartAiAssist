import React from 'react';
import { 
  Calendar, Clock, CheckCircle2, TrendingUp, Sparkles, 
  Play, XCircle, RefreshCw, ChevronRight, Award, Plus
} from 'lucide-react';
import type { Subject, StudyPlan, StudySession } from '../types';

interface DashboardProps {
  subjects: Subject[];
  studyPlan: StudyPlan | null;
  onCompleteSession: (session: StudySession) => void;
  onSkipSession: (session: StudySession) => void;
  onStartSession: (session: StudySession) => void;
  onAdaptPlan: () => void;
  onNavigateTab: (tab: string) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  subjects,
  studyPlan,
  onCompleteSession,
  onSkipSession,
  onStartSession,
  onAdaptPlan,
  onNavigateTab
}) => {
  const todayStr = new Date().toISOString().split('T')[0];

  const todaySessions = (studyPlan?.sessions || []).filter(
    (s) => s.date === todayStr || s.date.startsWith(todayStr)
  );
  
  const displaySessions = todaySessions.length > 0 
    ? todaySessions 
    : (studyPlan?.sessions || []).filter(s => s.status === 'PENDING').slice(0, 3);

  const nearestExamSubject = [...subjects].sort((a, b) => new Date(a.exam_date).getTime() - new Date(b.exam_date).getTime())[0];
  const upcomingExamDays = nearestExamSubject 
    ? Math.max(0, Math.ceil((new Date(nearestExamSubject.exam_date).getTime() - new Date().getTime()) / 86400000))
    : null;

  const totalTodayMinutes = displaySessions.reduce((acc, s) => acc + s.duration_minutes, 0);
  const completedCount = (studyPlan?.sessions || []).filter(s => s.status === 'COMPLETED').length;
  const totalCount = (studyPlan?.sessions || []).length;
  const overallProgressPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">Good morning! 👋</h1>
          <p className="text-sm text-slate-600">Here's what you should focus on today to stay on track for your exams.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigateTab('subjects')}
            className="px-3.5 py-2 bg-white border border-slate-300 text-slate-700 text-xs font-semibold rounded-xl shadow-2xs hover:bg-slate-50 transition-colors"
          >
            Manage Subjects ({subjects.length})
          </button>
          <button
            onClick={() => onNavigateTab('generate-plan')}
            className="px-3.5 py-2 bg-indigo-600 text-white text-xs font-semibold rounded-xl shadow-xs hover:bg-indigo-700 transition-colors flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Generate AI Schedule</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 border border-amber-100 flex items-center justify-center text-amber-600">
            <Calendar className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Upcoming Exam</p>
            <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
              {nearestExamSubject ? `${nearestExamSubject.name}` : 'No Upcoming Exam'}
            </h3>
            <p className="text-xs font-medium text-slate-500 mt-0.5">
              {nearestExamSubject && upcomingExamDays !== null
                ? `In ${upcomingExamDays} days (${nearestExamSubject.exam_date})`
                : 'Add a subject & set exam date'}
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Focus Time</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {Math.floor(totalTodayMinutes / 60)}h {totalTodayMinutes % 60}m
            </h3>
            <p className="text-xs font-medium text-slate-600 mt-0.5">
              Across {displaySessions.length} planned sessions
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Completed Tasks</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {completedCount} / {totalCount}
            </h3>
            <p className="text-xs font-medium text-emerald-600 mt-0.5">
              Sessions finished
            </p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Overall Syllabus</p>
            <h3 className="text-xl font-extrabold text-slate-900 mt-0.5">
              {overallProgressPct}%
            </h3>
            <div className="w-24 bg-slate-100 h-2 rounded-full mt-1 overflow-hidden">
              <div 
                className="bg-purple-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${overallProgressPct}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-indigo-900 via-indigo-850 to-slate-900 text-white rounded-2xl p-6 shadow-xl border border-indigo-700/50 relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-60 h-60 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2 max-w-3xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-indigo-200 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-indigo-300 animate-pulse" />
              <span>AI Recommendation Engine</span>
            </div>

            <h3 className="text-lg sm:text-xl font-bold text-white tracking-tight leading-snug">
              {studyPlan?.ai_recommendation || "Welcome to StudyMate AI! Add your subjects and exam dates, then click 'Generate Plan' to get your personalized AI recommendations."}
            </h3>

            <p className="text-xs text-indigo-200">
              Calculated using exam proximity, student confidence scores & historical revision intervals.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 shrink-0">
            {displaySessions.length > 0 ? (
              <button
                onClick={() => onStartSession(displaySessions[0])}
                className="px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-950 text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Play className="w-4 h-4 fill-indigo-950 text-indigo-950" />
                <span>Start Session</span>
              </button>
            ) : (
              <button
                onClick={() => onNavigateTab('generate-plan')}
                className="px-5 py-3 bg-white hover:bg-indigo-50 text-indigo-950 text-xs font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all"
              >
                <Plus className="w-4 h-4 text-indigo-950" />
                <span>Create Study Schedule</span>
              </button>
            )}

            <button
              onClick={onAdaptPlan}
              disabled={!studyPlan?.sessions.length}
              className="px-5 py-3 bg-indigo-800/80 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-semibold rounded-xl border border-indigo-500/40 flex items-center justify-center gap-2 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              <span>Adjust Plan</span>
            </button>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900 tracking-tight">TODAY'S STUDY PLAN</h3>
            <p className="text-xs text-slate-500">Personalized schedule optimized for high retention</p>
          </div>
          <button
            onClick={() => onNavigateTab('study-plan')}
            className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
          >
            <span>View Full Schedule</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="divide-y divide-slate-100">
          {displaySessions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 space-y-3">
              <Award className="w-12 h-12 mx-auto text-slate-300" />
              <div>
                <p className="text-base font-bold text-slate-800">No study sessions scheduled yet</p>
                <p className="text-xs text-slate-500 mt-0.5">Add your subjects and exam dates, then generate your AI schedule.</p>
              </div>
              <button 
                onClick={() => onNavigateTab('subjects')}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs inline-flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add Your First Subject</span>
              </button>
            </div>
          ) : (
            displaySessions.map((session) => (
              <div 
                key={session.id} 
                className={`p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 transition-colors ${
                  session.status === 'COMPLETED' 
                    ? 'bg-emerald-50/30' 
                    : session.status === 'SKIPPED'
                    ? 'bg-amber-50/40'
                    : 'hover:bg-slate-50/80'
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className="px-3 py-2 bg-slate-100 rounded-xl text-center min-w-[80px]">
                    <span className="text-xs font-extrabold text-slate-900 block">{session.scheduled_time || '09:00 AM'}</span>
                    <span className="text-[10px] font-semibold text-slate-500">{session.duration_minutes} min</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {session.subject_name}
                      </span>

                      {session.priority === 'HIGH' && (
                        <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded-md border border-rose-200">
                          High Priority
                        </span>
                      )}
                      {session.priority === 'MEDIUM' && (
                        <span className="px-2 py-0.5 text-[10px] font-semibold bg-amber-100 text-amber-700 rounded-md border border-amber-200">
                          Medium Priority
                        </span>
                      )}
                      {session.status === 'COMPLETED' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded-md">
                          Completed ✓
                        </span>
                      )}
                      {session.status === 'SKIPPED' && (
                        <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded-md">
                          Skipped (Rescheduled)
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-1">
                      {session.topic_name}
                    </h4>

                    {session.skip_reason && (
                      <p className="text-xs text-amber-700 mt-0.5 italic">
                        Reason: "{session.skip_reason}"
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end md:self-center">
                  {session.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => onStartSession(session)}
                        className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-2xs flex items-center gap-1.5 transition-colors"
                      >
                        <Play className="w-3.5 h-3.5 fill-white" />
                        <span>Start</span>
                      </button>

                      <button
                        onClick={() => onCompleteSession(session)}
                        className="px-3 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold rounded-xl border border-emerald-200 transition-colors flex items-center gap-1"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Complete</span>
                      </button>

                      <button
                        onClick={() => onSkipSession(session)}
                        className="px-3 py-2 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-600 text-xs font-semibold rounded-xl border border-slate-200 transition-colors flex items-center gap-1"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Skip</span>
                      </button>
                    </>
                  )}

                  {session.status !== 'PENDING' && (
                    <button
                      onClick={() => onStartSession(session)}
                      className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-medium rounded-lg hover:bg-slate-200"
                    >
                      Review Material
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
