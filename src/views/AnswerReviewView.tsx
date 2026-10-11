import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { AppView, QuizAttempt, Question, Quiz } from '../types';
import {
  ArrowLeft,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Lightbulb,
  Award,
  Filter,
} from 'lucide-react';

interface AnswerReviewViewProps {
  attempt: QuizAttempt;
  questions: Question[];
  quiz?: Quiz;
  onNavigate: (view: AppView) => void;
}

export const AnswerReviewView: React.FC<AnswerReviewViewProps> = ({
  attempt,
  questions,
  quiz,
  onNavigate,
}) => {
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unanswered'>('all');

  const optionLetters = ['A', 'B', 'C', 'D'];

  const filteredQuestions = questions.filter((q) => {
    const studentAns = attempt.selectedAnswers[q.id];
    const isUnanswered = studentAns === undefined || studentAns === null;
    const isCorrect = !isUnanswered && studentAns === q.correctOptionIndex;
    const isIncorrect = !isUnanswered && studentAns !== q.correctOptionIndex;

    if (filter === 'correct') return isCorrect;
    if (filter === 'incorrect') return isIncorrect;
    if (filter === 'unanswered') return isUnanswered;
    return true;
  });

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 space-y-6">
      {/* Top Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <button
          onClick={() => onNavigate('results')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Scorecard</span>
        </button>

        <div className="text-right">
          <p className="text-xs text-slate-500">
            Score: <strong className="text-blue-900">{attempt.score} / {attempt.totalMarks}</strong> ({attempt.percentage}%)
          </p>
        </div>
      </div>

      {/* Review Header Banner */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
        <div>
          <h2 className="text-xl font-black text-slate-900">
            Question & Answer Solutions Review
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {attempt.quizTitle} • Class {attempt.classId}
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              filter === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Questions ({questions.length})
          </button>
          <button
            onClick={() => setFilter('correct')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filter === 'correct'
                ? 'bg-emerald-600 text-white'
                : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Correct ({attempt.correctCount})</span>
          </button>
          <button
            onClick={() => setFilter('incorrect')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filter === 'incorrect'
                ? 'bg-rose-600 text-white'
                : 'bg-rose-50 text-rose-800 hover:bg-rose-100'
            }`}
          >
            <XCircle className="w-3.5 h-3.5" />
            <span>Incorrect ({attempt.incorrectCount})</span>
          </button>
          <button
            onClick={() => setFilter('unanswered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              filter === 'unanswered'
                ? 'bg-slate-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>Unanswered ({attempt.unansweredCount})</span>
          </button>
        </div>
      </div>

      {/* Questions List */}
      <div className="space-y-6">
        {filteredQuestions.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
            No questions match the current filter.
          </div>
        ) : (
          filteredQuestions.map((q, idx) => {
            const studentAns = attempt.selectedAnswers[q.id];
            const isUnanswered = studentAns === undefined || studentAns === null;
            const isCorrect = !isUnanswered && studentAns === q.correctOptionIndex;
            const originalIndex = questions.findIndex((item) => item.id === q.id);

            return (
              <div
                key={q.id}
                className={`bg-white rounded-3xl border-2 p-6 shadow-xs space-y-5 transition-all ${
                  isCorrect
                    ? 'border-emerald-200 bg-white'
                    : isUnanswered
                    ? 'border-slate-200 bg-white'
                    : 'border-rose-200 bg-white'
                }`}
              >
                {/* Question Header */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-2">
                    <span className="font-black text-sm text-slate-800">
                      Q{originalIndex + 1}.
                    </span>
                    {isCorrect ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        Correct (+{q.marks} Marks)
                      </span>
                    ) : isUnanswered ? (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 bg-slate-100 px-2.5 py-0.5 rounded-md border border-slate-200">
                        <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                        Unanswered (0 Marks)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-700 bg-rose-50 px-2.5 py-0.5 rounded-md border border-rose-200">
                        <XCircle className="w-3.5 h-3.5 text-rose-600" />
                        Incorrect ({quiz?.negativeMarking ? `-${quiz.negativeMarkValue}` : '0'} Marks)
                      </span>
                    )}
                  </div>

                  <span className="text-xs font-mono text-slate-400">ID: {q.id}</span>
                </div>

                {/* Question Text */}
                <div className="text-base font-bold text-slate-900 leading-relaxed">
                  {q.text}
                </div>

                {/* 4 Options with Visual State */}
                <div className="space-y-2.5">
                  {q.options.map((optionText, optIdx) => {
                    const isRightAnswer = optIdx === q.correctOptionIndex;
                    const isStudentChoice = optIdx === studentAns;

                    let rowStyle = 'border-slate-200 bg-slate-50/50 text-slate-700';
                    let badgeLabel = null;

                    if (isRightAnswer) {
                      rowStyle = 'border-emerald-500 bg-emerald-50 text-emerald-950 font-bold';
                      badgeLabel = (
                        <span className="text-[11px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-md border border-emerald-300">
                          ✓ Correct Answer
                        </span>
                      );
                    } else if (isStudentChoice && !isRightAnswer) {
                      rowStyle = 'border-rose-400 bg-rose-50 text-rose-950 font-bold';
                      badgeLabel = (
                        <span className="text-[11px] font-bold text-rose-700 bg-rose-100 px-2 py-0.5 rounded-md border border-rose-300">
                          ✗ Your Choice
                        </span>
                      );
                    }

                    return (
                      <div
                        key={optIdx}
                        className={`p-3.5 rounded-2xl border-2 flex items-center justify-between gap-3 text-sm transition-colors ${rowStyle}`}
                      >
                        <div className="flex items-center gap-3">
                          <span
                            className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                              isRightAnswer
                                ? 'bg-emerald-600 text-white'
                                : isStudentChoice
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {optionLetters[optIdx]}
                          </span>
                          <span>{optionText}</span>
                        </div>

                        {badgeLabel}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation Box */}
                {q.explanation && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-amber-900">
                      <Lightbulb className="w-4 h-4 text-amber-600" />
                      <span>Conceptual Explanation:</span>
                    </div>
                    <p className="text-amber-950 leading-relaxed pl-5.5">
                      {q.explanation}
                    </p>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Bottom Nav */}
      <div className="pt-4 flex items-center justify-between">
        <button
          onClick={() => onNavigate('results')}
          className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
        >
          ← Return to Scorecard
        </button>
        <button
          onClick={() => onNavigate('student-dashboard')}
          className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
        >
          Go to Student Dashboard
        </button>
      </div>
    </div>
  );
};
