import { Question, QuizAttempt } from '../types';

export interface ScoringInput {
  questions: Question[];
  selectedAnswers: Record<string, number>;
  negativeMarking: boolean;
  negativeMarkValue: number;
  passingPercentage: number;
}

export interface ScoringResult {
  totalMarks: number;
  score: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  negativeMarksDeducted: number;
  passed: boolean;
}

/**
 * Calculates student score based on question answers, marks per question,
 * and optional negative marking rules.
 */
export function calculateQuizScore(input: ScoringInput): ScoringResult {
  const { questions, selectedAnswers, negativeMarking, negativeMarkValue, passingPercentage } = input;

  let totalMarks = 0;
  let earnedMarks = 0;
  let correctCount = 0;
  let incorrectCount = 0;
  let unansweredCount = 0;
  let negativeMarksDeducted = 0;

  for (const q of questions) {
    const questionMarks = typeof q.marks === 'number' && q.marks > 0 ? q.marks : 1;
    totalMarks += questionMarks;

    const studentAnswer = selectedAnswers[q.id];

    if (studentAnswer === undefined || studentAnswer === null || studentAnswer === -1) {
      unansweredCount++;
    } else if (studentAnswer === q.correctOptionIndex) {
      correctCount++;
      earnedMarks += questionMarks;
    } else {
      incorrectCount++;
      if (negativeMarking && negativeMarkValue > 0) {
        negativeMarksDeducted += negativeMarkValue;
      }
    }
  }

  // Deduct negative marks, avoid negative total score (minimum 0)
  const finalScore = Math.max(0, Number((earnedMarks - negativeMarksDeducted).toFixed(2)));
  const percentage = totalMarks > 0 ? Number(((finalScore / totalMarks) * 100).toFixed(1)) : 0;
  const passed = percentage >= passingPercentage;

  return {
    totalMarks,
    score: finalScore,
    percentage,
    correctCount,
    incorrectCount,
    unansweredCount,
    negativeMarksDeducted: Number(negativeMarksDeducted.toFixed(2)),
    passed,
  };
}

/**
 * Applies consistent tie-breaking rules for quiz leaderboard:
 * 1. Higher score first
 * 2. Lower time taken (speed) second
 * 3. Earlier submission timestamp third
 */
export function sortAndRankAttempts(attempts: QuizAttempt[]): (QuizAttempt & { rank: number })[] {
  const sorted = [...attempts].sort((a, b) => {
    // 1. Score descending
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    // 2. Time taken ascending (faster is better)
    if (a.timeTakenSeconds !== b.timeTakenSeconds) {
      return a.timeTakenSeconds - b.timeTakenSeconds;
    }
    // 3. Submitted earlier
    return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
  });

  return sorted.map((att, idx) => ({
    ...att,
    rank: idx + 1,
  }));
}

/**
 * Normalizes and validates a 6-character quiz code (e.g., "GCC-101", "GCC-9428")
 */
export function normalizeQuizCode(rawCode: string): string {
  return rawCode.trim().toUpperCase().replace(/\s+/g, '');
}

/**
 * Format duration in seconds to "Xm Ys" or "XX:YY"
 */
export function formatDuration(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  if (mins === 0) return `${secs}s`;
  if (secs === 0) return `${mins}m`;
  return `${mins}m ${secs}s`;
}

/**
 * Format timestamp into readable localized Indian/International date time
 */
export function formatQuizDate(isoString: string): string {
  try {
    const date = new Date(isoString);
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
}
