import React, { useState, useEffect } from 'react';
import { X, Play, Pause, CheckCircle2, RotateCcw, Sparkles, Award } from 'lucide-react';
import type { StudySession } from '../types';

interface StudySessionModalProps {
  isOpen: boolean;
  session: StudySession | null;
  onClose: () => void;
  onComplete: (session: StudySession, confidence: 'Low' | 'Medium' | 'High') => void;
}

export const StudySessionModal: React.FC<StudySessionModalProps> = ({
  isOpen,
  session,
  onClose,
  onComplete
}) => {
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [confidence, setConfidence] = useState<'Low' | 'Medium' | 'High'>('High');

  useEffect(() => {
    if (session) {
      setTimeLeft(25 * 60);
      setIsActive(false);
      setIsFinished(false);
    }
  }, [session]);

  useEffect(() => {
    let timer: any = null;
    if (isActive && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isActive) {
      setIsActive(false);
      setIsFinished(true);
    }
    return () => clearInterval(timer);
  }, [isActive, timeLeft]);

  if (!isOpen || !session) return null;

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => {
    setTimeLeft(25 * 60);
    setIsActive(false);
  };

  const handleFinishSubmit = () => {
    onComplete(session, confidence);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4 font-sans">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl max-w-xl w-full p-8 text-white relative overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition-colors"
        >
          <X className="w-6 h-6" />
        </button>

        {!isFinished ? (
          <div className="text-center space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Daily Study Focus Mode</span>
            </div>

            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block">
                {session.subject_name}
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
                {session.topic_name}
              </h2>
              <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto">
                Learning Objective: Master core concepts, solve sample numerical problems, and revise key definitions.
              </p>
            </div>

            <div className="py-6">
              <div className="w-48 h-48 mx-auto rounded-full bg-gradient-to-tr from-indigo-900/50 to-slate-800 border-4 border-indigo-500/30 flex flex-col items-center justify-center shadow-inner shadow-indigo-500/20">
                <span className="text-5xl font-mono font-extrabold tracking-tight text-indigo-300">
                  {formattedTime}
                </span>
                <span className="text-[10px] text-slate-400 uppercase font-semibold mt-1">Focus Timer</span>
              </div>
            </div>

            <div className="flex items-center justify-center gap-4">
              <button
                onClick={toggleTimer}
                className={`px-8 py-3.5 rounded-2xl font-extrabold text-sm flex items-center gap-2 shadow-lg transition-all ${
                  isActive
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-amber-500/20'
                    : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-600/30'
                }`}
              >
                {isActive ? (
                  <>
                    <Pause className="w-5 h-5 fill-slate-950" />
                    <span>Pause Timer</span>
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 fill-white" />
                    <span>Start Session</span>
                  </>
                )}
              </button>

              <button
                onClick={resetTimer}
                className="p-3.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl border border-slate-700 transition-colors"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={() => setIsFinished(true)}
                className="px-5 py-3.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-400 font-bold text-sm rounded-2xl border border-emerald-500/30 transition-colors flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Finish</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-6 py-4 animate-in fade-in zoom-in duration-200">
            <div className="w-16 h-16 mx-auto rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Award className="w-8 h-8" />
            </div>

            <div>
              <h3 className="text-2xl font-bold text-white">Session Completed! 🎉</h3>
              <p className="text-xs text-slate-400 mt-1">
                How confident do you feel with <strong>{session.topic_name}</strong>?
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {(['Low', 'Medium', 'High'] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setConfidence(level)}
                  className={`p-4 rounded-2xl border text-xs font-extrabold flex flex-col items-center gap-1 transition-all ${
                    confidence === level
                      ? 'bg-indigo-600 border-indigo-400 text-white shadow-lg shadow-indigo-600/30 scale-105'
                      : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-sm">
                    {level === 'High' ? '💪 High' : level === 'Medium' ? '👍 Medium' : '⚠️ Low'}
                  </span>
                  <span className="text-[10px] text-slate-400 font-normal">
                    {level === 'High' ? 'Mastered' : level === 'Medium' ? 'Needs Practice' : 'Weak Topic'}
                  </span>
                </button>
              ))}
            </div>

            <p className="text-[11px] text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 p-3 rounded-xl">
              This confidence rating directly feeds into StudyMate's AI schedule engine to trigger optimal revision cycles!
            </p>

            <button
              onClick={handleFinishSubmit}
              className="w-full py-4 bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-extrabold text-sm rounded-2xl shadow-lg shadow-emerald-500/20 transition-all"
            >
              Save Progress & Return to Dashboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
