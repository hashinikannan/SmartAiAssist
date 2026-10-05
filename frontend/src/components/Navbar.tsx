import React from 'react';
import { Sparkles, RefreshCw, Cpu } from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onSeedDemo: () => void;
  isSeeding: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onSeedDemo, isSeeding }) => {
  const getTabTitle = () => {
    switch (currentTab) {
      case 'dashboard': return 'Dashboard Overview';
      case 'subjects': return 'My Subjects & Syllabus';
      case 'study-plan': return 'Personalized AI Study Schedule';
      case 'calendar': return 'Study Calendar & Milestones';
      case 'progress': return 'Learning Analytics & Progress';
      case 'tutor': return 'AI Study Tutor';
      case 'quiz': return 'AI Quiz & Revision Engine';
      case 'generate-plan': return 'Study Plan Generator';
      default: return 'StudyMate AI';
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between sticky top-0 z-10 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-900 capitalize tracking-tight flex items-center gap-2">
          {getTabTitle()}
        </h2>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-100 border border-slate-200 rounded-full text-xs font-medium text-slate-700">
          <Cpu className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI Engine: <strong className="text-slate-900">Adaptive Smart AI</strong></span>
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
        </div>

        <button
          onClick={onSeedDemo}
          disabled={isSeeding}
          className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg border border-slate-300 transition-colors"
          title="Reset sample subjects and study plan for demo"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
          <span>Reset Demo Data</span>
        </button>

        <button
          onClick={() => setCurrentTab('generate-plan')}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold rounded-lg shadow-sm shadow-indigo-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Generate Plan</span>
        </button>
      </div>
    </header>
  );
};
