import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { Badge } from '../components/common/Badge';
import { AppView, Quiz, StudentSession } from '../types';
import { storageService } from '../services/storageService';
import { normalizeQuizCode } from '../services/scoringService';
import {
  KeyRound,
  ArrowRight,
  BookOpen,
  Clock,
  Award,
  AlertCircle,
  CheckCircle2,
  Sparkles,
} from 'lucide-react';

interface JoinQuizViewProps {
  onNavigate: (view: AppView) => void;
  onSelectQuiz: (quiz: Quiz) => void;
  currentStudent: StudentSession | null;
  quizzes: Quiz[];
}

export const JoinQuizView: React.FC<JoinQuizViewProps> = ({
  onNavigate,
  onSelectQuiz,
  currentStudent,
  quizzes,
}) => {
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [matchedQuiz, setMatchedQuiz] = useState<Quiz | null>(null);

  const publishedQuizzes = quizzes.filter((q) => q.status === 'published');

  const handleCodeChange = (val: string) => {
    const formatted = val.toUpperCase();
    setCode(formatted);
    setError(null);

    // Auto-search if at least 4 characters
    if (formatted.length >= 4) {
      const found = storageService.getQuizByCode(formatted);
      if (found && found.status === 'published') {
        setMatchedQuiz(found);
      } else {
        setMatchedQuiz(null);
      }
    } else {
      setMatchedQuiz(null);
    }
  };

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      setError('Please enter a valid Quiz Code.');
      return;
    }

    const clean = normalizeQuizCode(code);
    const quiz = storageService.getQuizByCode(clean);

    if (!quiz) {
      setError(`No active quiz found for code "${clean}". Please verify with your instructor.`);
      setMatchedQuiz(null);
      return;
    }

    if (quiz.status !== 'published') {
      setError(`This quiz is currently in ${quiz.status} status and not open for submissions.`);
      return;
    }

    onSelectQuiz(quiz);

    if (!currentStudent) {
      onNavigate('student-entry');
    } else {
      onNavigate('quiz-instructions');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10 space-y-6">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold mx-auto mb-3 shadow-lg">
            <KeyRound className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-white">Join Quiz by Code</h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Enter the unique 6-character code provided by your GCC teacher
          </p>
        </div>

        {/* Entry Form */}
        <form onSubmit={handleJoin} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-2">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Quiz Code
            </label>
            <div className="relative">
              <input
                type="text"
                autoFocus
                placeholder="e.g. GCC-101"
                value={code}
                onChange={(e) => handleCodeChange(e.target.value)}
                className="w-full px-4 py-4 text-center font-mono font-black text-2xl tracking-widest uppercase bg-slate-50 border-2 border-slate-300 rounded-2xl focus:bg-white focus:border-blue-800 focus:ring-4 focus:ring-blue-100 transition focus:outline-hidden text-blue-950 placeholder:text-slate-300"
              />
            </div>
            <p className="text-[11px] text-slate-500 text-center">
              Codes are formatted like GCC-101 or GCC-801 (not case sensitive)
            </p>
          </div>

          {/* Matched Quiz Card Preview */}
          {matchedQuiz && (
            <div className="p-4 rounded-2xl bg-blue-50/70 border border-blue-200 space-y-3 animate-in fade-in">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  Quiz Found!
                </span>
                <Badge variant="blue">Class {matchedQuiz.classId}</Badge>
              </div>

              <div>
                <h4 className="text-sm font-black text-blue-950">{matchedQuiz.title}</h4>
                <p className="text-xs text-slate-600 mt-0.5 line-clamp-2">
                  {matchedQuiz.description}
                </p>
              </div>

              <div className="flex items-center gap-3 text-xs text-slate-600 border-t border-blue-200/60 pt-2">
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {matchedQuiz.durationMinutes} mins
                </span>
                <span>•</span>
                <span>{matchedQuiz.questionIds.length} MCQs</span>
                <span>•</span>
                <span>{matchedQuiz.totalMarks} Marks</span>
              </div>
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            className="w-full py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/25 transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Proceed to Instructions</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>
        </form>
      </div>

      {/* Quick Click Available Codes */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600">
          <Sparkles className="w-4 h-4 text-amber-500" />
          <span>Quick Select from Published Quizzes:</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {publishedQuizzes.map((q) => (
            <button
              key={q.id}
              type="button"
              onClick={() => {
                setCode(q.code);
                setMatchedQuiz(q);
              }}
              className="p-3 text-left rounded-xl border border-slate-200 hover:border-blue-400 hover:bg-blue-50/50 transition cursor-pointer group"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-black text-blue-900 bg-blue-100/60 px-2 py-0.5 rounded-md group-hover:bg-blue-900 group-hover:text-white transition-colors">
                  {q.code}
                </span>
                <span className="text-[11px] font-semibold text-slate-500">
                  Class {q.classId}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 truncate mt-1.5">{q.title}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
