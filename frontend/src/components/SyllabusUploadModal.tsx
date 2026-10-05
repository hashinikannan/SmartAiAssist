import React, { useState } from 'react';
import { X, FileText, Sparkles, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
import { api } from '../services/api';
import type { SyllabusParseResponse, Subject } from '../types';

interface SyllabusUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubjectsExtracted: (subjects: Partial<Subject>[]) => void;
}

export const SyllabusUploadModal: React.FC<SyllabusUploadModalProps> = ({
  isOpen,
  onClose,
  onSubjectsExtracted
}) => {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [parseResult, setParseResult] = useState<SyllabusParseResponse | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selected = e.target.files[0];
      if (!selected.name.toLowerCase().endsWith('.pdf')) {
        setErrorMsg('Please select a valid PDF file (.pdf)');
        return;
      }
      setFile(selected);
      setErrorMsg(null);
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setIsUploading(true);
    setErrorMsg(null);

    try {
      const res = await api.uploadSyllabusPdf(file);
      setParseResult(res);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to process PDF syllabus. Please try another PDF file.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleConfirmAndSave = () => {
    if (parseResult && parseResult.subjects) {
      onSubjectsExtracted(parseResult.subjects);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 border border-slate-200 relative my-8">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Sparkles className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-slate-900">Upload Syllabus PDF</h2>
            <p className="text-xs text-slate-500">PyPDF & AI will extract subjects, units and important topics</p>
          </div>
        </div>

        {!parseResult && (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-slate-300 hover:border-indigo-400 bg-slate-50/50 rounded-2xl p-8 text-center transition-all cursor-pointer relative">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              <FileText className="w-12 h-12 mx-auto text-indigo-500 mb-2" />
              {file ? (
                <div>
                  <p className="text-sm font-bold text-slate-900">{file.name}</p>
                  <p className="text-xs text-slate-500 mt-0.5">{(file.size / 1024).toFixed(1)} KB PDF file</p>
                </div>
              ) : (
                <div>
                  <p className="text-sm font-semibold text-slate-700">Click to browse or drop your Syllabus PDF</p>
                  <p className="text-xs text-slate-400 mt-1">Supports standard PDF documents up to 20MB</p>
                </div>
              )}
            </div>

            {errorMsg && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2 text-xs font-semibold text-rose-700">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUpload}
                disabled={!file || isUploading}
                className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-2"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing with PyPDF & AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Extract Syllabus</span>
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {parseResult && (
          <div className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800 font-semibold">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{parseResult.summary}</span>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-3 max-h-72 overflow-y-auto">
              <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Identified Subjects ({parseResult.subjects.length})</h4>
              
              {parseResult.subjects.map((sub, sIdx) => (
                <div key={sIdx} className="bg-white p-3 rounded-xl border border-slate-200 space-y-2">
                  <div className="flex justify-between font-bold text-sm text-slate-900">
                    <span>{sub.name}</span>
                    <span className="text-xs font-normal text-slate-500">Exam: {sub.exam_date}</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {sub.topics.map((t, tIdx) => (
                      <span key={tIdx} className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-100 rounded text-[10px] font-semibold">
                        {t.name} ({t.difficulty})
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setParseResult(null)}
                className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Upload Different PDF
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSave}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Extracted Subjects</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
