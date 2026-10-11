import {
  Subject,
  Chapter,
  Question,
  Quiz,
  QuizAttempt,
  StudentSession,
  TeacherUser,
  AppSettings,
} from '../types';
import {
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
  INITIAL_QUESTION_BANK,
  INITIAL_QUIZZES,
  INITIAL_ATTEMPTS,
  DEFAULT_SETTINGS,
} from '../data/initialData';
import {
  saveQuizToFirestore,
  deleteQuizFromFirestore,
  saveQuestionToFirestore,
  deleteQuestionFromFirestore,
  saveAttemptToFirestore,
  registerStudentInFirestore,
  saveSubjectToFirestore,
  deleteSubjectFromFirestore,
  saveChapterToFirestore,
  deleteChapterFromFirestore,
  subscribeToPublishedQuizzes,
  subscribeToQuestionBank,
  subscribeToAttempts,
  subscribeToStudents,
  subscribeToSubjects,
  subscribeToChapters,
  seedInitialDataIfEmpty,
  testConnection,
} from './firebaseClient';

const STORAGE_KEYS = {
  SUBJECTS: 'gcc_quiz_subjects_v1',
  CHAPTERS: 'gcc_quiz_chapters_v1',
  QUESTIONS: 'gcc_quiz_questions_v1',
  QUIZZES: 'gcc_quiz_quizzes_v1',
  ATTEMPTS: 'gcc_quiz_attempts_v1',
  STUDENTS: 'gcc_quiz_students_v1',
  CURRENT_STUDENT: 'gcc_quiz_current_student_v1',
  CURRENT_TEACHER: 'gcc_quiz_current_teacher_v1',
  SETTINGS: 'gcc_quiz_settings_v1',
};

class StorageService {
  private listeners: Set<() => void> = new Set();
  private isFirestoreSynced: boolean = false;

  constructor() {
    this.ensureInitialized();
    this.initFirestoreSync();
  }

  public subscribe(callback: () => void): () => void {
    this.listeners.add(callback);
    return () => {
      this.listeners.delete(callback);
    };
  }

  private notify() {
    this.listeners.forEach((cb) => {
      try {
        cb();
      } catch (err) {
        console.error('Error notifying storage listener:', err);
      }
    });
  }

  private getItem<T>(key: string, defaultValue: T): T {
    try {
      const item = localStorage.getItem(key);
      if (!item) return defaultValue;
      return JSON.parse(item) as T;
    } catch {
      return defaultValue;
    }
  }

