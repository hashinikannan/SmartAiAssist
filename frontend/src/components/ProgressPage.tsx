import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid 
} from 'recharts';
import { LineChart, Flame, AlertTriangle } from 'lucide-react';
import type { ProgressSummary } from '../types';

interface ProgressPageProps {
  progress: ProgressSummary | null;
}

export const ProgressPage: React.FC<ProgressPageProps> = ({ progress }) => {
  const chartData = progress?.weekly_hours_chart || [
    { day: 'Mon', hours: 0, target: 3.0 },
    { day: 'Tue', hours: 0, target: 3.0 },
    { day: 'Wed', hours: 0, target: 3.0 },
    { day: 'Thu', hours: 0, target: 3.0 },
    { day: 'Fri', hours: 0, target: 3.0 },
    { day: 'Sat', hours: 0, target: 3.0 },
    { day: 'Sun', hours: 0, target: 3.0 }
  ];

  const subjectsProgress = progress?.subject_progress || [];

  const needsAttention = progress?.needs_attention || [];

  const overallPercent = progress?.overall_progress_percentage || 0;
  const weeklyHours = progress?.weekly_study_hours || 0;
  const completedTopics = progress?.completed_topics_count || 0;
  const streak = progress?.streak_days || 0;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8 font-sans">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <LineChart className="w-6 h-6 text-indigo-600" />
          <span>Learning Analytics & Progress</span>
        </h1>
        <p className="text-sm text-slate-600">Track your weekly study hours, syllabus mastery %, and weak areas needing revision.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Overall Progress</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {overallPercent}%
          </h3>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-2 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${overallPercent}%` }}></div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Weekly Study Hours</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {weeklyHours} Hours
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Logged this week</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Completed Topics</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1">
            {completedTopics} Topics
          </h3>
          <p className="text-xs text-slate-500 mt-1">Total finished</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <p className="text-xs font-semibold text-slate-500 uppercase">Study Streak</p>
          <h3 className="text-2xl font-extrabold text-amber-500 mt-1 flex items-center gap-2">
            <span>{streak} Days</span>
            <Flame className="w-5 h-5 fill-amber-500 text-amber-500" />
          </h3>
          <p className="text-xs text-slate-500 font-semibold mt-1">Daily study streak</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Weekly Study Hours Log</h3>
            <span className="text-xs text-slate-500 font-semibold">Actual vs Target</span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderRadius: '12px', border: 'none', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="hours" name="Actual Hours" fill="#4f46e5" radius={[6, 6, 0, 0]} />
                <Bar dataKey="target" name="Target Hours" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h3 className="text-base font-bold text-slate-900">Subject-wise Mastery</h3>
          {subjectsProgress.length === 0 ? (
            <div className="text-center py-8 text-slate-500 text-sm">
              <p className="font-semibold text-slate-700">No subjects added yet.</p>
              <p className="text-xs text-slate-500 mt-1">Add subjects to view mastery stats.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {subjectsProgress.map((sub) => (
                <div key={sub.id} className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-slate-800">{sub.name}</span>
                    <span className="text-indigo-600">{sub.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${sub.progress}%`, backgroundColor: sub.color || '#4f46e5' }}
                    ></div>
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium block">Exam: {sub.exam_date}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-5 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="text-base font-bold text-slate-900">Needs Attention (AI Weakness Flags)</h3>
          </div>
          <span className="text-xs text-slate-500 font-medium">Prioritized for upcoming study schedule</span>
        </div>

        {needsAttention.length === 0 ? (
          <div className="p-6 text-center text-slate-500 text-sm">
            No weak topics flagged right now. Excellent job staying on track!
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {needsAttention.map((item, idx) => (
              <div key={idx} className="p-4 flex items-center justify-between gap-4 hover:bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${item.severity === 'HIGH' ? 'bg-rose-500' : 'bg-amber-500'}`}></div>
                  <div>
                    <h4 className="text-sm font-bold text-slate-900">
                      {item.subject} — {item.topic}
                    </h4>
                    <p className="text-xs text-slate-500 mt-0.5">{item.reason}</p>
                  </div>
                </div>

                <span className={`px-2.5 py-1 text-[10px] font-extrabold rounded-lg ${
                  item.severity === 'HIGH' ? 'bg-rose-100 text-rose-700' : 'bg-amber-100 text-amber-800'
                }`}>
                  {item.severity} PRIORITY
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
