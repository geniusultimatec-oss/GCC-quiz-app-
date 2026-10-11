import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { AppView, Question, Subject, Chapter } from '../types';
import { storageService } from '../services/storageService';
import {
  Layers,
  ArrowLeft,
  PlusCircle,
  Search,
  Filter,
  Edit3,
  Trash2,
  CheckCircle2,
  Lightbulb,
  Sparkles,
  BookOpen,
} from 'lucide-react';

interface QuestionBankViewProps {
  questionBank: Question[];
  subjects: Subject[];
  chapters: Chapter[];
  onNavigate: (view: AppView) => void;
  onRefresh: () => void;
}

export const QuestionBankView: React.FC<QuestionBankViewProps> = ({
  questionBank,
  subjects,
  chapters,
  onNavigate,
  onRefresh,
}) => {
  const [selectedClass, setSelectedClass] = useState<number | 'all'>('all');
  const [selectedSubject, setSelectedSubject] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Form fields for modal
  const [fClassId, setFClassId] = useState<number>(10);
  const [fSubjectId, setFSubjectId] = useState<string>('math');
  const [fChapterId, setFChapterId] = useState<string>('');
  const [fText, setFText] = useState('');
  const [fOpt0, setFOpt0] = useState('');
  const [fOpt1, setFOpt1] = useState('');
  const [fOpt2, setFOpt2] = useState('');
  const [fOpt3, setFOpt3] = useState('');
  const [fCorrect, setFCorrect] = useState(0);
  const [fExplanation, setFExplanation] = useState('');
  const [fMarks, setFMarks] = useState(2);
  const [fDifficulty, setFDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [formError, setFormError] = useState<string | null>(null);

  const filtered = questionBank.filter((q) => {
    if (selectedClass !== 'all' && q.classId !== selectedClass) return false;
    if (selectedSubject !== 'all' && q.subjectId !== selectedSubject) return false;
    if (search && !q.text.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const availableChaptersForModal = chapters.filter(
    (c) => c.classId === fClassId && c.subjectId === fSubjectId
  );

  const openCreateModal = () => {
    setEditingQuestion(null);
    setFClassId(10);
    setFSubjectId('math');
    setFChapterId('');
    setFText('');
    setFOpt0('');
    setFOpt1('');
    setFOpt2('');
    setFOpt3('');
    setFCorrect(0);
    setFExplanation('');
    setFMarks(2);
    setFDifficulty('medium');
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (q: Question) => {
    setEditingQuestion(q);
    setFClassId(q.classId);
    setFSubjectId(q.subjectId);
    setFChapterId(q.chapterId || '');
    setFText(q.text);
    setFOpt0(q.options[0] || '');
    setFOpt1(q.options[1] || '');
    setFOpt2(q.options[2] || '');
    setFOpt3(q.options[3] || '');
    setFCorrect(q.correctOptionIndex);
    setFExplanation(q.explanation || '');
    setFMarks(q.marks);
    setFDifficulty(q.difficulty);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSaveQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fText.trim()) {
      setFormError('Question text cannot be empty.');
      return;
    }
    if (!fOpt0.trim() || !fOpt1.trim() || !fOpt2.trim() || !fOpt3.trim()) {
      setFormError('All four options (A, B, C, D) must be provided.');
      return;
    }

    const question: Question = {
      id: editingQuestion?.id || `qb-${Date.now()}`,
      classId: fClassId,
      subjectId: fSubjectId,
      chapterId: fChapterId || undefined,
      text: fText.trim(),
      options: [fOpt0.trim(), fOpt1.trim(), fOpt2.trim(), fOpt3.trim()],
      correctOptionIndex: fCorrect,
      explanation: fExplanation.trim(),
      marks: fMarks,
      difficulty: fDifficulty,
      isSample: false,
      createdAt: editingQuestion?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storageService.saveQuestion(question);
    setIsModalOpen(false);
    onRefresh();
  };

  const handleDeleteConfirm = () => {
    if (deleteTargetId) {
      storageService.deleteQuestion(deleteTargetId);
      setDeleteTargetId(null);
      onRefresh();
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

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

        <button
          onClick={openCreateModal}
          className="px-4 py-2 bg-gradient-to-r from-blue-900 to-indigo-900 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-1.5 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-amber-400" />
          <span>Add New Question</span>
        </button>
      </div>

      {/* Header & Filter Card */}
      <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2.5">
              <Layers className="w-6 h-6 text-blue-900" />
              <span>GCC Question Bank ({questionBank.length})</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Curated multiple-choice questions for Classes 1 to 10 across all academic subjects
            </p>
          </div>

          <div className="w-full sm:w-64 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              placeholder="Search question text..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white focus:outline-hidden"
            />
          </div>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-100">
          <select
            value={selectedClass}
            onChange={(e) =>
              setSelectedClass(e.target.value === 'all' ? 'all' : Number(e.target.value))
            }
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Classes (1-10)</option>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>

          <select
            value={selectedSubject}
            onChange={(e) => setSelectedSubject(e.target.value)}
            className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold cursor-pointer"
          >
            <option value="all">All Subjects</option>
            {subjects.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Questions Cards List */}
      <div className="space-y-4">
        {filtered.length === 0 ? (
          <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center space-y-2">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-bold text-slate-700">No questions found</p>
            <p className="text-xs text-slate-500">
              Try adjusting your class/subject filters or add a new question using the button above.
            </p>
          </div>
        ) : (
          filtered.map((q, idx) => {
            const subject = subjects.find((s) => s.id === q.subjectId);

            return (
              <div
                key={q.id}
                className="bg-white rounded-3xl border border-slate-200 p-5 sm:p-6 shadow-xs hover:border-blue-300 transition-all space-y-4"
              >
                {/* Meta Bar */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-slate-100">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-xs font-black text-slate-400">#{idx + 1}</span>
                    <Badge variant="blue">Class {q.classId}</Badge>
                    <Badge variant="slate">{subject?.name || q.subjectId}</Badge>
                    <Badge variant="gold">+{q.marks} Marks</Badge>
                    <Badge variant="purple">{q.difficulty.toUpperCase()}</Badge>
                    {q.isSample && (
                      <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                        Sample Data (Editable)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => openEditModal(q)}
                      className="p-1.5 text-slate-600 hover:text-blue-900 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                      title="Edit question"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteTargetId(q.id)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition cursor-pointer"
                      title="Delete question"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Question Text */}
                <h3 className="text-base font-bold text-slate-900 leading-snug">{q.text}</h3>

                {/* 4 Options Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {q.options.map((opt, optIdx) => {
                    const isCorrect = optIdx === q.correctOptionIndex;
                    return (
                      <div
                        key={optIdx}
                        className={`p-2.5 rounded-xl border flex items-center justify-between gap-2 ${
                          isCorrect
                            ? 'bg-emerald-50/80 border-emerald-300 text-emerald-950 font-bold'
                            : 'bg-slate-50/60 border-slate-200 text-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span
                            className={`w-5 h-5 rounded-md flex items-center justify-center text-[10px] font-black shrink-0 ${
                              isCorrect
                                ? 'bg-emerald-700 text-white'
                                : 'bg-slate-200 text-slate-700'
                            }`}
                          >
                            {optionLetters[optIdx]}
                          </span>
                          <span>{opt}</span>
                        </div>
                        {isCorrect && (
                          <span className="text-[10px] text-emerald-700 font-bold">✓ Correct</span>
                        )}
                      </div>
                    );
                  })}
                </div>

                {/* Explanation */}
                {q.explanation && (
                  <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80 text-xs text-amber-950 flex items-start gap-2">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                    <span>
                      <strong>Explanation:</strong> {q.explanation}
                    </span>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Question Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 sm:p-8 shadow-2xl max-h-[90vh] overflow-y-auto space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-lg font-black text-slate-900">
                {editingQuestion ? 'Edit Question' : 'Add New Question to Question Bank'}
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 text-xs font-bold"
              >
                Close
              </button>
            </div>

            <form onSubmit={handleSaveQuestion} className="space-y-4">
              {formError && (
                <div className="p-3 bg-rose-50 text-rose-800 text-xs font-semibold rounded-xl border border-rose-200">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Class Grade</label>
                  <select
                    value={fClassId}
                    onChange={(e) => setFClassId(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                      <option key={c} value={c}>
                        Class {c}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Subject</label>
                  <select
                    value={fSubjectId}
                    onChange={(e) => setFSubjectId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    {subjects.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Chapter</label>
                  <select
                    value={fChapterId}
                    onChange={(e) => setFChapterId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="">General / All Chapters</option>
                    {availableChaptersForModal.map((chap) => (
                      <option key={chap.id} value={chap.id}>
                        {chap.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Question Text</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Enter the question clearly..."
                  value={fText}
                  onChange={(e) => setFText(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:bg-white"
                />
              </div>

              {/* 4 options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option A</label>
                  <input
                    type="text"
                    required
                    value={fOpt0}
                    onChange={(e) => setFOpt0(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option B</label>
                  <input
                    type="text"
                    required
                    value={fOpt1}
                    onChange={(e) => setFOpt1(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option C</label>
                  <input
                    type="text"
                    required
                    value={fOpt2}
                    onChange={(e) => setFOpt2(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option D</label>
                  <input
                    type="text"
                    required
                    value={fOpt3}
                    onChange={(e) => setFOpt3(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Correct Option</label>
                  <select
                    value={fCorrect}
                    onChange={(e) => setFCorrect(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value={0}>Option A</option>
                    <option value={1}>Option B</option>
                    <option value={2}>Option C</option>
                    <option value={3}>Option D</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Marks</label>
                  <input
                    type="number"
                    min={1}
                    max={10}
                    value={fMarks}
                    onChange={(e) => setFMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Difficulty</label>
                  <select
                    value={fDifficulty}
                    onChange={(e) => setFDifficulty(e.target.value as any)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">
                  Step-by-Step Explanation
                </label>
                <textarea
                  rows={2}
                  placeholder="Explain why the answer is correct for students..."
                  value={fExplanation}
                  onChange={(e) => setFExplanation(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-700 bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-blue-900 text-white rounded-xl text-xs font-bold"
                >
                  Save Question
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      <ConfirmModal
        isOpen={Boolean(deleteTargetId)}
        title="Delete Question?"
        message="Are you sure you want to permanently delete this question from the Question Bank?"
        variant="danger"
        confirmText="Yes, Delete"
        cancelText="Cancel"
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
};
