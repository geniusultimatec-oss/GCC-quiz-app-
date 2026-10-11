import React from 'react';
import { AppSettings, AppView } from '../../types';

interface FooterProps {
  settings: AppSettings;
  onNavigate: (view: AppView) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  return (
    <footer className="bg-[#0b132b] text-slate-300 border-t border-slate-800 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 sm:gap-10">
          {/* Column 1: Brand Info matching screenshot */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <img
                src={settings.logoUrl || '/gcc-logo.svg'}
                alt="GCC Emblem"
                className="w-8 h-8 rounded-full object-contain bg-white/10"
              />
              <h3 className="text-base font-extrabold text-white">
                Genius Coaching Centre (GCC)
              </h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              Empowering students from Class 1 to Class 10 with concept-driven assessments, timed MCQ challenges, transparent negative marking, and performance analytics.
            </p>
          </div>

          {/* Column 2: STUDENT HUB */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              STUDENT HUB
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('student-entry')}
                  className="hover:text-amber-400 text-slate-400 transition cursor-pointer"
                >
                  Student Sign In
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('join-quiz')}
                  className="hover:text-amber-400 text-slate-400 transition cursor-pointer"
                >
                  Enter Quiz Code
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('leaderboard')}
                  className="hover:text-amber-400 text-slate-400 transition cursor-pointer"
                >
                  Rankings & Leaderboard
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: FACULTY & ADMINISTRATION */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              FACULTY & ADMINISTRATION
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button
                  onClick={() => onNavigate('teacher-login')}
                  className="text-amber-400 hover:text-amber-300 font-semibold transition cursor-pointer"
                >
                  Teacher Portal Login
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('quiz-editor')}
                  className="hover:text-amber-400 text-slate-400 transition cursor-pointer"
                >
                  Create Assessment
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('class-subject-management')}
                  className="hover:text-amber-400 text-slate-400 transition cursor-pointer"
                >
                  Syllabus Management
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-10 pt-6 border-t border-slate-800/80 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p>© {new Date().getFullYear()} Genius Coaching Centre (GCC). All rights reserved.</p>
          <div className="flex items-center gap-3">
            <button
              onClick={() => onNavigate('settings')}
              className="hover:text-slate-300 transition cursor-pointer"
            >
              Storage & Firebase Settings
            </button>
            <span>•</span>
            <span className="text-amber-400">Classes 1 – 10 Assessment Portal</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
