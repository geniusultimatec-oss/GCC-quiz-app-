import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { AppView, StudentSession, QuizAttempt } from '../types';
import { formatDuration, formatQuizDate } from '../services/scoringService';
import {
  History,
  ArrowLeft,
  Search,
  CheckCircle2,
  XCircle,
  Clock,
  Award,
  ChevronRight,
  BookOpen,
} from 'lucide-react';

interface StudentHistoryViewProps {
  student: StudentSession;
  attempts: QuizAttempt[];
  onNavigate: (view: AppView) => void;
  onSelectAttempt: (attempt: QuizAttempt) => void;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({
  student,
  attempts,
  onNavigate,
  onSelectAttempt,
}) => {
  const [search, setSearch] = useState('');

  const myAttempts = attempts.filter((a) => a.studentId === student.studentId);
  const filteredAttempts = search
    ? myAttempts.filter(
        (a) =>
          a.quizTitle.toLowerCase().includes(search.toLowerCase()) ||
          a.quizCode.toLowerCase().includes(search.toLowerCase())
      )
    : myAttempts;

  // Stats
  const total = myAttempts.length;
  const passed = myAttempts.filter((a) => a.passed).length;
  const avgPct =
    total > 0
      ? (myAttempts.reduce((acc, a) => acc + a.percentage, 0) / total).toFixed(1)
      : '0.0';

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('student-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Student Dashboard</span>
        </button>

        <span className="text-xs font-mono text-slate-500 bg-slate-100 px-2.5 py-1 rounded-lg">
          Student ID: {student.studentId}
        </span>
      </div>

      {/* Header & Stats Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <History className="w-6 h-6 text-blue-900" />
              <span>Assessment History & Scorecards</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Review your past test scores, accuracy percentages, and solution keys
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by test name or code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden focus:border-blue-700"
            />
          </div>
        </div>

        {/* 3 Metric Pills */}
        <div className="grid grid-cols-3 gap-3 pt-2 border-t border-slate-100 text-center">
          <div className="p-3 bg-blue-50/60 rounded-2xl border border-blue-100">
            <p className="text-[11px] font-bold text-blue-800 uppercase">Tests Attempted</p>
            <p className="text-xl font-black text-blue-950 mt-0.5">{total}</p>
          </div>
          <div className="p-3 bg-emerald-50/60 rounded-2xl border border-emerald-100">
            <p className="text-[11px] font-bold text-emerald-800 uppercase">Passed Tests</p>
            <p className="text-xl font-black text-emerald-800 mt-0.5">{passed}</p>
          </div>
          <div className="p-3 bg-amber-50/60 rounded-2xl border border-amber-100">
            <p className="text-[11px] font-bold text-amber-800 uppercase">Avg Percentage</p>
            <p className="text-xl font-black text-amber-900 mt-0.5">{avgPct}%</p>
          </div>
        </div>
      </div>

      {/* Attempts List */}
      <div className="space-y-3">
        {filteredAttempts.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-3">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No test attempts recorded</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {search
                ? 'No tests matched your search query.'
                : 'Join a test or browse class quizzes to take your first assessment!'}
            </p>
            <button
              onClick={() => onNavigate('student-dashboard')}
              className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold"
            >
              Browse Quizzes
            </button>
          </div>
        ) : (
          filteredAttempts.map((attempt) => (
            <div
              key={attempt.id}
              onClick={() => {
                onSelectAttempt(attempt);
                onNavigate('results');
              }}
              className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-blue-400 hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 cursor-pointer group"
            >
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xs font-black text-blue-900 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded-md">
                    {attempt.quizCode}
                  </span>
                  <Badge variant="blue">Class {attempt.classId}</Badge>
                  <span className="text-[11px] text-slate-400">
                    {formatQuizDate(attempt.submittedAt)}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-900 transition-colors truncate">
                  {attempt.quizTitle}
                </h3>

                <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                  <span>
                    Score: <strong>{attempt.score}</strong> / {attempt.totalMarks}
                  </span>
                  <span>•</span>
                  <span>{attempt.correctCount} Correct</span>
                  <span>•</span>
                  <span>{attempt.incorrectCount} Incorrect</span>
                  <span>•</span>
                  <span>{formatDuration(attempt.timeTakenSeconds)}</span>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <div className="text-right">
                  <div
                    className={`text-base font-black px-3 py-1 rounded-xl ${
                      attempt.passed
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {attempt.percentage}%
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mt-0.5 block">
                    {attempt.passed ? 'PASSED' : 'NEEDS PRACTICE'}
                  </span>
                </div>

                <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-blue-900 group-hover:translate-x-1 transition-all" />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
