import React from 'react';
import { AppView, Quiz, Subject, StudentSession } from '../types';
import { storageService } from '../services/storageService';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  BookOpen,
  Award,
  Clock,
  CheckCircle2,
  Users,
  KeyRound,
  ShieldCheck,
} from 'lucide-react';

interface WelcomeViewProps {
  onNavigate: (view: AppView) => void;
  quizzes: Quiz[];
  subjects: Subject[];
  currentStudent: StudentSession | null;
  onSelectQuiz: (quiz: Quiz) => void;
}

export const WelcomeView: React.FC<WelcomeViewProps> = ({
  onNavigate,
  quizzes,
  subjects,
  currentStudent,
  onSelectQuiz,
}) => {
  const publishedQuizzes = quizzes.filter((q) => q.status === 'published');
  const studentsCount = storageService.getStudents().length;

  return (
    <div className="space-y-8 sm:space-y-10 pb-16">
      {/* 1. Hero Section matching screenshot */}
      <section className="relative overflow-hidden bg-gradient-to-r from-[#0c1f4a] via-[#102a6b] to-[#12285a] text-white rounded-3xl p-6 sm:p-10 shadow-xl border border-blue-900/60">
        <div className="relative max-w-3xl space-y-5">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-400/10 border border-amber-400/25 text-amber-300 text-xs font-medium tracking-wide">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            <span>Genius Coaching Centre (GCC) Assessment Engine</span>
          </div>

          {/* Main Title */}
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white leading-tight">
            Smart, Timed MCQ Assessments{' '}
            <span className="block mt-1 text-amber-400 font-black">
              for Classes 1 to 10
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-blue-100/90 max-w-2xl leading-relaxed">
            Welcome to the GCC Quiz portal. Practice chapter-wise tests, test yourself with instant countdown timers, review explanations, and compete on institute leaderboards.
          </p>

          {/* Action Buttons Row matching screenshot */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            {/* Student Entry (Amber) */}
            <button
              onClick={() => onNavigate(currentStudent ? 'student-dashboard' : 'student-entry')}
              className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-md transition flex items-center gap-2 cursor-pointer active:scale-98"
            >
              <GraduationCap className="w-4 h-4 text-slate-950" />
              <span>Student Entry</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Have a Quiz Code? (Blue) */}
            <button
              onClick={() => onNavigate('join-quiz')}
              className="px-5 py-2.5 bg-blue-800 hover:bg-blue-700 text-white font-medium text-xs sm:text-sm rounded-xl border border-blue-600/80 transition flex items-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-amber-400" />
              <span>Have a Quiz Code?</span>
            </button>

            {/* Teacher Portal (Translucent) */}
            <button
              onClick={() => onNavigate('teacher-login')}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/15 text-white/95 font-medium text-xs sm:text-sm rounded-xl border border-white/20 transition flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-blue-200" />
              <span>Teacher Portal</span>
            </button>
          </div>
        </div>
      </section>

      {/* 2. Key Stats 4-Card Row matching screenshot */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        {/* Card 1: Classes */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs tracking-wider uppercase">
            <BookOpen className="w-4 h-4 text-blue-600" />
            <span>CLASSES</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
            Class 1 – 10
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Universal syllabus coverage
          </p>
        </div>

        {/* Card 2: Live Quizzes */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-emerald-700 font-bold text-xs tracking-wider uppercase">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>LIVE QUIZZES</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
            {publishedQuizzes.length || 1}
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Available for attempt right now
          </p>
        </div>

        {/* Card 3: Students */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-blue-700 font-bold text-xs tracking-wider uppercase">
            <Users className="w-4 h-4 text-blue-600" />
            <span>STUDENTS</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
            {studentsCount || 5}
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Enrolled GCC students
          </p>
        </div>

        {/* Card 4: Rankings */}
        <div className="bg-white rounded-2xl border border-slate-200/90 p-4 sm:p-5 shadow-2xs space-y-1">
          <div className="flex items-center gap-1.5 text-amber-700 font-bold text-xs tracking-wider uppercase">
            <Award className="w-4 h-4 text-amber-500" />
            <span>RANKINGS</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight pt-1">
            Instant
          </div>
          <p className="text-xs text-slate-500 leading-snug">
            Automatic leaderboards & tie-breaks
          </p>
        </div>
      </section>

      {/* 3. Featured Active Quizzes Section matching screenshot */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Featured Active Quizzes
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Pick any test below or enter your teacher-provided quiz code
            </p>
          </div>

          <button
            onClick={() => onNavigate('join-quiz')}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <span>Enter Code</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Quiz Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {publishedQuizzes.map((quiz) => (
            <div
              key={quiz.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 shadow-2xs hover:border-blue-300 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Header row: Code pill & Class pill */}
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-0.5 rounded-md">
                    CODE : {quiz.code}
                  </span>
                  <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md">
                    Class {quiz.classId}
                  </span>
                </div>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-bold text-slate-900 leading-snug mt-3">
                  {quiz.title}
                </h3>

                {/* Meta details: mins, questions, marks */}
                <div className="flex items-center gap-2 text-xs text-slate-500 mt-2 font-medium">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {quiz.durationMinutes} mins
                  </span>
                  <span>·</span>
                  <span>{quiz.questionIds.length} Questions</span>
                  <span>·</span>
                  <span>{quiz.totalMarks} Marks</span>
                </div>
              </div>

              {/* Solid Royal Blue Action Button */}
              <button
                onClick={() => {
                  onSelectQuiz(quiz);
                  if (!currentStudent) {
                    onNavigate('student-entry');
                  } else {
                    onNavigate('quiz-instructions');
                  }
                }}
                className="w-full py-3 bg-[#19376d] hover:bg-blue-950 text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer active:scale-99"
              >
                <span>Start Test</span>
                <ArrowRight className="w-4 h-4 text-amber-400" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Supported Grades & Curriculum Section matching screenshot */}
      <section className="bg-slate-50/80 border border-slate-200/80 rounded-3xl p-6 sm:p-8 space-y-6">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900">
            Supported Grades & Curriculum
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Flexible teacher-managed syllabus covering CBSE, ICSE, and State Boards without restrictions.
          </p>
        </div>

        {/* 3 Wings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: Primary Wing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                PRIMARY WING
              </span>
              <h3 className="text-base font-bold text-slate-900">Classes 1 to 5</h3>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                English, Hindi, Mathematics, Environmental Studies (EVS), General Knowledge, and Computer basics.
              </p>
            </div>

            <button
              onClick={() => onNavigate('student-entry')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 text-left pt-2 cursor-pointer"
            >
              Foundational concepts & speed drills →
            </button>
          </div>

          {/* Card 2: Middle Wing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                MIDDLE WING
              </span>
              <h3 className="text-base font-bold text-slate-900">Classes 6 to 8</h3>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Mathematics, Science, Social Science, English, Hindi, Sanskrit, Computer Science, and General Knowledge.
              </p>
            </div>

            <button
              onClick={() => onNavigate('student-entry')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 text-left pt-2 cursor-pointer"
            >
              Analytical thinking & chapter mastery →
            </button>
          </div>

          {/* Card 3: Secondary Wing */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3 flex flex-col justify-between shadow-2xs">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                SECONDARY WING
              </span>
              <h3 className="text-base font-bold text-slate-900">Classes 9 & 10</h3>
              <p className="text-xs text-slate-600 leading-relaxed pt-1">
                Physics, Chemistry, Biology, Mathematics, Social Science, Language, Computer Applications & GK.
              </p>
            </div>

            <button
              onClick={() => onNavigate('student-entry')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 text-left pt-2 cursor-pointer"
            >
              Board exam rigor & competitive prep →
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
