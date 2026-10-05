import { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { Navbar } from './components/Navbar';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { SubjectsPage } from './components/SubjectsPage';
import { AddSubjectModal } from './components/AddSubjectModal';
import { SyllabusUploadModal } from './components/SyllabusUploadModal';
import { PlanGeneratorPage } from './components/PlanGeneratorPage';
import { StudyPlanPage } from './components/StudyPlanPage';
import { SkipReasonModal } from './components/AdaptiveModal';
import { StudySessionModal } from './components/StudySessionModal';
import { AITutorPage } from './components/AITutorPage';
import { QuizPage } from './components/QuizPage';
import { ProgressPage } from './components/ProgressPage';
import { CalendarPage } from './components/CalendarPage';
import { api } from './services/api';
import type { Subject, StudyPlan, StudySession, ProgressSummary } from './types';

export function App() {
  const [currentTab, setCurrentTab] = useState<string>('landing');

  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null);
  const [progress, setProgress] = useState<ProgressSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);

  const [isAddSubjectOpen, setIsAddSubjectOpen] = useState(false);
  const [isSyllabusUploadOpen, setIsSyllabusUploadOpen] = useState(false);
  const [skipModalSession, setSkipModalSession] = useState<StudySession | null>(null);
  const [activeStudySession, setActiveStudySession] = useState<StudySession | null>(null);

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const subs = await api.getSubjects();
        setSubjects(subs);

        const plan = await api.getStudyPlan();
        setStudyPlan(plan);

        const prog = await api.getProgress();
        setProgress(prog);
      } catch (e) {
        console.error('Error loading initial app data:', e);
      } finally {
        setIsLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSeedDemo = async () => {
    setIsSeeding(true);
    try {
      await api.seedDemo();
      const freshSubs = await api.getSubjects();
      setSubjects(freshSubs);
      const freshPlan = await api.getStudyPlan();
      setStudyPlan(freshPlan);
      const freshProg = await api.getProgress();
      setProgress(freshProg);
      setCurrentTab('dashboard');
    } catch (e) {
      console.error(e);
    } finally {
      setIsSeeding(false);
    }
  };

  const handleAddSubject = async (newSubData: Partial<Subject>) => {
    const created = await api.addSubject(newSubData);
    setSubjects((prev) => [...prev, created]);
  };

  const handleDeleteSubject = async (id: string) => {
    await api.deleteSubject(id);
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const handleSubjectsExtracted = async (extractedSubs: Partial<Subject>[]) => {
    for (const sub of extractedSubs) {
      const created = await api.addSubject(sub);
      setSubjects((prev) => [...prev, created]);
    }
    setCurrentTab('subjects');
  };

  const handleGeneratePlan = async (options: { daily_hours: number; preferred_time: string; study_days: string[] }) => {
    setIsLoading(true);
    try {
      const newPlan = await api.generateStudyPlan(options);
      setStudyPlan(newPlan);
      setCurrentTab('study-plan');
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCompleteSession = async (session: StudySession, confidence: 'Low' | 'Medium' | 'High' = 'Medium') => {
    await api.completeSession(session.id, confidence);
    const updatedPlan = await api.getStudyPlan();
    setStudyPlan(updatedPlan);
    const updatedProg = await api.getProgress();
    setProgress(updatedProg);
  };

  const handleOpenSkipModal = (session: StudySession) => {
    setSkipModalSession(session);
  };

  const handleConfirmSkip = async (sessionId: string, reason: string) => {
    await api.skipSession(sessionId, reason);
    const updatedPlan = await api.getStudyPlan();
    setStudyPlan(updatedPlan);
    setSkipModalSession(null);
  };

  const handleAdaptPlan = async () => {
    setIsLoading(true);
    try {
      const targetSessionId = skipModalSession?.id || (studyPlan?.sessions.find(s => s.status === 'SKIPPED')?.id) || 'sess-1';
      const adaptedPlan = await api.adaptStudyPlan(targetSessionId, "Student requested schedule adaptation");
      setStudyPlan(adaptedPlan);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartSession = (session: StudySession) => {
    setActiveStudySession(session);
  };

  if (currentTab === 'landing') {
    return (
      <LandingPage
        onStart={() => setCurrentTab('generate-plan')}
        onTryDemo={handleSeedDemo}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex text-slate-900 font-sans">
      <Sidebar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        streakDays={progress?.streak_days || 5}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <Navbar
          currentTab={currentTab}
          setCurrentTab={setCurrentTab}
          onSeedDemo={handleSeedDemo}
          isSeeding={isSeeding}
        />

        <main className="flex-1 overflow-y-auto">
          {currentTab === 'dashboard' && (
            <Dashboard
              subjects={subjects}
              studyPlan={studyPlan}
              onCompleteSession={(sess) => handleCompleteSession(sess, 'Medium')}
              onSkipSession={handleOpenSkipModal}
              onStartSession={handleStartSession}
              onAdaptPlan={handleAdaptPlan}
              onNavigateTab={setCurrentTab}
            />
          )}

          {currentTab === 'subjects' && (
            <SubjectsPage
              subjects={subjects}
              onOpenAddModal={() => setIsAddSubjectOpen(true)}
              onOpenUploadModal={() => setIsSyllabusUploadOpen(true)}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {currentTab === 'generate-plan' && (
            <PlanGeneratorPage
              subjects={subjects}
              onGeneratePlan={handleGeneratePlan}
              isGenerating={isLoading}
            />
          )}

          {currentTab === 'study-plan' && (
            <StudyPlanPage
              studyPlan={studyPlan}
              onCompleteSession={(sess) => handleCompleteSession(sess, 'Medium')}
              onSkipSession={handleOpenSkipModal}
              onStartSession={handleStartSession}
              onAdaptPlan={handleAdaptPlan}
              onRegeneratePlan={() => setCurrentTab('generate-plan')}
            />
          )}

          {currentTab === 'calendar' && (
            <CalendarPage
              studyPlan={studyPlan}
              subjects={subjects}
            />
          )}

          {currentTab === 'progress' && (
            <ProgressPage
              progress={progress}
            />
          )}

          {currentTab === 'tutor' && (
            <AITutorPage
              subjects={subjects}
            />
          )}

          {currentTab === 'quiz' && (
            <QuizPage
              subjects={subjects}
            />
          )}
        </main>
      </div>

      <AddSubjectModal
        isOpen={isAddSubjectOpen}
        onClose={() => setIsAddSubjectOpen(false)}
        onAddSubject={handleAddSubject}
      />

      <SyllabusUploadModal
        isOpen={isSyllabusUploadOpen}
        onClose={() => setIsSyllabusUploadOpen(false)}
        onSubjectsExtracted={handleSubjectsExtracted}
      />

      <SkipReasonModal
        isOpen={!!skipModalSession}
        session={skipModalSession}
        onClose={() => setSkipModalSession(null)}
        onConfirmSkip={handleConfirmSkip}
      />

      <StudySessionModal
        isOpen={!!activeStudySession}
        session={activeStudySession}
        onClose={() => setActiveStudySession(null)}
        onComplete={handleCompleteSession}
      />
    </div>
  );
}
export default App;
