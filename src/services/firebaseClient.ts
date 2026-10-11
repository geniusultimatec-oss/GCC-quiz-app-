import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import {
  getAuth,
  Auth,
  signInWithPopup,
  GoogleAuthProvider,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  Firestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocFromServer,
} from 'firebase/firestore';

// Provisioned Firebase configuration
import firebaseConfig from '../../firebase-applet-config.json';
import {
  Quiz,
  Question,
  QuizAttempt,
  StudentSession,
  Subject,
  Chapter,
  TeacherUser,
} from '../types';
import {
  INITIAL_SUBJECTS,
  INITIAL_CHAPTERS,
  INITIAL_QUESTION_BANK,
  INITIAL_QUIZZES,
} from '../data/initialData';

export const app: FirebaseApp = getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
export const db: Firestore = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth: Auth = getAuth(app);

// Default Primary Teacher Email
export const DEFAULT_TEACHER_EMAIL = 'geniusultimatec@gmail.com';

const STORAGE_KEYS = {
  TEACHER_EMAIL: 'gcc_authorized_teacher_email_v1',
};

export function getAuthorizedTeacherEmail(): string {
  try {
    const custom = localStorage.getItem(STORAGE_KEYS.TEACHER_EMAIL);
    if (custom && custom.trim()) return custom.trim().toLowerCase();
  } catch {}
  return DEFAULT_TEACHER_EMAIL.toLowerCase();
}

export function setAuthorizedTeacherEmail(email: string): void {
  const clean = email.trim().toLowerCase();
  if (clean) {
    localStorage.setItem(STORAGE_KEYS.TEACHER_EMAIL, clean);
  }
}

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// Initial Connection Test
export async function testConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
    return true;
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
      return false;
    }
    // Any other response confirms the Firestore server endpoint was reached
    return true;
  }
}

// -------------------------------------------------------------
// TEACHER AUTHENTICATION & AUTHORIZATION
// -------------------------------------------------------------

export async function isUserAuthorizedTeacher(user: User | null): Promise<boolean> {
  if (!user || !user.email) return false;
  const userEmail = user.email.toLowerCase().trim();
  const authorizedEmail = getAuthorizedTeacherEmail().toLowerCase();

  // 1. Matches configured authorized teacher email or default
  if (userEmail === authorizedEmail || userEmail === DEFAULT_TEACHER_EMAIL.toLowerCase()) {
    return true;
  }

  // 2. Check Firestore /teachers collection
  try {
    const teacherDoc = await getDoc(doc(db, 'teachers', user.uid));
    if (teacherDoc.exists()) {
      const data = teacherDoc.data();
      return data.role === 'teacher' || data.role === 'admin';
    }
  } catch (err) {
    console.warn('Teacher authorization check note:', err);
  }

  return false;
}

export async function loginTeacherWithGoogle(): Promise<{ user: User; teacher: TeacherUser }> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });
  const result = await signInWithPopup(auth, provider);
  const authorized = await isUserAuthorizedTeacher(result.user);

  if (!authorized) {
    await signOut(auth);
    throw new Error(
      `Access denied: Google account (${result.user.email}) is not authorized as a faculty instructor. Authorized teacher email is: ${getAuthorizedTeacherEmail()}`
    );
  }

  const teacher = await ensureTeacherProfileExists(result.user);
  return { user: result.user, teacher };
}

export async function loginTeacherWithEmail(
  email: string,
  pass: string
): Promise<{ user: User; teacher: TeacherUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const authorizedEmail = getAuthorizedTeacherEmail();

  // Pre-check email authorization to protect teacher portal
  if (cleanEmail !== authorizedEmail && cleanEmail !== DEFAULT_TEACHER_EMAIL.toLowerCase()) {
    throw new Error(
      `Access denied: "${cleanEmail}" is not authorized as a teacher. Only the designated teacher email (${authorizedEmail}) can access the faculty portal. Students cannot sign in as teachers.`
    );
  }

  const result = await signInWithEmailAndPassword(auth, cleanEmail, pass);
  const authorized = await isUserAuthorizedTeacher(result.user);

  if (!authorized) {
    await signOut(auth);
    throw new Error(
      `Access denied: This account is not authorized as faculty instructor at Genius Coaching Centre.`
    );
  }

  const teacher = await ensureTeacherProfileExists(result.user);
  return { user: result.user, teacher };
}

