import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2 } from 'lucide-react';
import type { StudyPlan, Subject } from '../types';

interface CalendarPageProps {
  studyPlan: StudyPlan | null;
  subjects: Subject[];
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ studyPlan }) => {
  const [selectedDateStr, setSelectedDateStr] = useState<string>(new Date().toISOString().split('T')[0]);

  const sessions = studyPlan?.sessions || [];

  // Get sessions for selected day
  const selectedSessions = sessions.filter((s) => s.date === selectedDateStr || s.date.startsWith(selectedDateStr));

  // Generate 14 days calendar list for easy navigation
  const daysList = Array.from({ length: 14 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() + i);
    const dateStr = d.toISOString().split('T')[0];
    const count = sessions.filter((s) => s.date === dateStr || s.date.startsWith(dateStr)).length;
    return {
      dateStr,
      dayName: d.toLocaleDateString('en-US', { weekday: 'short' }),
      dayNum: d.getDate(),
      month: d.toLocaleDateString('en-US', { month: 'short' }),
      sessionCount: count
    };
  });

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <CalendarIcon className="w-6 h-6 text-indigo-600" />
          <span>Study Calendar & Milestones</span>
        </h1>
        <p className="text-sm text-slate-600">Visual schedule of study sessions, revision cycles, and exam target dates.</p>
      </div>

      {/* Days Horizontal Picker */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs overflow-x-auto">
        <div className="flex gap-3 min-w-max">
          {daysList.map((item) => {
            const isSelected = item.dateStr === selectedDateStr;
            return (
              <button
                key={item.dateStr}
                onClick={() => setSelectedDateStr(item.dateStr)}
                className={`p-3 rounded-2xl border text-center transition-all flex flex-col items-center min-w-[70px] ${
                  isSelected
                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <span className={`text-[10px] font-semibold uppercase ${isSelected ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {item.dayName}
                </span>
                <span className="text-lg font-extrabold my-0.5">{item.dayNum}</span>
                <span className={`text-[10px] font-bold ${isSelected ? 'text-indigo-100' : 'text-slate-500'}`}>
                  {item.month}
                </span>
                {item.sessionCount > 0 && (
                  <span className={`mt-1.5 w-2 h-2 rounded-full ${isSelected ? 'bg-white' : 'bg-indigo-600'}`}></span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Sessions for Selected Day */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs p-6 space-y-4">
        <h3 className="text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
          Schedule for {selectedDateStr}
        </h3>

        <div className="space-y-3">
          {selectedSessions.length === 0 ? (
            <p className="text-xs text-slate-400 italic py-6 text-center">
              No study sessions scheduled for this date.
            </p>
          ) : (
            selectedSessions.map((session) => (
              <div
                key={session.id}
                className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3">
                  <div className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-center font-mono text-xs font-bold text-slate-800">
                    {session.scheduled_time || '09:00 AM'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600">{session.subject_name}</span>
                      <span className="text-[10px] font-extrabold px-2 py-0.5 bg-slate-200 text-slate-700 rounded">
                        {session.duration_minutes}m
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 mt-0.5">{session.topic_name}</h4>
                  </div>
                </div>

                <div>
                  {session.status === 'COMPLETED' ? (
                    <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-lg flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                    </span>
                  ) : (
                    <span className="px-3 py-1 bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg">
                      Pending
                    </span>
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
