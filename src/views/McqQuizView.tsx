import React, { useState, useEffect, useRef } from 'react';
import { Badge } from '../components/common/Badge';
import { ConfirmModal } from '../components/common/ConfirmModal';
import { Quiz, Question, StudentSession, QuizAttempt } from '../types';
import { calculateQuizScore } from '../services/scoringService';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  HelpCircle,
  Bookmark,
  RotateCcw,
  Send,
  AlertCircle,
  Menu,
  X,
  ShieldAlert,
  AlertTriangle,
  Bell,
  Sparkles,
} from 'lucide-react';

interface McqQuizViewProps {
  quiz: Quiz;
  questions: Question[];
  student: StudentSession;
  onSubmit: (attempt: QuizAttempt) => void;
}

export const McqQuizView: React.FC<McqQuizViewProps> = ({
  quiz,
  questions,
  student,
  onSubmit,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [markedForReview, setMarkedForReview] = useState<string[]>([]);
  const [timeLeft, setTimeLeft] = useState<number>(quiz.durationMinutes * 60);
  const [showSubmitModal, setShowSubmitModal] = useState(false);
  const [mobilePaletteOpen, setMobilePaletteOpen] = useState(false);
  const [dismissedMinuteBanner, setDismissedMinuteBanner] = useState(false);

  const startTimeRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);
  const hasTriggeredOneMinuteAlertRef = useRef<boolean>(false);

  const currentQuestion = questions[currentIndex] || questions[0];

  // Sound/haptic effect helper for Android touch
  const triggerHaptic = (pattern: number | number[] = 30) => {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate(pattern);
      }
    } catch {
      // Ignore
    }
  };

  // Web Audio chime for final 1-minute alert (zero external files)
  const playWarningChime = () => {
    try {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } catch {
      // Ignore
    }
  };

  // Timer Countdown Effect
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          handleAutoSubmit();
          return 0;
        }

        const newTime = prev - 1;

        // Trigger alert at less than 1 minute (60 seconds)
        if (newTime <= 60 && !hasTriggeredOneMinuteAlertRef.current) {
          hasTriggeredOneMinuteAlertRef.current = true;
          triggerHaptic([150, 80, 150, 80, 250]); // Distinct vibration pattern on Android
          playWarningChime();
        }

        return newTime;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAutoSubmit = () => {
    finalizeSubmission();
  };

  const handleSelectOption = (optionIndex: number) => {
    triggerHaptic(25);
    setSelectedAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionIndex,
    }));
  };

  const handleClearAnswer = () => {
    triggerHaptic(15);
    setSelectedAnswers((prev) => {
      const copy = { ...prev };
      delete copy[currentQuestion.id];
      return copy;
    });
  };

  const handleToggleMarkForReview = () => {
    triggerHaptic(20);
    setMarkedForReview((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  const finalizeSubmission = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    const elapsedSeconds = Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000));

    const scoring = calculateQuizScore({
      questions,
      selectedAnswers,
      negativeMarking: quiz.negativeMarking,
      negativeMarkValue: quiz.negativeMarkValue,
      passingPercentage: quiz.passingPercentage,
    });

    const attempt: QuizAttempt = {
      id: `att-${Date.now()}-${Math.floor(100 + Math.random() * 900)}`,
      quizId: quiz.id,
      quizCode: quiz.code,
      quizTitle: quiz.title,
      studentId: student.studentId,
      studentName: student.name,
      classId: student.classId,
      selectedAnswers,
      markedForReview,
      startedAt: new Date(startTimeRef.current).toISOString(),
      submittedAt: new Date().toISOString(),
      timeTakenSeconds: elapsedSeconds,
      score: scoring.score,
      totalMarks: scoring.totalMarks,
      percentage: scoring.percentage,
      correctCount: scoring.correctCount,
      incorrectCount: scoring.incorrectCount,
      unansweredCount: scoring.unansweredCount,
      negativeMarksDeducted: scoring.negativeMarksDeducted,
      passed: scoring.passed,
    };

    triggerHaptic(50);
    onSubmit(attempt);
  };

  // Format seconds to MM:SS
  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Calculated tallies for summary modal
  const answeredCount = Object.keys(selectedAnswers).length;
  const unansweredCount = questions.length - answeredCount;
  const reviewCount = markedForReview.length;
  const progressPercentage = Math.round((answeredCount / questions.length) * 100);

  // Time Warning Thresholds
  const isCriticalTime = timeLeft <= 60 && timeLeft > 0; // Less than 1 minute!
  const isLowTime = timeLeft <= 120 && timeLeft > 60; // Under 2 minutes

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-4 sm:space-y-6 pb-20 select-none">
      {/* Test Header Bar with Emergency Glow when < 1 min */}
      <div
        className={`bg-white rounded-2xl p-4 shadow-sm flex flex-wrap items-center justify-between gap-4 sticky top-14 sm:top-16 z-30 transition-all ${
          isCriticalTime
            ? 'border-2 border-rose-500 ring-4 ring-rose-400/20 shadow-lg shadow-rose-600/10'
            : 'border border-slate-200'
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="font-mono text-xs font-black bg-blue-900 text-white px-2.5 py-1 rounded-lg">
            {quiz.code}
          </span>
          <div>
            <h2 className="text-sm sm:text-base font-bold text-slate-900 truncate max-w-[180px] sm:max-w-md">
              {quiz.title}
            </h2>
            <p className="text-[11px] text-slate-500">
              Candidate: <strong>{student.name}</strong> • Class {student.classId}
            </p>
          </div>
        </div>

        {/* Live Countdown Timer & Mobile Palette Button */}
        <div className="flex items-center gap-3">
          {/* Urgent Glowing Timer Badge */}
          <div
            className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl font-mono text-sm sm:text-base font-black border transition-all ${
              isCriticalTime
                ? 'bg-rose-600 text-white border-rose-400 shadow-[0_0_15px_rgba(225,29,72,0.6)] animate-pulse'
                : isLowTime
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-blue-50 text-blue-900 border-blue-200'
            }`}
            title={isCriticalTime ? 'URGENT: Less than 1 minute left!' : 'Remaining test time'}
          >
            {isCriticalTime ? (
              <AlertTriangle className="w-4 h-4 text-amber-300 animate-bounce" />
            ) : (
              <Clock className={`w-4 h-4 ${isLowTime ? 'text-amber-600' : 'text-blue-700'}`} />
            )}
            <span>{formatTimer(timeLeft)}</span>
            {isCriticalTime && (
              <span className="text-[10px] font-sans font-extrabold uppercase bg-rose-800 text-amber-300 px-1.5 py-0.5 rounded-sm ml-1 hidden sm:inline">
                FINAL MINUTE
              </span>
            )}
          </div>

          <button
            onClick={() => setMobilePaletteOpen(true)}
            className="md:hidden p-2 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition"
            title="Question Palette"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setShowSubmitModal(true)}
            className={`px-4 py-2 font-bold text-xs sm:text-sm rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer ${
              isCriticalTime
                ? 'bg-rose-600 hover:bg-rose-700 text-white animate-pulse'
                : 'bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Submit Test</span>
            <span className="sm:hidden">Submit</span>
          </button>
        </div>

        {/* Progress Bar under header */}
        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
          <div
            className={`h-full transition-all duration-300 ${
              isCriticalTime ? 'bg-rose-600' : 'bg-blue-900'
            }`}
            style={{ width: `${progressPercentage}%` }}
          ></div>
        </div>
      </div>

      {/* Visual Warning Alert Banner when < 1 minute remaining */}
      {isCriticalTime && !dismissedMinuteBanner && (
        <div className="bg-gradient-to-r from-rose-700 via-rose-600 to-red-800 text-white rounded-2xl p-4 sm:p-5 shadow-xl border-2 border-rose-400 flex items-start sm:items-center justify-between gap-4 animate-in fade-in slide-in-from-top-3">
          <div className="flex items-start sm:items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 text-white flex items-center justify-center shrink-0 shadow-inner">
              <AlertTriangle className="w-6 h-6 text-amber-300 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-wider bg-rose-950/60 text-amber-300 px-2 py-0.5 rounded-md">
                  ⚠️ Alert: Less Than 1 Minute Remaining!
                </span>
                <span className="font-mono text-sm font-black text-white">
                  {timeLeft}s
                </span>
              </div>
              <p className="text-xs text-rose-100 mt-1 leading-relaxed">
                Please double check your answers. The test will <strong>automatically submit</strong> when the countdown reaches 00:00 ({unansweredCount} unanswered questions remaining).
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
            <button
              onClick={() => setShowSubmitModal(true)}
              className="px-4 py-2 bg-white text-rose-900 font-extrabold text-xs rounded-xl shadow-md hover:bg-rose-50 transition cursor-pointer"
            >
              Submit Now
            </button>
            <button
              onClick={() => setDismissedMinuteBanner(true)}
              className="p-2 text-rose-200 hover:text-white rounded-xl hover:bg-white/10 transition"
              title="Dismiss banner"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Main Grid: Question Card & Question Palette */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {/* Left Area: Active Question (3 columns on lg) */}
        <div className="md:col-span-2 lg:col-span-3 space-y-4">
          <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs space-y-6">
            {/* Question Meta */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-xl bg-blue-100/70 text-blue-950 font-black text-sm">
                  Question {currentIndex + 1} of {questions.length}
                </span>
                <Badge variant="gold">+{currentQuestion.marks} Marks</Badge>
                {currentQuestion.difficulty && (
                  <Badge variant="slate" size="sm">
                    {currentQuestion.difficulty.toUpperCase()}
                  </Badge>
                )}
              </div>

              {/* Mark for review toggle */}
              <button
                type="button"
                onClick={handleToggleMarkForReview}
                className={`flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-xl transition cursor-pointer border ${
                  markedForReview.includes(currentQuestion.id)
                    ? 'bg-amber-100 text-amber-900 border-amber-300'
                    : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
                }`}
              >
                <Bookmark className="w-4 h-4 fill-current" />
                <span>
                  {markedForReview.includes(currentQuestion.id)
                    ? 'Flagged for Review'
                    : 'Mark for Review'}
                </span>
              </button>
            </div>

            {/* Question Text */}
            <div className="text-base sm:text-lg font-bold text-slate-900 leading-relaxed">
              {currentQuestion.text}
            </div>

            {/* 4 Options Grid */}
            <div className="space-y-3 pt-2">
              {currentQuestion.options.map((optionText, optIdx) => {
                const isSelected = selectedAnswers[currentQuestion.id] === optIdx;
                return (
                  <div
                    key={optIdx}
                    onClick={() => handleSelectOption(optIdx)}
                    className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                      isSelected
                        ? 'border-blue-900 bg-blue-50/70 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50'
                    }`}
                  >
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center font-black text-sm shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-blue-900 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {optionLetters[optIdx]}
                    </div>

                    <span
                      className={`text-sm sm:text-base font-medium flex-1 ${
                        isSelected ? 'text-blue-950 font-bold' : 'text-slate-800'
                      }`}
                    >
                      {optionText}
                    </span>

                    <div
                      className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'border-blue-900 bg-blue-900 text-white'
                          : 'border-slate-300'
                      }`}
                    >
                      {isSelected && <div className="w-2 h-2 rounded-full bg-white"></div>}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Question Actions (Clear, Prev, Next) */}
            <div className="pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleClearAnswer}
                disabled={selectedAnswers[currentQuestion.id] === undefined}
                className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-rose-600 rounded-xl hover:bg-rose-50 transition flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Clear Choice</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    triggerHaptic(15);
                    setCurrentIndex((prev) => Math.max(0, prev - 1));
                  }}
                  disabled={currentIndex === 0}
                  className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition flex items-center gap-1.5 disabled:opacity-40 disabled:pointer-events-none cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Previous</span>
                </button>

                {currentIndex < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => {
                      triggerHaptic(15);
                      setCurrentIndex((prev) => Math.min(questions.length - 1, prev + 1));
                    }}
                    className="px-5 py-2.5 bg-blue-900 hover:bg-blue-950 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Next Question</span>
                    <ArrowRight className="w-4 h-4 text-amber-400" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowSubmitModal(true)}
                    className="px-5 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                  >
                    <span>Finish & Review</span>
                    <Send className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Area: Question Palette (Desktop view) */}
        <div className="hidden md:block">
          <div className="bg-white rounded-3xl border border-slate-200 p-5 shadow-xs space-y-5 sticky top-36">
            <div>
              <h3 className="text-sm font-black text-slate-900">Question Palette</h3>
              <p className="text-[11px] text-slate-500">
                Click any question to navigate directly
              </p>
            </div>

            {/* Status Legend */}
            <div className="grid grid-cols-2 gap-2 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
                <span>Answered ({answeredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200 border border-slate-300"></span>
                <span>Unanswered ({unansweredCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400"></span>
                <span>Review ({reviewCount})</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md border-2 border-blue-900 bg-white"></span>
                <span>Current</span>
              </div>
            </div>

            {/* Question Numbers Grid */}
            <div className="grid grid-cols-4 gap-2 max-h-72 overflow-y-auto pr-1">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isMarked = markedForReview.includes(q.id);
                const isCurrent = currentIndex === idx;

                let btnClass = 'bg-slate-100 text-slate-700 border-slate-200';
                if (isAnswered && isMarked) {
                  btnClass = 'bg-amber-100 text-amber-900 border-amber-300 font-bold';
                } else if (isAnswered) {
                  btnClass = 'bg-emerald-600 text-white border-emerald-600 font-bold';
                } else if (isMarked) {
                  btnClass = 'bg-amber-400 text-slate-950 border-amber-500 font-bold';
                }

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => {
                      triggerHaptic(15);
                      setCurrentIndex(idx);
                    }}
                    className={`h-10 rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer border ${btnClass} ${
                      isCurrent ? 'ring-2 ring-blue-900 ring-offset-2 scale-105' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setShowSubmitModal(true)}
              className={`w-full py-3 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer ${
                isCriticalTime
                  ? 'bg-rose-600 hover:bg-rose-700 animate-pulse'
                  : 'bg-blue-900 hover:bg-blue-950'
              }`}
            >
              <Send className="w-4 h-4 text-amber-400" />
              <span>Review & Submit Test</span>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Palette Drawer */}
      {mobilePaletteOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4">
          <div className="bg-white rounded-t-3xl sm:rounded-3xl w-full max-w-md p-6 space-y-4 max-h-[85vh] overflow-y-auto animate-in slide-in-from-bottom-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900">Question Palette</h3>
              <button
                onClick={() => setMobilePaletteOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Mobile Legend */}
            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-xl">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-emerald-600"></span>
                <span>Answered: {answeredCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-slate-200 border"></span>
                <span>Unanswered: {unansweredCount}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-md bg-amber-400"></span>
                <span>Marked for Review: {reviewCount}</span>
              </div>
            </div>

            {/* Mobile Buttons Grid */}
            <div className="grid grid-cols-5 gap-2 pt-2">
              {questions.map((q, idx) => {
                const isAnswered = selectedAnswers[q.id] !== undefined;
                const isMarked = markedForReview.includes(q.id);
                const isCurrent = currentIndex === idx;

                let btnClass = 'bg-slate-100 text-slate-700';
                if (isAnswered) btnClass = 'bg-emerald-600 text-white';
                else if (isMarked) btnClass = 'bg-amber-400 text-slate-950';

                return (
                  <button
                    key={q.id}
                    onClick={() => {
                      setCurrentIndex(idx);
                      setMobilePaletteOpen(false);
                    }}
                    className={`h-11 rounded-xl text-xs font-bold transition flex items-center justify-center border ${btnClass} ${
                      isCurrent ? 'ring-2 ring-blue-900 ring-offset-2' : ''
                    }`}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                setMobilePaletteOpen(false);
                setShowSubmitModal(true);
              }}
              className="w-full py-3 bg-blue-900 text-white font-bold text-sm rounded-xl mt-4 cursor-pointer"
            >
              Submit Quiz
            </button>
          </div>
        </div>
      )}

      {/* Confirmation Modal before Final Submit */}
      <ConfirmModal
        isOpen={showSubmitModal}
        title="Ready to Submit Test?"
        message="Please review your test attempt summary before completing. Once submitted, your scores will be permanently calculated."
        details={
          <div className="space-y-2">
            <div className="flex justify-between font-medium">
              <span>Total Questions:</span>
              <strong className="text-slate-900">{questions.length}</strong>
            </div>
            <div className="flex justify-between font-medium text-emerald-700">
              <span>Answered:</span>
              <strong>{answeredCount}</strong>
            </div>
            <div className="flex justify-between font-medium text-rose-700">
              <span>Unanswered:</span>
              <strong>{unansweredCount}</strong>
            </div>
            {reviewCount > 0 && (
              <div className="flex justify-between font-medium text-amber-700">
                <span>Marked for Review:</span>
                <strong>{reviewCount}</strong>
              </div>
            )}
            <div
              className={`flex justify-between font-medium pt-1 border-t border-slate-200 ${
                isCriticalTime ? 'text-rose-700 font-bold' : 'text-blue-900'
              }`}
            >
              <span>Time Remaining:</span>
              <strong className="font-mono">{formatTimer(timeLeft)}</strong>
            </div>
          </div>
        }
        confirmText="Yes, Final Submit"
        cancelText="Return to Questions"
        variant={isCriticalTime ? 'danger' : 'primary'}
        onConfirm={finalizeSubmission}
        onCancel={() => setShowSubmitModal(false)}
      />
    </div>
  );
};
