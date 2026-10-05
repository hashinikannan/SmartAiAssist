import React, { useState } from 'react';
import { 
  Plus, Upload, Trash2, ChevronDown, ChevronUp, BookOpen
} from 'lucide-react';
import type { Subject } from '../types';

interface SubjectsPageProps {
  subjects: Subject[];
  onOpenAddModal: () => void;
  onOpenUploadModal: () => void;
  onDeleteSubject: (id: string) => void;
}

export const SubjectsPage: React.FC<SubjectsPageProps> = ({
  subjects,
  onOpenAddModal,
  onOpenUploadModal,
  onDeleteSubject
}) => {
  const [expandedSubjectId, setExpandedSubjectId] = useState<string | null>(subjects[0]?.id || null);

  const toggleExpand = (id: string) => {
    setExpandedSubjectId(expandedSubjectId === id ? null : id);
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6 font-sans">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">My Subjects & Syllabus</h1>
          <p className="text-sm text-slate-600">Manage your course subjects, syllabus topics, difficulty, and upcoming exam dates.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onOpenUploadModal}
            className="px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 shadow-2xs flex items-center gap-2 transition-colors"
          >
            <Upload className="w-4 h-4 text-indigo-600" />
            <span>Upload Syllabus PDF</span>
          </button>

          <button
            onClick={onOpenAddModal}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2 transition-all hover:scale-[1.02]"
          >
            <Plus className="w-4 h-4" />
            <span>Add Subject</span>
          </button>
        </div>
      </div>

      {subjects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center space-y-4 max-w-lg mx-auto my-8">
          <div className="w-16 h-16 mx-auto rounded-full bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <BookOpen className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No subjects added yet</h3>
            <p className="text-xs text-slate-500 mt-1">Start by adding your subjects and syllabus topics manually or by uploading a syllabus PDF.</p>
          </div>
          <div className="flex justify-center gap-3 pt-2">
            <button
              onClick={onOpenAddModal}
              className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              <span>Add Subject</span>
            </button>
            <button
              onClick={onOpenUploadModal}
              className="px-4 py-2.5 bg-white hover:bg-slate-50 text-indigo-700 text-xs font-bold rounded-xl border border-indigo-200 shadow-2xs flex items-center gap-2"
            >
              <Upload className="w-4 h-4 text-indigo-600" />
              <span>Upload PDF</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((sub) => {
            const isExpanded = expandedSubjectId === sub.id;
            const topicCount = sub.topics ? sub.topics.length : 0;
            const progressPct = sub.progress_percentage || 0;

            return (
              <div 
                key={sub.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-2xs hover:border-indigo-300 transition-all flex flex-col overflow-hidden"
              >
                <div className="p-5 flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-base">
                        {sub.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 leading-tight">{sub.name}</h3>
                        <p className="text-xs text-slate-500 font-medium">Exam: {sub.exam_date}</p>
                      </div>
                    </div>

                    <button
                      onClick={() => onDeleteSubject(sub.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                      title="Delete Subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs font-semibold mb-1">
                      <span className="text-slate-600">Syllabus Covered</span>
                      <span className="text-indigo-600">{progressPct}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div 
                        className="bg-indigo-600 h-full rounded-full transition-all duration-500"
                        style={{ width: `${progressPct}%` }}
                      ></div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-1">
                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Topics</span>
                      <span className="font-extrabold text-slate-800">{topicCount} Topics</span>
                    </div>

                    <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                      <span className="text-[10px] text-slate-500 uppercase font-semibold block">Difficulty</span>
                      <span className={`font-bold ${sub.difficulty === 'Hard' ? 'text-rose-600' : 'text-amber-600'}`}>
                        {sub.difficulty}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-slate-100 bg-slate-50/50 p-3 flex items-center justify-between">
                  <button
                    onClick={() => toggleExpand(sub.id)}
                    className="w-full text-xs font-bold text-slate-700 hover:text-indigo-600 flex items-center justify-between px-2 py-1"
                  >
                    <span>{isExpanded ? 'Hide Topics' : `View Topics (${topicCount})`}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="p-4 bg-slate-50 border-t border-slate-100 divide-y divide-slate-200/60 max-h-60 overflow-y-auto">
                    {sub.topics && sub.topics.length > 0 ? (
                      sub.topics.map((t, idx) => (
                        <div key={idx} className="py-2 text-xs flex items-center justify-between">
                          <span className="font-semibold text-slate-800">{t.name}</span>
                          <div className="flex items-center gap-1.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.difficulty === 'Hard' ? 'bg-rose-100 text-rose-700' : 'bg-slate-200 text-slate-700'
                            }`}>
                              {t.difficulty}
                            </span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.confidence === 'Low' ? 'bg-amber-100 text-amber-800' : 'bg-emerald-100 text-emerald-800'
                            }`}>
                              Conf: {t.confidence}
                            </span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-xs text-slate-400 italic py-2 text-center">No topics added yet.</p>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
