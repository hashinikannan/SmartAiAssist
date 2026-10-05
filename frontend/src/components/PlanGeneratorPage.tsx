import React, { useState } from 'react';
import { Sparkles, ShieldCheck } from 'lucide-react';
import type { Subject } from '../types';

interface PlanGeneratorPageProps {
  subjects: Subject[];
  onGeneratePlan: (options: { daily_hours: number; preferred_time: string; study_days: string[] }) => void;
  isGenerating: boolean;
}

export const PlanGeneratorPage: React.FC<PlanGeneratorPageProps> = ({
  subjects,
  onGeneratePlan,
  isGenerating
}) => {
  const [dailyHours, setDailyHours] = useState(3.0);
  const [preferredTime, setPreferredTime] = useState('Morning & Evening');
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]);

  const toggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter((d) => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const allDays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePlan({
      daily_hours: dailyHours,
      preferred_time: preferredTime,
      study_days: selectedDays
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>GenAI Study Optimizer</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Generate AI Study Plan</h1>
        <p className="text-sm text-slate-600">
          Our GenAI engine balances exam proximity, topic difficulty, student confidence scores, and daily available study time.
        </p>
      </div>

      <form onSubmit={handleFormSubmit} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Configured Subjects ({subjects.length})
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {subjects.map((sub) => (
              <div key={sub.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                <span className="font-bold text-slate-900 block">{sub.name}</span>
                <span className="text-slate-500 font-medium block mt-0.5">Exam: {sub.exam_date}</span>
                <span className="text-indigo-600 font-semibold block mt-1">{sub.topics?.length || 0} topics included</span>
              </div>
            ))}
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              Daily Study Hours Target
            </label>
            <span className="text-sm font-extrabold text-indigo-600 bg-indigo-50 px-2.5 py-0.5 rounded-lg border border-indigo-100">
              {dailyHours} Hours / Day
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="8"
            step="0.5"
            value={dailyHours}
            onChange={(e) => setDailyHours(parseFloat(e.target.value))}
            className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
          />
          <div className="flex justify-between text-[10px] text-slate-400 font-semibold mt-1">
            <span>1 Hour</span>
            <span>4 Hours</span>
            <span>8 Hours</span>
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Preferred Study Slots
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {['Early Morning', 'Morning & Evening', 'Night Focus'].map((slot) => (
              <button
                type="button"
                key={slot}
                onClick={() => setPreferredTime(slot)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  preferredTime === slot
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Active Study Days
          </label>
          <div className="flex flex-wrap gap-2">
            {allDays.map((day) => {
              const isSelected = selectedDays.includes(day);
              return (
                <button
                  type="button"
                  key={day}
                  onClick={() => toggleDay(day)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {day.substring(0, 3)}
                </button>
              );
            })}
          </div>
        </div>

        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 flex items-center gap-3 text-xs text-slate-600">
          <ShieldCheck className="w-5 h-5 text-indigo-600 shrink-0" />
          <span>
            <strong>Deterministic Scoring + GenAI Reasoning:</strong> Prioritizes topics using exam urgency scores, low confidence flags, and spacing retention principles.
          </span>
        </div>

        <button
          type="submit"
          disabled={isGenerating}
          className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Sparkles className="w-5 h-5 animate-spin" />
              <span>Generating GenAI Schedule...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-5 h-5" />
              <span>Generate Personalized Plan</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};
