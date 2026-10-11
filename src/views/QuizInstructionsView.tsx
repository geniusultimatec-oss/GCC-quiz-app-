import React from 'react';
import { Badge } from '../components/common/Badge';
import { AppView, Quiz, StudentSession, Subject } from '../types';
import {
  Clock,
  Award,
  AlertTriangle,
  CheckCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  BookOpen,
  ArrowLeft,
} from 'lucide-react';

interface QuizInstructionsViewProps {
  quiz: Quiz;
  student: StudentSession;
  subject?: Subject;
  onStartQuiz: () => void;
  onNavigate: (view: AppView) => void;
}

export const QuizInstructionsView: React.FC<QuizInstructionsViewProps> = ({
  quiz,
  student,
  subject,
  onStartQuiz,
  onNavigate,
}) => {
  return (
    <div className="max-w-2xl mx-auto py-6 sm:py-10 space-y-6">
      <button
        onClick={() => onNavigate('student-dashboard')}
        className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Back to Student Dashboard</span>
      </button>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <Badge variant="gold">Class {quiz.classId}</Badge>
            <span className="font-mono text-xs font-bold bg-white/10 px-2 py-0.5 rounded-md text-amber-300">
              Code: {quiz.code}
            </span>
            <span className="text-xs text-blue-200">
              {subject?.name || 'General Academic Test'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-white leading-tight">
            {quiz.title}
          </h1>

          <p className="text-xs sm:text-sm text-blue-200 mt-2 leading-relaxed">
            {quiz.description}
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          {/* Student Candidate Identification */}
          <div className="p-4 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between">
            <div>
              <p className="text-[11px] font-bold text-blue-800 uppercase tracking-wider">Candidate Profile</p>
              <p className="text-sm font-black text-blue-950">{student.name}</p>
              <p className="text-xs text-slate-600 font-mono">
                Student ID: {student.studentId} • Class {student.classId}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-100/60 px-2.5 py-1 rounded-full">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Verified Student
              </span>
            </div>
          </div>

          {/* Test Parameters Overview */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <Clock className="w-5 h-5 text-blue-700 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500 font-medium">Duration</p>
              <p className="text-base font-black text-slate-900">{quiz.durationMinutes} Mins</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <BookOpen className="w-5 h-5 text-blue-700 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500 font-medium">Questions</p>
              <p className="text-base font-black text-slate-900">{quiz.questionIds.length} MCQs</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <Award className="w-5 h-5 text-amber-500 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500 font-medium">Total Marks</p>
              <p className="text-base font-black text-slate-900">{quiz.totalMarks}</p>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200">
              <CheckCircle className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
              <p className="text-[11px] text-slate-500 font-medium">Passing Mark</p>
              <p className="text-base font-black text-slate-900">{quiz.passingPercentage}%</p>
            </div>
          </div>

          {/* Marking Scheme Alert */}
          {quiz.negativeMarking ? (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div className="text-xs text-rose-900 leading-relaxed">
                <strong className="font-bold">Negative Marking is Active:</strong> For every incorrect answer,{' '}
                <strong>-{quiz.negativeMarkValue} marks</strong> will be deducted from your total score.
                Unanswered questions will not be penalized.
              </div>
            </div>
          ) : (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-xs text-emerald-900 font-medium">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                <strong>No Negative Marking:</strong> You are encouraged to attempt all questions without penalty for incorrect answers.
              </span>
            </div>
          )}

          {/* Instructions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Important Test Rules & Instructions:
            </h3>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  1
                </span>
                <span>
                  The countdown timer starts as soon as you click <strong>"Begin Test"</strong> and cannot be paused.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  2
                </span>
                <span>
                  Use the <strong>Question Palette</strong> to jump directly to any question. You can mark questions for review if you wish to revisit them.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  3
                </span>
                <span>
                  The quiz will <strong>automatically submit</strong> when the time reaches 00:00, saving all your selected answers.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-900 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                  4
                </span>
                <span>
                  After submitting, your score, percentage, leaderboard ranking, and question explanations will be generated immediately.
                </span>
              </li>
            </ul>
          </div>

          {/* Start Test Button */}
          <div className="pt-2">
            <button
              onClick={onStartQuiz}
              className="w-full py-4 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-extrabold text-base rounded-2xl shadow-xl shadow-blue-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>I Understand, Begin Test Now</span>
              <ArrowRight className="w-5 h-5 text-amber-400" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
