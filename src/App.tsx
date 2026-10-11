/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import {
  AppView,
  StudentSession,
  TeacherUser,
  Quiz,
  QuizAttempt,
  Question,
  Subject,
  Chapter,
  AppSettings,
} from './types';
import { storageService } from './services/storageService';
import { getFirebaseStatus } from './services/firebaseService';
import { subscribeToAuthChanges, logoutTeacher } from './services/firebaseClient';

// Common Components
import { Navbar } from './components/common/Navbar';
import { Footer } from './components/common/Footer';

// Views
import { WelcomeView } from './views/WelcomeView';
import { StudentEntryView } from './views/StudentEntryView';
import { StudentDashboardView } from './views/StudentDashboardView';
import { JoinQuizView } from './views/JoinQuizView';
import { QuizInstructionsView } from './views/QuizInstructionsView';
import { McqQuizView } from './views/McqQuizView';
import { ResultsView } from './views/ResultsView';
import { AnswerReviewView } from './views/AnswerReviewView';
import { StudentHistoryView } from './views/StudentHistoryView';
import { LeaderboardView } from './views/LeaderboardView';
import { TeacherLoginView } from './views/TeacherLoginView';
import { TeacherDashboardView } from './views/TeacherDashboardView';
import { QuizEditorView } from './views/QuizEditorView';
import { QuestionBankView } from './views/QuestionBankView';
import { StudentManagementView } from './views/StudentManagementView';
import { ClassSubjectManagementView } from './views/ClassSubjectManagementView';
import { SettingsView } from './views/SettingsView';

