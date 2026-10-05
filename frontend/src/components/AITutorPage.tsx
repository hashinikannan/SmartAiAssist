import React, { useState } from 'react';
import { Bot, Send, Sparkles } from 'lucide-react';
import { api } from '../services/api';
import type { TutorMessage, Subject } from '../types';

interface AITutorPageProps {
  subjects: Subject[];
}

export const AITutorPage: React.FC<AITutorPageProps> = ({ subjects }) => {
  const [selectedSubject, setSelectedSubject] = useState(subjects[0]?.name || 'General');
  const [selectedTopic, setSelectedTopic] = useState(subjects[0]?.topics[0]?.name || 'General Concepts');
  const [inputMsg, setInputMsg] = useState('');
  const [isSending, setIsSending] = useState(false);

  const [chatHistory, setChatHistory] = useState<TutorMessage[]>([
    {
      sender: 'ai',
      text: `👋 Welcome! I am your **StudyMate AI Tutor**. Add your subjects or select a topic above, then ask me anything!`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }
  ]);

  const suggestedPrompts = [
    "Explain this topic simply",
    "Give me an example",
    "Quiz me",
    "Give me 5 MCQs",
    "Explain my mistake"
  ];

  const handleSend = async (messageText?: string) => {
    const textToSend = messageText || inputMsg;
    if (!textToSend.trim() || isSending) return;

    const userMsg: TutorMessage = {
      sender: 'user',
      text: textToSend,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatHistory((prev) => [...prev, userMsg]);
    setInputMsg('');
    setIsSending(true);

    try {
      const res = await api.sendTutorMessage(selectedSubject, selectedTopic, textToSend, chatHistory);
      setChatHistory((prev) => [...prev, res.reply]);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 font-sans flex flex-col h-[calc(100vh-5rem)]">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <Bot className="w-6 h-6 text-indigo-600" />
            <span>AI Study Tutor</span>
          </h1>
          <p className="text-sm text-slate-600">Understand difficult topics, ask questions and prepare for exams.</p>
        </div>

        <div className="flex items-center gap-2">
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
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold outline-none"
            >
              {subjects.map((s) => (
                <option key={s.id} value={s.name}>{s.name}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              placeholder="Subject Name"
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none w-36"
            />
          )}

          <input
            type="text"
            placeholder="Topic Name"
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            className="px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none w-40"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {chatHistory.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'ai' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-xl p-4 rounded-2xl text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-br-none shadow-xs font-medium'
                    : 'bg-slate-50 text-slate-800 border border-slate-200 rounded-bl-none font-normal'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>
                <span className={`text-[10px] block text-right ${msg.sender === 'user' ? 'text-indigo-200' : 'text-slate-400'}`}>
                  {msg.timestamp}
                </span>
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center shrink-0 text-xs font-bold">
                  ST
                </div>
              )}
            </div>
          ))}

          {isSending && (
            <div className="flex items-center gap-2 text-xs text-indigo-600 font-semibold italic">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>AI Tutor is thinking...</span>
            </div>
          )}
        </div>

        <div className="p-3 bg-slate-50 border-t border-slate-200 flex flex-wrap gap-2 overflow-x-auto">
          {suggestedPrompts.map((prompt) => (
            <button
              key={prompt}
              onClick={() => handleSend(prompt)}
              className="px-3 py-1.5 bg-white hover:bg-indigo-50 border border-slate-300 hover:border-indigo-300 text-slate-700 hover:text-indigo-700 text-xs font-semibold rounded-xl shadow-2xs transition-all shrink-0"
            >
              💡 {prompt}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-slate-200 bg-white flex items-center gap-3">
          <input
            type="text"
            placeholder={`Ask AI Tutor about ${selectedTopic}...`}
            value={inputMsg}
            onChange={(e) => setInputMsg(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(); }}
            className="flex-1 px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white"
          />

          <button
            onClick={() => handleSend()}
            disabled={!inputMsg.trim() || isSending}
            className="px-5 py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl shadow-xs font-bold text-xs flex items-center gap-2 transition-colors"
          >
            <span>Send</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
