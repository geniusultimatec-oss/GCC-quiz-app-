import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { AppView, StudentSession, QuizAttempt } from '../types';
import { formatQuizDate, formatDuration } from '../services/scoringService';
import {
  Users,
  ArrowLeft,
  Search,
  Filter,
  CheckCircle2,
  GraduationCap,
  Calendar,
  Clock,
  Award,
} from 'lucide-react';

interface StudentManagementViewProps {
  students: StudentSession[];
  attempts: QuizAttempt[];
  onNavigate: (view: AppView) => void;
  onSelectAttempt: (attempt: QuizAttempt) => void;
}

export const StudentManagementView: React.FC<StudentManagementViewProps> = ({
  students,
  attempts,
  onNavigate,
  onSelectAttempt,
}) => {
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [search, setSearch] = useState('');
  const [viewingStudent, setViewingStudent] = useState<StudentSession | null>(null);

  const filteredStudents = students.filter((s) => {
    if (selectedClass !== 'all' && s.classId !== selectedClass) return false;
    if (
      search &&
      !s.name.toLowerCase().includes(search.toLowerCase()) &&
      !s.studentId.toLowerCase().includes(search.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const studentAttempts = viewingStudent
    ? attempts.filter((a) => a.studentId === viewingStudent.studentId)
    : [];

  return (
    <div className="max-w-5xl mx-auto py-6 sm:py-10 space-y-6">
      {/* Top Bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => onNavigate('teacher-dashboard')}
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-blue-900 transition cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Teacher Dashboard</span>
        </button>

        <span className="text-xs font-bold text-blue-900 bg-blue-50 px-3 py-1 rounded-xl border border-blue-200">
          Total Registered: {students.length} Scholars
        </span>
      </div>

      {/* Header & Filter Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Users className="w-6 h-6 text-blue-900" />
              <span>Student Roster & Performance Records</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Classes 1 to 10 student directory with generated IDs and individual assessment records
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Class Filter */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <button
            onClick={() => setSelectedClass('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
              selectedClass === 'all'
                ? 'bg-blue-900 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Classes ({students.length})
          </button>
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => {
            const count = students.filter((s) => s.classId === c).length;
            return (
              <button
                key={c}
                onClick={() => setSelectedClass(c)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedClass === c
                    ? 'bg-blue-900 text-white'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}
              >
                Class {c} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Grid of Student Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStudents.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl border border-slate-200 p-8 text-center text-slate-500 text-xs">
            No students found matching current filters.
          </div>
        ) : (
          filteredStudents.map((student) => {
            const sAttempts = attempts.filter((a) => a.studentId === student.studentId);
            const avg =
              sAttempts.length > 0
                ? (
                    sAttempts.reduce((sum, a) => sum + a.percentage, 0) / sAttempts.length
                  ).toFixed(1)
                : 'N/A';

            return (
              <div
                key={student.studentId}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-blue-400 transition-all flex flex-col justify-between space-y-4"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="blue">Class {student.classId}</Badge>
                    <span className="font-mono text-[11px] font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
                      {student.studentId}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-slate-900">{student.name}</h3>

                  <div className="flex items-center gap-3 text-xs text-slate-500">
                    <span>
                      Tests taken: <strong>{sAttempts.length}</strong>
                    </span>
                    <span>•</span>
                    <span>
                      Avg: <strong>{avg}%</strong>
                    </span>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[11px] text-slate-400">
                    Active: {formatQuizDate(student.lastActiveAt).slice(0, 11)}
                  </span>
                  <button
                    onClick={() => setViewingStudent(student)}
                    className="font-bold text-blue-700 hover:text-blue-900 cursor-pointer"
                  >
                    View Tests ({sAttempts.length}) →
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Viewing Individual Student Modal */}
      {viewingStudent && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl max-h-[85vh] overflow-y-auto space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-lg font-black text-slate-900">{viewingStudent.name}</h3>
                <p className="text-xs text-slate-500 font-mono">
                  ID: {viewingStudent.studentId} • Class {viewingStudent.classId}
                </p>
              </div>
              <button
                onClick={() => setViewingStudent(null)}
                className="text-xs font-bold text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600">
                Attempted Assessments ({studentAttempts.length}):
              </h4>

              {studentAttempts.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">
                  This student has not attempted any quizzes yet.
                </p>
              ) : (
                studentAttempts.map((att) => (
                  <div
                    key={att.id}
                    onClick={() => {
                      onSelectAttempt(att);
                      setViewingStudent(null);
                      onNavigate('results');
                    }}
                    className="p-3.5 bg-slate-50 hover:bg-blue-50/60 rounded-xl border border-slate-200 transition cursor-pointer flex items-center justify-between gap-3 text-xs"
                  >
                    <div>
                      <p className="font-bold text-slate-900">{att.quizTitle}</p>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        {att.quizCode} • {formatQuizDate(att.submittedAt)}
                      </p>
                    </div>

                    <div className="text-right shrink-0">
                      <span className="font-bold text-sm text-blue-900">{att.percentage}%</span>
                      <p className="text-[10px] text-slate-400">
                        {att.score}/{att.totalMarks} Marks
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <button
              onClick={() => setViewingStudent(null)}
              className="w-full py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
