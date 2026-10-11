import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { AppView, TeacherUser, Quiz, QuizAttempt, StudentSession, Subject } from '../types';
import { storageService } from '../services/storageService';
import { formatDuration, formatQuizDate } from '../services/scoringService';
import {
  Users,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  FileSpreadsheet,
  PlusCircle,
  Search,
  Filter,
  Download,
  Award,
  Layers,
  Settings,
  ChevronRight,
  Clock,
  Trash2,
  Edit3,
} from 'lucide-react';

interface TeacherDashboardViewProps {
  teacher: TeacherUser;
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  students: StudentSession[];
  subjects: Subject[];
  onNavigate: (view: AppView) => void;
  onEditQuiz: (quiz: Quiz) => void;
  onSelectAttempt: (attempt: QuizAttempt) => void;
}

export const TeacherDashboardView: React.FC<TeacherDashboardViewProps> = ({
  teacher,
  quizzes,
  attempts,
  students,
  subjects,
  onNavigate,
  onEditQuiz,
  onSelectAttempt,
}) => {
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [selectedQuizId, setSelectedQuizId] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Statistics
  const totalStudents = students.length;
  const totalQuizzes = quizzes.length;
  const publishedQuizzes = quizzes.filter((q) => q.status === 'published').length;
  const totalAttempts = attempts.length;
  const avgAccuracy =
    totalAttempts > 0
      ? (attempts.reduce((sum, a) => sum + a.percentage, 0) / totalAttempts).toFixed(1)
      : '0.0';

  // Filtered recent attempts
  const filteredAttempts = attempts.filter((att) => {
    if (selectedClass !== 'all' && att.classId !== selectedClass) return false;
    if (selectedQuizId !== 'all' && att.quizId !== selectedQuizId) return false;
    if (searchTerm) {
      const match =
        att.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.quizTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
        att.quizCode.toLowerCase().includes(searchTerm.toLowerCase());
      if (!match) return false;
    }
    return true;
  });

  // Handle CSV Download
  const handleExportCSV = () => {
    const csvContent = storageService.generateResultsCSV(
      selectedQuizId === 'all' ? undefined : selectedQuizId
    );
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute(
      'download',
      `GCC_Quiz_Results_${new Date().toISOString().slice(0, 10)}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-8 pb-12">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-400/20 text-amber-300 text-xs font-bold border border-amber-400/30">
            <span>Faculty Control Center</span>
            <span>•</span>
            <span>{teacher.role.toUpperCase()}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-white">{teacher.name}</h1>
          <p className="text-xs sm:text-sm text-blue-200">
            {teacher.email} • Genius Coaching Centre Academic Portal
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          <button
            onClick={() => onNavigate('quiz-editor')}
            className="flex-1 md:flex-initial px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-blue-950 font-black text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Quiz</span>
          </button>

          <button
            onClick={() => onNavigate('question-bank')}
            className="px-4 py-2.5 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Layers className="w-4 h-4" />
            <span>Question Bank</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            title="Download CSV report of student test results"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* 5 Main Statistics Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalStudents}</p>
          <span className="text-[11px] text-slate-400">Classes 1 to 10</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Total Quizzes</span>
            <BookOpen className="w-4 h-4 text-blue-800" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalQuizzes}</p>
          <span className="text-[11px] text-blue-700 font-semibold">{publishedQuizzes} Published</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Attempts Taken</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-slate-900">{totalAttempts}</p>
          <span className="text-[11px] text-slate-400">Evaluated online</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Avg Accuracy</span>
            <TrendingUp className="w-4 h-4 text-amber-500" />
          </div>
          <p className="text-2xl sm:text-3xl font-black text-amber-900">{avgAccuracy}%</p>
          <span className="text-[11px] text-slate-400">Overall performance</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold uppercase tracking-wider">Management</span>
            <Settings className="w-4 h-4 text-slate-400" />
          </div>
          <div className="pt-1 flex flex-col gap-1 text-xs">
            <button
              onClick={() => onNavigate('class-subject-management')}
              className="text-left font-bold text-blue-700 hover:text-blue-900"
            >
              • Manage Syllabus →
            </button>
            <button
              onClick={() => onNavigate('student-management')}
              className="text-left font-bold text-blue-700 hover:text-blue-900"
            >
              • Student Records →
            </button>
          </div>
        </div>
      </div>

      {/* Class-wise Performance & Published Quizzes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Published Quizzes Management */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">
              Quizzes Portfolio ({quizzes.length})
            </h3>
            <button
              onClick={() => onNavigate('quiz-editor')}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Create New</span>
            </button>
          </div>

          <div className="space-y-3">
            {quizzes.map((quiz) => {
              const quizAttempts = attempts.filter((a) => a.quizId === quiz.id);
              const subject = subjects.find((s) => s.id === quiz.subjectId);

              return (
                <div
                  key={quiz.id}
                  className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 shadow-xs hover:border-blue-300 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="blue">Class {quiz.classId}</Badge>
                      <span className="font-mono text-xs font-black bg-slate-100 px-2 py-0.5 rounded-md text-slate-800">
                        {quiz.code}
                      </span>
                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-md ${
                          quiz.status === 'published'
                            ? 'bg-emerald-100 text-emerald-800'
                            : quiz.status === 'draft'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {quiz.status}
                      </span>
                    </div>

                    <h4 className="text-base font-bold text-slate-900 truncate">
                      {quiz.title}
                    </h4>

                    <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                      <span>{subject?.name || 'Subject'}</span>
                      <span>•</span>
                      <span>{quiz.questionIds.length} Questions</span>
                      <span>•</span>
                      <span>{quiz.durationMinutes} Mins</span>
                      <span>•</span>
                      <strong className="text-blue-900">{quizAttempts.length} Attempts</strong>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onEditQuiz(quiz)}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
                    >
                      <Edit3 className="w-3.5 h-3.5 text-slate-600" />
                      <span>Edit</span>
                    </button>

                    <button
                      onClick={() => {
                        onNavigate('leaderboard');
                      }}
                      className="px-3 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1 cursor-pointer"
                    >
                      <Award className="w-3.5 h-3.5 text-amber-500" />
                      <span>Ranks</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: Class-wise Performance Breakdown */}
        <div className="space-y-6">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-800" />
              <span>Class Performance Meter</span>
            </h3>

            <div className="space-y-3.5">
              {[10, 9, 8, 7, 6, 5].map((cls) => {
                const clsAttempts = attempts.filter((a) => a.classId === cls);
                const avg =
                  clsAttempts.length > 0
                    ? Math.round(
                        clsAttempts.reduce((sum, a) => sum + a.percentage, 0) / clsAttempts.length
                      )
                    : 0;

                return (
                  <div key={cls} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-700">Class {cls}</span>
                      <span className="text-slate-500 font-mono">
                        {clsAttempts.length} tests • <strong>{avg}% avg</strong>
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-blue-900 h-full rounded-full transition-all"
                        style={{ width: `${avg}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Syllabus Management Jump */}
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50/60 rounded-3xl border border-blue-200 p-6 space-y-3">
            <h4 className="text-sm font-black text-blue-950 flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-700" />
              <span>Curriculum & Syllabus Setup</span>
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed">
              Add custom chapters, topics, or subjects for Classes 1 to 10 aligned with CBSE, ICSE, or State board exams.
            </p>
            <button
              onClick={() => onNavigate('class-subject-management')}
              className="w-full py-2.5 bg-blue-900 hover:bg-blue-950 text-white font-bold text-xs rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Manage Subjects & Chapters</span>
              <ChevronRight className="w-4 h-4 text-amber-400" />
            </button>
          </div>
        </div>
      </div>

      {/* Filterable Student Test Results Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden space-y-4 p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Student Submissions & Score Log ({filteredAttempts.length})
            </h3>
            <p className="text-xs text-slate-500">
              Real-time audit log of student attempts across all active tests
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Class filter */}
            <select
              value={selectedClass}
              onChange={(e) =>
                setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))
              }
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer"
            >
              <option value="all">All Classes</option>
              {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                <option key={c} value={c}>
                  Class {c}
                </option>
              ))}
            </select>

            {/* Quiz filter */}
            <select
              value={selectedQuizId}
              onChange={(e) => setSelectedQuizId(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium cursor-pointer max-w-[150px] truncate"
            >
              <option value="all">All Quizzes</option>
              {quizzes.map((q) => (
                <option key={q.id} value={q.id}>
                  {q.code}: {q.title}
                </option>
              ))}
            </select>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
              <input
                type="text"
                placeholder="Search student or code..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 pr-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden"
              />
            </div>

            <button
              onClick={handleExportCSV}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition flex items-center gap-1 cursor-pointer"
            >
              <Download className="w-3.5 h-3.5" />
              <span>CSV</span>
            </button>
          </div>
        </div>

        {/* Results Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-100">
              <tr>
                <th className="py-3 px-4">Student</th>
                <th className="py-3 px-4">Class</th>
                <th className="py-3 px-4">Quiz Title</th>
                <th className="py-3 px-4">Marks</th>
                <th className="py-3 px-4">Percentage</th>
                <th className="py-3 px-4">Time Spent</th>
                <th className="py-3 px-4 text-right">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAttempts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    No student attempts matching current filters.
                  </td>
                </tr>
              ) : (
                filteredAttempts.map((att) => (
                  <tr
                    key={att.id}
                    onClick={() => {
                      onSelectAttempt(att);
                      onNavigate('results');
                    }}
                    className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-slate-900 group-hover:text-blue-900">
                        {att.studentName}
                      </p>
                      <p className="text-[10px] font-mono text-slate-400">{att.studentId}</p>
                    </td>

                    <td className="py-3.5 px-4">
                      <Badge variant="blue" size="sm">
                        Class {att.classId}
                      </Badge>
                    </td>

                    <td className="py-3.5 px-4 font-medium text-slate-800">
                      <span className="font-mono text-[11px] font-bold bg-slate-100 px-1.5 py-0.5 rounded-sm mr-1.5">
                        {att.quizCode}
                      </span>
                      {att.quizTitle}
                    </td>

                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {att.score} / {att.totalMarks}
                    </td>

                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 rounded-md font-bold text-xs ${
                          att.passed
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {att.percentage}%
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-500">
                      {formatDuration(att.timeTakenSeconds)}
                    </td>

                    <td className="py-3.5 px-4 text-right text-slate-400 text-[11px]">
                      {formatQuizDate(att.submittedAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
