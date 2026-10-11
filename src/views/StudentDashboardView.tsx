import React from 'react';
import { Logo } from '../components/common/Logo';
import { Badge } from '../components/common/Badge';
import { AppView, StudentSession, Quiz, QuizAttempt, Subject } from '../types';
import {
  GraduationCap,
  KeyRound,
  Award,
  BookOpen,
  Clock,
  CheckCircle2,
  TrendingUp,
  History,
  ArrowRight,
  LogOut,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { formatDuration, formatQuizDate } from '../services/scoringService';

interface StudentDashboardViewProps {
  student: StudentSession;
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  subjects: Subject[];
  onNavigate: (view: AppView) => void;
  onSelectQuiz: (quiz: Quiz) => void;
  onSelectAttempt: (attempt: QuizAttempt) => void;
  onLogout: () => void;
}

export const StudentDashboardView: React.FC<StudentDashboardViewProps> = ({
  student,
  quizzes,
  attempts,
  subjects,
  onNavigate,
  onSelectQuiz,
  onSelectAttempt,
  onLogout,
}) => {
  // Student specific attempts and class quizzes
  const myAttempts = attempts.filter((a) => a.studentId === student.studentId);
  const classQuizzes = quizzes.filter(
    (q) => q.classId === student.classId && q.status === 'published'
  );

  // Statistics
  const totalCompleted = myAttempts.length;
  const avgPercentage =
    totalCompleted > 0
      ? (myAttempts.reduce((acc, a) => acc + a.percentage, 0) / totalCompleted).toFixed(1)
      : '0.0';
  const totalMarksEarned = myAttempts.reduce((acc, a) => acc + a.score, 0);

  return (
    <div className="space-y-8 pb-12">
      {/* Student Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800 relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 rounded-full bg-amber-400/10 blur-2xl pointer-events-none"></div>

        <div className="relative flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5">
            <div className="w-16 h-16 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-black text-xl shadow-lg border-2 border-white/20 shrink-0">
              C{student.classId}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-400/20 text-amber-300 border border-amber-400/30">
                  Student Scholar
                </span>
                <span className="text-xs font-mono text-blue-200 bg-white/10 px-2 py-0.5 rounded-md">
                  ID: {student.studentId}
                </span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white">{student.name}</h2>
              <p className="text-xs text-blue-200">
                Enrolled in <strong>Class {student.classId}</strong> • Genius Coaching Centre
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={() => onNavigate('join-quiz')}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-blue-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <KeyRound className="w-4 h-4" />
              <span>Join Quiz by Code</span>
            </button>
            <button
              onClick={onLogout}
              className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Switch Student</span>
            </button>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-[11px] font-medium text-blue-200">Quizzes Attempted</p>
            <p className="text-2xl font-black text-white mt-1">{totalCompleted}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-[11px] font-medium text-blue-200">Average Score</p>
            <p className="text-2xl font-black text-amber-300 mt-1">{avgPercentage}%</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-[11px] font-medium text-blue-200">Total Marks Earned</p>
            <p className="text-2xl font-black text-emerald-300 mt-1">{totalMarksEarned.toFixed(1)}</p>
          </div>

          <div className="bg-white/5 backdrop-blur-xs p-3.5 rounded-2xl border border-white/10">
            <p className="text-[11px] font-medium text-blue-200">Enrolled Class</p>
            <p className="text-2xl font-black text-white mt-1">Class {student.classId}</p>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Available Tests & Recent Results */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Assigned Quizzes for this Class */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>Active Quizzes for Class {student.classId}</span>
                <span className="text-xs bg-blue-100 text-blue-900 px-2 py-0.5 rounded-full font-bold">
                  {classQuizzes.length}
                </span>
              </h3>
              <p className="text-xs text-slate-500">
                Prepared by your coaching centre instructors for your syllabus
              </p>
            </div>

            <button
              onClick={() => onNavigate('join-quiz')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              Enter Code <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          {classQuizzes.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
              <BookOpen className="w-12 h-12 text-slate-300 mx-auto" />
              <p className="text-sm font-bold text-slate-700">No active quizzes for Class {student.classId}</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Your teachers have not published any quizzes for Class {student.classId} yet, or you can join a test using its unique code.
              </p>
              <button
                onClick={() => onNavigate('join-quiz')}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold"
              >
                Join with Quiz Code
              </button>
            </div>
          ) : (
            <div className="space-y-3.5">
              {classQuizzes.map((quiz) => {
                const subject = subjects.find((s) => s.id === quiz.subjectId);
                const existingAttempt = myAttempts.find((a) => a.quizId === quiz.id);

                return (
                  <div
                    key={quiz.id}
                    className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="blue">{subject?.name || 'Subject'}</Badge>
                        <span className="font-mono text-xs font-bold bg-slate-100 text-slate-700 px-2 py-0.5 rounded-md">
                          {quiz.code}
                        </span>
                        {existingAttempt && (
                          <Badge variant="green">
                            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                            Attempted ({existingAttempt.percentage}%)
                          </Badge>
                        )}
                      </div>

                      <h4 className="text-base font-bold text-slate-900 leading-snug">
                        {quiz.title}
                      </h4>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-slate-400" />
                          {quiz.durationMinutes} mins
                        </span>
                        <span>•</span>
                        <span>{quiz.questionIds.length} MCQs</span>
                        <span>•</span>
                        <span>{quiz.totalMarks} Marks</span>
                        {quiz.negativeMarking && (
                          <>
                            <span>•</span>
                            <span className="text-rose-600 font-medium">
                              Neg: -{quiz.negativeMarkValue}
                            </span>
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {existingAttempt ? (
                        <button
                          onClick={() => {
                            onSelectAttempt(existingAttempt);
                            onNavigate('results');
                          }}
                          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                        >
                          View Scorecard
                        </button>
                      ) : null}

                      <button
                        onClick={() => {
                          onSelectQuiz(quiz);
                          onNavigate('quiz-instructions');
                        }}
                        className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                      >
                        <span>{existingAttempt ? 'Retake' : 'Start Quiz'}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-amber-400" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Recent Attempts & Quick Links */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <History className="w-4 h-4 text-blue-800" />
                <span>Recent Scorecards</span>
              </h3>
              {myAttempts.length > 0 && (
                <button
                  onClick={() => onNavigate('student-history')}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                >
                  All ({myAttempts.length})
                </button>
              )}
            </div>

            {myAttempts.length === 0 ? (
              <div className="py-6 text-center space-y-2">
                <TrendingUp className="w-8 h-8 text-slate-300 mx-auto" />
                <p className="text-xs font-semibold text-slate-600">No attempts yet</p>
                <p className="text-[11px] text-slate-400">
                  Pick any active quiz to complete your first assessment!
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {myAttempts.slice(0, 4).map((att) => (
                  <div
                    key={att.id}
                    onClick={() => {
                      onSelectAttempt(att);
                      onNavigate('results');
                    }}
                    className="p-3.5 rounded-2xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 transition-all cursor-pointer group"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-slate-900 truncate group-hover:text-blue-900">
                          {att.quizTitle}
                        </p>
                        <p className="text-[10px] text-slate-500 mt-0.5">
                          {formatQuizDate(att.submittedAt)}
                        </p>
                      </div>
                      <span
                        className={`text-xs font-black px-2 py-0.5 rounded-md shrink-0 ${
                          att.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500 border-t border-slate-200/60 pt-2">
                      <span>
                        Score: <strong>{att.score}</strong> / {att.totalMarks}
                      </span>
                      <span className="font-semibold text-blue-800 flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                        Review <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Quick Helper Links */}
          <div className="bg-gradient-to-br from-amber-50 to-amber-100/60 rounded-3xl border border-amber-200 p-6 space-y-3">
            <div className="flex items-center gap-2.5 text-amber-900 font-extrabold text-sm">
              <Award className="w-5 h-5 text-amber-600" />
              <span>GCC Hall of Fame</span>
            </div>
            <p className="text-xs text-amber-800 leading-relaxed">
              Check top-ranked scholars across all quizzes in the Genius Coaching Centre Hall of Fame.
            </p>
            <button
              onClick={() => onNavigate('leaderboard')}
              className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>View Leaderboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
