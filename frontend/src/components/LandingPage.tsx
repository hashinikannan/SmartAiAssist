import React from 'react';
import { Sparkles, ArrowRight, Play, Calendar, Zap, Brain } from 'lucide-react';

interface LandingPageProps {
  onStart: () => void;
  onTryDemo: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onStart, onTryDemo }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      <nav className="max-w-6xl mx-auto w-full px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-md shadow-indigo-600/20">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="font-bold text-xl text-slate-900 tracking-tight">StudyMate AI</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            onClick={onTryDemo}
            className="text-sm font-semibold text-slate-600 hover:text-slate-900 px-3 py-2 transition-colors"
          >
            Live Demo
          </button>
          <button
            onClick={onStart}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold rounded-lg shadow-sm shadow-indigo-600/20 transition-all"
          >
            Get Started
          </button>
        </div>
      </nav>

      <main className="flex-1 max-w-5xl mx-auto px-6 pt-16 pb-24 text-center flex flex-col items-center justify-center">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-semibold mb-8">
          <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
          <span>GenAI Hackathon Solution — Adaptive Study Scheduling</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 tracking-tight leading-tight max-w-3xl mb-6">
          Your Personal <span className="text-indigo-600 underline decoration-indigo-300 decoration-wavy decoration-2">AI Study Assistant</span>
        </h1>

        <p className="text-lg sm:text-xl text-slate-600 max-w-2xl leading-relaxed mb-10">
          Turn your syllabus, exam dates and available time into a personalized study plan that adapts as you learn.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto mb-16">
          <button
            onClick={onStart}
            className="w-full sm:w-auto px-8 py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-base rounded-xl shadow-lg shadow-indigo-600/25 flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Create My Study Plan</span>
            <ArrowRight className="w-5 h-5" />
          </button>

          <button
            onClick={onTryDemo}
            className="w-full sm:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-slate-800 font-bold text-base rounded-xl border border-slate-300 shadow-sm flex items-center justify-center gap-2.5 transition-all"
          >
            <Play className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span>Try Demo</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 w-full text-left pt-12 border-t border-slate-200">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 mb-4">
              <Calendar className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Personalized Planning</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Considers your exam dates, daily available hours, topic difficulty, and personal confidence levels to construct realistic study goals.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 mb-4">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">Adaptive Scheduling</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Skipped a session or struggled with a topic? AI instantly recalculates your remaining schedule so you never fall behind before exams.
            </p>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs hover:border-indigo-300 transition-all">
            <div className="w-12 h-12 rounded-xl bg-purple-50 border border-purple-100 flex items-center justify-center text-purple-600 mb-4">
              <Brain className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 mb-2">AI-Powered Learning</h3>
            <p className="text-sm text-slate-600 leading-relaxed">
              Ask your 24/7 AI tutor questions, generate instant practice MCQs, and track your topic mastery in real-time.
            </p>
          </div>
        </div>
      </main>

      <footer className="border-t border-slate-200 py-6 text-center text-xs text-slate-500 bg-white">
        <p>© 2026 StudyMate AI — Built for GenAI Hackathon. All rights reserved.</p>
      </footer>
    </div>
  );
};
