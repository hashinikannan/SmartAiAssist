import React from 'react';
import { 
  LayoutDashboard, BookOpen, Calendar, LineChart, 
  Bot, HelpCircle, Sparkles, Settings, UserCheck, Flame 
} from 'lucide-react';

interface SidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  streakDays?: number;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentTab, setCurrentTab, streakDays = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'subjects', label: 'My Subjects', icon: BookOpen },
    { id: 'study-plan', label: 'Study Plan', icon: Sparkles },
    { id: 'calendar', label: 'Calendar', icon: Calendar },
    { id: 'progress', label: 'Progress', icon: LineChart },
    { id: 'tutor', label: 'AI Tutor', icon: Bot },
    { id: 'quiz', label: 'Quiz', icon: HelpCircle },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col h-screen sticky top-0 border-r border-slate-800 shadow-xl z-20">
      {/* Brand Header */}
      <div className="p-5 border-b border-slate-800 flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
          <Sparkles className="w-5 h-5 animate-pulse-subtle" />
        </div>
        <div>
          <h1 className="font-bold text-white text-lg tracking-tight">StudyMate AI</h1>
          <p className="text-xs text-indigo-400 font-medium">Adaptive Study Assistant</p>
        </div>
      </div>

      {/* Streak Banner */}
      <div className="mx-4 mt-4 p-3 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border border-amber-500/20 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Flame className="w-5 h-5 text-amber-500 fill-amber-500" />
          <span className="text-xs font-semibold text-amber-200">Study Streak</span>
        </div>
        <span className="text-sm font-extrabold text-amber-400">{streakDays} Days 🔥</span>
      </div>

      {/* Nav Menu */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Main Menu</div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
              <span>{item.label}</span>
              {item.id === 'study-plan' && (
                <span className="ml-auto px-1.5 py-0.5 text-[10px] font-semibold bg-indigo-500/20 text-indigo-300 rounded-full border border-indigo-500/30">
                  AI
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Footer Section */}
      <div className="p-4 border-t border-slate-800 space-y-1">
        <button
          onClick={() => setCurrentTab('settings')}
          className={`w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-colors ${
            currentTab === 'settings' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:bg-slate-800/40 hover:text-slate-200'
          }`}
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </button>
        <div className="pt-2 mt-2 border-t border-slate-800 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-200">
              ST
            </div>
            <div className="text-left">
              <p className="text-xs font-semibold text-slate-200 truncate w-24">Student</p>
              <p className="text-[10px] text-slate-500">Active Account</p>
            </div>
          </div>
          <UserCheck className="w-4 h-4 text-emerald-400" />
        </div>
      </div>
    </aside>
  );
};
