import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { AppView, Quiz, QuizAttempt, StudentSession } from '../types';
import { sortAndRankAttempts, formatDuration, formatQuizDate } from '../services/scoringService';
import {
  Award,
  Trophy,
  Medal,
  Clock,
  Search,
  Filter,
  User,
  CheckCircle2,
  Calendar,
} from 'lucide-react';

interface LeaderboardViewProps {
  quizzes: Quiz[];
  attempts: QuizAttempt[];
  currentStudent: StudentSession | null;
  onNavigate: (view: AppView) => void;
  selectedQuizId?: string;
}

export const LeaderboardView: React.FC<LeaderboardViewProps> = ({
  quizzes,
  attempts,
  currentStudent,
  onNavigate,
  selectedQuizId: initialQuizId,
}) => {
  const publishedQuizzes = quizzes.filter((q) => q.status === 'published');
  const [selectedQuizId, setSelectedQuizId] = useState<string>(
    initialQuizId || (publishedQuizzes[0]?.id ?? 'all')
  );
  const [search, setSearch] = useState('');

  // Filter attempts for selected quiz
  const filteredAttempts =
    selectedQuizId === 'all'
      ? attempts
      : attempts.filter((a) => a.quizId === selectedQuizId);

  // Apply tie-breaking sort & rank
  const rankedAttempts = sortAndRankAttempts(filteredAttempts);

  // Search filter
  const displayAttempts = search
    ? rankedAttempts.filter(
        (a) =>
          a.studentName.toLowerCase().includes(search.toLowerCase()) ||
          a.studentId.toLowerCase().includes(search.toLowerCase())
      )
    : rankedAttempts;

  const topThree = rankedAttempts.slice(0, 3);
  const activeQuiz = quizzes.find((q) => q.id === selectedQuizId);

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-blue-950 via-blue-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-blue-800 text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-400 to-yellow-400 text-blue-950 flex items-center justify-center font-black mx-auto mb-3 shadow-lg">
          <Trophy className="w-9 h-9" />
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-white">
          GCC Hall of Fame & Leaderboard
        </h1>
        <p className="text-xs sm:text-sm text-blue-200 mt-2 max-w-lg mx-auto">
          Celebrating top academic achievers at Genius Coaching Centre. Ranked strictly by highest score, fastest completion speed, and submission timestamp.
        </p>

        {/* Quiz selector */}
        <div className="mt-6 max-w-md mx-auto flex flex-col sm:flex-row items-center gap-3">
          <select
            value={selectedQuizId}
            onChange={(e) => setSelectedQuizId(e.target.value)}
            className="w-full bg-white/10 text-white font-bold text-xs sm:text-sm px-4 py-3 rounded-xl border border-white/20 focus:bg-blue-900 focus:outline-hidden cursor-pointer"
          >
            <option value="all" className="text-slate-900">
              🏆 All Quizzes Combined
            </option>
            {publishedQuizzes.map((q) => (
              <option key={q.id} value={q.id} className="text-slate-900">
                Class {q.classId}: {q.code} - {q.title}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Top 3 Podium Cards (if enough participants) */}
      {topThree.length > 0 && selectedQuizId !== 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end pt-4">
          {/* Rank 2 (Silver) */}
          {topThree[1] && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs text-center space-y-3 order-2 md:order-1 hover:border-slate-400 transition">
              <div className="w-12 h-12 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-black mx-auto text-lg shadow-sm border-2 border-slate-300">
                🥈 2nd
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 truncate">
                  {topThree[1].studentName}
                </h4>
                <p className="text-xs text-slate-500 font-mono">Class {topThree[1].classId}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-lg font-black text-slate-800">{topThree[1].percentage}%</p>
                <p className="text-[11px] text-slate-500">
                  {topThree[1].score}/{topThree[1].totalMarks} Marks • {formatDuration(topThree[1].timeTakenSeconds)}
                </p>
              </div>
            </div>
          )}

          {/* Rank 1 (Gold) */}
          {topThree[0] && (
            <div className="bg-gradient-to-b from-amber-50 to-white rounded-3xl border-2 border-amber-400 p-6 shadow-lg text-center space-y-3 order-1 md:order-2 -mt-4 transform md:-translate-y-2">
              <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-300 text-blue-950 flex items-center justify-center font-black mx-auto text-2xl shadow-md border-2 border-amber-200">
                🥇
              </div>
              <span className="inline-block text-[10px] font-black uppercase tracking-widest text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full">
                Champion • Rank 1
              </span>
              <div>
                <h3 className="text-lg font-black text-blue-950 truncate">
                  {topThree[0].studentName}
                </h3>
                <p className="text-xs text-slate-500 font-mono">Class {topThree[0].classId} • ID: {topThree[0].studentId}</p>
              </div>
              <div className="p-3.5 bg-amber-100/60 rounded-2xl border border-amber-200">
                <p className="text-2xl font-black text-amber-950">{topThree[0].percentage}%</p>
                <p className="text-xs text-amber-900 font-medium mt-0.5">
                  {topThree[0].score}/{topThree[0].totalMarks} Marks • {formatDuration(topThree[0].timeTakenSeconds)}
                </p>
              </div>
            </div>
          )}

          {/* Rank 3 (Bronze) */}
          {topThree[2] && (
            <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs text-center space-y-3 order-3 md:order-3 hover:border-amber-300 transition">
              <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-800 flex items-center justify-center font-black mx-auto text-lg shadow-sm border-2 border-amber-300">
                🥉 3rd
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 truncate">
                  {topThree[2].studentName}
                </h4>
                <p className="text-xs text-slate-500 font-mono">Class {topThree[2].classId}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
                <p className="text-lg font-black text-slate-800">{topThree[2].percentage}%</p>
                <p className="text-[11px] text-slate-500">
                  {topThree[2].score}/{topThree[2].totalMarks} Marks • {formatDuration(topThree[2].timeTakenSeconds)}
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ranked Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 sm:p-6 border-b border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-black text-slate-900">
              {activeQuiz ? `${activeQuiz.title} Ranking` : 'All Recorded Attempts'}
            </h3>
            <p className="text-xs text-slate-500">
              {displayAttempts.length} participants evaluated
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search student name or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {displayAttempts.length === 0 ? (
          <div className="p-10 text-center space-y-2">
            <Trophy className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No student attempts recorded yet</p>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              Be the first scholar to take this quiz and establish the top spot on the leaderboard!
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="py-3 px-4 sm:px-6 w-16">Rank</th>
                  <th className="py-3 px-4">Student</th>
                  <th className="py-3 px-4">Class</th>
                  <th className="py-3 px-4">Score</th>
                  <th className="py-3 px-4">Accuracy</th>
                  <th className="py-3 px-4">Speed</th>
                  <th className="py-3 px-4 sm:px-6 text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {displayAttempts.map((att) => {
                  const isCurrent = currentStudent?.studentId === att.studentId;
                  const medalIcons = ['🥇', '🥈', '🥉'];

                  return (
                    <tr
                      key={att.id}
                      className={`transition-colors ${
                        isCurrent
                          ? 'bg-blue-50/80 font-bold'
                          : 'hover:bg-slate-50/80'
                      }`}
                    >
                      <td className="py-3.5 px-4 sm:px-6">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs ${
                            att.rank === 1
                              ? 'bg-amber-400 text-slate-950 font-black'
                              : att.rank === 2
                              ? 'bg-slate-200 text-slate-800'
                              : att.rank === 3
                              ? 'bg-amber-100 text-amber-900'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {att.rank <= 3 ? medalIcons[att.rank - 1] : att.rank}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">
                            {att.studentName}
                          </span>
                          {isCurrent && (
                            <span className="text-[10px] bg-blue-200 text-blue-900 px-1.5 py-0.5 rounded-sm font-extrabold">
                              YOU
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-mono text-slate-400 block">
                          {att.studentId}
                        </span>
                      </td>

                      <td className="py-3.5 px-4">
                        <Badge variant="blue" size="sm">
                          Class {att.classId}
                        </Badge>
                      </td>

                      <td className="py-3.5 px-4 font-bold text-slate-900">
                        {att.score} <span className="text-slate-400 font-normal">/ {att.totalMarks}</span>
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

                      <td className="py-3.5 px-4 text-slate-600">
                        {formatDuration(att.timeTakenSeconds)}
                      </td>

                      <td className="py-3.5 px-4 sm:px-6 text-right text-slate-400 text-[11px]">
                        {formatQuizDate(att.submittedAt)}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
