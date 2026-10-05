import React, { useState } from 'react';
import { X, Sparkles, RefreshCw } from 'lucide-react';
import type { StudySession } from '../types';

interface SkipReasonModalProps {
  isOpen: boolean;
  session: StudySession | null;
  onClose: () => void;
  onConfirmSkip: (sessionId: string, reason: string) => void;
}

export const SkipReasonModal: React.FC<SkipReasonModalProps> = ({
  isOpen,
  session,
  onClose,
  onConfirmSkip
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("Didn't understand");
  const [customNotes, setCustomNotes] = useState('');

  if (!isOpen || !session) return null;

  const options = [
    "Didn't understand",
    "No time",
    "Too difficult",
    "Other"
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalReason = selectedReason === 'Other' && customNotes.trim() ? customNotes : selectedReason;
    onConfirmSkip(session.id, finalReason);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 relative animate-in fade-in zoom-in duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-amber-50 border border-amber-200 flex items-center justify-center text-amber-600 font-bold">
            <RefreshCw className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Skip Study Session</h3>
            <p className="text-xs text-slate-500">Why are you skipping "{session.topic_name}"?</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            {options.map((option) => (
              <label
                key={option}
                onClick={() => setSelectedReason(option)}
                className={`flex items-center gap-3 p-3 rounded-xl border text-xs font-bold cursor-pointer transition-all ${
                  selectedReason === option
                    ? 'bg-indigo-50 border-indigo-500 text-indigo-900 shadow-2xs'
                    : 'bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100'
                }`}
              >
                <input
                  type="radio"
                  name="skipReason"
                  checked={selectedReason === option}
                  onChange={() => setSelectedReason(option)}
                  className="accent-indigo-600"
                />
                <span>{option}</span>
              </label>
            ))}
          </div>

          {selectedReason === 'Other' && (
            <textarea
              placeholder="Specify your reason..."
              value={customNotes}
              onChange={(e) => setCustomNotes(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500"
              rows={2}
            />
          )}

          <div className="p-3 bg-indigo-50 border border-indigo-100 rounded-xl flex items-center gap-2 text-[11px] text-indigo-800">
            <Sparkles className="w-4 h-4 text-indigo-600 shrink-0" />
            <span>
              <strong>Adaptive AI Feature:</strong> StudyMate AI will analyze this reason to reschedule the topic into your remaining calendar without missing exam prep.
            </span>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-bold rounded-xl shadow-xs"
            >
              Mark Skipped & Trigger AI Adapt
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