  private setItem<T>(key: string, value: T): void {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      this.notify();
    } catch (err) {
      console.error(`Error saving key ${key} to localStorage`, err);
    }
  }

  public ensureInitialized(): void {
    if (!localStorage.getItem(STORAGE_KEYS.SUBJECTS)) {
      this.setItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.CHAPTERS)) {
      this.setItem(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUESTIONS)) {
      this.setItem(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTION_BANK);
    }
    if (!localStorage.getItem(STORAGE_KEYS.QUIZZES)) {
      this.setItem(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
    }
    if (!localStorage.getItem(STORAGE_KEYS.ATTEMPTS)) {
      this.setItem(STORAGE_KEYS.ATTEMPTS, INITIAL_ATTEMPTS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.SETTINGS)) {
      this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    }
    if (!localStorage.getItem(STORAGE_KEYS.STUDENTS)) {
      const initialStudents: StudentSession[] = [
        { studentId: 'GCC-S-101', name: 'Aarav Sharma', classId: 10, createdAt: '2026-02-01T10:00:00Z', lastActiveAt: '2026-03-01T10:00:00Z' },
        { studentId: 'GCC-S-102', name: 'Diya Patel', classId: 10, createdAt: '2026-02-02T10:00:00Z', lastActiveAt: '2026-03-01T10:00:00Z' },
        { studentId: 'GCC-S-103', name: 'Rohan Verma', classId: 10, createdAt: '2026-02-05T10:00:00Z', lastActiveAt: '2026-03-01T10:00:00Z' },
        { studentId: 'GCC-S-801', name: 'Ananya Gupta', classId: 8, createdAt: '2026-02-10T10:00:00Z', lastActiveAt: '2026-03-02T11:00:00Z' },
        { studentId: 'GCC-S-501', name: 'Kabir Singh', classId: 5, createdAt: '2026-02-12T10:00:00Z', lastActiveAt: '2026-03-03T09:00:00Z' },
      ];
      this.setItem(STORAGE_KEYS.STUDENTS, initialStudents);
    }
  }

  // --- Real-Time Firestore Synchronization ---
  public async initFirestoreSync(): Promise<void> {
    if (this.isFirestoreSynced) return;
    this.isFirestoreSynced = true;

    try {
      await testConnection();
      await seedInitialDataIfEmpty();

      // Listen to Quizzes from Firestore
      subscribeToPublishedQuizzes((remoteQuizzes) => {
        if (remoteQuizzes && remoteQuizzes.length > 0) {
          this.setItem(STORAGE_KEYS.QUIZZES, remoteQuizzes);
        }
      });

      // Listen to Question Bank from Firestore
      subscribeToQuestionBank((remoteQuestions) => {
        if (remoteQuestions && remoteQuestions.length > 0) {
          this.setItem(STORAGE_KEYS.QUESTIONS, remoteQuestions);
        }
      });

      // Listen to Attempts from Firestore
      subscribeToAttempts((remoteAttempts) => {
        if (remoteAttempts && remoteAttempts.length > 0) {
          this.setItem(STORAGE_KEYS.ATTEMPTS, remoteAttempts);
        }
      });

      // Listen to Students from Firestore
      subscribeToStudents((remoteStudents) => {
        if (remoteStudents && remoteStudents.length > 0) {
          this.setItem(STORAGE_KEYS.STUDENTS, remoteStudents);
        }
      });

      // Listen to Subjects from Firestore
      subscribeToSubjects((remoteSubjects) => {
        if (remoteSubjects && remoteSubjects.length > 0) {
          this.setItem(STORAGE_KEYS.SUBJECTS, remoteSubjects);
        }
      });

      // Listen to Chapters from Firestore
      subscribeToChapters((remoteChapters) => {
        if (remoteChapters && remoteChapters.length > 0) {
          this.setItem(STORAGE_KEYS.CHAPTERS, remoteChapters);
        }
      });
    } catch (err) {
      console.warn('Firestore live listener initialization note:', err);
    }
  }

  // --- Settings ---
  public getSettings(): AppSettings {
    const settings = this.getItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
    if (!settings.logoUrl) {
      settings.logoUrl = '/gcc-logo.svg';
    }
    settings.firebaseEnabled = true; // Live Firebase Firestore is now provisioned & active
    return settings;
  }

  public updateSettings(settings: Partial<AppSettings>): void {
    const current = this.getSettings();
    this.setItem(STORAGE_KEYS.SETTINGS, { ...current, ...settings });
  }

  // --- Students ---
  public getStudents(): StudentSession[] {
    return this.getItem(STORAGE_KEYS.STUDENTS, []);
  }

  public getCurrentStudent(): StudentSession | null {
    return this.getItem<StudentSession | null>(STORAGE_KEYS.CURRENT_STUDENT, null);
  }

  public setCurrentStudent(student: StudentSession | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_STUDENT, student);
  }

  public registerOrLoginStudent(name: string, classId: number): StudentSession {
    const students = this.getStudents();
    const cleanName = name.trim();
    let student = students.find(
      (s) => s.name.toLowerCase() === cleanName.toLowerCase() && s.classId === classId
    );

    if (student) {
      student.lastActiveAt = new Date().toISOString();
      this.setItem(
        STORAGE_KEYS.STUDENTS,
        students.map((s) => (s.studentId === student!.studentId ? student! : s))
      );
    } else {
      const studentId = `GCC-S-${Math.floor(1000 + Math.random() * 9000)}`;
      student = {
        studentId,
        name: cleanName,
        classId,
        createdAt: new Date().toISOString(),
        lastActiveAt: new Date().toISOString(),
      };
      this.setItem(STORAGE_KEYS.STUDENTS, [...students, student]);
    }

    // Persist to Firestore asynchronously
    registerStudentInFirestore(student).catch((err) => {
      console.warn('Student Firestore sync note:', err);
    });

    this.setCurrentStudent(student);
    return student;
  }

  // --- Teacher ---
  public getCurrentTeacher(): TeacherUser | null {
    return this.getItem<TeacherUser | null>(STORAGE_KEYS.CURRENT_TEACHER, null);
  }

  public setTeacherSession(teacher: TeacherUser | null): void {
    this.setItem(STORAGE_KEYS.CURRENT_TEACHER, teacher);
  }

  // --- Subjects, Chapters ---
  public getSubjects(): Subject[] {
    return this.getItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
  }

  public getSubjectsForClass(classId: number): Subject[] {
    return this.getSubjects().filter((s) => s.applicableClasses.includes(classId));
  }

  public saveSubject(subject: Subject): void {
    const subjects = this.getSubjects();
    const index = subjects.findIndex((s) => s.id === subject.id);
    if (index >= 0) {
      subjects[index] = subject;
      this.setItem(STORAGE_KEYS.SUBJECTS, [...subjects]);
    } else {
      this.setItem(STORAGE_KEYS.SUBJECTS, [...subjects, subject]);
    }

    saveSubjectToFirestore(subject).catch((err) => {
      console.warn('Subject Firestore sync note:', err);
    });
  }

  public deleteSubject(subjectId: string): void {
    const subjects = this.getSubjects().filter((s) => s.id !== subjectId);
    this.setItem(STORAGE_KEYS.SUBJECTS, subjects);

    deleteSubjectFromFirestore(subjectId).catch((err) => {
      console.warn('Subject Firestore delete note:', err);
    });
  }

  public getChapters(): Chapter[] {
    return this.getItem(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
  }

  public getChaptersFor(subjectId: string, classId: number): Chapter[] {
    return this.getChapters().filter((c) => c.subjectId === subjectId && c.classId === classId);
  }

  public saveChapter(chapter: Chapter): void {
    const chapters = this.getChapters();
    const index = chapters.findIndex((c) => c.id === chapter.id);
    if (index >= 0) {
      chapters[index] = chapter;
      this.setItem(STORAGE_KEYS.CHAPTERS, [...chapters]);
    } else {
      this.setItem(STORAGE_KEYS.CHAPTERS, [...chapters, chapter]);
    }

    saveChapterToFirestore(chapter).catch((err) => {
      console.warn('Chapter Firestore sync note:', err);
    });
  }

  public deleteChapter(chapterId: string): void {
    const chapters = this.getChapters().filter((c) => c.id !== chapterId);
    this.setItem(STORAGE_KEYS.CHAPTERS, chapters);

    deleteChapterFromFirestore(chapterId).catch((err) => {
      console.warn('Chapter Firestore delete note:', err);
    });
  }

  // --- Question Bank ---
  public getQuestions(): Question[] {
    return this.getItem(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTION_BANK);
  }

  public saveQuestion(question: Question): void {
    const questions = this.getQuestions();
    const index = questions.findIndex((q) => q.id === question.id);
    let updatedQuestion = question;
    if (index >= 0) {
      updatedQuestion = { ...question, updatedAt: new Date().toISOString() };
      questions[index] = updatedQuestion;
      this.setItem(STORAGE_KEYS.QUESTIONS, [...questions]);
    } else {
      updatedQuestion = { ...question, createdAt: new Date().toISOString() };
      this.setItem(STORAGE_KEYS.QUESTIONS, [...questions, updatedQuestion]);
    }

    saveQuestionToFirestore(updatedQuestion).catch((err) => {
      console.warn('Question Firestore sync note:', err);
    });
  }

  public deleteQuestion(questionId: string): void {
    const questions = this.getQuestions().filter((q) => q.id !== questionId);
    this.setItem(STORAGE_KEYS.QUESTIONS, questions);

    deleteQuestionFromFirestore(questionId).catch((err) => {
      console.warn('Question Firestore delete note:', err);
    });
  }

  // --- Quizzes ---
  public getQuizzes(): Quiz[] {
    return this.getItem(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
  }

  public getQuizById(id: string): Quiz | null {
    return this.getQuizzes().find((q) => q.id === id) || null;
  }

  public getQuizByCode(code: string): Quiz | null {
    const normalized = code.trim().toUpperCase().replace(/\s+/g, '');
    return this.getQuizzes().find((q) => q.code.toUpperCase().replace(/\s+/g, '') === normalized) || null;
  }

  public getQuizzesForClass(classId: number): Quiz[] {
    return this.getQuizzes().filter((q) => q.classId === classId && q.status === 'published');
  }

  public saveQuiz(quiz: Quiz): void {
    const quizzes = this.getQuizzes();
    const index = quizzes.findIndex((q) => q.id === quiz.id);
    let updatedQuiz = quiz;
    if (index >= 0) {
      updatedQuiz = { ...quiz, updatedAt: new Date().toISOString() };
      quizzes[index] = updatedQuiz;
      this.setItem(STORAGE_KEYS.QUIZZES, [...quizzes]);
    } else {
      updatedQuiz = {
        ...quiz,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.setItem(STORAGE_KEYS.QUIZZES, [...quizzes, updatedQuiz]);
    }

    // Persist to Cloud Firestore
    saveQuizToFirestore(updatedQuiz).catch((err) => {
      console.warn('Quiz Firestore sync note:', err);
    });
  }

  public deleteQuiz(quizId: string): void {
    const quizzes = this.getQuizzes().filter((q) => q.id !== quizId);
    this.setItem(STORAGE_KEYS.QUIZZES, quizzes);

    deleteQuizFromFirestore(quizId).catch((err) => {
      console.warn('Quiz Firestore delete note:', err);
    });
  }

  public generateQuizCode(): string {
    const prefixes = ['GCC', 'QUIZ', 'TEST'];
    const p = prefixes[0];
    const num = Math.floor(100 + Math.random() * 900);
    return `${p}-${num}`;
  }

  // --- Attempts & Results ---
  public getAttempts(): QuizAttempt[] {
    return this.getItem(STORAGE_KEYS.ATTEMPTS, INITIAL_ATTEMPTS);
  }

  public getAttemptsForStudent(studentId: string): QuizAttempt[] {
    return this.getAttempts().filter((a) => a.studentId === studentId);
  }

  public getAttemptsForQuiz(quizId: string): QuizAttempt[] {
    return this.getAttempts().filter((a) => a.quizId === quizId);
  }

  public saveAttempt(attempt: QuizAttempt): void {
    const attempts = this.getAttempts();
    this.setItem(STORAGE_KEYS.ATTEMPTS, [attempt, ...attempts]);

    // Persist to Cloud Firestore
    saveAttemptToFirestore(attempt).catch((err) => {
      console.warn('Attempt Firestore sync note:', err);
    });
  }

  public getStudentAttemptForQuiz(studentId: string, quizId: string): QuizAttempt | null {
    return this.getAttempts().find((a) => a.studentId === studentId && a.quizId === quizId) || null;
  }

  // --- Reset & Backup ---
  public resetToSampleData(): void {
    this.setItem(STORAGE_KEYS.SUBJECTS, INITIAL_SUBJECTS);
    this.setItem(STORAGE_KEYS.CHAPTERS, INITIAL_CHAPTERS);
    this.setItem(STORAGE_KEYS.QUESTIONS, INITIAL_QUESTION_BANK);
    this.setItem(STORAGE_KEYS.QUIZZES, INITIAL_QUIZZES);
    this.setItem(STORAGE_KEYS.ATTEMPTS, INITIAL_ATTEMPTS);
    this.setItem(STORAGE_KEYS.SETTINGS, DEFAULT_SETTINGS);
  }

  public exportFullBackupJSON(): string {
    const data = {
      version: '1.0',
      exportedAt: new Date().toISOString(),
      subjects: this.getSubjects(),
      chapters: this.getChapters(),
      questions: this.getQuestions(),
      quizzes: this.getQuizzes(),
      attempts: this.getAttempts(),
      students: this.getStudents(),
      settings: this.getSettings(),
    };
    return JSON.stringify(data, null, 2);
  }

  public importBackupJSON(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString);
      if (data.subjects) this.setItem(STORAGE_KEYS.SUBJECTS, data.subjects);
      if (data.chapters) this.setItem(STORAGE_KEYS.CHAPTERS, data.chapters);
      if (data.questions) this.setItem(STORAGE_KEYS.QUESTIONS, data.questions);
      if (data.quizzes) this.setItem(STORAGE_KEYS.QUIZZES, data.quizzes);
      if (data.attempts) this.setItem(STORAGE_KEYS.ATTEMPTS, data.attempts);
      if (data.students) this.setItem(STORAGE_KEYS.STUDENTS, data.students);
      if (data.settings) this.setItem(STORAGE_KEYS.SETTINGS, data.settings);
      return true;
    } catch (e) {
      console.error('Failed to parse backup JSON', e);
      return false;
    }
  }

  public generateResultsCSV(quizId?: string): string {
    const attempts = quizId ? this.getAttemptsForQuiz(quizId) : this.getAttempts();
    const headers = [
      'Attempt ID',
      'Quiz Code',
      'Quiz Title',
      'Student ID',
      'Student Name',
      'Class',
      'Score Obtained',
      'Total Marks',
      'Percentage (%)',
      'Passed',
      'Correct Count',
      'Incorrect Count',
      'Unanswered Count',
      'Negative Deducted',
      'Time Taken (s)',
      'Submitted At',
    ];

    const rows = attempts.map((a) => [
      `"${a.id}"`,
      `"${a.quizCode}"`,
      `"${a.quizTitle.replace(/"/g, '""')}"`,
      `"${a.studentId}"`,
      `"${a.studentName.replace(/"/g, '""')}"`,
      a.classId,
      a.score,
      a.totalMarks,
      a.percentage,
      a.passed ? 'YES' : 'NO',
      a.correctCount,
      a.incorrectCount,
      a.unansweredCount,
      a.negativeMarksDeducted,
      a.timeTakenSeconds,
      `"${a.submittedAt}"`,
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }
}

export const storageService = new StorageService();
