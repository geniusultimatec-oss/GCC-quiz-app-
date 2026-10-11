export type ClassLevel = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10;

export type DifficultyLevel = 'easy' | 'medium' | 'hard';

export type QuizStatus = 'draft' | 'published' | 'archived';

export interface Subject {
  id: string;
  name: string;
  applicableClasses: number[];
  iconName?: string;
  color?: string;
  description?: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  classId: number;
  title: string;
  order: number;
  topics?: string[];
}

export interface Question {
  id: string;
  classId: number;
  subjectId: string;
  chapterId?: string;
  topic?: string;
  text: string;
  options: [string, string, string, string];
  correctOptionIndex: number; // 0, 1, 2, or 3
  explanation?: string;
  marks: number;
  difficulty: DifficultyLevel;
  tags?: string[];
  isSample?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface Quiz {
  id: string;
  code: string; // e.g. "GCC-101", 6-digit alphanumeric
  title: string;
  description: string;
  instructions: string[];
  classId: number;
  subjectId: string;
  chapterId?: string;
  questionIds: string[];
  durationMinutes: number;
  totalMarks: number;
  passingPercentage: number;
  negativeMarking: boolean;
  negativeMarkValue: number; // e.g., 0.25, 0.5, 1
  randomizeQuestions: boolean;
  showAnswersAfterTest: boolean;
  leaderboardEnabled: boolean;
  status: QuizStatus;
  startTime?: string;
  endTime?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudentSession {
  studentId: string; // e.g. "GCC-S-1042"
  name: string;
  classId: number;
  createdAt: string;
  lastActiveAt: string;
}

export interface QuizAttempt {
  id: string;
  quizId: string;
  quizCode: string;
  quizTitle: string;
  studentId: string;
  studentName: string;
  classId: number;
  selectedAnswers: Record<string, number>; // questionId -> selectedOptionIndex (0..3)
  markedForReview: string[]; // questionIds
  startedAt: string;
  submittedAt: string;
  timeTakenSeconds: number;
  score: number;
  totalMarks: number;
  percentage: number;
  correctCount: number;
  incorrectCount: number;
  unansweredCount: number;
  negativeMarksDeducted: number;
  passed: boolean;
  rank?: number;
}

export interface TeacherUser {
  id: string;
  name: string;
  email: string;
  role: 'teacher' | 'admin';
  subjectSpecialization?: string;
}

export interface AppSettings {
  centreName: string;
  shortName: string;
  tagline: string;
  logoUrl?: string;
  contactEmail: string;
  contactPhone: string;
  address: string;
  firebaseEnabled: boolean;
  firebaseConfig?: {
    apiKey?: string;
    authDomain?: string;
    projectId?: string;
    storageBucket?: string;
    messagingSenderId?: string;
    appId?: string;
  };
}

export type AppView =
  | 'welcome'
  | 'student-entry'
  | 'student-dashboard'
  | 'join-quiz'
  | 'quiz-instructions'
  | 'mcq-quiz'
  | 'results'
  | 'answer-review'
  | 'student-history'
  | 'leaderboard'
  | 'teacher-login'
  | 'teacher-dashboard'
  | 'quiz-editor'
  | 'question-bank'
  | 'student-management'
  | 'class-subject-management'
  | 'settings';
