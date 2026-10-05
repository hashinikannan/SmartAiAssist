import React from 'react';
import { 
  Sparkles, Calendar, Clock, CheckCircle2, XCircle, 
  RefreshCw, Play
} from 'lucide-react';
import type { StudyPlan, StudySession } from '../types';

interface StudyPlanPageProps {
  studyPlan: StudyPlan | null;
  onCompleteSession: (session: StudySession) => void;
  onSkipSession: (session: StudySession) => void;
  onStartSession: (session: StudySession) => void;
  onAdaptPlan: () => void;
  onRegeneratePlan: () => void;
}

export const StudyPlanPage: React.FC<StudyPlanPageProps> = ({
  studyPlan,
  onCompleteSession,
  onSkipSession,
  onStartSession,
  onAdaptPlan,
  onRegeneratePlan
}) => {
  const sessions = studyPlan?.sessions || [];

  const groupedSessions: { [date: string]: StudySession[] } = {};
  sessions.forEach((sess) => {
    const d = sess.date || 'Today';
    if (!groupedSessions[d]) {
      groupedSessions[d] = [];
    }
    groupedSessions[d].push(sess);
  });

  const sortedDates = Object.keys(groupedSessions).sort();

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Personalized AI Study Schedule</span>
            <span className="px-2.5 py-0.5 text-xs bg-indigo-100 text-indigo-700 rounded-full font-bold">
              7-Day Adaptive
            </span>
          </h1>
          <p className="text-sm text-slate-600">
            Continuously balances weak topics, exam proximity, and session completion feedback.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onAdaptPlan}
            className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-extrabold rounded-xl shadow-md flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Adapt My Plan</span>
          </button>

          <button
            onClick={onRegeneratePlan}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-colors"
          >
            <Sparkles className="w-4 h-4" />
            <span>Regenerate with AI</span>
          </button>
        </div>
      </div>

      {studyPlan?.ai_recommendation && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-2xl p-5 flex items-start gap-3">
          <Sparkles className="w-5 h-5 text-indigo-600 mt-0.5 shrink-0" />
          <div className="text-xs space-y-1">
            <h4 className="font-bold text-indigo-900 uppercase tracking-wider">AI Scheduler Recommendation</h4>
            <p className="text-slate-700 leading-relaxed">{studyPlan.ai_recommendation}</p>
          </div>
        </div>
      )}

      <div className="space-y-8">
        {sortedDates.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-slate-500">
            <Calendar className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-800">No Study Sessions Scheduled</h3>
            <p className="text-xs mt-1">Click "Regenerate with AI" to generate your custom timetable.</p>
          </div>
        ) : (
          sortedDates.map((dateStr) => {
            const dateSessions = groupedSessions[dateStr];
            const dateObj = new Date(dateStr);
            const formattedDate = !isNaN(dateObj.getTime())
              ? dateObj.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
              : dateStr;

            return (
              <div key={dateStr} className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="px-3.5 py-1.5 bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-xs uppercase tracking-wider">
                    {formattedDate}
                  </div>
                  <span className="text-xs font-medium text-slate-500">
                    {dateSessions.length} session{dateSessions.length > 1 ? 's' : ''} planned
                  </span>
                  <div className="h-px bg-slate-200 flex-1"></div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {dateSessions.map((session) => (
                    <div
                      key={session.id}
                      className={`bg-white rounded-2xl border p-5 transition-all flex flex-col justify-between ${
                        session.status === 'COMPLETED'
                          ? 'border-emerald-200 bg-emerald-50/20'
                          : session.status === 'SKIPPED'
                          ? 'border-amber-300 bg-amber-50/30'
                          : 'border-slate-200 hover:border-indigo-300 shadow-2xs'
                      }`}
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-bold text-indigo-700 bg-indigo-50 px-2.5 py-1 rounded-lg border border-indigo-100">
                            {session.subject_name}
                          </span>

                          <div className="flex items-center gap-1.5">
                            {session.priority === 'HIGH' && (
                              <span className="px-2 py-0.5 text-[10px] font-extrabold bg-rose-100 text-rose-700 rounded border border-rose-200">
                                HIGH
                              </span>
                            )}
                            {session.status === 'COMPLETED' && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-emerald-100 text-emerald-800 rounded">
                                Completed ✓
                              </span>
                            )}
                            {session.status === 'SKIPPED' && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-amber-100 text-amber-800 rounded">
                                Skipped
                              </span>
                            )}
                          </div>
                        </div>

                        <div>
                          <h4 className="text-base font-bold text-slate-900 leading-snug">
                            {session.topic_name}
                          </h4>
                          <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                            <span className="flex items-center gap-1">
                              <Clock className="w-3.5 h-3.5 text-slate-400" />
                              {session.duration_minutes} mins
                            </span>
                            <span>•</span>
                            <span>{session.scheduled_time || '09:00 AM'}</span>
                          </div>
                        </div>

                        {session.skip_reason && (
                          <div className="p-2 bg-amber-100/60 rounded-lg text-[11px] text-amber-900 italic">
                            Skipped: "{session.skip_reason}"
                          </div>
                        )}
                      </div>

                      <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
                        {session.status === 'PENDING' ? (
                          <>
                            <button
                              onClick={() => onStartSession(session)}
                              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-lg flex items-center gap-1 transition-colors"
                            >
                              <Play className="w-3.5 h-3.5 fill-white" />
                              <span>Start</span>
                            </button>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => onCompleteSession(session)}
                                className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"
                                title="Mark Completed"
                              >
                                <CheckCircle2 className="w-4 h-4" />
                              </button>

                              <button
                                onClick={() => onSkipSession(session)}
                                className="p-1.5 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg"
                                title="Skip Session"
                              >
                                <XCircle className="w-4 h-4" />
                              </button>
                            </div>
                          </>
                        ) : (
                          <button
                            onClick={() => onStartSession(session)}
                            className="text-xs font-bold text-indigo-600 hover:text-indigo-800"
                          >
                            Review Topic →
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
