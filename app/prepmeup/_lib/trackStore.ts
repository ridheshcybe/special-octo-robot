import fs from "fs";
import path from "path";
import { getAppOverallMetrics, getAllAppUsers } from "./studentStore";

export interface Track {
  id: string;
  slug: string;
  title: string;
  description: string;
  icon: string;
  status: "draft" | "published" | "archived" | "coming_soon";
  displayOrder: number;
  courseCount: number;
  badge?: string;
}

export interface Instructor {
  id: string;
  slug: string;
  fullName: string;
  title: string;
  bio: string;
  qualifications: string;
  expertise: string[];
  avatarUrl?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  websiteUrl?: string;
  status: "active" | "inactive";
  rating?: number;
  studentsMentored?: number;
}

export interface Course {
  id: string;
  trackSlug: string;
  instructorSlug: string;
  instructorId: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  level: "beginner" | "intermediate" | "advanced";
  language: string;
  format: "recorded" | "live" | "hybrid";
  prerequisite: string;
  thumbnailUrl: string;
  status: "draft" | "under_review" | "published" | "archived";
  isFreePreviewEnabled: boolean;
  durationHours: number;
  totalLessons: number;
  simulationsCount: number;
  quizzesCount: number;
  includesMentorship: boolean;
  includesCertificate: boolean;
  priceInr: number;
  tools: string[];
}

export interface CourseModule {
  id: string;
  courseSlug: string;
  moduleNumber: number;
  title: string;
  description: string;
  status: "draft" | "under_review" | "published" | "archived";
}

export interface CourseLesson {
  id: string;
  courseSlug: string;
  moduleId: string;
  moduleNumber: number;
  lessonNumber: number;
  title: string;
  description: string;
  lessonType: "video" | "pdf" | "quiz" | "simulation" | "assignment" | "live_session" | "coding_lab";
  duration: string;
  isFreePreview: boolean;
  status: "draft" | "under_review" | "approved" | "published" | "archived";
  videoUrl?: string;
  pdfPath?: string;
  simulationId?: string;
  simulationSlug?: string;
  quizId?: string;
  contentMarkdown?: string;
}

export interface QuantumSimulationMeta {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  moduleNumber: number;
  isFreePreview: boolean;
  formula: string;
  relatedLessonId: string;
}

export interface QuantumQuizQuestion {
  id: string;
  text: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface QuantumQuiz {
  id: string;
  courseSlug: string;
  moduleNumber: number;
  title: string;
  description: string;
  isFreePreview: boolean;
  status: "draft" | "under_review" | "published" | "archived";
  durationMinutes: number;
  totalMarks: number;
  passingScore: number;
  questions: QuantumQuizQuestion[];
}

export interface MentorshipSlot {
  id: string;
  instructorId: string;
  instructorName: string;
  courseSlug: string;
  startAt: string;
  endAt: string;
  durationMinutes: number;
  timezone: string;
  status: "available" | "requested" | "booked" | "blocked" | "completed" | "cancelled";
  supportedTypes: string[];
}

export interface MentorshipSessionItem {
  id: string;
  slotId?: string;
  courseSlug: string;
  instructorSlug: string;
  instructorName: string;
  studentName: string;
  studentEmail: string;
  sessionType: "quantum_doubt_clearing" | "quantum_interview_prep" | "career_guidance" | string;
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  status: "requested" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  studentNotes: string;
  instructorNotes: string;
}

export interface PendingApprovalItem {
  id: string;
  itemType: "lesson" | "quiz" | "question" | "ai_draft";
  courseSlug: string;
  courseTitle: string;
  instructorName: string;
  instructorSlug: string;
  title: string;
  summary: string;
  submittedAt: string;
  status: "pending_review" | "approved" | "rejected" | "published";
  reviewComments?: string;
}

export interface QuantumCertificate {
  code: string;
  studentTarget: string;
  studentName: string;
  courseSlug: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  status: "issued" | "revoked";
  verificationUrl: string;
}

export interface StudentQuantumProgress {
  completedLessons: string[];
  completedSimulations: string[];
  passedQuizzes: string[];
  completionPercentage: number;
  certificateStatus: "not_eligible" | "eligible" | "issued" | "revoked";
  certificateCode?: string;
}

interface TrackStoreState {
  tracks: Track[];
  instructors: Instructor[];
  courses: Course[];
  modules: CourseModule[];
  lessons: CourseLesson[];
  simulations: QuantumSimulationMeta[];
  quizzes: QuantumQuiz[];
  mentorshipSlots: MentorshipSlot[];
  mentorshipSessions: MentorshipSessionItem[];
  pendingApprovals: PendingApprovalItem[];
  certificates: QuantumCertificate[];
  studentQuantumProgress: Record<string, StudentQuantumProgress>;
}

let cachedState: TrackStoreState | null = null;

function getDataFilePath(): string {
  return path.join(process.cwd(), "deploy", "cms", "quantum_track_data.json");
}

function loadState(): TrackStoreState {
  if (cachedState) return cachedState;

  try {
    const filePath = getDataFilePath();
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      cachedState = JSON.parse(raw);
      if (!Array.isArray(cachedState!.quizzes)) cachedState!.quizzes = [];
      if (!Array.isArray(cachedState!.mentorshipSlots)) cachedState!.mentorshipSlots = [];
      if (!Array.isArray(cachedState!.mentorshipSessions)) cachedState!.mentorshipSessions = [];
      if (!Array.isArray(cachedState!.pendingApprovals)) cachedState!.pendingApprovals = [];
      if (!Array.isArray(cachedState!.certificates)) cachedState!.certificates = [];
      if (!cachedState!.studentQuantumProgress) cachedState!.studentQuantumProgress = {};
      return cachedState!;
    }
  } catch (err) {
    console.error("[TrackStore] Error loading CMS data:", err);
  }

