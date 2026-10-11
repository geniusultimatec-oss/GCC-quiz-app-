import React, { useState } from 'react';
import { Logo } from './Logo';
import { AppView, StudentSession, TeacherUser, AppSettings } from '../../types';
import {
  Menu,
  X,
  KeyRound,
  GraduationCap,
  LogOut,
  Settings,
  ShieldCheck,
} from 'lucide-react';

interface NavbarProps {
  currentView: AppView;
  onNavigate: (view: AppView) => void;
  currentStudent: StudentSession | null;
  currentTeacher: TeacherUser | null;
  onStudentLogout: () => void;
  onTeacherLogout: () => void;
  settings: AppSettings;
  firebaseActive: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  currentStudent,
  currentTeacher,
  onStudentLogout,
  onTeacherLogout,
  settings,
  firebaseActive,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200/90 shadow-2xs">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          {/* Brand Logo */}
          <div
            onClick={() => onNavigate('welcome')}
            className="cursor-pointer transition-transform hover:opacity-90 shrink-0"
          >
            <Logo size="md" customLogoUrl={settings.logoUrl} />
          </div>

          {/* Navigation Items (Visible on desktop & tablets, scrollable on mobile) */}
          <nav className="hidden lg:flex items-center gap-5 xl:gap-7 text-xs font-semibold text-slate-700">
            <button
              onClick={() => onNavigate('welcome')}
              className={`transition-colors cursor-pointer ${
                currentView === 'welcome'
                  ? 'text-blue-900 font-bold'
                  : 'hover:text-blue-900'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => onNavigate(currentStudent ? 'student-dashboard' : 'student-entry')}
              className={`transition-colors cursor-pointer ${
                ['student-entry', 'student-dashboard'].includes(currentView)
                  ? 'text-blue-900 font-bold'
                  : 'hover:text-blue-900'
              }`}
            >
              Student Entry
            </button>

            <button
              onClick={() => onNavigate('join-quiz')}
              className={`transition-colors cursor-pointer ${
                currentView === 'join-quiz'
                  ? 'text-blue-900 font-bold'
                  : 'hover:text-blue-900'
              }`}
            >
              Enter Quiz Code
            </button>

            <button
              onClick={() => onNavigate('leaderboard')}
              className={`transition-colors cursor-pointer ${
                currentView === 'leaderboard'
                  ? 'text-blue-900 font-bold'
                  : 'hover:text-blue-900'
              }`}
            >
              Hall of Fame
            </button>
          </nav>

          {/* Action Buttons on Right */}
          <div className="hidden sm:flex items-center gap-2.5 shrink-0">
            {currentStudent ? (
              <div className="flex items-center gap-2 bg-blue-50/80 border border-blue-200 pl-2.5 pr-1 py-1 rounded-lg text-xs">
                <span className="font-bold text-blue-950">
                  {currentStudent.name} (Cl. {currentStudent.classId})
                </span>
                <button
                  onClick={onStudentLogout}
                  title="Logout Student"
                  className="p-1 rounded-md text-slate-400 hover:text-rose-600 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('student-entry')}
                className="px-3 py-1.5 text-xs font-semibold text-blue-900 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition cursor-pointer"
              >
                Student Entry
              </button>
            )}

            {currentTeacher ? (
              <div className="flex items-center gap-2 bg-amber-50 border border-amber-200 pl-2.5 pr-1 py-1 rounded-lg text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                  Teacher Admin
                </span>
                <button
                  onClick={onTeacherLogout}
                  title="Logout Teacher"
                  className="p-1 rounded-md text-amber-600 hover:text-rose-600 transition cursor-pointer"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => onNavigate('teacher-login')}
                className="px-3.5 py-1.5 text-xs font-semibold text-white bg-[#19376d] hover:bg-blue-950 rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span>Teacher Portal</span>
              </button>
            )}

            <button
              onClick={() => onNavigate('settings')}
              title="Settings"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
            >
              <Settings className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Actions / Hamburger */}
          <div className="flex sm:hidden items-center gap-1.5">
            <button
              onClick={() => onNavigate(currentStudent ? 'student-dashboard' : 'student-entry')}
              className="px-2.5 py-1 text-[11px] font-semibold text-blue-900 bg-blue-50 border border-blue-200 rounded-md"
            >
              Entry
            </button>
            <button
              onClick={() => onNavigate(currentTeacher ? 'teacher-dashboard' : 'teacher-login')}
              className="px-2.5 py-1 text-[11px] font-semibold text-white bg-[#19376d] rounded-md flex items-center gap-1"
            >
              <KeyRound className="w-3 h-3 text-amber-400" />
              <span>Portal</span>
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:bg-slate-100 transition"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-t border-slate-100 bg-white px-4 py-3 space-y-2 shadow-lg animate-in slide-in-from-top-1">
          <div className="grid grid-cols-2 gap-2 text-xs font-semibold text-slate-700">
            <button
              onClick={() => {
                onNavigate('welcome');
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Home
            </button>
            <button
              onClick={() => {
                onNavigate(currentStudent ? 'student-dashboard' : 'student-entry');
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Student Entry
            </button>
            <button
              onClick={() => {
                onNavigate('join-quiz');
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Enter Quiz Code
            </button>
            <button
              onClick={() => {
                onNavigate('leaderboard');
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Hall of Fame
            </button>
            <button
              onClick={() => {
                onNavigate('teacher-dashboard');
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100"
            >
              Teacher Dashboard
            </button>
            <button
              onClick={() => {
                onNavigate('settings');
                setMobileMenuOpen(false);
              }}
              className="p-2 text-left rounded-lg bg-slate-50 hover:bg-slate-100 flex items-center gap-1"
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Settings</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
