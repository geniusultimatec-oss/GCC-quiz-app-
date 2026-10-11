import { calculateQuizScore, sortAndRankAttempts } from './scoringService';
import { Question, QuizAttempt } from '../types';

// Mock questions
const mockQuestions: Question[] = [
  {
    id: 'q1',
    classId: 8,
    subjectId: 'math',
    text: 'What is 5 x 6?',
    options: ['25', '30', '35', '40'],
    correctOptionIndex: 1, // '30'
    marks: 2,
    difficulty: 'easy',
    createdAt: '2026-01-01',
  },
  {
    id: 'q2',
    classId: 8,
    subjectId: 'math',
    text: 'Solve for x: 2x = 10',
    options: ['2', '5', '8', '10'],
    correctOptionIndex: 1, // '5'
    marks: 2,
    difficulty: 'easy',
    createdAt: '2026-01-01',
  },
  {
    id: 'q3',
    classId: 8,
    subjectId: 'math',
    text: 'What is the square root of 64?',
    options: ['6', '7', '8', '9'],
    correctOptionIndex: 2, // '8'
    marks: 2,
    difficulty: 'medium',
    createdAt: '2026-01-01',
  },
];

/**
 * Self-running test runner function to verify score calculations
 */
export function runScoringTests(): { passed: boolean; message: string }[] {
  const results: { passed: boolean; message: string }[] = [];

  // Test 1: All correct answers without negative marking
  const test1 = calculateQuizScore({
    questions: mockQuestions,
    selectedAnswers: { q1: 1, q2: 1, q3: 2 },
    negativeMarking: false,
    negativeMarkValue: 0,
    passingPercentage: 40,
  });

  results.push({
    passed: test1.score === 6 && test1.correctCount === 3 && test1.passed === true,
    message: `Test 1 (All correct): Score ${test1.score}/6, Correct: ${test1.correctCount}`,
  });

  // Test 2: 1 Correct, 1 Incorrect, 1 Unanswered WITH negative marking (0.5 deduction)
  const test2 = calculateQuizScore({
    questions: mockQuestions,
    selectedAnswers: { q1: 1, q2: 0 }, // q1 correct (+2), q2 wrong (-0.5), q3 unanswered
    negativeMarking: true,
    negativeMarkValue: 0.5,
    passingPercentage: 50,
  });

  // earned: 2, deducted: 0.5 => 1.5 out of 6 => 25% => failed (<50%)
  results.push({
    passed:
      test2.score === 1.5 &&
      test2.correctCount === 1 &&
      test2.incorrectCount === 1 &&
      test2.unansweredCount === 1 &&
      test2.negativeMarksDeducted === 0.5 &&
      test2.passed === false,
    message: `Test 2 (Negative marking): Score ${test2.score}/6, Deducted: ${test2.negativeMarksDeducted}`,
  });

  // Test 3: Floor score at zero (never negative score)
  const test3 = calculateQuizScore({
    questions: mockQuestions,
    selectedAnswers: { q1: 0, q2: 0, q3: 0 }, // All 3 wrong
    negativeMarking: true,
    negativeMarkValue: 1.0,
    passingPercentage: 40,
  });

  results.push({
    passed: test3.score === 0 && test3.correctCount === 0 && test3.incorrectCount === 3,
    message: `Test 3 (Floored at zero): Score ${test3.score}/6, Correct: 0`,
  });

  // Test 4: Leaderboard tie-breaking (same score, faster time wins)
  const mockAttempts: QuizAttempt[] = [
    {
      id: 'att-1',
      quizId: 'quiz-1',
      quizCode: 'GCC-101',
      quizTitle: 'Maths Quiz',
      studentId: 's1',
      studentName: 'Aarav Sharma',
      classId: 8,
      selectedAnswers: {},
      markedForReview: [],
      startedAt: '2026-03-01T10:00:00Z',
      submittedAt: '2026-03-01T10:15:00Z',
      timeTakenSeconds: 300, // 5 mins
      score: 18,
      totalMarks: 20,
      percentage: 90,
      correctCount: 9,
      incorrectCount: 1,
      unansweredCount: 0,
      negativeMarksDeducted: 0,
      passed: true,
    },
    {
      id: 'att-2',
      quizId: 'quiz-1',
      quizCode: 'GCC-101',
      quizTitle: 'Maths Quiz',
      studentId: 's2',
      studentName: 'Diya Patel',
      classId: 8,
      selectedAnswers: {},
      markedForReview: [],
      startedAt: '2026-03-01T10:00:00Z',
      submittedAt: '2026-03-01T10:10:00Z',
      timeTakenSeconds: 180, // 3 mins (faster!)
      score: 18, // same score!
      totalMarks: 20,
      percentage: 90,
      correctCount: 9,
      incorrectCount: 1,
      unansweredCount: 0,
      negativeMarksDeducted: 0,
      passed: true,
    },
  ];

  const ranked = sortAndRankAttempts(mockAttempts);
  results.push({
    passed: ranked[0].studentName === 'Diya Patel' && ranked[0].rank === 1 && ranked[1].rank === 2,
    message: `Test 4 (Leaderboard tie-breaking): Rank 1 is ${ranked[0].studentName} (${ranked[0].timeTakenSeconds}s)`,
  });

  return results;
}