  // Fallback defaults if file read fails
  cachedState = {
    tracks: [],
    instructors: [],
    courses: [],
    modules: [],
    lessons: [],
    simulations: [],
    quizzes: [],
    mentorshipSlots: [],
    mentorshipSessions: [],
    pendingApprovals: [],
    certificates: [],
    studentQuantumProgress: {},
  };

  return cachedState;
}

function persistState() {
  if (!cachedState) return;
  try {
    const filePath = getDataFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(cachedState, null, 2), "utf-8");
  } catch (err) {
    console.error("[TrackStore] Persist error:", err);
  }
}

// ----------------------------------------------------------------------------
// Public Track & Course Queries
// ----------------------------------------------------------------------------
export function getAllTracks(): Track[] {
  const state = loadState();
  return [...state.tracks].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getTrackBySlug(slug: string): Track | null {
  const state = loadState();
  return state.tracks.find((t) => t.slug === slug) || null;
}

export function getAllCourses(): Course[] {
  const state = loadState();
  return [...state.courses];
}

export function getCoursesByTrack(trackSlug: string): Course[] {
  const state = loadState();
  return state.courses.filter((c) => c.trackSlug === trackSlug);
}

export function getCourseBySlug(courseSlug: string): Course | null {
  const state = loadState();
  return state.courses.find((c) => c.slug === courseSlug) || null;
}

export function getCourseModulesAndLessons(courseSlug: string): {
  course: Course | null;
  modules: Array<CourseModule & { lessons: CourseLesson[] }>;
} {
  const state = loadState();
  const course = state.courses.find((c) => c.slug === courseSlug) || null;
  if (!course) {
    return { course: null, modules: [] };
  }

  const courseModules = state.modules
    .filter((m) => m.courseSlug === courseSlug)
    .sort((a, b) => a.moduleNumber - b.moduleNumber);

  const modulesWithLessons = courseModules.map((m) => {
    const lessons = state.lessons
      .filter((l) => l.courseSlug === courseSlug && l.moduleId === m.id)
      .sort((a, b) => a.lessonNumber - b.lessonNumber);
    return { ...m, lessons };
  });

  return { course, modules: modulesWithLessons };
}

export function getLessonById(courseSlug: string, lessonId: string): {
  lesson: CourseLesson | null;
  course: Course | null;
  module: CourseModule | null;
  prevLessonId: string | null;
  nextLessonId: string | null;
} {
  const state = loadState();
  const course = state.courses.find((c) => c.slug === courseSlug) || null;
  const allCourseLessons = state.lessons
    .filter((l) => l.courseSlug === courseSlug)
    .sort((a, b) => (a.moduleNumber - b.moduleNumber) || (a.lessonNumber - b.lessonNumber));

  const index = allCourseLessons.findIndex((l) => l.id === lessonId);
  if (index === -1) {
    return { lesson: null, course, module: null, prevLessonId: null, nextLessonId: null };
  }

  const lesson = allCourseLessons[index];
  const moduleObj = state.modules.find((m) => m.id === lesson.moduleId) || null;
  const prevLessonId = index > 0 ? allCourseLessons[index - 1].id : null;
  const nextLessonId = index < allCourseLessons.length - 1 ? allCourseLessons[index + 1].id : null;

  return { lesson, course, module: moduleObj, prevLessonId, nextLessonId };
}

// ----------------------------------------------------------------------------
// Simulations
// ----------------------------------------------------------------------------
export function getQuantumSimulations(): QuantumSimulationMeta[] {
  const state = loadState();
  return [...state.simulations];
}

export function getQuantumSimulationBySlug(slug: string): QuantumSimulationMeta | null {
  const state = loadState();
  return state.simulations.find((s) => s.slug === slug) || null;
}

// ----------------------------------------------------------------------------
// Quizzes & Assessments (Phase Q2 Activation)
// ----------------------------------------------------------------------------
export function getAllQuantumQuizzes(options?: { publishedOnly?: boolean }): QuantumQuiz[] {
  const state = loadState();
  if (options?.publishedOnly) {
    return state.quizzes.filter((q) => q.status === "published");
  }
  return [...state.quizzes];
}

export function getQuantumQuizById(quizId: string): QuantumQuiz | null {
  const state = loadState();
  return state.quizzes.find((q) => q.id === quizId) || null;
}

export function publishQuantumQuiz(quizId: string): { success: boolean; quiz?: QuantumQuiz } {
  const state = loadState();
  const quiz = state.quizzes.find((q) => q.id === quizId);
  if (!quiz) return { success: false };
  quiz.status = "published";
  persistState();
  return { success: true, quiz };
}

// ----------------------------------------------------------------------------
// Quantum AI Tutor Knowledge Retrieval (Approved RAG Context)
// ----------------------------------------------------------------------------
export function getApprovedQuantumRAGContext(query: string, moduleNumber?: number): {
  contextSnippet: string;
  matchedLessons: string[];
  isSyllabusGrounded: boolean;
  disclosureNotice?: string;
} {
  const state = loadState();
  const qLower = query.toLowerCase();

  // Filter only approved / published lessons
  let candidates = state.lessons.filter((l) => l.status === "published" && l.contentMarkdown);
  if (moduleNumber) {
    candidates = candidates.filter((l) => l.moduleNumber === moduleNumber);
  }

  // Score candidate relevance
  const keywords = qLower.split(/\W+/).filter((k) => k.length > 2);
  const scored = candidates.map((l) => {
    let score = 0;
    const lText = (l.title + " " + l.description + " " + l.contentMarkdown).toLowerCase();
    for (const kw of keywords) {
      if (lText.includes(kw)) score += 1;
    }
    return { lesson: l, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const topMatches = scored.filter((s) => s.score > 0).slice(0, 3);

  if (topMatches.length > 0) {
    const snippets = topMatches.map(
      (m) =>
        `[Module ${m.lesson.moduleNumber} Lesson ${m.lesson.lessonNumber}: ${m.lesson.title}]\n${m.lesson.contentMarkdown}`
    );
    return {
      contextSnippet: snippets.join("\n\n---\n\n"),
      matchedLessons: topMatches.map((m) => m.lesson.title),
      isSyllabusGrounded: true,
    };
  }

  // If query is outside course curriculum, explicitly disclose general quantum knowledge
  return {
    contextSnippet:
      "General Quantum Information Principles: Dirac Bra-Ket notation, Born probability postulate, unitary matrix gates, tensor product Hilbert spaces, and Qiskit circuit SDK.",
    matchedLessons: [],
    isSyllabusGrounded: false,
    disclosureNotice:
      "This explanation uses general quantum-computing knowledge and may not be part of your course syllabus.",
  };
}

// ----------------------------------------------------------------------------
// Mentorship Availability & Double-Booking Protected Scheduling (Phase Q2)
// ----------------------------------------------------------------------------
export function getAvailableMentorshipSlots(courseSlug = "quantum-computing-foundations"): MentorshipSlot[] {
  const state = loadState();
  return state.mentorshipSlots.filter(
    (s) => s.status === "available" && (!courseSlug || s.courseSlug === courseSlug)
  );
}

export function requestMentorshipSession(params: {
  studentName: string;
  studentEmail: string;
  slotId: string;
  sessionType: string;
  studentNotes: string;
}): { success: boolean; session?: MentorshipSessionItem; error?: string } {
  const state = loadState();
  const slotIndex = state.mentorshipSlots.findIndex((s) => s.id === params.slotId);

  if (slotIndex === -1) {
    return { success: false, error: "Selected mentorship slot does not exist." };
  }

  const slot = state.mentorshipSlots[slotIndex];
  // Double-booking protection: verify slot status is still available
  if (slot.status !== "available") {
    return { success: false, error: "This slot is already booked or no longer available." };
  }

  // Mark slot as booked
  slot.status = "booked";

  const newSession: MentorshipSessionItem = {
    id: `sess-${Date.now()}`,
    slotId: slot.id,
    courseSlug: slot.courseSlug,
    instructorSlug: "dr-aravind-vaidya",
    instructorName: slot.instructorName,
    studentName: params.studentName,
    studentEmail: params.studentEmail,
    sessionType: params.sessionType,
    scheduledAt: slot.startAt,
    durationMinutes: slot.durationMinutes,
    meetingUrl: "https://meet.google.com/pmu-quantum-vip",
    status: "requested",
    studentNotes: params.studentNotes,
    instructorNotes: "Awaiting faculty session confirmation.",
  };

  state.mentorshipSessions.unshift(newSession);
  persistState();
  return { success: true, session: newSession };
}

export function getStudentMentorshipSessions(studentIdentifier: string): MentorshipSessionItem[] {
  const state = loadState();
  const idLower = studentIdentifier.toLowerCase();
  return state.mentorshipSessions.filter(
    (s) => s.studentEmail.toLowerCase() === idLower || s.studentName.toLowerCase().includes(idLower)
  );
}

export function updateMentorshipSession(
  sessionId: string,
  updates: Partial<MentorshipSessionItem>
): { success: boolean; session?: MentorshipSessionItem } {
  const state = loadState();
  const index = state.mentorshipSessions.findIndex((s) => s.id === sessionId);
  if (index === -1) return { success: false };

  const updated: MentorshipSessionItem = {
    ...state.mentorshipSessions[index],
    ...updates,
  };
  state.mentorshipSessions[index] = updated;

  // If session cancelled, free up the corresponding slot
  if (updates.status === "cancelled" && updated.slotId) {
    const slot = state.mentorshipSlots.find((s) => s.id === updated.slotId);
    if (slot) slot.status = "available";
  }

  persistState();
  return { success: true, session: updated };
}

// ----------------------------------------------------------------------------
// Admin Approvals Queue (Phase Q2)
// ----------------------------------------------------------------------------
export function getPendingApprovals(): PendingApprovalItem[] {
  const state = loadState();
  return [...state.pendingApprovals];
}

export function reviewPendingApproval(
  itemId: string,
  action: "approve" | "reject" | "publish",
  comments = ""
): { success: boolean; item?: PendingApprovalItem } {
  const state = loadState();
  const index = state.pendingApprovals.findIndex((i) => i.id === itemId);
  if (index === -1) return { success: false };

  const item = state.pendingApprovals[index];
  if (action === "approve") {
    item.status = "approved";
  } else if (action === "publish") {
    item.status = "published";
  } else {
    item.status = "rejected";
  }
  item.reviewComments = comments;
  persistState();
  return { success: true, item };
}

// ----------------------------------------------------------------------------
// Student Quantum Progress & Completion Tracking
// ----------------------------------------------------------------------------
export function getStudentQuantumProgress(studentTarget: string): StudentQuantumProgress {
  const state = loadState();
  const key = studentTarget.toLowerCase();
  if (state.studentQuantumProgress[key]) {
    return state.studentQuantumProgress[key];
  }

  const defaultProgress: StudentQuantumProgress = {
    completedLessons: ["lesson-q1-01"], // Free preview default
    completedSimulations: ["qubit-state-visualizer"],
    passedQuizzes: [],
    completionPercentage: 10,
    certificateStatus: "not_eligible",
  };
  return defaultProgress;
}

export function updateStudentQuantumProgress(
  studentTarget: string,
  update: { type: "lesson" | "simulation" | "quiz"; id: string; passed?: boolean }
): StudentQuantumProgress {
  const state = loadState();
  const key = studentTarget.toLowerCase();
  const current = getStudentQuantumProgress(studentTarget);

  if (update.type === "lesson" && !current.completedLessons.includes(update.id)) {
    current.completedLessons.push(update.id);
  } else if (update.type === "simulation" && !current.completedSimulations.includes(update.id)) {
    current.completedSimulations.push(update.id);
  } else if (update.type === "quiz" && update.passed && !current.passedQuizzes.includes(update.id)) {
    current.passedQuizzes.push(update.id);
  }

  // Calculate percentage: 20 lessons (50%), 5 simulations (25%), 5 quizzes (25%)
  const lessonPct = (Math.min(20, current.completedLessons.length) / 20) * 50;
  const simPct = (Math.min(5, current.completedSimulations.length) / 5) * 25;
  const quizPct = (Math.min(5, current.passedQuizzes.length) / 5) * 25;
  current.completionPercentage = Math.round(lessonPct + simPct + quizPct);

  // Check certificate eligibility
  if (
    current.completedLessons.length >= 20 &&
    current.passedQuizzes.length >= 5 &&
    current.certificateStatus === "not_eligible"
  ) {
    current.certificateStatus = "eligible";
  }

  state.studentQuantumProgress[key] = current;
  persistState();
  return current;
}

// ----------------------------------------------------------------------------
// Certificate Issuance & Public Verification
// ----------------------------------------------------------------------------
export function issueQuantumCertificate(
  studentTarget: string,
  studentName: string
): { success: boolean; certificate?: QuantumCertificate; error?: string } {
  const state = loadState();
  const key = studentTarget.toLowerCase();
  const progress = getStudentQuantumProgress(studentTarget);

  // Check existing
  const existing = state.certificates.find((c) => c.studentTarget.toLowerCase() === key);
  if (existing) {
    return { success: true, certificate: existing };
  }

  // Check eligibility criteria
  if (progress.completedLessons.length < 20 || progress.passedQuizzes.length < 5) {
    return {
      success: false,
      error: "Eligibility criteria not met: must complete all 20 lessons and pass all 5 module assessments.",
    };
  }

  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  const code = `PMU-QC-2026-${randomHex}`;

  const cert: QuantumCertificate = {
    code,
    studentTarget: key,
    studentName,
    courseSlug: "quantum-computing-foundations",
    courseTitle: "Quantum Computing Foundations",
    instructorName: "Dr. Aravind Vaidya, PhD",
    issueDate: new Date().toISOString(),
    status: "issued",
    verificationUrl: `https://prepmeupai.in/prepmeup/verify-certificate/${code}`,
  };

  state.certificates.push(cert);
  progress.certificateStatus = "issued";
  progress.certificateCode = code;
  state.studentQuantumProgress[key] = progress;
  persistState();

  return { success: true, certificate: cert };
}

export function getCertificateByCode(certificateCode: string): {
  code: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  status: "issued" | "revoked";
  verificationUrl: string;
} | null {
  const state = loadState();
  const cert = state.certificates.find(
    (c) => c.code.trim().toUpperCase() === certificateCode.trim().toUpperCase()
  );
  if (!cert) return null;

  // Strict data boundary: Zero PII, no email, no phone, no user IDs
  return {
    code: cert.code,
    studentName: cert.studentName,
    courseTitle: cert.courseTitle,
    instructorName: cert.instructorName,
    issueDate: cert.issueDate,
    status: cert.status,
    verificationUrl: cert.verificationUrl,
  };
}

// ----------------------------------------------------------------------------
// Instructors & Permissions
// ----------------------------------------------------------------------------
export function getInstructorBySlug(slug: string): Instructor | null {
  const state = loadState();
  return state.instructors.find((i) => i.slug === slug) || null;
}

export function getInstructorById(id: string): Instructor | null {
  const state = loadState();
  return state.instructors.find((i) => i.id === id) || null;
}

export function getInstructorCourses(instructorIdentifier: string): Course[] {
  const state = loadState();
  return state.courses.filter(
    (c) => c.instructorSlug === instructorIdentifier || c.instructorId === instructorIdentifier
  );
}

export function getInstructorMentorshipRequests(instructorIdentifier: string): MentorshipSessionItem[] {
  const state = loadState();
  return state.mentorshipSessions.filter(
    (s) => s.instructorSlug === instructorIdentifier || instructorIdentifier.includes("vaidya")
  );
}

export function updateCourseByInstructor(
  instructorIdentifier: string,
  courseSlug: string,
  updates: Partial<Course>
): { success: boolean; error?: string; course?: Course } {
  const state = loadState();
  const courseIndex = state.courses.findIndex((c) => c.slug === courseSlug);
  if (courseIndex === -1) {
    return { success: false, error: "Course not found" };
  }

  const course = state.courses[courseIndex];
  if (
    course.instructorSlug !== instructorIdentifier &&
    course.instructorId !== instructorIdentifier &&
    instructorIdentifier !== "admin"
  ) {
    return { success: false, error: "Unauthorized: Instructors can manage only their own courses" };
  }

  const updatedCourse: Course = {
    ...course,
    ...updates,
    status:
      updates.status === "published" && instructorIdentifier !== "admin"
        ? "under_review"
        : updates.status || course.status,
  };

  state.courses[courseIndex] = updatedCourse;
  persistState();
  return { success: true, course: updatedCourse };
}

export function createCourseByInstructor(
  instructorIdentifier: string,
  newCourseData: Omit<Course, "id">
): { success: boolean; error?: string; course?: Course } {
  const state = loadState();
  const instructor =
    state.instructors.find(
      (i) => i.slug === instructorIdentifier || i.id === instructorIdentifier
    ) || state.instructors[0];

  const id = `c-dyn-${Date.now()}`;
  const course: Course = {
    ...newCourseData,
    id,
    instructorId: instructor.id,
    instructorSlug: instructor.slug,
    status: "draft",
  };

  state.courses.push(course);
  persistState();
  return { success: true, course };
}

export function saveLessonByInstructor(
  instructorIdentifier: string,
  courseSlug: string,
  lessonData: Partial<CourseLesson> & { id?: string; moduleId: string; title: string }
): { success: boolean; error?: string; lesson?: CourseLesson } {
  const state = loadState();
  const course = state.courses.find((c) => c.slug === courseSlug);
  if (!course) return { success: false, error: "Course not found" };

  if (
    course.instructorSlug !== instructorIdentifier &&
    course.instructorId !== instructorIdentifier &&
    instructorIdentifier !== "admin"
  ) {
    return { success: false, error: "Unauthorized: Instructors can manage only their own courses" };
  }

  const existingIndex = lessonData.id
    ? state.lessons.findIndex((l) => l.id === lessonData.id)
    : -1;

  if (existingIndex >= 0) {
    const updated: CourseLesson = {
      ...state.lessons[existingIndex],
      ...lessonData,
      status: lessonData.status || "draft",
    };
    state.lessons[existingIndex] = updated;
    persistState();
    return { success: true, lesson: updated };
  } else {
    const newLesson: CourseLesson = {
      id: lessonData.id || `lesson-dyn-${Date.now()}`,
      courseSlug,
      moduleId: lessonData.moduleId,
      moduleNumber: 1,
      lessonNumber: state.lessons.filter((l) => l.courseSlug === courseSlug).length + 1,
      title: lessonData.title,
      description: lessonData.description || "",
      lessonType: lessonData.lessonType || "video",
      duration: lessonData.duration || "15 min",
      isFreePreview: Boolean(lessonData.isFreePreview),
      status: "draft",
      contentMarkdown: lessonData.contentMarkdown || "",
    };
    state.lessons.push(newLesson);
    persistState();
    return { success: true, lesson: newLesson };
  }
}

export function checkUserCourseAccess(
  userTarget: string | null | undefined,
  courseSlug: string
): { hasAccess: boolean; isFreePreviewOnly: boolean; role: "guest" | "student" | "instructor" | "admin" } {
  if (!userTarget) {
    return { hasAccess: false, isFreePreviewOnly: true, role: "guest" };
  }

  if (userTarget === "walavalkarridhesh@gmail.com" || userTarget.includes("admin")) {
    return { hasAccess: true, isFreePreviewOnly: false, role: "admin" };
  }

  if (userTarget.includes("vaidya") || userTarget.includes("instructor")) {
    return { hasAccess: true, isFreePreviewOnly: false, role: "instructor" };
  }

  const allUsers = getAllAppUsers();
  const user = allUsers.find(
    (u) => u.target.toLowerCase() === userTarget.toLowerCase() || u.id === userTarget
  );

  if (user) {
    const tier = user.tier || "";
    if (
      tier.includes("Tier 3") ||
      tier.includes("VIP") ||
      tier.includes("Tier 2") ||
      tier.includes("Pro")
    ) {
      return { hasAccess: true, isFreePreviewOnly: false, role: "student" };
    }
  }

  return { hasAccess: false, isFreePreviewOnly: true, role: "student" };
}
