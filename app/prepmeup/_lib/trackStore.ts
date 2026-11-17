import fs from "fs";
import path from "path";
import crypto from "crypto";
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

export interface MentorshipSessionAuditEntry {
  transition: string;
  fromStatus: string;
  toStatus: string;
  timestamp: string;
  actor: string;
  details?: Record<string, any>;
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
  isRefunded?: boolean;
  isConsumed?: boolean;
  rescheduledFromSlotId?: string;
  lastRescheduledAt?: string;
  auditTrail?: MentorshipSessionAuditEntry[];
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

export interface QuantumEnrollment {
  id: string;
  userId: string;
  courseId: string;
  trackId: string;
  accessType: "free_preview" | "semester_pass" | "mentorship_pack" | "admin_granted";
  status: "active" | "expired" | "cancelled" | "revoked";
  startsAt: string;
  expiresAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuantumOrder {
  id: string;
  userId: string;
  courseId: string;
  productType: "semester_pass" | "mentorship_pack";
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
  status: "created" | "pending" | "paid" | "failed" | "expired" | "refunded";
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface QuantumPayment {
  id: string;
  orderId: string;
  userId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  verificationStatus: "pending" | "verified" | "failed";
  webhookStatus: "pending" | "received" | "processed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface MentorshipPack {
  id: string;
  userId: string;
  courseId: string;
  packType: string;
  totalSessions: number;
  usedSessions: number;
  status: "active" | "exhausted" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
}

export interface EarlyAdopterRedemption {
  id: string;
  userId: string;
  courseId: string;
  redemptionNumber: number;
  status: "claimed" | "revoked";
  createdAt: string;
}

export interface WebhookEventRecord {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  payload: any;
  status: "received" | "processing" | "processed" | "failed" | "ignored";
  attempts: number;
  errorMessage?: string;
  receivedAt: string;
  processedAt?: string;
}

export interface RateLimitEventRecord {
  id: string;
  bucketKey: string;
  identifier: string;
  count: number;
  windowStart: number;
  expiresAt: number;
  createdAt: string;
}

export interface CyberLabTask {
  id: string;
  labId: string;
  taskNumber: number;
  title: string;
  instructions: string;
  hint?: string;
  expectedFlagHash: string;
  flagFormat: string;
  points: number;
}

export interface CyberLab {
  id: string;
  courseId: string;
  moduleId: string;
  lessonId: string;
  title: string;
  slug: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  labType: "guided_lab" | "challenge_lab" | "ctf_challenge";
  environmentType: "browser_sandbox" | "simulated_terminal" | "soc_log_viewer";
  estimatedMinutes: number;
  isFreePreview: boolean;
  status: "draft" | "published" | "archived";
  tasks: CyberLabTask[];
  sandboxConfig: Record<string, any>;
}

export interface CyberLabAttempt {
  id: string;
  labId: string;
  taskId: string;
  userId: string;
  submittedFlag: string;
  isCorrect: boolean;
  pointsAwarded: number;
  attemptNumber: number;
  createdAt: string;
}

export interface CyberLabProgress {
  id: string;
  userId: string;
  labId: string;
  status: "not_started" | "in_progress" | "completed";
  tasksCompleted: number;
  totalTasks: number;
  score: number;
  startedAt: string;
  completedAt?: string;
  lastAttemptAt?: string;
}

export interface CyberIncidentCase {
  id: string;
  courseId: string;
  moduleId: string;
  title: string;
  slug: string;
  description: string;
  scenarioType: string;
  threatActorProfile: Record<string, any>;
  evidenceArtifacts: Record<string, any>;
  investigationSteps: string[];
  remediationPlan: Record<string, any>;
  isFreePreview: boolean;
  status: "draft" | "published" | "archived";
}

export interface LabAcceptance {
  id: string;
  userId: string;
  labId: string;
  policyVersion: string;
  acceptedAt: string;
  metadata?: Record<string, any>;
}

export interface CyberOrder {
  id: string;
  userId: string;
  courseId: string;
  productType: "semester_pass" | "mentorship_pack";
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
  status: "created" | "pending" | "paid" | "failed" | "expired" | "refunded";
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface CyberPayment {
  id: string;
  orderId: string;
  userId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  verificationStatus: "pending" | "verified" | "failed";
  webhookStatus: "pending" | "received" | "processed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface CyberMentorshipPack {
  id: string;
  userId: string;
  courseId: string;
  packType: string;
  totalSessions: number;
  usedSessions: number;
  status: "active" | "exhausted" | "expired" | "revoked";
  expiresAt: string;
  createdAt: string;
}

export interface CyberEarlyAdopterRedemption {
  id: string;
  userId: string;
  courseId: string;
  redemptionNumber: number;
  status: "claimed" | "revoked";
  createdAt: string;
}

export interface StudentCyberProgress {
  completedLessons: string[];
  completedLabs: string[];
  passedQuizzes: string[];
  completionPercentage: number;
  certificateStatus: "not_eligible" | "eligible" | "issued" | "revoked";
  certificateCode?: string;
}

// ----------------------------------------------------------------------------
// Phase C3: Unified Products, Orders, Payments & All-Access Entitlements
// ----------------------------------------------------------------------------

export interface UnifiedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  productType: "semester_pass" | "mentorship_pack" | "all_access_pass";
  trackId?: string;
  courseIds?: string[];
  priceInPaise: number;
  currency: string;
  durationDays: number;
  isActive: boolean;
  isEarlyAdopterEligible: boolean;
  earlyAdopterLimit?: number;
  features: string[];
}

export interface UnifiedOrder {
  id: string;
  userId: string;
  productId: string;
  productSlug: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: string;
  status: "created" | "pending" | "paid" | "failed" | "expired" | "refunded";
  metadata?: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedPayment {
  id: string;
  orderId: string;
  userId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise: number;
  currency: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  verificationStatus: "pending" | "verified" | "failed";
  webhookStatus?: "pending" | "received" | "processed" | "failed";
  createdAt: string;
  updatedAt: string;
}

export interface AllAccessEntitlement {
  id: string;
  userId: string;
  productId: string;
  productSlug: string;
  includedTrackIds: string[];
  includedCourseIds: string[];
  startsAt: string;
  expiresAt: string;
  status: "active" | "expired" | "cancelled" | "revoked";
  createdAt: string;
  updatedAt: string;
}

export interface AllAccessEarlyAdopterRedemption {
  id: string;
  userId: string;
  productId: string;
  productSlug: string;
  redemptionNumber: number;
  status: "claimed" | "revoked";
  createdAt: string;
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
  enrollments: QuantumEnrollment[];
  orders: QuantumOrder[];
  payments: QuantumPayment[];
  mentorshipPacks: MentorshipPack[];
  earlyAdopterRedemptions: EarlyAdopterRedemption[];
  webhookEvents?: WebhookEventRecord[];
  rateLimitEvents?: RateLimitEventRecord[];
  cyberLabs?: CyberLab[];
  cyberLabAttempts?: CyberLabAttempt[];
  cyberLabProgress?: CyberLabProgress[];
  cyberIncidentCases?: CyberIncidentCase[];
  labAcceptances?: LabAcceptance[];
  cyberOrders?: CyberOrder[];
  cyberPayments?: CyberPayment[];
  cyberMentorshipPacks?: CyberMentorshipPack[];
  cyberEarlyAdopterRedemptions?: CyberEarlyAdopterRedemption[];
  studentCyberProgress?: Record<string, StudentCyberProgress>;
  unifiedProducts?: UnifiedProduct[];
  unifiedOrders?: UnifiedOrder[];
  unifiedPayments?: UnifiedPayment[];
  allAccessEntitlements?: AllAccessEntitlement[];
  allAccessEarlyAdopterRedemptions?: AllAccessEarlyAdopterRedemption[];
}

let cachedState: TrackStoreState | null = null;

function getDataFilePath(): string {
  return path.join(process.cwd(), "deploy", "cms", "quantum_track_data.json");
}

export function loadState(): TrackStoreState {
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
      if (!Array.isArray(cachedState!.enrollments)) cachedState!.enrollments = [];
      if (!Array.isArray(cachedState!.orders)) cachedState!.orders = [];
      if (!Array.isArray(cachedState!.payments)) cachedState!.payments = [];
      if (!Array.isArray(cachedState!.mentorshipPacks)) cachedState!.mentorshipPacks = [];
      if (!Array.isArray(cachedState!.earlyAdopterRedemptions)) cachedState!.earlyAdopterRedemptions = [];
      if (!Array.isArray(cachedState!.webhookEvents)) cachedState!.webhookEvents = [];
      if (!Array.isArray(cachedState!.rateLimitEvents)) cachedState!.rateLimitEvents = [];
      if (!Array.isArray(cachedState!.cyberLabs)) cachedState!.cyberLabs = [];
      if (!Array.isArray(cachedState!.cyberLabAttempts)) cachedState!.cyberLabAttempts = [];
      if (!Array.isArray(cachedState!.cyberLabProgress)) cachedState!.cyberLabProgress = [];
      if (!Array.isArray(cachedState!.cyberIncidentCases)) cachedState!.cyberIncidentCases = [];
      if (!Array.isArray(cachedState!.labAcceptances)) cachedState!.labAcceptances = [];
      if (!Array.isArray(cachedState!.cyberOrders)) cachedState!.cyberOrders = [];
      if (!Array.isArray(cachedState!.cyberPayments)) cachedState!.cyberPayments = [];
      if (!Array.isArray(cachedState!.cyberMentorshipPacks)) cachedState!.cyberMentorshipPacks = [];
      if (!Array.isArray(cachedState!.cyberEarlyAdopterRedemptions)) cachedState!.cyberEarlyAdopterRedemptions = [];
      if (!cachedState!.studentCyberProgress) cachedState!.studentCyberProgress = {};
      if (!Array.isArray(cachedState!.unifiedProducts) || cachedState!.unifiedProducts.length === 0) {
        cachedState!.unifiedProducts = getDefaultUnifiedProducts();
      }
      if (!Array.isArray(cachedState!.unifiedOrders)) cachedState!.unifiedOrders = [];
      if (!Array.isArray(cachedState!.unifiedPayments)) cachedState!.unifiedPayments = [];
      if (!Array.isArray(cachedState!.allAccessEntitlements)) cachedState!.allAccessEntitlements = [];
      if (!Array.isArray(cachedState!.allAccessEarlyAdopterRedemptions)) cachedState!.allAccessEarlyAdopterRedemptions = [];
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
    enrollments: [],
    orders: [],
    payments: [],
    mentorshipPacks: [],
    earlyAdopterRedemptions: [],
    webhookEvents: [],
    rateLimitEvents: [],
    cyberLabs: [],
    cyberLabAttempts: [],
    cyberLabProgress: [],
    cyberIncidentCases: [],
    labAcceptances: [],
    cyberOrders: [],
    cyberPayments: [],
    cyberMentorshipPacks: [],
    cyberEarlyAdopterRedemptions: [],
    studentCyberProgress: {},
    unifiedProducts: getDefaultUnifiedProducts(),
    unifiedOrders: [],
    unifiedPayments: [],
    allAccessEntitlements: [],
    allAccessEarlyAdopterRedemptions: [],
  };

  return cachedState;
}

export function persistState() {
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
  const base = [...state.tracks]
    .filter((t) => t.slug !== "quantum-computing")
    .map((t) => {
      if (t.slug === "btech-cse-aiml") {
        return { ...t, badge: "100% Free for Everyone" };
      }
      if (t.slug === "cybersecurity") {
        return { ...t, status: "coming_soon" as const, badge: "Under Construction • Coming Soon" };
      }
      return t;
    })
    .sort((a, b) => a.displayOrder - b.displayOrder);
  if (!base.some((t) => t.slug === "cloud-computing-aws")) {
    base.push({
      id: "trk-cloud-aws",
      slug: "cloud-computing-aws",
      title: "Cloud Computing (AWS)",
      subtitle: "EC2, S3, IAM, VPC, Lambda & Cloud Architecture",
      description: "Hands-on AWS cloud engineering track covering core compute, storage, networking, serverless, and exam-ready architecture.",
      icon: "AWS",
      accentColor: "#ff3b1d",
      displayOrder: 4,
      isPublished: true,
      status: "coming_soon",
      badge: "Under Construction • Coming Soon",
      courseCount: 1,
    } as Track);
  }
  return base;
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

  const current = state.mentorshipSessions[index];

  // Prevent double refund if already refunded
  if (updates.status === "cancelled" && current.status !== "cancelled" && !current.isRefunded) {
    if (current.status !== "completed") {
      refundMentorshipSession(current.studentEmail);
      updates.isRefunded = true;
    }
  }

  // If marked completed, mark isConsumed if not already
  if (updates.status === "completed" && !current.isConsumed) {
    updates.isConsumed = true;
  }

  // Audit trail entry
  const auditTrail: MentorshipSessionAuditEntry[] = [...(current.auditTrail || [])];
  if (updates.status && updates.status !== current.status) {
    auditTrail.push({
      transition: `${current.status}->${updates.status}`,
      fromStatus: current.status,
      toStatus: updates.status,
      timestamp: new Date().toISOString(),
      actor: updates.status === "cancelled" ? "student" : updates.status === "completed" ? "instructor" : "system",
      details: {
        isRefunded: updates.isRefunded ?? current.isRefunded,
        isConsumed: updates.isConsumed ?? current.isConsumed,
      },
    });
  }

  const updated: MentorshipSessionItem = {
    ...current,
    ...updates,
    auditTrail,
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

  if (
    userTarget.includes("vaidya") ||
    userTarget.includes("weber") ||
    userTarget.includes("marcus") ||
    userTarget.includes("instructor")
  ) {
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

  // Check All-Access Entitlement
  if (hasActiveAllAccess(userTarget)) {
    const entitlements = getAllAccessEntitlements(userTarget);
    const active = entitlements.find((e) => e.status === "active");
    if (active) {
      const allowedCourses = active.includedCourseIds || [];
      if (allowedCourses.includes(courseSlug)) {
        return { hasAccess: true, isFreePreviewOnly: false, role: "student" };
      }
    }
  }

  // Check Quantum or Cyber Enrollment
  const enrollment = courseSlug.includes("cybersecurity")
    ? getCyberEnrollment(userTarget, courseSlug)
    : courseSlug.includes("quantum") || courseSlug.includes("btech")
    ? getQuantumEnrollment(userTarget, courseSlug)
    : null;
  if (enrollment && enrollment.status === "active") {
    return { hasAccess: true, isFreePreviewOnly: false, role: "student" };
  }

  return { hasAccess: false, isFreePreviewOnly: true, role: "student" };
}

// ----------------------------------------------------------------------------
// Phase Q3: Quantum Commercial Enrollment, Orders & Mentorship Entitlements
// ----------------------------------------------------------------------------

export function getQuantumEnrollment(
  userTarget: string,
  courseId = "quantum-computing-foundations"
): QuantumEnrollment | null {
  const state = loadState();
  const key = userTarget.toLowerCase();
  const now = new Date();

  // Find active enrollment
  const enr = state.enrollments.find(
    (e) =>
      e.userId.toLowerCase() === key &&
      e.courseId === courseId &&
      e.status === "active"
  );

  if (!enr) return null;

  // Check expiration
  if (enr.expiresAt && new Date(enr.expiresAt) < now) {
    enr.status = "expired";
    persistState();
    return null;
  }

  return enr;
}

export function getAllQuantumEnrollments(): QuantumEnrollment[] {
  const state = loadState();
  return [...state.enrollments];
}

export function createOrExtendQuantumEnrollment(params: {
  userId: string;
  courseId?: string;
  accessType: "free_preview" | "semester_pass" | "mentorship_pack" | "admin_granted";
  months?: number;
  durationDays?: number;
  expiresAt?: string;
  notes?: string;
}): QuantumEnrollment {
  const state = loadState();
  const courseId = params.courseId || "quantum-computing-foundations";
  const now = new Date();
  let expiresAt: string;
  if (params.expiresAt) {
    expiresAt = params.expiresAt;
  } else if (typeof params.durationDays === "number") {
    expiresAt = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000).toISOString();
  } else {
    const months = params.months || 6;
    expiresAt = new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  // Check if active enrollment exists
  const existing = state.enrollments.find(
    (e) =>
      e.userId.toLowerCase() === params.userId.toLowerCase() &&
      e.courseId === courseId &&
      e.status === "active"
  );

  if (existing) {
    existing.accessType = params.accessType;
    existing.expiresAt = expiresAt;
    existing.updatedAt = now.toISOString();
    persistState();
    return existing;
  }

  const newEnr: QuantumEnrollment = {
    id: `enr-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    courseId,
    trackId: "quantum-computing",
    accessType: params.accessType,
    status: "active",
    startsAt: now.toISOString(),
    expiresAt: params.accessType === "free_preview" ? undefined : expiresAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  state.enrollments.push(newEnr);
  persistState();
  return newEnr;
}

export function revokeQuantumEnrollment(enrollmentIdOrUserId: string): boolean {
  const state = loadState();
  const key = enrollmentIdOrUserId.toLowerCase();
  const enr = state.enrollments.find(
    (e) => e.id === enrollmentIdOrUserId || (e.userId.toLowerCase() === key && e.status === "active")
  );
  if (!enr) return false;
  enr.status = "revoked";
  enr.updatedAt = new Date().toISOString();
  persistState();
  return true;
}

export function getAllMentorshipPacksForUser(
  userId: string,
  courseId = "quantum-computing-foundations"
): MentorshipPack[] {
  const state = loadState();
  const key = userId.toLowerCase();
  return state.mentorshipPacks.filter((p) => {
    if (p.userId.toLowerCase() !== key) return false;
    if (p.courseId !== courseId && p.courseId !== "quantum-computing-foundations") return false;
    return true;
  });
}

// Mentorship packs
export function getQuantumMentorshipPacks(
  userId: string,
  courseId = "quantum-computing-foundations"
): MentorshipPack[] {
  const state = loadState();
  const key = userId.toLowerCase();
  const now = new Date();

  return state.mentorshipPacks.filter((p) => {
    if (p.userId.toLowerCase() !== key) return false;
    if (p.courseId !== courseId && p.courseId !== "quantum-computing-foundations") return false;
    // Check expiry
    if (p.status === "active" && p.expiresAt && new Date(p.expiresAt) < now) {
      p.status = "expired";
      persistState();
      return false;
    }
    return p.status === "active" && p.usedSessions < p.totalSessions;
  });
}

export function createMentorshipPack(params: {
  userId: string;
  courseId?: string;
  totalSessions?: number;
  validityDays?: number;
}): MentorshipPack {
  const state = loadState();
  const courseId = params.courseId || "quantum-computing-foundations";
  const now = new Date();
  const days = params.validityDays || 90;
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const pack: MentorshipPack = {
    id: `pack-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    courseId,
    packType: "single_session",
    totalSessions: params.totalSessions || 1,
    usedSessions: 0,
    status: "active",
    expiresAt,
    createdAt: now.toISOString(),
  };

  state.mentorshipPacks.push(pack);
  persistState();
  return pack;
}

export function consumeMentorshipSession(
  userId: string,
  courseId = "quantum-computing-foundations"
): { success: boolean; packId?: string; error?: string } {
  const state = loadState();
  const activePacks = getQuantumMentorshipPacks(userId, courseId);

  if (activePacks.length === 0) {
    const aaRes = consumeAllAccessMentorshipSession(userId);
    if (aaRes.success) {
      return { success: true, packId: aaRes.packId };
    }
    return { success: false, error: "No active mentorship sessions or packs available." };
  }

  const pack = activePacks[0];
  pack.usedSessions += 1;
  if (pack.usedSessions >= pack.totalSessions) {
    pack.status = "exhausted";
  }
  persistState();
  return { success: true, packId: pack.id };
}

export function refundMentorshipSession(
  userId: string,
  courseId = "quantum-computing-foundations"
): boolean {
  const state = loadState();
  const key = userId.toLowerCase();
  // Find a pack with usedSessions > 0 to refund
  const pack = state.mentorshipPacks.find(
    (p) =>
      p.userId.toLowerCase() === key &&
      (p.courseId === courseId || p.courseId === "quantum-computing-foundations") &&
      p.usedSessions > 0
  );

  if (!pack) return false;
  pack.usedSessions = Math.max(0, pack.usedSessions - 1);
  if (pack.status === "exhausted") {
    pack.status = "active";
  }
  persistState();
  return true;
}

// Early adopter counter
export function getEarlyAdopterCount(courseId = "quantum-computing-foundations"): number {
  const state = loadState();
  return state.earlyAdopterRedemptions.filter(
    (r) => r.courseId === courseId && r.status === "claimed"
  ).length;
}

export function claimEarlyAdopterSeat(
  userId: string,
  courseId = "quantum-computing-foundations",
  limit = 10
): { success: boolean; redemptionNumber?: number; seatNumber?: number; error?: string } {
  const state = loadState();
  const key = userId.toLowerCase();

  // Check if user already claimed
  const existing = state.earlyAdopterRedemptions.find(
    (r) => r.userId.toLowerCase() === key && r.courseId === courseId && r.status === "claimed"
  );
  if (existing) {
    return {
      success: false,
      error: "You have already claimed an Early Adopter 100% discount redemption.",
      redemptionNumber: existing.redemptionNumber,
    };
  }

  // Count active claims atomically
  const currentCount = getEarlyAdopterCount(courseId);
  if (currentCount >= limit) {
    return {
      success: false,
      error: `All ${limit} Early Adopter seats have been claimed. Please enroll via standard checkout.`,
    };
  }

  const redemptionNumber = currentCount + 1;
  const newClaim: EarlyAdopterRedemption = {
    id: `ea-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId,
    courseId,
    redemptionNumber,
    status: "claimed",
    createdAt: new Date().toISOString(),
  };

  state.earlyAdopterRedemptions.push(newClaim);

  // Automatically activate Semester Pass enrollment
  createOrExtendQuantumEnrollment({
    userId,
    courseId,
    accessType: "semester_pass",
    months: 6,
  });

  // Also include 1 mentorship session benefit
  createMentorshipPack({
    userId,
    courseId,
    totalSessions: 1,
    validityDays: 180,
  });

  persistState();
  return { success: true, redemptionNumber, seatNumber: redemptionNumber };
}

// Quantum Orders & Payments
export function createQuantumOrder(params: {
  userId: string;
  courseId?: string;
  productType: "semester_pass" | "mentorship_pack";
  razorpayOrderId: string;
  amountInPaise: number;
  metadata?: any;
}): QuantumOrder {
  const state = loadState();
  const now = new Date().toISOString();

  const order: QuantumOrder = {
    id: `ord-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    courseId: params.courseId || "quantum-computing-foundations",
    productType: params.productType,
    razorpayOrderId: params.razorpayOrderId,
    amountInPaise: params.amountInPaise,
    currency: "INR",
    status: "created",
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  state.orders.push(order);
  persistState();
  return order;
}

export function getQuantumOrderByRazorpayId(razorpayOrderId: string): QuantumOrder | null {
  const state = loadState();
  return state.orders.find((o) => o.razorpayOrderId === razorpayOrderId) || null;
}

export function updateQuantumOrderStatus(
  razorpayOrderId: string,
  status: "paid" | "failed" | "refunded",
  paymentDetails?: {
    razorpayPaymentId?: string;
    razorpaySignature?: string;
    amountInPaise?: number;
    verificationStatus?: "verified" | "failed";
  }
): boolean {
  const state = loadState();
  const order = state.orders.find((o) => o.razorpayOrderId === razorpayOrderId);
  if (!order) return false;

  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (paymentDetails?.razorpayPaymentId) {
    const existingPay = state.payments.find(
      (p) => p.razorpayPaymentId === paymentDetails.razorpayPaymentId
    );
    if (!existingPay) {
      const newPay: QuantumPayment = {
        id: `pay-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
        orderId: order.id,
        userId: order.userId,
        razorpayPaymentId: paymentDetails.razorpayPaymentId,
        razorpaySignature: paymentDetails.razorpaySignature,
        amountInPaise: paymentDetails.amountInPaise || order.amountInPaise,
        currency: "INR",
        status: status === "paid" ? "captured" : status === "refunded" ? "refunded" : "failed",
        verificationStatus: paymentDetails.verificationStatus || "verified",
        webhookStatus: "processed",
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      state.payments.push(newPay);
    }
  }

  // If paid, provision entitlements
  if (status === "paid") {
    if (order.productType === "semester_pass") {
      createOrExtendQuantumEnrollment({
        userId: order.userId,
        courseId: order.courseId,
        accessType: "semester_pass",
        months: 6,
      });
      // Semester pass also includes 1 mentorship session benefit
      createMentorshipPack({
        userId: order.userId,
        courseId: order.courseId,
        totalSessions: 1,
        validityDays: 180,
      });
    } else if (order.productType === "mentorship_pack") {
      createMentorshipPack({
        userId: order.userId,
        courseId: order.courseId,
        totalSessions: 1,
        validityDays: 90,
      });
    }
  }

  persistState();
  return true;
}

export function getAllQuantumOrders(): QuantumOrder[] {
  const state = loadState();
  return [...state.orders];
}

export function getAllQuantumPayments(): QuantumPayment[] {
  const state = loadState();
  return [...state.payments];
}

// ----------------------------------------------------------------------------
// Phase C0: Persistent Razorpay Webhook Idempotency
// ----------------------------------------------------------------------------
export function recordWebhookEventAtomic(event: {
  provider?: string;
  eventId: string;
  eventType: string;
  payload: any;
}): { isDuplicate: boolean; event: WebhookEventRecord } {
  const state = loadState();
  if (!state.webhookEvents) state.webhookEvents = [];

  const provider = event.provider || "razorpay";
  const existing = state.webhookEvents.find(
    (e) => e.provider === provider && e.eventId === event.eventId
  );

  if (existing) {
    existing.attempts = (existing.attempts || 1) + 1;
    persistState();
    return { isDuplicate: true, event: existing };
  }

  const record: WebhookEventRecord = {
    id: `wh_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
    provider,
    eventId: event.eventId,
    eventType: event.eventType,
    payload: event.payload,
    status: "processing",
    attempts: 1,
    receivedAt: new Date().toISOString(),
  };

  state.webhookEvents.push(record);
  persistState();
  return { isDuplicate: false, event: record };
}

export function updateWebhookEventStatus(
  eventId: string,
  status: "processed" | "failed" | "ignored",
  errorMessage?: string,
  provider = "razorpay"
): boolean {
  const state = loadState();
  if (!state.webhookEvents) return false;

  const found = state.webhookEvents.find(
    (e) => e.provider === provider && e.eventId === eventId
  );
  if (!found) return false;

  found.status = status;
  if (errorMessage) found.errorMessage = errorMessage;
  if (status === "processed") found.processedAt = new Date().toISOString();
  persistState();
  return true;
}

// ----------------------------------------------------------------------------
// Phase C0: Durable Rate Limit Store (Database / CMS fallback)
// ----------------------------------------------------------------------------
export function checkAndIncrementDurableRateLimit(params: {
  bucketKey: string;
  identifier: string;
  limit: number;
  windowSeconds: number;
}): { allowed: boolean; remaining: number; retryAfterSec?: number; count: number } {
  const state = loadState();
  if (!state.rateLimitEvents) state.rateLimitEvents = [];

  const now = Date.now();
  const windowMs = params.windowSeconds * 1000;
  const key = `${params.bucketKey}:${params.identifier}`;

  let record = state.rateLimitEvents.find(
    (r) => r.bucketKey === params.bucketKey && r.identifier === params.identifier
  );

  if (!record || now >= record.expiresAt) {
    // Reset window
    if (!record) {
      record = {
        id: `rl_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        bucketKey: params.bucketKey,
        identifier: params.identifier,
        count: 1,
        windowStart: now,
        expiresAt: now + windowMs,
        createdAt: new Date().toISOString(),
      };
      state.rateLimitEvents.push(record);
    } else {
      record.count = 1;
      record.windowStart = now;
      record.expiresAt = now + windowMs;
    }

    persistState();
    return {
      allowed: true,
      remaining: Math.max(0, params.limit - 1),
      count: 1,
    };
  }

  // Active window
  if (record.count >= params.limit) {
    const retryAfterSec = Math.max(1, Math.ceil((record.expiresAt - now) / 1000));
    return {
      allowed: false,
      remaining: 0,
      retryAfterSec,
      count: record.count,
    };
  }

  record.count += 1;
  persistState();

  return {
    allowed: true,
    remaining: Math.max(0, params.limit - record.count),
    count: record.count,
  };
}

// ----------------------------------------------------------------------------
// Phase C0: Reschedule Mentorship Session Correctly
// ----------------------------------------------------------------------------
export function rescheduleMentorshipSession(
  sessionId: string,
  newSlotId: string,
  actorIdentifier: string
): { success: boolean; session?: MentorshipSessionItem; error?: string } {
  const state = loadState();
  const index = state.mentorshipSessions.findIndex((s) => s.id === sessionId);
  if (index === -1) {
    return { success: false, error: "Mentorship session not found." };
  }

  const session = state.mentorshipSessions[index];
  const isAuthorized =
    session.studentEmail.toLowerCase() === actorIdentifier.toLowerCase() ||
    session.studentName.toLowerCase().includes(actorIdentifier.toLowerCase()) ||
    actorIdentifier === "admin";

  if (!isAuthorized) {
    return { success: false, error: "Unauthorized to reschedule this session." };
  }

  if (session.status === "completed") {
    return { success: false, error: "Cannot reschedule a completed session." };
  }

  if (session.status === "cancelled") {
    return { success: false, error: "Cannot reschedule a cancelled session." };
  }

  // Find target slot
  const newSlot = state.mentorshipSlots.find((s) => s.id === newSlotId);
  if (!newSlot) {
    return { success: false, error: "Target mentorship slot not found." };
  }

  if (newSlot.status !== "available") {
    return { success: false, error: "Target mentorship slot is not available." };
  }

  // Free previous slot if still marked booked/requested
  if (session.slotId) {
    const prevSlot = state.mentorshipSlots.find((s) => s.id === session.slotId);
    if (prevSlot && prevSlot.id !== newSlotId) {
      prevSlot.status = "available";
    }
  }

  // Reserve new slot
  newSlot.status = "booked";

  const auditTrail: MentorshipSessionAuditEntry[] = [...(session.auditTrail || [])];
  auditTrail.push({
    transition: "rescheduled",
    fromStatus: session.status,
    toStatus: "confirmed",
    timestamp: new Date().toISOString(),
    actor: actorIdentifier,
    details: {
      fromSlotId: session.slotId,
      toSlotId: newSlot.id,
      scheduledAt: newSlot.startAt,
    },
  });

  // Update session without refunding or re-consuming credits
  const updatedSession: MentorshipSessionItem = {
    ...session,
    rescheduledFromSlotId: session.slotId,
    slotId: newSlot.id,
    scheduledAt: newSlot.startAt,
    durationMinutes: newSlot.durationMinutes,
    status: "confirmed",
    lastRescheduledAt: new Date().toISOString(),
    auditTrail,
  };

  state.mentorshipSessions[index] = updatedSession;
  persistState();

  return { success: true, session: updatedSession };
}

// ==========================================
// CYBERSECURITY TRACK & LABS HELPERS
// ==========================================

export function getAllCyberLabs(publishedOnly = true): CyberLab[] {
  const state = loadState();
  const labs = state.cyberLabs || [];
  if (publishedOnly) {
    return labs.filter((l) => l.status === "published");
  }
  return labs;
}

export function getCyberLabBySlug(slug: string): CyberLab | undefined {
  const state = loadState();
  return (state.cyberLabs || []).find((l) => l.slug === slug);
}

export function getCyberLabById(id: string): CyberLab | undefined {
  const state = loadState();
  return (state.cyberLabs || []).find((l) => l.id === id);
}

export function recordLabAcceptance(
  userId: string,
  labId: string,
  policyVersion = "1.0",
  metadata: Record<string, any> = {}
): { success: boolean; acceptance: LabAcceptance } {
  const state = loadState();
  if (!state.labAcceptances) state.labAcceptances = [];

  const existingIndex = state.labAcceptances.findIndex(
    (a) => a.userId === userId && a.labId === labId && a.policyVersion === policyVersion
  );

  const acceptance: LabAcceptance = {
    id:
      existingIndex >= 0
        ? state.labAcceptances[existingIndex].id
        : `acc-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    userId,
    labId,
    policyVersion,
    acceptedAt: new Date().toISOString(),
    metadata,
  };

  if (existingIndex >= 0) {
    state.labAcceptances[existingIndex] = acceptance;
  } else {
    state.labAcceptances.push(acceptance);
  }

  persistState();
  return { success: true, acceptance };
}

export function hasUserAcceptedLabPolicy(
  userId: string | null | undefined,
  labId: string,
  policyVersion = "1.0"
): boolean {
  if (!userId) return false;
  const state = loadState();
  return (state.labAcceptances || []).some(
    (a) => a.userId === userId && a.labId === labId && a.policyVersion === policyVersion
  );
}

export function getUserCyberLabProgress(
  userId: string | null | undefined,
  labId: string
): CyberLabProgress | undefined {
  if (!userId) return undefined;
  const state = loadState();
  return (state.cyberLabProgress || []).find(
    (p) => p.userId === userId && p.labId === labId
  );
}

export function getAllUserCyberProgress(
  userId: string | null | undefined
): CyberLabProgress[] {
  if (!userId) return [];
  const state = loadState();
  return (state.cyberLabProgress || []).filter((p) => p.userId === userId);
}

export function submitCyberLabFlag(params: {
  userId: string;
  labSlug: string;
  taskId?: string;
  submittedFlag: string;
}): {
  success: boolean;
  isCorrect: boolean;
  pointsAwarded: number;
  message: string;
  attemptsCount: number;
} {
  const { userId, labSlug, taskId, submittedFlag } = params;
  const state = loadState();

  const lab = (state.cyberLabs || []).find((l) => l.slug === labSlug);
  if (!lab) {
    return {
      success: false,
      isCorrect: false,
      pointsAwarded: 0,
      message: "Lab not found.",
      attemptsCount: 0,
    };
  }

  const task = taskId ? lab.tasks.find((t) => t.id === taskId) : lab.tasks[0];

  if (!task) {
    return {
      success: false,
      isCorrect: false,
      pointsAwarded: 0,
      message: "Task not found.",
      attemptsCount: 0,
    };
  }

  if (!state.cyberLabAttempts) state.cyberLabAttempts = [];
  if (!state.cyberLabProgress) state.cyberLabProgress = [];

  const priorAttempts = state.cyberLabAttempts.filter(
    (a) => a.userId === userId && a.taskId === task.id
  );
  const attemptNumber = priorAttempts.length + 1;

  // Check if flag matches SHA-256
  const cleanFlag = submittedFlag.trim();
  const flagHash = crypto.createHash("sha256").update(cleanFlag).digest("hex");
  const isCorrect = flagHash.toLowerCase() === task.expectedFlagHash.toLowerCase();

  const pointsAwarded = isCorrect ? task.points : 0;

  const attempt: CyberLabAttempt = {
    id: `att-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
    labId: lab.id,
    taskId: task.id,
    userId,
    submittedFlag: cleanFlag,
    isCorrect,
    pointsAwarded,
    attemptNumber,
    createdAt: new Date().toISOString(),
  };
  state.cyberLabAttempts.push(attempt);

  // Update progress
  let progress = state.cyberLabProgress.find(
    (p) => p.userId === userId && p.labId === lab.id
  );

  const now = new Date().toISOString();
  if (!progress) {
    progress = {
      id: `prog-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      userId,
      labId: lab.id,
      status: isCorrect ? "completed" : "in_progress",
      tasksCompleted: isCorrect ? 1 : 0,
      totalTasks: lab.tasks.length,
      score: pointsAwarded,
      startedAt: now,
      completedAt: isCorrect ? now : undefined,
      lastAttemptAt: now,
    };
    state.cyberLabProgress.push(progress);
  } else {
    progress.lastAttemptAt = now;
    if (isCorrect && progress.status !== "completed") {
      progress.status = "completed";
      progress.tasksCompleted = lab.tasks.length;
      progress.score = task.points;
      progress.completedAt = now;
    } else if (!isCorrect && progress.status === "not_started") {
      progress.status = "in_progress";
    }
  }

  persistState();

  return {
    success: true,
    isCorrect,
    pointsAwarded,
    message: isCorrect
      ? "Success! Flag captured and verified."
      : "Incorrect flag. Re-check the evidence or inspect hint.",
    attemptsCount: attemptNumber,
  };
}

export function getAllCyberIncidentCases(publishedOnly = true): CyberIncidentCase[] {
  const state = loadState();
  const cases = state.cyberIncidentCases || [];
  if (publishedOnly) {
    return cases.filter((c) => c.status === "published");
  }
  return cases;
}

export function getCyberIncidentCaseBySlug(slug: string): CyberIncidentCase | undefined {
  const state = loadState();
  return (state.cyberIncidentCases || []).find((c) => c.slug === slug);
}

export function getCyberIncidentCaseById(id: string): CyberIncidentCase | undefined {
  const state = loadState();
  return (state.cyberIncidentCases || []).find((c) => c.id === id);
}

// ----------------------------------------------------------------------------
// Phase C2: CyberSecurity Commercial Enrollment, Orders & Mentorship Entitlements
// ----------------------------------------------------------------------------

export function getCyberEnrollment(
  userTarget: string,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): QuantumEnrollment | null {
  const state = loadState();
  const key = userTarget.toLowerCase();
  const now = new Date();

  // Find active enrollment
  const enr = state.enrollments.find(
    (e) =>
      e.userId.toLowerCase() === key &&
      e.courseId === courseId &&
      e.status === "active"
  );

  if (!enr) return null;

  // Check expiration
  if (enr.expiresAt && new Date(enr.expiresAt) < now) {
    enr.status = "expired";
    persistState();
    return null;
  }

  return enr;
}

export function getAllCyberEnrollments(): QuantumEnrollment[] {
  const state = loadState();
  return state.enrollments.filter(
    (e) =>
      e.courseId === "cybersecurity-foundations-ethical-hacking-soc-ctf" ||
      e.trackId === "cybersecurity"
  );
}

export function createOrExtendCyberEnrollment(params: {
  userId: string;
  courseId?: string;
  accessType: "free_preview" | "semester_pass" | "mentorship_pack" | "admin_granted";
  months?: number;
  durationDays?: number;
  expiresAt?: string;
  notes?: string;
}): QuantumEnrollment {
  const state = loadState();
  const courseId = params.courseId || "cybersecurity-foundations-ethical-hacking-soc-ctf";
  const now = new Date();
  let expiresAt: string;
  if (params.expiresAt) {
    expiresAt = params.expiresAt;
  } else if (typeof params.durationDays === "number") {
    expiresAt = new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000).toISOString();
  } else {
    const months = params.months || 6;
    expiresAt = new Date(now.getTime() + months * 30 * 24 * 60 * 60 * 1000).toISOString();
  }

  // Check if active enrollment exists
  const existing = state.enrollments.find(
    (e) =>
      e.userId.toLowerCase() === params.userId.toLowerCase() &&
      e.courseId === courseId &&
      e.status === "active"
  );

  if (existing) {
    existing.accessType = params.accessType;
    existing.expiresAt = expiresAt;
    existing.updatedAt = now.toISOString();
    persistState();
    return existing;
  }

  const newEnr: QuantumEnrollment = {
    id: `enr-cyb-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    courseId,
    trackId: "cybersecurity",
    accessType: params.accessType,
    status: "active",
    startsAt: now.toISOString(),
    expiresAt: params.accessType === "free_preview" ? undefined : expiresAt,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  state.enrollments.push(newEnr);
  persistState();
  return newEnr;
}

export function revokeCyberEnrollment(enrollmentIdOrUserId: string): boolean {
  const state = loadState();
  const key = enrollmentIdOrUserId.toLowerCase();
  const enr = state.enrollments.find(
    (e) =>
      (e.courseId === "cybersecurity-foundations-ethical-hacking-soc-ctf" || e.trackId === "cybersecurity") &&
      (e.id === enrollmentIdOrUserId || (e.userId.toLowerCase() === key && e.status === "active"))
  );
  if (!enr) return false;
  enr.status = "revoked";
  enr.updatedAt = new Date().toISOString();
  persistState();
  return true;
}

export function createCyberOrder(params: {
  userId: string;
  courseId: string;
  productType: "semester_pass" | "mentorship_pack";
  razorpayOrderId: string;
  amountInPaise: number;
  currency?: string;
  metadata?: Record<string, any>;
}): CyberOrder {
  const state = loadState();
  if (!state.cyberOrders) state.cyberOrders = [];

  const now = new Date().toISOString();
  const order: CyberOrder = {
    id: `ord-cyb-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    courseId: params.courseId,
    productType: params.productType,
    razorpayOrderId: params.razorpayOrderId,
    amountInPaise: params.amountInPaise,
    currency: params.currency || "INR",
    status: "created",
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  state.cyberOrders.push(order);
  persistState();
  return order;
}

export function getCyberOrderById(orderId: string): CyberOrder | null {
  const state = loadState();
  return (state.cyberOrders || []).find((o) => o.id === orderId) || null;
}

export function getCyberOrderByRazorpayId(rzpOrderId: string): CyberOrder | null {
  const state = loadState();
  return (state.cyberOrders || []).find((o) => o.razorpayOrderId === rzpOrderId) || null;
}

export function updateCyberOrderStatus(
  orderId: string,
  status: CyberOrder["status"],
  metadataOrPaymentDetails?: Record<string, any>
): boolean {
  const state = loadState();
  const order = (state.cyberOrders || []).find(
    (o) => o.id === orderId || o.razorpayOrderId === orderId
  );
  if (!order) return false;

  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (metadataOrPaymentDetails) {
    order.metadata = { ...(order.metadata || {}), ...metadataOrPaymentDetails };

    if (metadataOrPaymentDetails.razorpayPaymentId) {
      if (!state.cyberPayments) state.cyberPayments = [];
      const existingPay = state.cyberPayments.find(
        (p) => p.razorpayPaymentId === metadataOrPaymentDetails.razorpayPaymentId
      );
      if (!existingPay) {
        const newPay: CyberPayment = {
          id: `pay-cyb-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
          orderId: order.id,
          userId: order.userId,
          razorpayPaymentId: metadataOrPaymentDetails.razorpayPaymentId,
          razorpaySignature: metadataOrPaymentDetails.razorpaySignature,
          amountInPaise: metadataOrPaymentDetails.amountInPaise || order.amountInPaise,
          currency: "INR",
          status:
            status === "paid" ? "captured" : status === "refunded" ? "refunded" : "failed",
          verificationStatus: metadataOrPaymentDetails.verificationStatus || "verified",
          webhookStatus: "processed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.cyberPayments.push(newPay);
      }
    }
  }

  // Provision entitlements upon payment
  if (status === "paid") {
    if (order.productType === "semester_pass") {
      createOrExtendCyberEnrollment({
        userId: order.userId,
        courseId: order.courseId,
        accessType: "semester_pass",
        months: 6,
      });
      createCyberMentorshipPack({
        userId: order.userId,
        courseId: order.courseId,
        totalSessions: 1,
        durationDays: 180,
      });
    } else if (order.productType === "mentorship_pack") {
      createCyberMentorshipPack({
        userId: order.userId,
        courseId: order.courseId,
        totalSessions: 1,
        durationDays: 90,
      });
    }
  }

  persistState();
  return true;
}

export function recordCyberPayment(params: {
  orderId: string;
  userId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise: number;
  currency?: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  verificationStatus: "pending" | "verified" | "failed";
  webhookStatus?: "pending" | "received" | "processed" | "failed";
}): CyberPayment {
  const state = loadState();
  if (!state.cyberPayments) state.cyberPayments = [];

  const now = new Date().toISOString();
  const payment: CyberPayment = {
    id: `pay-cyb-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    orderId: params.orderId,
    userId: params.userId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    amountInPaise: params.amountInPaise,
    currency: params.currency || "INR",
    status: params.status,
    verificationStatus: params.verificationStatus,
    webhookStatus: params.webhookStatus || "pending",
    createdAt: now,
    updatedAt: now,
  };

  state.cyberPayments.push(payment);
  persistState();
  return payment;
}

export function getCyberPaymentsByOrderId(orderId: string): CyberPayment[] {
  const state = loadState();
  return (state.cyberPayments || []).filter((p) => p.orderId === orderId);
}

export function getAllCyberOrders(): CyberOrder[] {
  const state = loadState();
  return state.cyberOrders || [];
}

export function getAllCyberPayments(): CyberPayment[] {
  const state = loadState();
  return state.cyberPayments || [];
}

export function createCyberMentorshipPack(params: {
  userId: string;
  courseId?: string;
  packType?: string;
  totalSessions?: number;
  durationDays?: number;
}): CyberMentorshipPack {
  const state = loadState();
  if (!state.cyberMentorshipPacks) state.cyberMentorshipPacks = [];

  const now = new Date();
  const days = params.durationDays || 90;
  const expiresAt = new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString();

  const pack: CyberMentorshipPack = {
    id: `pack-cyb-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    courseId: params.courseId || "cybersecurity-foundations-ethical-hacking-soc-ctf",
    packType: params.packType || "single_session",
    totalSessions: params.totalSessions || 1,
    usedSessions: 0,
    status: "active",
    expiresAt,
    createdAt: now.toISOString(),
  };

  state.cyberMentorshipPacks.push(pack);
  persistState();
  return pack;
}

export function getCyberMentorshipPacks(
  userId: string,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): CyberMentorshipPack[] {
  const state = loadState();
  const key = userId.toLowerCase();
  const now = new Date();

  return (state.cyberMentorshipPacks || []).filter((p) => {
    if (p.userId.toLowerCase() !== key) return false;
    if (p.courseId !== courseId && p.courseId !== "cybersecurity-foundations-ethical-hacking-soc-ctf") return false;
    if (new Date(p.expiresAt) < now) {
      p.status = "expired";
      return false;
    }
    return p.status === "active" && p.usedSessions < p.totalSessions;
  });
}

export function consumeCyberMentorshipSession(
  userId: string,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  const state = loadState();
  const availablePacks = getCyberMentorshipPacks(userId, courseId);
  if (availablePacks.length === 0) {
    const aaRes = consumeAllAccessMentorshipSession(userId);
    return aaRes.success;
  }

  const pack = availablePacks[0];
  pack.usedSessions += 1;
  if (pack.usedSessions >= pack.totalSessions) {
    pack.status = "exhausted";
  }
  persistState();
  return true;
}

export function refundCyberMentorshipSession(
  userId: string,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  const state = loadState();
  const key = userId.toLowerCase();
  const pack = (state.cyberMentorshipPacks || []).find(
    (p) =>
      p.userId.toLowerCase() === key &&
      (p.courseId === courseId || p.courseId === "cybersecurity-foundations-ethical-hacking-soc-ctf") &&
      p.usedSessions > 0
  );
  if (!pack) return false;

  pack.usedSessions = Math.max(0, pack.usedSessions - 1);
  if (pack.status === "exhausted" && pack.usedSessions < pack.totalSessions) {
    pack.status = "active";
  }
  persistState();
  return true;
}

export function getCyberEarlyAdopterCount(courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"): number {
  const state = loadState();
  return (state.cyberEarlyAdopterRedemptions || []).filter(
    (r) =>
      (r.courseId === courseId || r.courseId === "cybersecurity-foundations-ethical-hacking-soc-ctf") &&
      r.status === "claimed"
  ).length;
}

export function getCyberEarlyAdopterRedemption(
  userId: string,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): CyberEarlyAdopterRedemption | null {
  const state = loadState();
  const key = userId.toLowerCase();
  return (
    (state.cyberEarlyAdopterRedemptions || []).find(
      (r) =>
        r.userId.toLowerCase() === key &&
        (r.courseId === courseId || r.courseId === "cybersecurity-foundations-ethical-hacking-soc-ctf") &&
        r.status === "claimed"
    ) || null
  );
}

export function getAllCyberEarlyAdopters(
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): CyberEarlyAdopterRedemption[] {
  const state = loadState();
  return (state.cyberEarlyAdopterRedemptions || []).filter(
    (r) => r.courseId === courseId || r.courseId === "cybersecurity-foundations-ethical-hacking-soc-ctf"
  );
}

export function claimCyberEarlyAdopterSeat(
  userId: string,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf",
  limit = 10
): { success: boolean; redemptionNumber?: number; seatNumber?: number; error?: string } {
  const state = loadState();
  if (!state.cyberEarlyAdopterRedemptions) state.cyberEarlyAdopterRedemptions = [];

  const existing = getCyberEarlyAdopterRedemption(userId, courseId);
  if (existing) {
    return {
      success: false,
      error: "You have already claimed an Early Adopter free seat for this CyberSecurity course.",
    };
  }

  const currentCount = getCyberEarlyAdopterCount(courseId);
  if (currentCount >= limit) {
    return {
      success: false,
      error: `All ${limit} Early Adopter seats have already been claimed.`,
    };
  }

  const redemptionNumber = currentCount + 1;
  const redemption: CyberEarlyAdopterRedemption = {
    id: `ea-cyb-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId,
    courseId,
    redemptionNumber,
    status: "claimed",
    createdAt: new Date().toISOString(),
  };

  state.cyberEarlyAdopterRedemptions.push(redemption);

  // Automatically activate 6-month Semester Pass
  createOrExtendCyberEnrollment({
    userId,
    courseId,
    accessType: "semester_pass",
    months: 6,
    notes: `Early Adopter Seat #${redemptionNumber}`,
  });

  persistState();

  return {
    success: true,
    redemptionNumber,
  };
}

export function getStudentCyberProgress(studentId: string): StudentCyberProgress {
  const state = loadState();
  if (!state.studentCyberProgress) state.studentCyberProgress = {};
  const key = studentId.toLowerCase();

  const labProgress = (state.cyberLabProgress || []).filter(
    (p) => p.userId.toLowerCase() === key && p.status === "completed"
  );
  const completedLabs = labProgress.map((p) => p.labId);

  const existing = state.studentCyberProgress[key];
  if (existing) {
    const mergedLabs = Array.from(new Set([...(existing.completedLabs || []), ...completedLabs]));
    existing.completedLabs = mergedLabs;
    const totalItems = 20 + 5 + 5;
    const completedItems =
      (existing.completedLessons?.length || 0) + mergedLabs.length + (existing.passedQuizzes?.length || 0);
    existing.completionPercentage = Math.min(100, Math.round((completedItems / totalItems) * 100));
    return existing;
  }

  const defaultProgress: StudentCyberProgress = {
    completedLessons: [],
    completedLabs,
    passedQuizzes: [],
    completionPercentage: Math.round((completedLabs.length / 30) * 100),
    certificateStatus: "not_eligible",
  };
  state.studentCyberProgress[key] = defaultProgress;
  return defaultProgress;
}

export function updateStudentCyberProgress(
  studentId: string,
  update: Partial<StudentCyberProgress>
): StudentCyberProgress {
  const state = loadState();
  if (!state.studentCyberProgress) state.studentCyberProgress = {};
  const key = studentId.toLowerCase();
  const current = getStudentCyberProgress(studentId);

  const updated: StudentCyberProgress = {
    ...current,
    ...update,
    completedLessons: Array.from(
      new Set([...(current.completedLessons || []), ...(update.completedLessons || [])])
    ),
    completedLabs: Array.from(
      new Set([...(current.completedLabs || []), ...(update.completedLabs || [])])
    ),
    passedQuizzes: Array.from(
      new Set([...(current.passedQuizzes || []), ...(update.passedQuizzes || [])])
    ),
  };

  const totalItems = 20 + 5 + 5;
  const completedCount =
    updated.completedLessons.length + updated.completedLabs.length + updated.passedQuizzes.length;
  updated.completionPercentage = Math.min(100, Math.round((completedCount / totalItems) * 100));

  if (
    updated.completedLessons.length >= 20 &&
    updated.completedLabs.length >= 5 &&
    updated.passedQuizzes.length >= 5 &&
    updated.certificateStatus !== "issued"
  ) {
    updated.certificateStatus = "eligible";
  }

  state.studentCyberProgress[key] = updated;
  persistState();
  return updated;
}

export function issueCyberCertificate(
  studentId: string,
  studentName: string,
  courseSlug = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): { success: boolean; certificate?: QuantumCertificate; error?: string } {
  const state = loadState();
  const key = studentId.toLowerCase();

  const enrollment = getCyberEnrollment(studentId, courseSlug);
  const isAdmin = key === "walavalkarridhesh@gmail.com" || key.includes("admin");
  if (!isAdmin && (!enrollment || enrollment.status !== "active")) {
    return {
      success: false,
      error: "Active CyberSecurity Semester Pass is required for certificate issuance.",
    };
  }

  const progress = getStudentCyberProgress(studentId);
  const isEligible =
    isAdmin ||
    (progress.completedLessons.length >= 20 &&
      progress.completedLabs.length >= 5 &&
      progress.passedQuizzes.length >= 5);

  if (!isEligible && !isAdmin) {
    return {
      success: false,
      error: `Eligibility criteria not met: ${progress.completedLessons.length}/20 lessons, ${progress.completedLabs.length}/5 labs, ${progress.passedQuizzes.length}/5 quizzes.`,
    };
  }

  const randomHex = crypto.randomBytes(3).toString("hex").toUpperCase();
  const code = `PMU-CYB-2026-${randomHex}`;
  const now = new Date().toISOString();

  const cert: QuantumCertificate = {
    code,
    studentTarget: studentId,
    studentName,
    courseSlug,
    courseTitle: "CyberSecurity Foundations: Ethical Hacking, SOC & CTF",
    instructorName: "Dr. Marcus Weber, PhD",
    issueDate: now,
    status: "issued",
    verificationUrl: `https://prepmeup.ai/prepmeup/verify-certificate/${code}`,
  };

  if (!state.certificates) state.certificates = [];
  state.certificates.push(cert);

  progress.certificateStatus = "issued";
  progress.certificateCode = code;
  if (!state.studentCyberProgress) state.studentCyberProgress = {};
  state.studentCyberProgress[key] = progress;

  persistState();

  return { success: true, certificate: cert };
}

// ============================================================================
// Phase C3: Unified Products, Orders, Payments, All-Access & Mentorship
// ============================================================================

export function getDefaultUnifiedProducts(): UnifiedProduct[] {
  return [
    {
      id: "prod-btech-sem-pass",
      slug: "btech-semester-pass",
      name: "B.Tech CSE AI/ML Semester Pass",
      description:
        "Full semester access to B.Tech Semester 1 coursework, syllabus notes, past papers, and diagnostic quizzes.",
      productType: "semester_pass",
      trackId: "btech-cse-aiml",
      courseIds: ["btech-cse-aiml-sem1"],
      priceInPaise: 9900,
      currency: "INR",
      durationDays: 180,
      isActive: true,
      isEarlyAdopterEligible: false,
      features: [
        "All 6 B.Tech Semester 1 Subjects (CSE1001-CSE1006)",
        "Verified Class Notes & Cheatsheets",
        "University Past Solved Papers",
        "Semester Assessment Quizzes",
      ],
    },
    {
      id: "prod-quantum-sem-pass",
      slug: "quantum-semester-pass",
      name: "Quantum Semester Pass",
      description:
        "Full access to Quantum Computing Foundations: 20 lessons, 5 hardware simulators, quizzes, AI tutor, and certificate.",
      productType: "semester_pass",
      trackId: "quantum-computing",
      courseIds: ["quantum-computing-foundations"],
      priceInPaise: 99900,
      currency: "INR",
      durationDays: 180,
      isActive: true,
      isEarlyAdopterEligible: false,
      features: [
        "All 20 Quantum Lessons across 5 structured modules",
        "All 5 Interactive NISQ Simulators & Bloch Sphere",
        "Unlimited Quantum AI Tutor with KaTeX equations",
        "Official Academic Certificate of Completion",
        "1 Included 1-on-1 Mentorship Session",
      ],
    },
    {
      id: "prod-cyber-sem-pass",
      slug: "cybersecurity-semester-pass",
      name: "CyberSecurity Semester Pass",
      description:
        "Comprehensive defensive security & SOC training: 20 lessons, 5 safe browser labs, CTF challenges, AI tutor, and certificate.",
      productType: "semester_pass",
      trackId: "cybersecurity",
      courseIds: ["cybersecurity-foundations-ethical-hacking-soc-ctf"],
      priceInPaise: 99900,
      currency: "INR",
      durationDays: 180,
      isActive: true,
      isEarlyAdopterEligible: false,
      features: [
        "All 20 CyberSecurity Defense Lessons across 5 modules",
        "All 5 Safe In-Browser Labs & SOC Simulators",
        "All 5 CTF Challenges with Secure Flag Validation",
        "Defensive Cyber AI Tutor with safety guardrails",
        "Official Academic Certificate of Completion",
        "1 Included 1-on-1 Mentorship Session",
      ],
    },
    {
      id: "prod-all-access-pass",
      slug: "prepmeup-all-access-pass",
      name: "PrepMeUp All-Access Semester Pass",
      description:
        "Unlocks the entire PrepMeUp AI platform: B.Tech CSE AI/ML + Quantum Computing + CyberSecurity Foundations for 6 months.",
      productType: "all_access_pass",
      trackId: undefined,
      courseIds: [
        "btech-cse-aiml-sem1",
        "quantum-computing-foundations",
        "cybersecurity-foundations-ethical-hacking-soc-ctf",
      ],
      priceInPaise: 149900,
      currency: "INR",
      durationDays: 180,
      isActive: true,
      isEarlyAdopterEligible: true,
      earlyAdopterLimit: 10,
      features: [
        "Full B.Tech CSE AI/ML Semester 1 curriculum (CSE1001-CSE1006)",
        "Complete Quantum Computing Foundations track + 5 NISQ simulators",
        "Complete CyberSecurity Foundations track + 5 in-browser labs & CTF",
        "Both Academic Certificates of Completion with public QR verification",
        "2 Complimentary 1-on-1 Mentorship Sessions included",
        "Unlimited Cross-Track AI Doubt Resolution & RAG",
      ],
    },
    {
      id: "prod-quantum-mentorship-pack",
      slug: "quantum-mentorship-pack",
      name: "Quantum 1-on-1 Mentorship Pack",
      description:
        "One dedicated 45-minute live private advisory session with Quantum Computing faculty.",
      productType: "mentorship_pack",
      trackId: "quantum-computing",
      courseIds: ["quantum-computing-foundations"],
      priceInPaise: 49900,
      currency: "INR",
      durationDays: 90,
      isActive: true,
      isEarlyAdopterEligible: false,
      features: [
        "45-Minute Private Session with Dr. Aravind Vaidya, PhD",
        "Qiskit Code Review & Quantum Circuit Optimization",
        "NISQ Research, Algorithms & Higher Studies Guidance",
        "90-Day Flexible Booking Validity",
      ],
    },
    {
      id: "prod-cyber-mentorship-pack",
      slug: "cybersecurity-mentorship-pack",
      name: "CyberSecurity 1-on-1 Mentorship Pack",
      description:
        "One dedicated 45-minute live private advisory session with certified SOC Security Leads.",
      productType: "mentorship_pack",
      trackId: "cybersecurity",
      courseIds: ["cybersecurity-foundations-ethical-hacking-soc-ctf"],
      priceInPaise: 49900,
      currency: "INR",
      durationDays: 90,
      isActive: true,
      isEarlyAdopterEligible: false,
      features: [
        "45-Minute Private Session with Senior SOC Lead",
        "Defensive Architecture & CTF Lab Walkthroughs",
        "SOC Analyst L1/L2 Interview Prep & Resume Review",
        "90-Day Flexible Booking Validity",
      ],
    },
    {
      id: "prod-all-access-mentorship-pack",
      slug: "all-access-mentorship-pack",
      name: "All-Access 1-on-1 Mentorship Pack",
      description:
        "One dedicated 45-minute flexible mentorship session valid across any enrolled subject or track.",
      productType: "mentorship_pack",
      trackId: undefined,
      courseIds: [
        "btech-cse-aiml-sem1",
        "quantum-computing-foundations",
        "cybersecurity-foundations-ethical-hacking-soc-ctf",
      ],
      priceInPaise: 89900,
      currency: "INR",
      durationDays: 90,
      isActive: true,
      isEarlyAdopterEligible: false,
      features: [
        "Flexible 45-Minute Session across B.Tech, Quantum, or CyberSecurity",
        "Comprehensive Engineering Portfolio & Resume Review",
        "Industry Advisory, Placement Coaching & Graduate School Guidance",
        "90-Day Flexible Booking Validity",
      ],
    },
  ];
}

export function getAllUnifiedProducts(activeOnly = true): UnifiedProduct[] {
  const state = loadState();
  const products = (state.unifiedProducts || getDefaultUnifiedProducts()).map((p) =>
    p.slug === "btech-sem1" || p.slug === "btech-semester-pass" ? { ...p, priceInPaise: 0 } : p
  );
  if (!products.some((p) => p.slug === "cloud-computing-aws")) {
    products.push({
      id: "prod-cloud-aws",
      slug: "cloud-computing-aws",
      name: "Cloud Computing (AWS) Pass",
      description: "Full access to Cloud Computing (AWS) modules, hands-on labs, quizzes, and certificate.",
      productType: "semester_pass",
      trackId: "cloud-computing-aws",
      courseIds: ["cloud-computing-aws"],
      priceInPaise: 99900,
      currency: "INR",
      durationDays: 180,
      isActive: true,
      isEarlyAdopterEligible: false,
      features: ["AWS Core & Architecture", "Hands-on Labs & Quizzes", "Certificate of Completion"],
    });
  }
  return activeOnly
    ? products.filter(
        (p) => p.isActive && !p.slug.startsWith("quantum-") && p.slug !== "cybersecurity-mentorship-pack"
      )
    : products;
}

export function getUnifiedProductBySlug(slug: string): UnifiedProduct | undefined {
  const products = getAllUnifiedProducts(false);
  return products.find((p) => p.slug === slug);
}

export function getUnifiedProductById(id: string): UnifiedProduct | undefined {
  const products = getAllUnifiedProducts(false);
  return products.find((p) => p.id === id);
}

export function createUnifiedOrder(params: {
  userId: string;
  productSlug: string;
  razorpayOrderId?: string;
  amountInPaise?: number;
  currency?: string;
  metadata?: Record<string, any>;
}): UnifiedOrder {
  const state = loadState();
  if (!state.unifiedOrders) state.unifiedOrders = [];

  const product = getUnifiedProductBySlug(params.productSlug);
  const productId = product ? product.id : params.productSlug;
  const now = new Date().toISOString();
  const rzpId =
    params.razorpayOrderId || `order_uni_${Date.now()}_${Math.random().toString(16).substring(2, 6)}`;

  const order: UnifiedOrder = {
    id: `uord-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    productId,
    productSlug: params.productSlug,
    razorpayOrderId: rzpId,
    amountInPaise:
      params.amountInPaise !== undefined
        ? params.amountInPaise
        : product
        ? product.priceInPaise
        : 0,
    currency: params.currency || "INR",
    status: "created",
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  state.unifiedOrders.push(order);
  persistState();
  return order;
}

export function getUnifiedOrderById(id: string): UnifiedOrder | null {
  const state = loadState();
  return (state.unifiedOrders || []).find((o) => o.id === id) || null;
}

export function getUnifiedOrderByRazorpayId(rzpOrderId: string): UnifiedOrder | null {
  const state = loadState();
  return (state.unifiedOrders || []).find((o) => o.razorpayOrderId === rzpOrderId) || null;
}

export function updateUnifiedOrderStatus(
  orderIdOrRzpId: string,
  status: UnifiedOrder["status"],
  metadataOrPaymentDetails?: Record<string, any>
): boolean {
  const state = loadState();
  const order = (state.unifiedOrders || []).find(
    (o) => o.id === orderIdOrRzpId || o.razorpayOrderId === orderIdOrRzpId
  );
  if (!order) return false;

  order.status = status;
  order.updatedAt = new Date().toISOString();

  if (metadataOrPaymentDetails) {
    order.metadata = { ...(order.metadata || {}), ...metadataOrPaymentDetails };

    if (metadataOrPaymentDetails.razorpayPaymentId) {
      if (!state.unifiedPayments) state.unifiedPayments = [];
      const existingPay = state.unifiedPayments.find(
        (p) => p.razorpayPaymentId === metadataOrPaymentDetails.razorpayPaymentId
      );
      if (!existingPay) {
        const newPay: UnifiedPayment = {
          id: `pay-uni-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
          orderId: order.id,
          userId: order.userId,
          razorpayPaymentId: metadataOrPaymentDetails.razorpayPaymentId,
          razorpaySignature: metadataOrPaymentDetails.razorpaySignature,
          amountInPaise: metadataOrPaymentDetails.amountInPaise || order.amountInPaise,
          currency: "INR",
          status:
            status === "paid" ? "captured" : status === "refunded" ? "refunded" : "failed",
          verificationStatus: metadataOrPaymentDetails.verificationStatus || "verified",
          webhookStatus: "processed",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        state.unifiedPayments.push(newPay);
      }
    }
  }

  // Provision entitlements upon payment
  if (status === "paid") {
    const slug = order.productSlug;

    if (slug === "btech-semester-pass") {
      // Provision B.Tech Semester pass
      createOrExtendQuantumEnrollment({
        userId: order.userId,
        courseId: "btech-cse-aiml-sem1",
        accessType: "semester_pass",
        months: 6,
      });
    } else if (slug === "quantum-semester-pass") {
      createOrExtendQuantumEnrollment({
        userId: order.userId,
        courseId: "quantum-computing-foundations",
        accessType: "semester_pass",
        months: 6,
      });
      createMentorshipPack({
        userId: order.userId,
        courseId: "quantum-computing-foundations",
        totalSessions: 1,
        validityDays: 180,
      });
    } else if (slug === "cybersecurity-semester-pass") {
      createOrExtendCyberEnrollment({
        userId: order.userId,
        courseId: "cybersecurity-foundations-ethical-hacking-soc-ctf",
        accessType: "semester_pass",
        months: 6,
      });
      createCyberMentorshipPack({
        userId: order.userId,
        courseId: "cybersecurity-foundations-ethical-hacking-soc-ctf",
        totalSessions: 1,
        durationDays: 180,
      });
    } else if (slug === "prepmeup-all-access-pass") {
      // 1. All-Access Entitlement
      createOrExtendAllAccessEntitlement({
        userId: order.userId,
        productSlug: "prepmeup-all-access-pass",
        durationDays: 180,
      });
      // 2. Quantum Access
      createOrExtendQuantumEnrollment({
        userId: order.userId,
        courseId: "quantum-computing-foundations",
        accessType: "semester_pass",
        months: 6,
      });
      // 3. CyberSecurity Access
      createOrExtendCyberEnrollment({
        userId: order.userId,
        courseId: "cybersecurity-foundations-ethical-hacking-soc-ctf",
        accessType: "semester_pass",
        months: 6,
      });
      // 4. B.Tech Semester 1 Access
      createOrExtendQuantumEnrollment({
        userId: order.userId,
        courseId: "btech-cse-aiml-sem1",
        accessType: "semester_pass",
        months: 6,
      });
      // 5. Included 2 complimentary mentorship sessions
      createAllAccessMentorshipPack({
        userId: order.userId,
        totalSessions: 2,
        durationDays: 180,
      });
    } else if (slug === "quantum-mentorship-pack") {
      createMentorshipPack({
        userId: order.userId,
        courseId: "quantum-computing-foundations",
        totalSessions: 1,
        validityDays: 90,
      });
    } else if (slug === "cybersecurity-mentorship-pack") {
      createCyberMentorshipPack({
        userId: order.userId,
        courseId: "cybersecurity-foundations-ethical-hacking-soc-ctf",
        totalSessions: 1,
        durationDays: 90,
      });
    } else if (slug === "all-access-mentorship-pack") {
      createAllAccessMentorshipPack({
        userId: order.userId,
        totalSessions: 1,
        durationDays: 90,
      });
    }
  }

  persistState();
  return true;
}

export function recordUnifiedPayment(params: {
  orderId: string;
  userId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise: number;
  currency?: string;
  status: "created" | "authorized" | "captured" | "failed" | "refunded";
  verificationStatus: "pending" | "verified" | "failed";
  webhookStatus?: "pending" | "received" | "processed" | "failed";
}): UnifiedPayment {
  const state = loadState();
  if (!state.unifiedPayments) state.unifiedPayments = [];

  const now = new Date().toISOString();
  const payment: UnifiedPayment = {
    id: `pay-uni-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    orderId: params.orderId,
    userId: params.userId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    amountInPaise: params.amountInPaise,
    currency: params.currency || "INR",
    status: params.status,
    verificationStatus: params.verificationStatus,
    webhookStatus: params.webhookStatus || "pending",
    createdAt: now,
    updatedAt: now,
  };

  state.unifiedPayments.push(payment);
  persistState();
  return payment;
}

export function getAllUnifiedOrders(): UnifiedOrder[] {
  const state = loadState();
  return state.unifiedOrders || [];
}

export function getAllUnifiedPayments(): UnifiedPayment[] {
  const state = loadState();
  return state.unifiedPayments || [];
}

// ----------------------------------------------------------------------------
// All-Access Entitlements
// ----------------------------------------------------------------------------

export function getAllAccessEntitlements(userId?: string): AllAccessEntitlement[] {
  const state = loadState();
  const list = state.allAccessEntitlements || [];
  if (!userId) return list;

  const key = userId.toLowerCase();
  const now = new Date();

  return list.filter((e) => {
    if (e.userId.toLowerCase() !== key) return false;
    if (new Date(e.expiresAt) < now && e.status === "active") {
      e.status = "expired";
    }
    return true;
  });
}

export function hasActiveAllAccess(userId: string | null | undefined): boolean {
  if (!userId) return false;
  const key = userId.toLowerCase();
  if (key === "walavalkarridhesh@gmail.com" || key === "admin" || key === "superadmin") return true;

  const entitlements = getAllAccessEntitlements(userId);
  const active = entitlements.find((e) => e.status === "active" && new Date(e.expiresAt) > new Date());
  return Boolean(active);
}

export function createOrExtendAllAccessEntitlement(params: {
  userId: string;
  productId?: string;
  productSlug?: string;
  durationDays?: number;
}): AllAccessEntitlement {
  const state = loadState();
  if (!state.allAccessEntitlements) state.allAccessEntitlements = [];

  const key = params.userId.toLowerCase();
  const duration = params.durationDays || 180;
  const now = new Date();
  const product = params.productSlug
    ? getUnifiedProductBySlug(params.productSlug)
    : getUnifiedProductBySlug("prepmeup-all-access-pass");

  const includedTracks = ["btech-cse-aiml", "quantum-computing", "cybersecurity"];
  const includedCourses = [
    "btech-cse-aiml-sem1",
    "quantum-computing-foundations",
    "cybersecurity-foundations-ethical-hacking-soc-ctf",
  ];

  const existing = state.allAccessEntitlements.find(
    (e) => e.userId.toLowerCase() === key && e.status === "active"
  );

  if (existing) {
    const curExp = new Date(existing.expiresAt);
    const base = curExp > now ? curExp : now;
    const newExp = new Date(base.getTime() + duration * 24 * 60 * 60 * 1000);
    existing.expiresAt = newExp.toISOString();
    existing.updatedAt = now.toISOString();
    persistState();
    return existing;
  }

  const expDate = new Date(now.getTime() + duration * 24 * 60 * 60 * 1000);
  const entitlement: AllAccessEntitlement = {
    id: `ent-all-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    productId: product ? product.id : "prod-all-access-pass",
    productSlug: params.productSlug || "prepmeup-all-access-pass",
    includedTrackIds: includedTracks,
    includedCourseIds: includedCourses,
    startsAt: now.toISOString(),
    expiresAt: expDate.toISOString(),
    status: "active",
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  state.allAccessEntitlements.push(entitlement);
  persistState();
  return entitlement;
}

export function revokeAllAccessEntitlement(entitlementIdOrUserId: string): boolean {
  const state = loadState();
  const key = entitlementIdOrUserId.toLowerCase();
  let found = false;

  for (const ent of state.allAccessEntitlements || []) {
    if (ent.id === entitlementIdOrUserId || ent.userId.toLowerCase() === key) {
      ent.status = "revoked";
      ent.updatedAt = new Date().toISOString();
      found = true;
    }
  }

  if (found) persistState();
  return found;
}

// ----------------------------------------------------------------------------
// All-Access Early Adopter Redemptions
// ----------------------------------------------------------------------------

export function getAllAccessEarlyAdopterCount(
  productSlug = "prepmeup-all-access-pass"
): number {
  const state = loadState();
  const list = state.allAccessEarlyAdopterRedemptions || [];
  return list.filter((r) => r.productSlug === productSlug && r.status === "claimed").length;
}

export function getAllAccessEarlyAdopterRedemption(
  userId: string,
  productSlug = "prepmeup-all-access-pass"
): AllAccessEarlyAdopterRedemption | undefined {
  const state = loadState();
  const key = userId.toLowerCase();
  return (state.allAccessEarlyAdopterRedemptions || []).find(
    (r) => r.userId.toLowerCase() === key && r.productSlug === productSlug && r.status === "claimed"
  );
}

export function getAllAccessEarlyAdopters(
  productSlug = "prepmeup-all-access-pass"
): AllAccessEarlyAdopterRedemption[] {
  const state = loadState();
  return (state.allAccessEarlyAdopterRedemptions || []).filter(
    (r) => r.productSlug === productSlug && r.status === "claimed"
  );
}

export function claimAllAccessEarlyAdopterSeat(
  userId: string,
  productSlug = "prepmeup-all-access-pass",
  limit = 10
): { success: boolean; redemptionNumber?: number; seatNumber?: number; error?: string } {
  const state = loadState();
  if (!state.allAccessEarlyAdopterRedemptions) state.allAccessEarlyAdopterRedemptions = [];

  const existing = getAllAccessEarlyAdopterRedemption(userId, productSlug);
  if (existing) {
    return {
      success: false,
      error: "You have already claimed an Early Adopter free seat for the All-Access Pass.",
    };
  }

  const currentCount = getAllAccessEarlyAdopterCount(productSlug);
  if (currentCount >= limit) {
    return {
      success: false,
      error: `All ${limit} Early Adopter seats have already been claimed.`,
    };
  }

  const redemptionNumber = currentCount + 1;
  const product = getUnifiedProductBySlug(productSlug);

  const redemption: AllAccessEarlyAdopterRedemption = {
    id: `red-all-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId,
    productId: product ? product.id : "prod-all-access-pass",
    productSlug,
    redemptionNumber,
    status: "claimed",
    createdAt: new Date().toISOString(),
  };

  state.allAccessEarlyAdopterRedemptions.push(redemption);

  // Automatically activate 6-month All-Access entitlement with scholarship
  createOrExtendAllAccessEntitlement({
    userId,
    productSlug,
    durationDays: 180,
  });

  // Provision Quantum, CyberSecurity, B.Tech enrollments & 2 complimentary sessions
  createOrExtendQuantumEnrollment({
    userId,
    courseId: "quantum-computing-foundations",
    accessType: "semester_pass",
    months: 6,
  });
  createOrExtendCyberEnrollment({
    userId,
    courseId: "cybersecurity-foundations-ethical-hacking-soc-ctf",
    accessType: "semester_pass",
    months: 6,
  });
  createOrExtendQuantumEnrollment({
    userId,
    courseId: "btech-cse-aiml-sem1",
    accessType: "semester_pass",
    months: 6,
  });
  createAllAccessMentorshipPack({
    userId,
    totalSessions: 2,
    durationDays: 180,
  });

  persistState();
  return { success: true, redemptionNumber, seatNumber: redemptionNumber };
}

// ----------------------------------------------------------------------------
// All-Access Mentorship Packs
// ----------------------------------------------------------------------------

export function createAllAccessMentorshipPack(params: {
  userId: string;
  totalSessions?: number;
  durationDays?: number;
}): MentorshipPack {
  const state = loadState();
  if (!state.mentorshipPacks) state.mentorshipPacks = [];

  const sessions = params.totalSessions || 1;
  const days = params.durationDays || 90;
  const expiresAt = new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();

  const pack: MentorshipPack = {
    id: `pack-all-${Date.now()}-${Math.random().toString(16).substring(2, 6)}`,
    userId: params.userId,
    courseId: "all-access",
    packType: "all_access_session",
    totalSessions: sessions,
    usedSessions: 0,
    status: "active",
    expiresAt,
    createdAt: new Date().toISOString(),
  };

  state.mentorshipPacks.push(pack);
  persistState();
  return pack;
}

export function getAllAccessMentorshipPacks(userId: string): MentorshipPack[] {
  const state = loadState();
  const key = userId.toLowerCase();
  const now = new Date();

  return (state.mentorshipPacks || []).filter((p) => {
    if (p.userId.toLowerCase() !== key) return false;
    if (p.courseId !== "all-access" && p.packType !== "all_access_session") return false;
    if (new Date(p.expiresAt) < now) {
      p.status = "expired";
      return false;
    }
    return p.status === "active" && p.usedSessions < p.totalSessions;
  });
}

export function consumeAllAccessMentorshipSession(userId: string): {
  success: boolean;
  packId?: string;
  error?: string;
} {
  const state = loadState();
  const available = getAllAccessMentorshipPacks(userId);
  if (available.length === 0) {
    return { success: false, error: "No active All-Access mentorship sessions available." };
  }

  const pack = available[0];
  pack.usedSessions += 1;
  if (pack.usedSessions >= pack.totalSessions) {
    pack.status = "exhausted";
  }
  persistState();
  return { success: true, packId: pack.id };
}

export function refundAllAccessMentorshipSession(userId: string): boolean {
  const state = loadState();
  const key = userId.toLowerCase();
  const pack = (state.mentorshipPacks || []).find(
    (p) =>
      p.userId.toLowerCase() === key &&
      (p.courseId === "all-access" || p.packType === "all_access_session") &&
      p.usedSessions > 0
  );
  if (!pack) return false;

  pack.usedSessions = Math.max(0, pack.usedSessions - 1);
  if (pack.status === "exhausted" && pack.usedSessions < pack.totalSessions) {
    pack.status = "active";
  }
  persistState();
  return true;
}

