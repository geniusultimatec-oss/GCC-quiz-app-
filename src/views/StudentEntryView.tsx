import React, { useState } from 'react';
import { Logo } from '../components/common/Logo';
import { AppView, StudentSession } from '../types';
import { storageService } from '../services/storageService';
import {
  GraduationCap,
  ArrowRight,
  User,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  Info,
} from 'lucide-react';

interface StudentEntryViewProps {
  onNavigate: (view: AppView) => void;
  onStudentLogin: (student: StudentSession) => void;
  currentStudent: StudentSession | null;
  pendingQuizCode?: string;
}

export const StudentEntryView: React.FC<StudentEntryViewProps> = ({
  onNavigate,
  onStudentLogin,
  currentStudent,
  pendingQuizCode,
}) => {
  const [name, setName] = useState(currentStudent?.name || '');
  const [selectedClass, setSelectedClass] = useState<number>(currentStudent?.classId || 10);
  const [error, setError] = useState<string | null>(null);
  const [generatedIdPreview, setGeneratedIdPreview] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Please enter your full name to continue.');
      return;
    }
    if (name.trim().length < 2) {
      setError('Student name must be at least 2 characters.');
      return;
    }

    try {
      const student = storageService.registerOrLoginStudent(name.trim(), selectedClass);
      setGeneratedIdPreview(student.studentId);
      onStudentLogin(student);

      // Short delay for user to see their generated ID confirmation
      setTimeout(() => {
        if (pendingQuizCode) {
          onNavigate('join-quiz');
        } else {
          onNavigate('student-dashboard');
        }
      }, 400);
    } catch (err) {
      setError('Unable to start student session. Please try again.');
    }
  };

  return (
    <div className="max-w-xl mx-auto py-6 sm:py-10">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white p-6 sm:p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 -mt-6 -mr-6 w-32 h-32 rounded-full bg-amber-400/10 blur-xl"></div>
          <div className="w-14 h-14 rounded-2xl bg-amber-400 text-blue-950 flex items-center justify-center font-bold mx-auto mb-3 shadow-lg">
            <GraduationCap className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-black text-white">Student Registration & Entry</h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1">
            Genius Coaching Centre • Classes 1 to 10 Assessment Portal
          </p>
        </div>

        {/* Content Form */}
        <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 animate-in fade-in">
              {error}
            </div>
          )}

          {currentStudent && !generatedIdPreview && (
            <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-2xl flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-blue-700 shrink-0" />
                <span className="text-blue-950">
                  Active session found: <strong>{currentStudent.name}</strong> (Class {currentStudent.classId})
                </span>
              </div>
              <button
                type="button"
                onClick={() => onNavigate('student-dashboard')}
                className="font-bold text-blue-700 hover:text-blue-900 underline"
              >
                Go to Dashboard
              </button>
            </div>
          )}

          {/* Student Name */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Student Full Name <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="w-5 h-5" />
              </div>
              <input
                type="text"
                required
                placeholder="e.g. Aarav Sharma / Priya Patel"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError(null);
                }}
                className="w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-700 focus:ring-2 focus:ring-blue-100 transition focus:outline-hidden"
              />
            </div>
            <p className="text-[11px] text-slate-500">
              Your name will appear on test scorecards and the leaderboard.
            </p>
          </div>

          {/* Class Grade Selection */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Select Your Class <span className="text-rose-500">*</span>
              </label>
              <span className="text-xs font-bold text-blue-900 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                Selected: Class {selectedClass}
              </span>
            </div>

            <div className="grid grid-cols-5 gap-2 sm:gap-2.5">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((cls) => {
                const isSelected = selectedClass === cls;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`py-3 rounded-xl font-black text-sm transition-all cursor-pointer border ${
                      isSelected
                        ? 'bg-blue-900 text-white border-blue-900 shadow-md shadow-blue-900/30 scale-102'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 hover:border-slate-300'
                    }`}
                  >
                    Cl. {cls}
                  </button>
                );
              })}
            </div>
            <p className="text-[11px] text-slate-500">
              Quizzes, subjects, and question banks will be filtered for Class {selectedClass}.
            </p>
          </div>

          {/* Information Notice */}
          <div className="p-3.5 bg-amber-50/70 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-900">
            <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <div className="leading-relaxed">
              <strong>Quick Student Access:</strong> No email or phone password is required. A permanent Student ID (e.g. GCC-S-XXXX) will be generated for your progress tracking.
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full py-3.5 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-bold text-sm rounded-xl shadow-lg shadow-blue-900/25 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Continue to Test Arena</span>
            <ArrowRight className="w-4 h-4 text-amber-400" />
          </button>

          {/* Teacher redirection */}
          <div className="text-center pt-2">
            <button
              type="button"
              onClick={() => onNavigate('teacher-login')}
              className="text-xs font-semibold text-slate-500 hover:text-blue-900 transition"
            >
              Are you a faculty member? Switch to Teacher Login →
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