export default function App() {
  const [currentView, setCurrentView] = useState<AppView>('welcome');
  const [currentStudent, setCurrentStudent] = useState<StudentSession | null>(
    storageService.getCurrentStudent()
  );
  const [currentTeacher, setCurrentTeacher] = useState<TeacherUser | null>(
    storageService.getCurrentTeacher()
  );

  // Database reactive state
  const [quizzes, setQuizzes] = useState<Quiz[]>(storageService.getQuizzes());
  const [attempts, setAttempts] = useState<QuizAttempt[]>(storageService.getAttempts());
  const [students, setStudents] = useState<StudentSession[]>(storageService.getStudents());
  const [subjects, setSubjects] = useState<Subject[]>(storageService.getSubjects());
  const [chapters, setChapters] = useState<Chapter[]>(storageService.getChapters());
  const [questionBank, setQuestionBank] = useState<Question[]>(storageService.getQuestions());
  const [settings, setSettings] = useState<AppSettings>(storageService.getSettings());

  // Active Contexts
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [activeAttempt, setActiveAttempt] = useState<QuizAttempt | null>(null);
  const [quizToEdit, setQuizToEdit] = useState<Quiz | null>(null);

  // Subscribe to storage mutations
  useEffect(() => {
    const unsubscribe = storageService.subscribe(() => {
      setQuizzes(storageService.getQuizzes());
      setAttempts(storageService.getAttempts());
      setStudents(storageService.getStudents());
      setSubjects(storageService.getSubjects());
      setChapters(storageService.getChapters());
      setQuestionBank(storageService.getQuestions());
      setSettings(storageService.getSettings());
      setCurrentStudent(storageService.getCurrentStudent());
      setCurrentTeacher(storageService.getCurrentTeacher());
    });
    return unsubscribe;
  }, []);

  // Sync Firebase Teacher Auth state
  useEffect(() => {
    const unsubscribeAuth = subscribeToAuthChanges((teacher) => {
      if (teacher) {
        storageService.setTeacherSession(teacher);
        setCurrentTeacher(teacher);
      }
    });
    return unsubscribeAuth;
  }, []);

  const fbStatus = getFirebaseStatus();

  // Navigation Handler
  const handleNavigate = (view: AppView) => {
    // Scroll to top on navigation
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setCurrentView(view);
  };

  // Student Auth
  const handleStudentLogin = (student: StudentSession) => {
    setCurrentStudent(student);
  };

  const handleStudentLogout = () => {
    storageService.setCurrentStudent(null);
    setCurrentStudent(null);
    handleNavigate('welcome');
  };

  // Teacher Auth
  const handleTeacherLogin = (teacher: TeacherUser) => {
    setCurrentTeacher(teacher);
  };

  const handleTeacherLogout = () => {
    logoutTeacher().catch(() => {});
    storageService.setTeacherSession(null);
    setCurrentTeacher(null);
    handleNavigate('welcome');
  };

  // Selecting a Quiz to start
  const handleSelectQuiz = (quiz: Quiz) => {
    setActiveQuiz(quiz);
  };

  // Starting the Quiz
  const handleStartQuiz = () => {
    if (!activeQuiz) return;
    handleNavigate('mcq-quiz');
  };

  // Completing the Quiz
  const handleSubmitQuizAttempt = (attempt: QuizAttempt) => {
    storageService.saveAttempt(attempt);
    setActiveAttempt(attempt);
    handleNavigate('results');
  };

  // Editing a Quiz
  const handleEditQuiz = (quiz: Quiz) => {
    setQuizToEdit(quiz);
    handleNavigate('quiz-editor');
  };

  // Saving a Quiz
  const handleSaveQuiz = (quiz: Quiz) => {
    storageService.saveQuiz(quiz);
    setQuizToEdit(null);
  };

  // Get active quiz questions
  const getActiveQuizQuestions = (): Question[] => {
    if (!activeQuiz) return [];
    const questions = activeQuiz.questionIds
      .map((id) => questionBank.find((q) => q.id === id))
      .filter((q): q is Question => Boolean(q));

    if (activeQuiz.randomizeQuestions) {
      return [...questions].sort(() => Math.random() - 0.5);
    }
    return questions;
  };

  // Get questions for active attempt review
  const getAttemptQuestions = (): Question[] => {
    if (!activeAttempt) return [];
    const quiz = quizzes.find((q) => q.id === activeAttempt.quizId);
    if (quiz) {
      return quiz.questionIds
        .map((id) => questionBank.find((q) => q.id === id))
        .filter((q): q is Question => Boolean(q));
    }
    // Fallback: match by answer keys
    const answeredIds = Object.keys(activeAttempt.selectedAnswers);
    return questionBank.filter((q) => answeredIds.includes(q.id));
  };

  // Determine if we are in full-screen quiz mode (no header/footer distractions)
  const isTakingQuiz = currentView === 'mcq-quiz';

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900 selection:bg-amber-200 selection:text-amber-900 font-sans">
      {/* Hide standard navbar during active exam for distraction-free focus */}
      {!isTakingQuiz && (
        <Navbar
          currentView={currentView}
          onNavigate={handleNavigate}
          currentStudent={currentStudent}
          currentTeacher={currentTeacher}
          onStudentLogout={handleStudentLogout}
          onTeacherLogout={handleTeacherLogout}
          settings={settings}
          firebaseActive={fbStatus.isConfigured}
        />
      )}

      {/* Main Content Viewport */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {currentView === 'welcome' && (
          <WelcomeView
            onNavigate={handleNavigate}
            quizzes={quizzes}
            subjects={subjects}
            currentStudent={currentStudent}
            onSelectQuiz={handleSelectQuiz}
          />
        )}

        {currentView === 'student-entry' && (
          <StudentEntryView
            onNavigate={handleNavigate}
            onStudentLogin={handleStudentLogin}
            currentStudent={currentStudent}
            pendingQuizCode={activeQuiz?.code}
          />
        )}

        {currentView === 'student-dashboard' && currentStudent && (
          <StudentDashboardView
            student={currentStudent}
            quizzes={quizzes}
            attempts={attempts}
            subjects={subjects}
            onNavigate={handleNavigate}
            onSelectQuiz={handleSelectQuiz}
            onSelectAttempt={(att) => {
              setActiveAttempt(att);
            }}
            onLogout={handleStudentLogout}
          />
        )}

        {currentView === 'student-dashboard' && !currentStudent && (
          <StudentEntryView
            onNavigate={handleNavigate}
            onStudentLogin={handleStudentLogin}
            currentStudent={null}
          />
        )}

        {currentView === 'join-quiz' && (
          <JoinQuizView
            onNavigate={handleNavigate}
            onSelectQuiz={handleSelectQuiz}
            currentStudent={currentStudent}
            quizzes={quizzes}
          />
        )}

        {currentView === 'quiz-instructions' && activeQuiz && currentStudent && (
          <QuizInstructionsView
            quiz={activeQuiz}
            student={currentStudent}
            subject={subjects.find((s) => s.id === activeQuiz.subjectId)}
            onStartQuiz={handleStartQuiz}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'quiz-instructions' && (!activeQuiz || !currentStudent) && (
          <div className="text-center py-12 space-y-4">
            <p className="text-slate-600 font-bold">Please select a quiz and register as a student first.</p>
            <button
              onClick={() => handleNavigate('welcome')}
              className="px-5 py-2.5 bg-blue-900 text-white font-bold rounded-xl text-xs"
            >
              Go to Home
            </button>
          </div>
        )}

        {currentView === 'mcq-quiz' && activeQuiz && currentStudent && (
          <McqQuizView
            quiz={activeQuiz}
            questions={getActiveQuizQuestions()}
            student={currentStudent}
            onSubmit={handleSubmitQuizAttempt}
          />
        )}

        {currentView === 'results' && activeAttempt && currentStudent && (
          <ResultsView
            attempt={activeAttempt}
            quiz={quizzes.find((q) => q.id === activeAttempt.quizId) || activeQuiz || undefined}
            student={currentStudent}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'answer-review' && activeAttempt && (
          <AnswerReviewView
            attempt={activeAttempt}
            questions={getAttemptQuestions()}
            quiz={quizzes.find((q) => q.id === activeAttempt.quizId) || activeQuiz || undefined}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'student-history' && currentStudent && (
          <StudentHistoryView
            student={currentStudent}
            attempts={attempts}
            onNavigate={handleNavigate}
            onSelectAttempt={(att) => {
              setActiveAttempt(att);
            }}
          />
        )}

        {currentView === 'leaderboard' && (
          <LeaderboardView
            quizzes={quizzes}
            attempts={attempts}
            currentStudent={currentStudent}
            onNavigate={handleNavigate}
            selectedQuizId={activeQuiz?.id}
          />
        )}

        {currentView === 'teacher-login' && (
          <TeacherLoginView
            onNavigate={handleNavigate}
            onTeacherLogin={handleTeacherLogin}
          />
        )}

        {currentView === 'teacher-dashboard' && currentTeacher && (
          <TeacherDashboardView
            teacher={currentTeacher}
            quizzes={quizzes}
            attempts={attempts}
            students={students}
            subjects={subjects}
            onNavigate={handleNavigate}
            onEditQuiz={handleEditQuiz}
            onSelectAttempt={(att) => {
              setActiveAttempt(att);
            }}
          />
        )}

        {currentView === 'teacher-dashboard' && !currentTeacher && (
          <TeacherLoginView
            onNavigate={handleNavigate}
            onTeacherLogin={handleTeacherLogin}
          />
        )}

        {currentView === 'quiz-editor' && (
          <QuizEditorView
            quizToEdit={quizToEdit}
            teacher={currentTeacher || {
              id: 'T-demo',
              name: 'Teacher Demo',
              email: 'teacher@geniuscoaching.edu',
              role: 'teacher',
            }}
            subjects={subjects}
            chapters={chapters}
            questionBank={questionBank}
            onSaveQuiz={handleSaveQuiz}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'question-bank' && (
          <QuestionBankView
            questionBank={questionBank}
            subjects={subjects}
            chapters={chapters}
            onNavigate={handleNavigate}
            onRefresh={() => {
              setQuestionBank(storageService.getQuestions());
            }}
          />
        )}

        {currentView === 'student-management' && (
          <StudentManagementView
            students={students}
            attempts={attempts}
            onNavigate={handleNavigate}
            onSelectAttempt={(att) => {
              setActiveAttempt(att);
            }}
          />
        )}

        {currentView === 'class-subject-management' && (
          <ClassSubjectManagementView
            subjects={subjects}
            chapters={chapters}
            onNavigate={handleNavigate}
            onRefresh={() => {
              setSubjects(storageService.getSubjects());
              setChapters(storageService.getChapters());
            }}
          />
        )}

        {currentView === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={(newSettings) => {
              storageService.updateSettings(newSettings);
            }}
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Footer */}
      {!isTakingQuiz && <Footer settings={settings} onNavigate={handleNavigate} />}
    </div>
  );
}
