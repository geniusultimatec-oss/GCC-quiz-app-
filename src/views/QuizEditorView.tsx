import React, { useState } from 'react';
import { Badge } from '../components/common/Badge';
import { AppView, Quiz, Question, Subject, Chapter, TeacherUser } from '../types';
import { storageService } from '../services/storageService';
import {
  ArrowLeft,
  Save,
  PlusCircle,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Layers,
  Sparkles,
  Clock,
  Award,
  Trash2,
  KeyRound,
} from 'lucide-react';

interface QuizEditorViewProps {
  quizToEdit?: Quiz | null;
  teacher: TeacherUser;
  subjects: Subject[];
  chapters: Chapter[];
  questionBank: Question[];
  onSaveQuiz: (quiz: Quiz) => void;
  onNavigate: (view: AppView) => void;
}

export const QuizEditorView: React.FC<QuizEditorViewProps> = ({
  quizToEdit,
  teacher,
  subjects,
  chapters,
  questionBank,
  onSaveQuiz,
  onNavigate,
}) => {
  const [title, setTitle] = useState(quizToEdit?.title || '');
  const [description, setDescription] = useState(quizToEdit?.description || '');
  const [classId, setClassId] = useState<number>(quizToEdit?.classId || 10);
  const [subjectId, setSubjectId] = useState<string>(
    quizToEdit?.subjectId || subjects[0]?.id || 'math'
  );
  const [code, setCode] = useState(
    quizToEdit?.code || storageService.generateQuizCode()
  );
  const [durationMinutes, setDurationMinutes] = useState<number>(
    quizToEdit?.durationMinutes || 15
  );
  const [passingPercentage, setPassingPercentage] = useState<number>(
    quizToEdit?.passingPercentage || 40
  );
  const [negativeMarking, setNegativeMarking] = useState<boolean>(
    quizToEdit?.negativeMarking || false
  );
  const [negativeMarkValue, setNegativeMarkValue] = useState<number>(
    quizToEdit?.negativeMarkValue || 0.25
  );
  const [randomizeQuestions, setRandomizeQuestions] = useState<boolean>(
    quizToEdit?.randomizeQuestions || false
  );
  const [showAnswersAfterTest, setShowAnswersAfterTest] = useState<boolean>(
    quizToEdit?.showAnswersAfterTest ?? true
  );
  const [leaderboardEnabled, setLeaderboardEnabled] = useState<boolean>(
    quizToEdit?.leaderboardEnabled ?? true
  );
  const [status, setStatus] = useState<'draft' | 'published' | 'archived'>(
    quizToEdit?.status || 'published'
  );

  // Selected question IDs
  const [selectedQuestionIds, setSelectedQuestionIds] = useState<string[]>(
    quizToEdit?.questionIds || []
  );

  // Quick question creation state
  const [showAddQuickQuestion, setShowAddQuickQuestion] = useState(false);
  const [newQText, setNewQText] = useState('');
  const [newQChapterId, setNewQChapterId] = useState('');
  const [newQOpt0, setNewQOpt0] = useState('');
  const [newQOpt1, setNewQOpt1] = useState('');
  const [newQOpt2, setNewQOpt2] = useState('');
  const [newQOpt3, setNewQOpt3] = useState('');
  const [newQCorrect, setNewQCorrect] = useState(0);
  const [newQExplanation, setNewQExplanation] = useState('');
  const [newQMarks, setNewQMarks] = useState(2);
  const [error, setError] = useState<string | null>(null);

  // Filter available questions from question bank matching this class & subject
  const availableQuestions = questionBank.filter(
    (q) => q.classId === classId && q.subjectId === subjectId
  );

  const availableChapters = chapters.filter(
    (c) => c.classId === classId && c.subjectId === subjectId
  );

  // Calculate total marks based on selected question objects
  const totalCalculatedMarks = selectedQuestionIds.reduce((acc, qId) => {
    const q = questionBank.find((item) => item.id === qId);
    return acc + (q?.marks || 1);
  }, 0);

  const toggleQuestionSelection = (qId: string) => {
    setSelectedQuestionIds((prev) =>
      prev.includes(qId) ? prev.filter((id) => id !== qId) : [...prev, qId]
    );
  };

  const handleCreateQuickQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQText.trim()) return;
    if (!newQOpt0.trim() || !newQOpt1.trim() || !newQOpt2.trim() || !newQOpt3.trim()) {
      setError('Please provide all 4 options (A, B, C, D) for the question.');
      return;
    }

    const created: Question = {
      id: `qb-custom-${Date.now()}`,
      classId,
      subjectId,
      chapterId: newQChapterId || undefined,
      text: newQText.trim(),
      options: [newQOpt0.trim(), newQOpt1.trim(), newQOpt2.trim(), newQOpt3.trim()],
      correctOptionIndex: newQCorrect,
      explanation: newQExplanation.trim(),
      marks: newQMarks,
      difficulty: 'medium',
      createdAt: new Date().toISOString(),
      isSample: false,
    };

    storageService.saveQuestion(created);
    setSelectedQuestionIds((prev) => [...prev, created.id]);

    // Reset quick question modal
    setNewQText('');
    setNewQChapterId('');
    setNewQOpt0('');
    setNewQOpt1('');
    setNewQOpt2('');
    setNewQOpt3('');
    setNewQExplanation('');
    setShowAddQuickQuestion(false);
    setError(null);
  };

  const handleSaveQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Quiz title is required.');
      return;
    }
    if (selectedQuestionIds.length === 0) {
      setError('Please select at least 1 question for the quiz.');
      return;
    }

    const quiz: Quiz = {
      id: quizToEdit?.id || `quiz-${Date.now()}`,
      code: code.trim().toUpperCase(),
      title: title.trim(),
      description: description.trim() || `Class ${classId} MCQ Test on ${title}`,
      instructions: [
        `This test consists of ${selectedQuestionIds.length} questions.`,
        `Time allowed: ${durationMinutes} minutes.`,
        `Total Marks: ${totalCalculatedMarks}.`,
        negativeMarking
          ? `Negative marking is applied (-${negativeMarkValue} per wrong answer).`
          : 'No negative marking.',
        'Click submit when all questions are answered.',
      ],
      classId,
      subjectId,
      questionIds: selectedQuestionIds,
      durationMinutes,
      totalMarks: totalCalculatedMarks,
      passingPercentage,
      negativeMarking,
      negativeMarkValue: negativeMarking ? negativeMarkValue : 0,
      randomizeQuestions,
      showAnswersAfterTest,
      leaderboardEnabled,
      status,
      createdBy: teacher.email,
      createdAt: quizToEdit?.createdAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    onSaveQuiz(quiz);
    onNavigate('teacher-dashboard');
  };

  return (
    <div className="max-w-4xl mx-auto py-6 sm:py-10 space-y-6">
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
          {quizToEdit ? 'Editing Existing Quiz' : 'New Quiz Creator'}
        </span>
      </div>

      <form onSubmit={handleSaveQuiz} className="space-y-8">
        {error && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs font-semibold text-rose-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Section 1: Basic Quiz Meta */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">1. Basic Quiz Information</h2>
            <p className="text-xs text-slate-500">
              Set quiz identity, target class, subject, and unique joining code
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Title */}
            <div className="sm:col-span-2 space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Quiz Title <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Class 10 Term Assessment: Trigonometry & Linear Algebra"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-hidden"
              />
            </div>

            {/* Class Grade */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Target Class (1 to 10)
              </label>
              <select
                value={classId}
                onChange={(e) => setClassId(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-hidden cursor-pointer"
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((c) => (
                  <option key={c} value={c}>
                    Class {c}
                  </option>
                ))}
              </select>
            </div>

            {/* Subject */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Subject
              </label>
              <select
                value={subjectId}
                onChange={(e) => setSubjectId(e.target.value)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-hidden cursor-pointer"
              >
                {subjects
                  .filter((s) => s.applicableClasses.includes(classId))
                  .map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
              </select>
            </div>

            {/* Quiz Code */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                  Unique Quiz Code
                </label>
                <button
                  type="button"
                  onClick={() => setCode(storageService.generateQuizCode())}
                  className="text-[11px] font-bold text-blue-700 hover:underline"
                >
                  Generate New
                </button>
              </div>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl font-mono text-sm font-extrabold text-blue-900 uppercase focus:bg-white focus:border-blue-700 focus:outline-hidden"
              />
            </div>

            {/* Status */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Publication Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:border-blue-700 focus:outline-hidden cursor-pointer"
              >
                <option value="published">Published (Live for Students)</option>
                <option value="draft">Draft (Saved only for Teachers)</option>
                <option value="archived">Archived (Closed)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Timer, Negative Marking & Rules */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div>
            <h2 className="text-lg font-black text-slate-900">2. Examination Rules & Marking</h2>
            <p className="text-xs text-slate-500">
              Configure exam duration, negative marking deductions, and student review settings
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Duration */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Duration (Minutes)
              </label>
              <input
                type="number"
                min={1}
                max={180}
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Passing % */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Passing Percentage (%)
              </label>
              <input
                type="number"
                min={10}
                max={100}
                value={passingPercentage}
                onChange={(e) => setPassingPercentage(Number(e.target.value))}
                className="w-full px-4 py-3 bg-slate-50 border border-slate-300 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-hidden"
              />
            </div>

            {/* Negative Marking Toggle */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Negative Marking
              </label>
              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  id="negToggle"
                  checked={negativeMarking}
                  onChange={(e) => setNegativeMarking(e.target.checked)}
                  className="w-5 h-5 rounded-md text-blue-900 focus:ring-blue-800"
                />
                <label htmlFor="negToggle" className="text-xs font-bold text-slate-800 cursor-pointer">
                  {negativeMarking ? 'Enabled (- deduction)' : 'Disabled (No penalty)'}
                </label>
              </div>
            </div>
          </div>

          {negativeMarking && (
            <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl flex items-center justify-between gap-4">
              <span className="text-xs font-bold text-rose-900">
                Marks deducted for each incorrect answer:
              </span>
              <select
                value={negativeMarkValue}
                onChange={(e) => setNegativeMarkValue(Number(e.target.value))}
                className="px-3 py-1.5 bg-white border border-rose-300 rounded-xl text-xs font-bold text-rose-900"
              >
                <option value={0.25}>-0.25 Marks</option>
                <option value={0.5}>-0.50 Marks</option>
                <option value={1}>-1.00 Mark</option>
              </select>
            </div>
          )}

          {/* Additional toggles */}
          <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-bold text-slate-700">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={randomizeQuestions}
                onChange={(e) => setRandomizeQuestions(e.target.checked)}
                className="w-4 h-4 rounded-md"
              />
              <span>Shuffle question order</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAnswersAfterTest}
                onChange={(e) => setShowAnswersAfterTest(e.target.checked)}
                className="w-4 h-4 rounded-md"
              />
              <span>Show answers after submit</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={leaderboardEnabled}
                onChange={(e) => setLeaderboardEnabled(e.target.checked)}
                className="w-4 h-4 rounded-md"
              />
              <span>Enable Hall of Fame leaderboard</span>
            </label>
          </div>
        </div>

        {/* Section 3: Question Selector & Creator */}
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black text-slate-900 flex items-center gap-2">
                <span>3. Selected Questions ({selectedQuestionIds.length})</span>
                <span className="text-xs font-bold bg-amber-100 text-amber-900 px-2.5 py-0.5 rounded-full">
                  Total {totalCalculatedMarks} Marks
                </span>
              </h2>
              <p className="text-xs text-slate-500">
                Choose MCQs from the question bank or author a new question right now
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowAddQuickQuestion(!showAddQuickQuestion)}
              className="px-4 py-2 bg-blue-50 hover:bg-blue-100 text-blue-900 text-xs font-bold rounded-xl border border-blue-200 transition flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4 text-blue-700" />
              <span>{showAddQuickQuestion ? 'Close Form' : '+ Add New Question'}</span>
            </button>
          </div>

          {/* Quick Question Creator Form */}
          {showAddQuickQuestion && (
            <div className="p-5 rounded-2xl bg-slate-50 border-2 border-blue-200 space-y-4 animate-in fade-in">
              <h4 className="text-sm font-black text-blue-950 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <span>Author New Question (Class {classId})</span>
              </h4>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Question Text</label>
                <textarea
                  rows={2}
                  placeholder="Enter the question text..."
                  value={newQText}
                  onChange={(e) => setNewQText(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-medium focus:outline-hidden"
                />
              </div>

              {/* 4 Options */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option A</label>
                  <input
                    type="text"
                    placeholder="Option A"
                    value={newQOpt0}
                    onChange={(e) => setNewQOpt0(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option B</label>
                  <input
                    type="text"
                    placeholder="Option B"
                    value={newQOpt1}
                    onChange={(e) => setNewQOpt1(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option C</label>
                  <input
                    type="text"
                    placeholder="Option C"
                    value={newQOpt2}
                    onChange={(e) => setNewQOpt2(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Option D</label>
                  <input
                    type="text"
                    placeholder="Option D"
                    value={newQOpt3}
                    onChange={(e) => setNewQOpt3(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                  />
                </div>
              </div>

              {/* Correct Answer & Marks & Chapter */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Chapter</label>
                  <select
                    value={newQChapterId}
                    onChange={(e) => setNewQChapterId(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  >
                    <option value="">General / All Chapters</option>
                    {availableChapters.map((chap) => (
                      <option key={chap.id} value={chap.id}>
                        {chap.title}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-slate-600">Correct Option</label>
                  <select
                    value={newQCorrect}
                    onChange={(e) => setNewQCorrect(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
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
                    value={newQMarks}
                    onChange={(e) => setNewQMarks(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold"
                  />
                </div>
              </div>

              {/* Explanation */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-600">Answer Explanation (Optional)</label>
                <input
                  type="text"
                  placeholder="Explain why this option is correct..."
                  value={newQExplanation}
                  onChange={(e) => setNewQExplanation(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleCreateQuickQuestion}
                className="px-4 py-2 bg-blue-900 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Save & Add to This Quiz
              </button>
            </div>
          )}

          {/* Question Bank Checklist */}
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1">
            {questionBank.map((q) => {
              const isSelected = selectedQuestionIds.includes(q.id);
              const isSameClass = q.classId === classId;

              return (
                <div
                  key={q.id}
                  onClick={() => toggleQuestionSelection(q.id)}
                  className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-start gap-3.5 ${
                    isSelected
                      ? 'border-blue-900 bg-blue-50/50'
                      : isSameClass
                      ? 'border-slate-200 bg-white hover:border-slate-300'
                      : 'border-slate-100 bg-slate-50/60 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => {}}
                    className="w-5 h-5 rounded-md text-blue-900 mt-0.5 shrink-0"
                  />

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-mono text-slate-400">{q.id}</span>
                      <Badge variant="blue" size="sm">
                        Class {q.classId}
                      </Badge>
                      <Badge variant="gold" size="sm">
                        {q.marks} Marks
                      </Badge>
                      {q.isSample && (
                        <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded-sm">
                          Sample Data
                        </span>
                      )}
                    </div>

                    <p className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                      {q.text}
                    </p>

                    <p className="text-[11px] text-emerald-700 font-medium">
                      Correct Answer: {q.options[q.correctOptionIndex]}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Submit Bar */}
        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => onNavigate('teacher-dashboard')}
            className="px-5 py-3 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl cursor-pointer"
          >
            Cancel
          </button>

          <button
            type="submit"
            className="px-6 py-3 bg-gradient-to-r from-blue-900 via-blue-800 to-indigo-900 hover:from-blue-950 hover:to-indigo-950 text-white font-bold text-xs rounded-xl shadow-lg shadow-blue-900/20 transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4 text-amber-400" />
            <span>Save & Publish Quiz</span>
          </button>
        </div>
      </form>
    </div>
  );
};
