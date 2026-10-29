/**
 * In-memory & session-persistent student activity store.
 * Tracks quiz attempts, coding submissions, and doubts per studentId.
 * Guarantees that progress stats reflect real student submissions without fake placeholder data.
 */

export interface StudentQuizAttempt {
  id: string;
  quizId: string;
  quizTitle: string;
  score: number;
  totalMarks: number;
  percentage: number;
  breakdown: Array<{
    questionId: string;
    questionText: string;
    studentAnswer: any;
    isCorrect: boolean;
    marksAwarded: number;
    explanation?: string;
  }>;
  submittedAt: string;
}

export interface StudentCodingSubmission {
  id: string;
  problemId: string;
  problemTitle: string;
  code: string;
  language: string;
  status: "accepted" | "runtime_error" | "wrong_answer";
  submittedAt: string;
}

export interface StudentDoubtItem {
  id: string;
  title: string;
  queryText: string;
  answerText: string;
  subjectName?: string;
  isGrounded: boolean;
  createdAt: string;
}

interface StudentRecord {
  quizAttempts: StudentQuizAttempt[];
  codingSubmissions: StudentCodingSubmission[];
  doubts: StudentDoubtItem[];
}

// Global server-side map keyed by studentId (e.g. wa-8421194608 or email or mock id)
const studentStoreMap = new Map<string, StudentRecord>();

function getOrCreateRecord(studentId: string): StudentRecord {
  let record = studentStoreMap.get(studentId);
  if (!record) {
    record = {
      quizAttempts: [],
      codingSubmissions: [],
      doubts: [],
    };
    studentStoreMap.set(studentId, record);
  }
  return record;
}

export function recordQuizAttempt(studentId: string, attempt: StudentQuizAttempt): void {
  const record = getOrCreateRecord(studentId);
  // Add to beginning of attempts list
  record.quizAttempts.unshift(attempt);
  if (record.quizAttempts.length > 50) {
    record.quizAttempts.pop();
  }
}

export function recordCodingSubmission(studentId: string, submission: StudentCodingSubmission): void {
  const record = getOrCreateRecord(studentId);
  record.codingSubmissions.unshift(submission);
  if (record.codingSubmissions.length > 50) {
    record.codingSubmissions.pop();
  }
}

export function recordDoubt(studentId: string, doubt: StudentDoubtItem): void {
  const record = getOrCreateRecord(studentId);
  record.doubts.unshift(doubt);
  if (record.doubts.length > 50) {
    record.doubts.pop();
  }
}

export function getStudentActivity(studentId: string): StudentRecord {
  return getOrCreateRecord(studentId);
}
