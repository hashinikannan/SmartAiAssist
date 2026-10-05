import React, { useState } from 'react';
import { HelpCircle, Sparkles, CheckCircle2, XCircle, ArrowRight, Award } from 'lucide-react';
import confetti from 'canvas-confetti';
import { api } from '../services/api';
import type { QuizQuestion, QuizResult, Subject } from '../types';

interface QuizPageProps {
  subjects: Subject[];
}

export const QuizPage: React.FC<QuizPageProps> = ({ subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'General');
  const [selectedTopic, setSelectedTopic] = useState(subjects[0]?.topics[0]?.name || 'Core Concepts');
  const [numQuestions, setNumQuestions] = useState(5);
  const [difficulty, setDifficulty] = useState('Medium');

  const [isGenerating, setIsGenerating] = useState(false);
  const [questions, setQuestions] = useState<QuizQuestion[] | null>(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [userAnswers, setUserAnswers] = useState<number[]>([]);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const [quizResult, setQuizResult] = useState<QuizResult | null>(null);

  const handleStartQuiz = async () => {
    if (!selectedSubject.trim() || !selectedTopic.trim()) return;
    setIsGenerating(true);
    setQuizResult(null);
    setQuestions(null);
    setCurrentQuestionIdx(0);
    setUserAnswers([]);
    setSelectedOption(null);
    setShowExplanation(false);

    try {
      const qList = await api.generateQuiz(selectedSubject, selectedTopic, numQuestions, difficulty);
      setQuestions(qList);
    } catch (e) {
      console.error(e);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleSelectOption = (index: number) => {
    if (showExplanation) return;
    setSelectedOption(index);
  };

  const handleConfirmAnswer = () => {
    if (selectedOption === null) return;
    const newAnswers = [...userAnswers, selectedOption];
    setUserAnswers(newAnswers);
    setShowExplanation(true);
  };

  const handleNextQuestion = async () => {
    if (!questions) return;
    if (currentQuestionIdx < questions.length - 1) {
      setCurrentQuestionIdx((prev) => prev + 1);
      setSelectedOption(null);
      setShowExplanation(false);
    } else {
      try {
        const res = await api.submitQuiz(selectedSubject, selectedTopic, questions, userAnswers);
        setQuizResult(res);
        if (res.percentage >= 80) {
          confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });
        }
      } catch (e) {
        console.error(e);
      }
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-8 font-sans">
      <div className="text-center max-w-2xl mx-auto space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-50 border border-indigo-200 rounded-full text-indigo-700 text-xs font-semibold">
          <HelpCircle className="w-3.5 h-3.5 text-indigo-600" />
          <span>AI MCQ Quiz Generator</span>
        </div>
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Revise & Test Your Knowledge</h1>
        <p className="text-sm text-slate-600">
          Generate custom AI practice quizzes. Poorly scored topics are automatically flagged for study schedule adaptation.
        </p>
      </div>

      {!questions && !quizResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Subject</label>
              {subjects.length > 0 ? (
                <select
                  value={selectedSubject}
                  onChange={(e) => {
                    const subName = e.target.value;
                    setSelectedSubject(subName);
                    const subObj = subjects.find(s => s.name === subName);
                    if (subObj && subObj.topics.length > 0) {
                      setSelectedTopic(subObj.topics[0].name);
                    }
                  }}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none"
                >
                  {subjects.map((s) => (
                    <option key={s.id} value={s.name}>{s.name}</option>
                  ))}
                </select>
              ) : (
                <input
                  type="text"
                  value={selectedSubject}
                  onChange={(e) => setSelectedSubject(e.target.value)}
                  placeholder="Subject Name"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none"
                />
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Topic</label>
              <input
                type="text"
                value={selectedTopic}
                onChange={(e) => setSelectedTopic(e.target.value)}
                placeholder="Topic Name"
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Number of MCQs</label>
              <select
                value={numQuestions}
                onChange={(e) => setNumQuestions(parseInt(e.target.value))}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none"
              >
                <option value={3}>3 Questions (Quick Revision)</option>
                <option value={5}>5 Questions (Standard)</option>
                <option value={10}>10 Questions (Full Assessment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Difficulty Level</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm font-medium outline-none"
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard (Exam Level)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartQuiz}
            disabled={isGenerating || !selectedSubject.trim() || !selectedTopic.trim()}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm rounded-xl shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isGenerating ? (
              <>
                <Sparkles className="w-5 h-5 animate-spin" />
                <span>Generating AI MCQs...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Generate & Start Quiz</span>
              </>
            )}
          </button>
        </div>
      )}

      {questions && !quizResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <div>
              <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg">
                {selectedSubject} — {selectedTopic}
              </span>
            </div>
            <span className="text-xs font-extrabold text-slate-700">
              Question {currentQuestionIdx + 1} of {questions.length}
            </span>
          </div>

          {(() => {
            const q = questions[currentQuestionIdx];
            const isAnswered = showExplanation;
            return (
              <div className="space-y-5">
                <h3 className="text-lg font-bold text-slate-900 leading-snug">
                  {q.question}
                </h3>

                <div className="space-y-2.5">
                  {q.options.map((opt, optIdx) => {
                    let optionStyle = "bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100";
                    if (selectedOption === optIdx) {
                      optionStyle = "bg-indigo-50 border-indigo-500 text-indigo-950 font-bold shadow-2xs";
                    }
                    if (isAnswered) {
                      if (optIdx === q.correct_answer_index) {
                        optionStyle = "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold";
                      } else if (selectedOption === optIdx) {
                        optionStyle = "bg-rose-50 border-rose-500 text-rose-950 font-bold";
                      }
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleSelectOption(optIdx)}
                        disabled={isAnswered}
                        className={`w-full p-4 rounded-xl border text-xs text-left transition-all flex items-center justify-between ${optionStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-lg bg-white border border-slate-300 font-extrabold flex items-center justify-center shrink-0">
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span>{opt}</span>
                        </div>

                        {isAnswered && optIdx === q.correct_answer_index && (
                          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                        )}
                        {isAnswered && selectedOption === optIdx && optIdx !== q.correct_answer_index && (
                          <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {isAnswered && (
                  <div className="p-4 bg-indigo-50/70 border border-indigo-200 rounded-xl space-y-1 text-xs text-indigo-900 animate-in fade-in duration-200">
                    <div className="font-bold flex items-center gap-1.5 text-indigo-950">
                      <Sparkles className="w-4 h-4 text-indigo-600" />
                      <span>Explanation:</span>
                    </div>
                    <p className="leading-relaxed">{q.explanation}</p>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                  {!isAnswered ? (
                    <button
                      onClick={handleConfirmAnswer}
                      disabled={selectedOption === null}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow-xs"
                    >
                      Confirm Answer
                    </button>
                  ) : (
                    <button
                      onClick={handleNextQuestion}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs flex items-center gap-1.5"
                    >
                      <span>{currentQuestionIdx < questions.length - 1 ? 'Next Question' : 'View Results'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      )}

      {quizResult && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
            <Award className="w-10 h-10" />
          </div>

          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Quiz Completed!</h2>
            <p className="text-xs text-slate-500 mt-1">{selectedSubject} — {selectedTopic}</p>
          </div>

          <div className="py-4">
            <span className="text-5xl font-extrabold text-indigo-600">
              {quizResult.score} / {quizResult.total}
            </span>
            <span className="block text-sm font-bold text-slate-600 mt-1">
              Score: {quizResult.percentage}%
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-700 max-w-md mx-auto">
            {quizResult.feedback}
          </div>

          <div className="flex justify-center gap-4 pt-2">
            <button
              onClick={() => { setQuizResult(null); setQuestions(null); }}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl border border-slate-300"
            >
              Take Another Quiz
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