export async function registerTeacherWithEmail(
  email: string,
  pass: string,
  displayName: string
): Promise<{ user: User; teacher: TeacherUser }> {
  const cleanEmail = email.trim().toLowerCase();
  const authorizedEmail = getAuthorizedTeacherEmail();

  // Strict security gate: only the designated authorized email is permitted to register
  if (cleanEmail !== authorizedEmail && cleanEmail !== DEFAULT_TEACHER_EMAIL.toLowerCase()) {
    throw new Error(
      `Registration restricted: Only the authorized faculty email (${authorizedEmail}) can create a teacher account. Students cannot register as teachers.`
    );
  }

  if (pass.length < 6) {
    throw new Error('Password must be at least 6 characters.');
  }

  const result = await createUserWithEmailAndPassword(auth, cleanEmail, pass);
  const teacher = await ensureTeacherProfileExists(result.user, displayName);
  return { user: result.user, teacher };
}

export async function ensureTeacherProfileExists(user: User, customName?: string): Promise<TeacherUser> {
  const teacherRef = doc(db, 'teachers', user.uid);
  let name = customName || user.displayName || 'Authorized Faculty Instructor';
  let teacherData: TeacherUser = {
    id: user.uid,
    name,
    email: user.email?.toLowerCase() || '',
    role: 'admin',
    subjectSpecialization: 'Classes 1 - 10 Curriculum',
  };

  try {
    const existing = await getDoc(teacherRef);
    if (!existing.exists()) {
      await setDoc(teacherRef, {
        id: user.uid,
        name,
        email: user.email?.toLowerCase(),
        role: 'admin',
        createdAt: new Date().toISOString(),
      });
    } else {
      const data = existing.data();
      teacherData.name = data.name || teacherData.name;
      teacherData.role = data.role || 'admin';
    }
  } catch (err) {
    console.warn('Teacher profile check note:', err);
  }

  return teacherData;
}

export async function logoutTeacher(): Promise<void> {
  await signOut(auth);
}

export function subscribeToAuthChanges(
  callback: (teacher: TeacherUser | null) => void
): () => void {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      const authorized = await isUserAuthorizedTeacher(user);
      if (authorized) {
        const teacher = await ensureTeacherProfileExists(user);
        callback(teacher);
      } else {
        callback(null);
      }
    } else {
      callback(null);
    }
  });
}

// -------------------------------------------------------------
// FIRESTORE SEEDING (One-time starter curriculum & question bank)
// -------------------------------------------------------------

export async function seedInitialDataIfEmpty(): Promise<void> {
  try {
    const qSnapshot = await getDocs(collection(db, 'quizzes'));
    if (!qSnapshot.empty) return; // Already seeded

    console.log('Seeding initial GCC curriculum and starter quizzes into Cloud Firestore...');

    for (const sub of INITIAL_SUBJECTS) {
      await setDoc(doc(db, 'subjects', sub.id), sub);
    }

    for (const chap of INITIAL_CHAPTERS) {
      await setDoc(doc(db, 'chapters', chap.id), chap);
    }

    for (const q of INITIAL_QUESTION_BANK) {
      await setDoc(doc(db, 'questionBank', q.id), q);
    }

    for (const quiz of INITIAL_QUIZZES) {
      await setDoc(doc(db, 'quizzes', quiz.id), quiz);
    }

    console.log('Cloud Firestore initialized with GCC syllabus and tests.');
  } catch (err) {
    console.warn('Seeding note:', err);
  }
}

// -------------------------------------------------------------
// REAL-TIME FIRESTORE DATA LISTENERS
// -------------------------------------------------------------

