import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Logo } from '../components/common/Logo';
import { Badge } from '../components/common/Badge';
import { AppView, QuizAttempt, Quiz, StudentSession } from '../types';
import { formatDuration, formatQuizDate } from '../services/scoringService';
import {
  Award,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Clock,
  ArrowRight,
  RotateCcw,
  Printer,
  ChevronRight,
  TrendingUp,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface ResultsViewProps {
  attempt: QuizAttempt;
  quiz?: Quiz;
  student: StudentSession;
  onNavigate: (view: AppView) => void;
  onRetakeQuiz?: () => void;
}

export const ResultsView: React.FC<ResultsViewProps> = ({
  attempt,
  quiz,
  student,
  onNavigate,
  onRetakeQuiz,
}) => {
  // Trigger confetti if scored 70%+
  useEffect(() => {
    if (attempt.percentage >= 60) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#1e40af', '#f59e0b', '#10b981', '#3b82f6'],
        });
      } catch {
        // Ignore confetti error
      }
    }
  }, [attempt.percentage]);

  const getPerformanceMessage = () => {
    if (attempt.percentage >= 90) return { title: 'Outstanding Performance! 🏆', desc: 'You have mastered this assessment with flying colors!' };
    if (attempt.percentage >= 75) return { title: 'Excellent Work! 🌟', desc: 'Great conceptual clarity and problem-solving skills.' };
    if (attempt.percentage >= 50) return { title: 'Good Effort! 👍', desc: 'Well done! A little more practice will make you unstoppable.' };
    return { title: 'Keep Practicing! 📚', desc: 'Review the answer explanations below to strengthen key topics.' };
  };

  const perf = getPerformanceMessage();

  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6 print:py-0 print:max-w-none">
      {/* Action Bar for Print & Return */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={() => onNavigate('student-dashboard')}
          className="text-xs font-bold text-slate-500 hover:text-blue-900 transition cursor-pointer"
        >
          ← Return to Student Dashboard
        </button>

        <button
          onClick={() => window.print()}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition cursor-pointer"
        >
          <Printer className="w-4 h-4 text-slate-600" />
          <span>Print / Save Scorecard</span>
        </button>
      </div>

      {/* Main Scorecard Card */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden print:border-none print:shadow-none">
        {/* Banner with Royal Blue & Gold */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-8 -mr-8 w-40 h-40 rounded-full bg-amber-400/10 blur-xl"></div>

          <div className="flex items-center justify-center gap-2 mb-2">
            <Badge variant="gold">Class {attempt.classId}</Badge>
            <span className="font-mono text-xs font-bold bg-white/10 px-2 py-0.5 rounded-md text-amber-300">
              Code: {attempt.quizCode}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white">{attempt.quizTitle}</h2>
          <p className="text-xs text-blue-200 mt-1">Official GCC Student Evaluation Report</p>

          {/* Central Percentage Badge */}
          <div className="mt-6 flex flex-col items-center justify-center">
            <div className="w-28 h-28 sm:w-32 sm:h-32 rounded-full bg-gradient-to-tr from-amber-400 via-amber-300 to-yellow-400 text-blue-950 flex flex-col items-center justify-center shadow-2xl border-4 border-white/20 select-none">
              <span className="text-3xl sm:text-4xl font-black leading-none">{attempt.percentage}%</span>
              <span className="text-[10px] font-extrabold uppercase tracking-widest mt-1 text-blue-900">
                {attempt.passed ? 'PASSED' : 'RETRY'}
              </span>
            </div>

            <div className="mt-4 space-y-1">
              <h3 className="text-lg font-black text-amber-300">{perf.title}</h3>
              <p className="text-xs text-blue-100 max-w-sm mx-auto">{perf.desc}</p>
            </div>
          </div>
        </div>

        {/* Student Details and Metrics Breakdown */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Candidate identification bar */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
            <div>
              <span className="text-slate-500">Student: </span>
              <strong className="text-slate-900">{attempt.studentName}</strong>
              <span className="text-slate-400 font-mono ml-2">({attempt.studentId})</span>
            </div>
            <div className="text-slate-500">
              Submitted: <strong>{formatQuizDate(attempt.submittedAt)}</strong>
            </div>
          </div>

          {/* 6 Key Performance Metric Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {/* Score */}
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 text-center">
              <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Score Obtained</p>
              <p className="text-2xl font-black text-blue-950 mt-1">
                {attempt.score} <span className="text-xs text-slate-500 font-normal">/ {attempt.totalMarks}</span>
              </p>
            </div>

            {/* Correct */}
            <div className="p-4 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-center">
              <p className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">Correct</p>
              <p className="text-2xl font-black text-emerald-700 mt-1 flex items-center justify-center gap-1">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>{attempt.correctCount}</span>
              </p>
            </div>

            {/* Incorrect */}
            <div className="p-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center">
              <p className="text-[11px] font-bold text-rose-800 uppercase tracking-wider">Incorrect</p>
              <p className="text-2xl font-black text-rose-700 mt-1 flex items-center justify-center gap-1">
                <XCircle className="w-5 h-5 text-rose-600" />
                <span>{attempt.incorrectCount}</span>
              </p>
            </div>

            {/* Unanswered */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Unanswered</p>
              <p className="text-2xl font-black text-slate-700 mt-1 flex items-center justify-center gap-1">
                <HelpCircle className="w-5 h-5 text-slate-400" />
                <span>{attempt.unansweredCount}</span>
              </p>
            </div>

            {/* Time Taken */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Time Taken</p>
              <p className="text-2xl font-black text-slate-800 mt-1 flex items-center justify-center gap-1">
                <Clock className="w-5 h-5 text-slate-400" />
                <span>{formatDuration(attempt.timeTakenSeconds)}</span>
              </p>
            </div>

            {/* Negative Deducted */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-center">
              <p className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">Neg. Penalty</p>
              <p className="text-2xl font-black text-slate-700 mt-1">
                {attempt.negativeMarksDeducted > 0 ? `-${attempt.negativeMarksDeducted}` : '0'}
              </p>
            </div>
          </div>

          {/* Next Steps Buttons */}
          <div className="space-y-3 pt-2 print:hidden">
            <button
              onClick={() => onNavigate('answer-review')}
              className="w-full py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              <span>Review Detailed Questions & Explanations</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => onNavigate('leaderboard')}
                className="py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Award className="w-4 h-4" />
                <span>Check Quiz Leaderboard</span>
              </button>

              <button
                onClick={() => onNavigate('student-dashboard')}
                className="py-3 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>Student Dashboard</span>
                <ChevronRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