export function subscribeToPublishedQuizzes(
  callback: (quizzes: Quiz[]) => void
): () => void {
  const q = collection(db, 'quizzes');
  return onSnapshot(
    q,
    (snapshot) => {
      const list: Quiz[] = [];
      snapshot.forEach((d) => {
        const data = d.data() as Quiz;
        list.push({ ...data, id: d.id });
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'quizzes');
    }
  );
}

export function subscribeToQuestionBank(
  callback: (questions: Question[]) => void
): () => void {
  const ref = collection(db, 'questionBank');
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: Question[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as Question), id: d.id });
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'questionBank');
    }
  );
}

export function subscribeToAttempts(
  callback: (attempts: QuizAttempt[]) => void
): () => void {
  const ref = collection(db, 'quizAttempts');
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: QuizAttempt[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as QuizAttempt), id: d.id });
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'quizAttempts');
    }
  );
}

export function subscribeToStudents(
  callback: (students: StudentSession[]) => void
): () => void {
  const ref = collection(db, 'students');
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: StudentSession[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as StudentSession), studentId: d.id });
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'students');
    }
  );
}

export function subscribeToSubjects(
  callback: (subjects: Subject[]) => void
): () => void {
  const ref = collection(db, 'subjects');
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: Subject[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as Subject), id: d.id });
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'subjects');
    }
  );
}

export function subscribeToChapters(
  callback: (chapters: Chapter[]) => void
): () => void {
  const ref = collection(db, 'chapters');
  return onSnapshot(
    ref,
    (snapshot) => {
      const list: Chapter[] = [];
      snapshot.forEach((d) => {
        list.push({ ...(d.data() as Chapter), id: d.id });
      });
      callback(list);
    },
    (err) => {
      handleFirestoreError(err, OperationType.LIST, 'chapters');
    }
  );
}

// -------------------------------------------------------------
// FIRESTORE MUTATIONS
// -------------------------------------------------------------

export async function saveQuizToFirestore(quiz: Quiz): Promise<void> {
  const path = `quizzes/${quiz.id}`;
  try {
    await setDoc(doc(db, 'quizzes', quiz.id), {
      ...quiz,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteQuizFromFirestore(quizId: string): Promise<void> {
  const path = `quizzes/${quizId}`;
  try {
    await deleteDoc(doc(db, 'quizzes', quizId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveQuestionToFirestore(question: Question): Promise<void> {
  const path = `questionBank/${question.id}`;
  try {
    await setDoc(doc(db, 'questionBank', question.id), {
      ...question,
      updatedAt: new Date().toISOString(),
    });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteQuestionFromFirestore(questionId: string): Promise<void> {
  const path = `questionBank/${questionId}`;
  try {
    await deleteDoc(doc(db, 'questionBank', questionId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveAttemptToFirestore(attempt: QuizAttempt): Promise<void> {
  const path = `quizAttempts/${attempt.id}`;
  try {
    await setDoc(doc(db, 'quizAttempts', attempt.id), attempt);
  } catch (err) {
    handleFirestoreError(err, OperationType.CREATE, path);
  }
}

export async function registerStudentInFirestore(
  student: StudentSession
): Promise<void> {
  const path = `students/${student.studentId}`;
  try {
    await setDoc(doc(db, 'students', student.studentId), student);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function saveSubjectToFirestore(subject: Subject): Promise<void> {
  const path = `subjects/${subject.id}`;
  try {
    await setDoc(doc(db, 'subjects', subject.id), subject);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteSubjectFromFirestore(subjectId: string): Promise<void> {
  const path = `subjects/${subjectId}`;
  try {
    await deleteDoc(doc(db, 'subjects', subjectId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}

export async function saveChapterToFirestore(chapter: Chapter): Promise<void> {
  const path = `chapters/${chapter.id}`;
  try {
    await setDoc(doc(db, 'chapters', chapter.id), chapter);
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, path);
  }
}

export async function deleteChapterFromFirestore(chapterId: string): Promise<void> {
  const path = `chapters/${chapterId}`;
  try {
    await deleteDoc(doc(db, 'chapters', chapterId));
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, path);
  }
}
