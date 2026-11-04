import fs from "fs";
import path from "path";

/**
 * PrepMeUp AI — Phase C2 CyberSecurity commercial store.
 *
 * Mirrors the Phase Q3 Quantum commercial layer, but lives in its own persisted
 * namespace so the existing `/courses` and Quantum flows are never touched.
 *
 * Runtime persistence is a file-backed JSON store (same strategy as trackStore).
 * When the PrepMeUp Supabase project is configured, callers mirror the same
 * records into the `pmu_cyber_*` tables through the service-role client.
 */

export const CYBER_COURSE_SLUG = "cybersecurity-foundations";
export const CYBER_COURSE_ID = "c2222222-2222-4222-8222-222222222222";
export const CYBER_TRACK_SLUG = "cybersecurity";
export const CYBER_COURSE_TITLE = "CyberSecurity Foundations";
export const CYBER_INSTRUCTOR_NAME = "Meera Raghavan, CISSP";
export const CYBER_SEMESTER_MONTHS = 6;
export const CYBER_MENTORSHIP_PACK_VALIDITY_DAYS = 90;
export const CYBER_PASS_MENTORSHIP_VALIDITY_DAYS = 180;
export const CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS = 1;

export type CyberAccessType =
  | "free_preview"
  | "semester_pass"
  | "mentorship_pack"
  | "admin_granted";
export type CyberEnrollmentStatus = "active" | "expired" | "cancelled" | "revoked";
export type CyberProductType = "semester_pass" | "mentorship_pack";
export type CyberOrderStatus =
  | "created"
  | "pending"
  | "paid"
  | "failed"
  | "expired"
  | "refunded";
export type CyberPaymentStatus =
  | "created"
  | "authorized"
  | "captured"
  | "failed"
  | "refunded";
export type CyberVerificationStatus = "pending" | "verified" | "failed";
export type CyberWebhookStatus = "pending" | "received" | "processed" | "failed";
export type CyberPackStatus = "active" | "exhausted" | "expired" | "revoked";
export type CyberBookingStatus = "confirmed" | "completed" | "cancelled" | "rescheduled";

export interface CyberEnrollment {
  id: string;
  userId: string;
  courseId: string;
  accessType: CyberAccessType;
  status: CyberEnrollmentStatus;
  startsAt: string;
  expiresAt?: string;
  source?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CyberOrder {
  id: string;
  userId: string;
  courseId: string;
  productType: CyberProductType;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: "INR";
  status: CyberOrderStatus;
  metadata: Record<string, any>;
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
  currency: "INR";
  status: CyberPaymentStatus;
  verificationStatus: CyberVerificationStatus;
  webhookStatus: CyberWebhookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface CyberMentorshipPack {
  id: string;
  userId: string;
  courseId: string;
  packType: "single_session" | "semester_pass_included";
  totalSessions: number;
  usedSessions: number;
  status: CyberPackStatus;
  expiresAt: string;
  sourceOrderId?: string;
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

export interface CyberCertificate {
  code: string;
  userId: string;
  studentName: string;
  courseSlug: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  status: "issued" | "revoked";
  pdfPath?: string;
  verificationUrl: string;
}

export interface CyberProgress {
  completedLessons: string[];
  completedLabs: string[];
  completedCtfChallenges: string[];
  passedQuizzes: string[];
  finalAssessmentPassed: boolean;
  updatedAt: string;
}

export interface CyberMentorshipBooking {
  id: string;
  userId: string;
  courseId: string;
  slotId: string;
  instructorName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: CyberBookingStatus;
  entitlementPackId?: string;
  entitlementSource?: "semester_pass" | "mentorship_pack";
  isConsumed: boolean;
  isRefunded: boolean;
  rescheduledFromSlotId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CyberWebhookEventRecord {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  status: "received" | "processing" | "processed" | "failed" | "ignored";
  payload: any;
  attempts: number;
  createdAt: string;
}

// ---------------------------------------------------------------------------
// Declarative CyberSecurity Foundations curriculum manifest
// (defensive content metadata only — no offensive tooling)
// ---------------------------------------------------------------------------
export interface CyberModuleMeta {
  moduleNumber: number;
  title: string;
  description: string;
}

export interface CyberLessonMeta {
  id: string;
  moduleNumber: number;
  lessonNumber: number;
  title: string;
  duration: string;
  isFreePreview: boolean;
}

export interface CyberLabMeta {
  id: string;
  moduleNumber: number;
  title: string;
  labType: "browser_lab" | "incident_investigation";
  isFreePreview: boolean;
}

export interface CyberCtfMeta {
  id: string;
  moduleNumber: number;
  title: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

export interface CyberQuizMeta {
  id: string;
  moduleNumber: number;
  title: string;
  isFreePreview: boolean;
  passingScore: number;
}

export const CYBER_MODULES: CyberModuleMeta[] = [
  {
    moduleNumber: 1,
    title: "Security Fundamentals & Threat Models",
    description:
      "CIA triad, authentication vs authorization, attack surfaces, and defensive threat modelling for modern web applications.",
  },
  {
    moduleNumber: 2,
    title: "Web Application Defence",
    description:
      "Input validation, output encoding, session hardening, secure headers, and OWASP-aligned defensive controls.",
  },
  {
    moduleNumber: 3,
    title: "Network & Cloud Security Operations",
    description:
      "TLS inspection, secure cloud identity, least-privilege design, and log-driven detection engineering.",
  },
  {
    moduleNumber: 4,
    title: "Incident Response & Forensics",
    description:
      "Triage playbooks, evidence handling, containment, post-incident review, and defensive reporting.",
  },
];

export const CYBER_LESSONS: CyberLessonMeta[] = [
  { id: "cyb-l1-01", moduleNumber: 1, lessonNumber: 1, title: "The CIA Triad & Defensive Mindset", duration: "18 min", isFreePreview: true },
  { id: "cyb-l1-02", moduleNumber: 1, lessonNumber: 2, title: "Threat Modelling with STRIDE", duration: "22 min", isFreePreview: false },
  { id: "cyb-l2-01", moduleNumber: 2, lessonNumber: 1, title: "Injection Defences: Prepared Statements & Encoding", duration: "24 min", isFreePreview: false },
  { id: "cyb-l2-02", moduleNumber: 2, lessonNumber: 2, title: "Session Hardening & Secure Cookies", duration: "20 min", isFreePreview: false },
  { id: "cyb-l3-01", moduleNumber: 3, lessonNumber: 1, title: "TLS, Certificate Pinning & Secure Transport", duration: "21 min", isFreePreview: false },
  { id: "cyb-l3-02", moduleNumber: 3, lessonNumber: 2, title: "Cloud IAM Least Privilege", duration: "23 min", isFreePreview: false },
  { id: "cyb-l4-01", moduleNumber: 4, lessonNumber: 1, title: "Incident Response Lifecycle", duration: "19 min", isFreePreview: false },
  { id: "cyb-l4-02", moduleNumber: 4, lessonNumber: 2, title: "Evidence Handling & Chain of Custody", duration: "17 min", isFreePreview: false },
];

export const CYBER_LABS: CyberLabMeta[] = [
  { id: "cyb-lab-01", moduleNumber: 1, title: "Incident Investigation: Phishing Triage Report", labType: "incident_investigation", isFreePreview: true },
  { id: "cyb-lab-02", moduleNumber: 2, title: "Browser Lab: Secure HTTP Header Audit", labType: "browser_lab", isFreePreview: false },
  { id: "cyb-lab-03", moduleNumber: 3, title: "Browser Lab: Cloud IAM Policy Review", labType: "browser_lab", isFreePreview: false },
  { id: "cyb-lab-04", moduleNumber: 4, title: "Incident Investigation: Ransomware Tabletop", labType: "incident_investigation", isFreePreview: false },
];

export const CYBER_CTF_CHALLENGES: CyberCtfMeta[] = [
  { id: "cyb-ctf-01", moduleNumber: 2, title: "Encode the Output", difficulty: "beginner" },
  { id: "cyb-ctf-02", moduleNumber: 2, title: "Session Flag Audit", difficulty: "beginner" },
  { id: "cyb-ctf-03", moduleNumber: 3, title: "Certificate Chain Detective", difficulty: "intermediate" },
  { id: "cyb-ctf-04", moduleNumber: 4, title: "Log Correlation Puzzle", difficulty: "intermediate" },
];

export const CYBER_QUIZZES: CyberQuizMeta[] = [
  { id: "cyb-quiz-01", moduleNumber: 1, title: "Module 1: Security Fundamentals", isFreePreview: true, passingScore: 60 },
  { id: "cyb-quiz-02", moduleNumber: 2, title: "Module 2: Web Application Defence", isFreePreview: false, passingScore: 60 },
  { id: "cyb-quiz-03", moduleNumber: 3, title: "Module 3: Network & Cloud Security", isFreePreview: false, passingScore: 60 },
  { id: "cyb-quiz-04", moduleNumber: 4, title: "Module 4: Incident Response", isFreePreview: false, passingScore: 60 },
];

export const CYBER_FINAL_ASSESSMENT = {
  id: "cyb-final-assessment",
  title: "CyberSecurity Foundations Final Assessment",
  required: true,
  passingScore: 70,
};

// ---------------------------------------------------------------------------
// Pricing configuration (server-authoritative)
// ---------------------------------------------------------------------------
export function getCyberSemesterPassPriceInPaise(): number {
  const configured = Number(process.env.CYBER_SEMESTER_PASS_PRICE_IN_PAISE);
  return Number.isFinite(configured) && configured > 0 ? configured : 99900;
}

export function getCyberMentorshipPackPriceInPaise(): number {
  const configured = Number(process.env.CYBER_MENTORSHIP_PACK_PRICE_IN_PAISE);
  return Number.isFinite(configured) && configured > 0 ? configured : 49900;
}

export function getCyberEarlyAdopterLimit(): number {
  const configured = Number(process.env.CYBER_EARLY_ADOPTER_LIMIT);
  return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : 10;
}

export function getCyberProductPriceInPaise(productType: CyberProductType): number {
  return productType === "mentorship_pack"
    ? getCyberMentorshipPackPriceInPaise()
    : getCyberSemesterPassPriceInPaise();
}

// ---------------------------------------------------------------------------
// Persisted state
// ---------------------------------------------------------------------------
interface CyberStoreState {
  enrollments: CyberEnrollment[];
  orders: CyberOrder[];
  payments: CyberPayment[];
  mentorshipPacks: CyberMentorshipPack[];
  earlyAdopterRedemptions: CyberEarlyAdopterRedemption[];
  certificates: CyberCertificate[];
  progress: Record<string, CyberProgress>;
  bookings: CyberMentorshipBooking[];
  webhookEvents: CyberWebhookEventRecord[];
}

let cachedCyberState: CyberStoreState | null = null;

function getCyberDataFilePath(): string {
  return path.join(process.cwd(), "deploy", "cms", "cyber_track_data.json");
}

function freshState(): CyberStoreState {
  return {
    enrollments: [],
    orders: [],
    payments: [],
    mentorshipPacks: [],
    earlyAdopterRedemptions: [],
    certificates: [],
    progress: {},
    bookings: [],
    webhookEvents: [],
  };
}

export function loadCyberState(): CyberStoreState {
  if (cachedCyberState) return cachedCyberState;

  try {
    const filePath = getCyberDataFilePath();
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Partial<CyberStoreState>;
      const base = freshState();
      cachedCyberState = {
        enrollments: Array.isArray(parsed.enrollments) ? parsed.enrollments : base.enrollments,
        orders: Array.isArray(parsed.orders) ? parsed.orders : base.orders,
        payments: Array.isArray(parsed.payments) ? parsed.payments : base.payments,
        mentorshipPacks: Array.isArray(parsed.mentorshipPacks)
          ? parsed.mentorshipPacks
          : base.mentorshipPacks,
        earlyAdopterRedemptions: Array.isArray(parsed.earlyAdopterRedemptions)
          ? parsed.earlyAdopterRedemptions
          : base.earlyAdopterRedemptions,
        certificates: Array.isArray(parsed.certificates) ? parsed.certificates : base.certificates,
        progress:
          parsed.progress && typeof parsed.progress === "object" ? parsed.progress : base.progress,
        bookings: Array.isArray(parsed.bookings) ? parsed.bookings : base.bookings,
        webhookEvents: Array.isArray(parsed.webhookEvents)
          ? parsed.webhookEvents
          : base.webhookEvents,
      };
      return cachedCyberState;
    }
  } catch (err) {
    console.error("[CyberStore] Error loading CyberSecurity data:", err);
  }

  cachedCyberState = freshState();
  return cachedCyberState;
}

export function persistCyberState() {
  if (!cachedCyberState) return;
  try {
    const filePath = getCyberDataFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(cachedCyberState, null, 2), "utf-8");
    fs.renameSync(tempPath, filePath);
  } catch (err) {
    console.error("[CyberStore] Persist error:", err);
  }
}

function normalizeId(value: string): string {
  return (value || "").trim().toLowerCase();
}

function isSameCourse(courseId: string | undefined, expected?: string): boolean {
  if (!courseId) return true;
  return (
    courseId === CYBER_COURSE_SLUG ||
    courseId === CYBER_COURSE_ID ||
    !expected ||
    courseId === expected
  );
}

function addMonths(from: Date, months: number): Date {
  const next = new Date(from.getTime());
  next.setMonth(next.getMonth() + months);
  return next;
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
}

// ---------------------------------------------------------------------------
// Enrollments
// ---------------------------------------------------------------------------
export function getCyberEnrollment(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): CyberEnrollment | null {
  if (!userId) return null;
  const state = loadCyberState();
  const key = normalizeId(userId);
  const now = new Date();

  const enrollment = state.enrollments.find(
    (e) =>
      normalizeId(e.userId) === key &&
      isSameCourse(e.courseId, courseId) &&
      e.status === "active" &&
      e.accessType !== "free_preview"
  );

  if (!enrollment) return null;

  if (enrollment.expiresAt && new Date(enrollment.expiresAt) < now) {
    enrollment.status = "expired";
    enrollment.updatedAt = nowIso();
    persistCyberState();
    return null;
  }

  return enrollment;
}

export function getAllCyberEnrollments(): CyberEnrollment[] {
  return [...loadCyberState().enrollments].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
}

export function getCyberEnrollmentsForUser(userId: string): CyberEnrollment[] {
  const key = normalizeId(userId);
  return loadCyberState().enrollments.filter((e) => normalizeId(e.userId) === key);
}

export function grantCyberEnrollment(params: {
  userId: string;
  courseId?: string;
  accessType: Exclude<CyberAccessType, "free_preview">;
  months?: number;
  durationDays?: number;
  expiresAt?: string;
  source?: string;
}): CyberEnrollment {
  const state = loadCyberState();
  const courseId = params.courseId || CYBER_COURSE_SLUG;
  const now = new Date();
  const expiresAt = params.expiresAt
    ? params.expiresAt
    : params.durationDays
    ? new Date(now.getTime() + params.durationDays * 24 * 60 * 60 * 1000).toISOString()
    : addMonths(now, params.months || CYBER_SEMESTER_MONTHS).toISOString();

  const existing = state.enrollments.find(
    (e) =>
      normalizeId(e.userId) === normalizeId(params.userId) &&
      isSameCourse(e.courseId, courseId) &&
      e.status === "active" &&
      e.accessType !== "free_preview"
  );

  if (existing) {
    // Never downgrade an admin grant to a paid label; always extend the horizon.
    if (existing.accessType !== "admin_granted" || params.accessType !== "semester_pass") {
      existing.accessType = params.accessType;
    }
    const currentExpiry = existing.expiresAt ? new Date(existing.expiresAt) : now;
    const nextExpiry = new Date(expiresAt);
    existing.expiresAt =
      currentExpiry.getTime() > nextExpiry.getTime() ? currentExpiry.toISOString() : expiresAt;
    existing.source = params.source || existing.source;
    existing.updatedAt = now.toISOString();
    persistCyberState();
    return existing;
  }

  const enrollment: CyberEnrollment = {
    id: makeId("cyb-enr"),
    userId: params.userId,
    courseId,
    accessType: params.accessType,
    status: "active",
    startsAt: now.toISOString(),
    expiresAt,
    source: params.source,
    createdAt: now.toISOString(),
    updatedAt: now.toISOString(),
  };

  state.enrollments.push(enrollment);
  persistCyberState();
  return enrollment;
}

export function revokeCyberEnrollment(enrollmentIdOrUserId: string): boolean {
  const state = loadCyberState();
  const raw = (enrollmentIdOrUserId || "").trim();
  const key = normalizeId(raw);

  const enrollment =
    state.enrollments.find((e) => e.id === raw) ||
    state.enrollments.find(
      (e) => normalizeId(e.userId) === key && e.status === "active" && e.accessType !== "free_preview"
    );

  if (!enrollment) return false;
  enrollment.status = "revoked";
  enrollment.updatedAt = nowIso();
  persistCyberState();
  return true;
}

// ---------------------------------------------------------------------------
// Mentorship packs & credits
// ---------------------------------------------------------------------------
export function getAllCyberMentorshipPacks(): CyberMentorshipPack[] {
  return [...loadCyberState().mentorshipPacks].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt)
  );
}

export function getCyberMentorshipPacks(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): CyberMentorshipPack[] {
  if (!userId) return [];
  const state = loadCyberState();
  const key = normalizeId(userId);
  const now = new Date();
  let mutated = false;

  const usable = state.mentorshipPacks.filter((pack) => {
    if (normalizeId(pack.userId) !== key) return false;
    if (!isSameCourse(pack.courseId, courseId)) return false;

    if (pack.status === "active" && pack.expiresAt && new Date(pack.expiresAt) < now) {
      pack.status = "expired";
      mutated = true;
      return false;
    }
    return pack.status === "active" && pack.usedSessions < pack.totalSessions;
  });

  if (mutated) persistCyberState();
  return usable.sort((a, b) => a.expiresAt.localeCompare(b.expiresAt));
}

export function createCyberMentorshipPack(params: {
  userId: string;
  courseId?: string;
  totalSessions?: number;
  validityDays?: number;
  packType?: CyberMentorshipPack["packType"];
  sourceOrderId?: string;
}): CyberMentorshipPack {
  const state = loadCyberState();
  const now = new Date();
  const days = params.validityDays || CYBER_MENTORSHIP_PACK_VALIDITY_DAYS;

  const pack: CyberMentorshipPack = {
    id: makeId("cyb-pack"),
    userId: params.userId,
    courseId: params.courseId || CYBER_COURSE_SLUG,
    packType: params.packType || "single_session",
    totalSessions: Math.max(1, params.totalSessions || 1),
    usedSessions: 0,
    status: "active",
    expiresAt: new Date(now.getTime() + days * 24 * 60 * 60 * 1000).toISOString(),
    sourceOrderId: params.sourceOrderId,
    createdAt: now.toISOString(),
  };

  state.mentorshipPacks.push(pack);
  persistCyberState();
  return pack;
}

export function getCyberAvailableMentorshipSessions(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): number {
  return getCyberMentorshipPacks(userId, courseId).reduce(
    (sum, pack) => sum + Math.max(0, pack.totalSessions - pack.usedSessions),
    0
  );
}

export function getCyberIncludedPassMentorshipSessions(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): number {
  return getCyberMentorshipPacks(userId, courseId)
    .filter((pack) => pack.packType === "semester_pass_included")
    .reduce((sum, pack) => sum + Math.max(0, pack.totalSessions - pack.usedSessions), 0);
}

/**
 * Consumes one mentorship credit from the soonest-expiring usable pack.
 * Called exactly once when a booking is confirmed.
 */
export function consumeCyberMentorshipCredit(
  userId: string,
  courseId = CYBER_COURSE_SLUG
): { success: boolean; packId?: string; source?: "semester_pass" | "mentorship_pack"; error?: string } {
  const packs = getCyberMentorshipPacks(userId, courseId);
  const pack =
    packs.find((p) => p.packType === "semester_pass_included") ||
    packs.find((p) => p.packType === "single_session");

  if (!pack) {
    return { success: false, error: "No unused CyberSecurity mentorship entitlement available." };
  }

  pack.usedSessions += 1;
  if (pack.usedSessions >= pack.totalSessions) {
    pack.status = "exhausted";
  }
  persistCyberState();

  return {
    success: true,
    packId: pack.id,
    source: pack.packType === "semester_pass_included" ? "semester_pass" : "mentorship_pack",
  };
}

/**
 * Refunds exactly one credit back to the pack that funded the booking.
 * Callers must guard against double refunds using the booking's `isRefunded` flag.
 */
export function refundCyberMentorshipCredit(packId: string): boolean {
  const state = loadCyberState();
  const pack = state.mentorshipPacks.find((p) => p.id === packId);
  if (!pack) return false;

  if (pack.usedSessions <= 0) return false;
  pack.usedSessions = Math.max(0, pack.usedSessions - 1);
  if (pack.status === "exhausted" && pack.usedSessions < pack.totalSessions) {
    pack.status = "active";
  }
  if (pack.status === "expired" && new Date(pack.expiresAt) > new Date()) {
    pack.status = "active";
  }
  persistCyberState();
  return true;
}

// ---------------------------------------------------------------------------
// Early adopter atomic redemption counter
// ---------------------------------------------------------------------------
export function getCyberEarlyAdopterCount(courseId = CYBER_COURSE_SLUG): number {
  return loadCyberState().earlyAdopterRedemptions.filter(
    (r) => isSameCourse(r.courseId, courseId) && r.status === "claimed"
  ).length;
}

export function getCyberEarlyAdopterRedemption(
  userId: string,
  courseId = CYBER_COURSE_SLUG
): CyberEarlyAdopterRedemption | null {
  const key = normalizeId(userId);
  return (
    loadCyberState().earlyAdopterRedemptions.find(
      (r) =>
        normalizeId(r.userId) === key &&
        isSameCourse(r.courseId, courseId) &&
        r.status === "claimed"
    ) || null
  );
}

export function getAllCyberEarlyAdopterRedemptions(): CyberEarlyAdopterRedemption[] {
  return [...loadCyberState().earlyAdopterRedemptions].sort(
    (a, b) => a.redemptionNumber - b.redemptionNumber
  );
}

/**
 * Atomic-in-process claim. The read-count/write-claim happens inside a single
 * synchronous call so concurrent requests in the same process cannot both take
 * the last seat. The durable cross-instance guarantee is the
 * `pmu_claim_cyber_early_adopter` Postgres function in the Phase C2 migration.
 */
export function claimCyberEarlyAdopterSeat(
  userId: string,
  courseId = CYBER_COURSE_SLUG,
  limit = getCyberEarlyAdopterLimit(),
  forcedRedemptionNumber?: number
): {
  success: boolean;
  alreadyClaimed?: boolean;
  exhausted?: boolean;
  redemptionNumber?: number;
  error?: string;
} {
  const existing = getCyberEarlyAdopterRedemption(userId, courseId);
  if (existing) {
    return {
      success: true,
      alreadyClaimed: true,
      redemptionNumber: existing.redemptionNumber,
    };
  }

  const state = loadCyberState();
  const claimed = state.earlyAdopterRedemptions.filter(
    (r) => isSameCourse(r.courseId, courseId) && r.status === "claimed"
  );
  if (claimed.length >= limit) {
    return {
      success: false,
      exhausted: true,
      error: `All ${limit} Early Adopter seats have been claimed.`,
    };
  }

  const redemptionNumber =
    forcedRedemptionNumber && forcedRedemptionNumber > 0
      ? forcedRedemptionNumber
      : claimed.reduce((max, r) => Math.max(max, r.redemptionNumber), 0) + 1;

  state.earlyAdopterRedemptions.push({
    id: makeId("cyb-ea"),
    userId,
    courseId,
    redemptionNumber,
    status: "claimed",
    createdAt: nowIso(),
  });
  persistCyberState();

  return { success: true, redemptionNumber };
}

// ---------------------------------------------------------------------------
// Orders, payments & entitlement provisioning
// ---------------------------------------------------------------------------
export function createCyberOrder(params: {
  userId: string;
  courseId?: string;
  productType: CyberProductType;
  razorpayOrderId: string;
  amountInPaise: number;
  metadata?: Record<string, any>;
}): CyberOrder {
  const state = loadCyberState();
  const now = nowIso();

  const order: CyberOrder = {
    id: makeId("cyb-ord"),
    userId: params.userId,
    courseId: params.courseId || CYBER_COURSE_SLUG,
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
  persistCyberState();
  return order;
}

export function getAllCyberOrders(): CyberOrder[] {
  return [...loadCyberState().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCyberOrdersForUser(userId: string): CyberOrder[] {
  const key = normalizeId(userId);
  return loadCyberState().orders.filter((o) => normalizeId(o.userId) === key);
}

export function getCyberOrderByRazorpayId(razorpayOrderId: string): CyberOrder | null {
  return (
    loadCyberState().orders.find((o) => o.razorpayOrderId === razorpayOrderId) || null
  );
}

export function getAllCyberPayments(): CyberPayment[] {
  return [...loadCyberState().payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getCyberPaymentsForUser(userId: string): CyberPayment[] {
  const key = normalizeId(userId);
  return loadCyberState().payments.filter((p) => normalizeId(p.userId) === key);
}

export function upsertCyberPayment(params: {
  order: CyberOrder;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise?: number;
  status: CyberPaymentStatus;
  verificationStatus: CyberVerificationStatus;
  webhookStatus?: CyberWebhookStatus;
}): CyberPayment {
  const state = loadCyberState();
  const existing = state.payments.find(
    (p) => p.razorpayPaymentId === params.razorpayPaymentId
  );

  if (existing) {
    existing.status = params.status;
    existing.verificationStatus = params.verificationStatus;
    if (params.webhookStatus) existing.webhookStatus = params.webhookStatus;
    if (params.razorpaySignature) existing.razorpaySignature = params.razorpaySignature;
    existing.updatedAt = nowIso();
    persistCyberState();
    return existing;
  }

  const payment: CyberPayment = {
    id: makeId("cyb-pay"),
    orderId: params.order.id,
    userId: params.order.userId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    amountInPaise: params.amountInPaise ?? params.order.amountInPaise,
    currency: "INR",
    status: params.status,
    verificationStatus: params.verificationStatus,
    webhookStatus: params.webhookStatus || "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  state.payments.push(payment);
  persistCyberState();
  return payment;
}

/**
 * Idempotently provisions the entitlements described by an order.
 * Safe to call from both checkout verification and webhook delivery.
 */
export function provisionCyberEntitlementsForOrder(order: CyberOrder): void {
  const state = loadCyberState();
  const live = state.orders.find((o) => o.id === order.id) || order;

  if (live.metadata?.entitlementsGrantedAt) return;

  if (live.productType === "semester_pass") {
    grantCyberEnrollment({
      userId: live.userId,
      courseId: live.courseId,
      accessType: "semester_pass",
      months: CYBER_SEMESTER_MONTHS,
      source: `order:${live.id}`,
    });

    if (CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS > 0) {
      const alreadyHasIncluded = state.mentorshipPacks.some(
        (p) => p.sourceOrderId === live.id && p.packType === "semester_pass_included"
      );
      if (!alreadyHasIncluded) {
        createCyberMentorshipPack({
          userId: live.userId,
          courseId: live.courseId,
          totalSessions: CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
          validityDays: CYBER_PASS_MENTORSHIP_VALIDITY_DAYS,
          packType: "semester_pass_included",
          sourceOrderId: live.id,
        });
      }
    }
  } else {
    const alreadyHasPack = state.mentorshipPacks.some((p) => p.sourceOrderId === live.id);
    if (!alreadyHasPack) {
      createCyberMentorshipPack({
        userId: live.userId,
        courseId: live.courseId,
        totalSessions: 1,
        validityDays: CYBER_MENTORSHIP_PACK_VALIDITY_DAYS,
        packType: "single_session",
        sourceOrderId: live.id,
      });
    }
  }

  const persisted = state.orders.find((o) => o.id === live.id);
  if (persisted) {
    persisted.metadata = {
      ...(persisted.metadata || {}),
      entitlementsGrantedAt: nowIso(),
    };
    persisted.updatedAt = nowIso();
  }
  persistCyberState();
}

export function markCyberOrderPaid(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise?: number;
  source: "checkout_verify" | "webhook";
  webhookStatus?: CyberWebhookStatus;
}): { order: CyberOrder | null; alreadyPaid: boolean } {
  const state = loadCyberState();
  const order = state.orders.find(
    (o) => o.razorpayOrderId === params.razorpayOrderId
  );
  if (!order) return { order: null, alreadyPaid: false };

  const alreadyPaid = order.status === "paid";
  order.status = "paid";
  order.updatedAt = nowIso();
  order.metadata = {
    ...(order.metadata || {}),
    paidVia: params.source,
    lastPaymentId: params.razorpayPaymentId,
  };
  persistCyberState();

  upsertCyberPayment({
    order,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    amountInPaise: params.amountInPaise,
    status: "captured",
    verificationStatus: "verified",
    webhookStatus: params.webhookStatus || (params.source === "webhook" ? "processed" : "pending"),
  });

  provisionCyberEntitlementsForOrder(order);
  return { order, alreadyPaid };
}

export function markCyberOrderFailed(
  razorpayOrderId: string,
  razorpayPaymentId?: string
): CyberOrder | null {
  const state = loadCyberState();
  const order = state.orders.find((o) => o.razorpayOrderId === razorpayOrderId);
  if (!order) return null;

  // A paid order is never downgraded by a late/duplicate failure event.
  if (order.status === "paid") return order;

  order.status = "failed";
  order.updatedAt = nowIso();
  persistCyberState();

  if (razorpayPaymentId) {
    upsertCyberPayment({
      order,
      razorpayPaymentId,
      status: "failed",
      verificationStatus: "failed",
      webhookStatus: "processed",
    });
  }
  return order;
}

export function markCyberOrderVerificationFailed(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature?: string
): void {
  const state = loadCyberState();
  const order = state.orders.find((o) => o.razorpayOrderId === razorpayOrderId);
  if (!order || order.status === "paid") return;

  order.status = "failed";
  order.updatedAt = nowIso();
  persistCyberState();

  upsertCyberPayment({
    order,
    razorpayPaymentId,
    razorpaySignature,
    status: "failed",
    verificationStatus: "failed",
  });
}

export function refundCyberOrder(
  razorpayOrderId: string,
  razorpayPaymentId?: string
): CyberOrder | null {
  const state = loadCyberState();
  const order = state.orders.find((o) => o.razorpayOrderId === razorpayOrderId);
  if (!order) return null;

  order.status = "refunded";
  order.updatedAt = nowIso();
  persistCyberState();

  if (razorpayPaymentId) {
    const payment = state.payments.find((p) => p.razorpayPaymentId === razorpayPaymentId);
    if (payment) {
      payment.status = "refunded";
      payment.updatedAt = nowIso();
    } else {
      upsertCyberPayment({
        order,
        razorpayPaymentId,
        status: "refunded",
        verificationStatus: "verified",
        webhookStatus: "processed",
      });
    }
  }

  // Refund ends the access granted by this order.
  const enrollment = state.enrollments.find(
    (e) => normalizeId(e.userId) === normalizeId(order.userId) && e.source === `order:${order.id}`
  );
  if (enrollment && enrollment.status === "active") {
    enrollment.status = "revoked";
    enrollment.updatedAt = nowIso();
  }

  const pack = state.mentorshipPacks.find((p) => p.sourceOrderId === order.id);
  if (pack && pack.status === "active") {
    pack.status = "revoked";
  }

  persistCyberState();
  return order;
}

// ---------------------------------------------------------------------------
// Webhook idempotency (durable store fallback)
// ---------------------------------------------------------------------------
export function recordCyberWebhookEvent(event: {
  eventId: string;
  eventType: string;
  payload: any;
  provider?: string;
}): { isDuplicate: boolean; event: CyberWebhookEventRecord } {
  const state = loadCyberState();
  const provider = event.provider || "razorpay_cyber";
  const existing = state.webhookEvents.find(
    (e) => e.provider === provider && e.eventId === event.eventId
  );

  if (existing) {
    existing.attempts += 1;
    persistCyberState();
    return { isDuplicate: true, event: existing };
  }

  const record: CyberWebhookEventRecord = {
    id: makeId("cyb-wh"),
    provider,
    eventId: event.eventId,
    eventType: event.eventType,
    status: "processing",
    payload: event.payload,
    attempts: 1,
    createdAt: nowIso(),
  };

  state.webhookEvents.push(record);
  persistCyberState();
  return { isDuplicate: false, event: record };
}

export function updateCyberWebhookEventStatus(
  eventId: string,
  status: CyberWebhookEventRecord["status"],
  provider = "razorpay_cyber"
): boolean {
  const state = loadCyberState();
  const record = state.webhookEvents.find(
    (e) => e.provider === provider && e.eventId === eventId
  );
  if (!record) return false;
  record.status = status;
  persistCyberState();
  return true;
}

// ---------------------------------------------------------------------------
// Progress & certificate eligibility
// ---------------------------------------------------------------------------
export function emptyCyberProgress(): CyberProgress {
  return {
    completedLessons: [],
    completedLabs: [],
    completedCtfChallenges: [],
    passedQuizzes: [],
    finalAssessmentPassed: false,
    updatedAt: nowIso(),
  };
}

export function getCyberProgress(userId: string): CyberProgress {
  const state = loadCyberState();
  return state.progress[normalizeId(userId)] || emptyCyberProgress();
}

export function markCyberProgress(
  userId: string,
  update: {
    type: "lesson" | "lab" | "ctf" | "quiz" | "final_assessment";
    id: string;
    passed?: boolean;
  }
): CyberProgress {
  const state = loadCyberState();
  const key = normalizeId(userId);
  const current = state.progress[key] || emptyCyberProgress();

  if (update.type === "lesson" && !current.completedLessons.includes(update.id)) {
    current.completedLessons.push(update.id);
  }
  if (update.type === "lab" && !current.completedLabs.includes(update.id)) {
    current.completedLabs.push(update.id);
  }
  if (update.type === "ctf" && !current.completedCtfChallenges.includes(update.id)) {
    current.completedCtfChallenges.push(update.id);
  }
  if (
    update.type === "quiz" &&
    update.passed &&
    !current.passedQuizzes.includes(update.id)
  ) {
    current.passedQuizzes.push(update.id);
  }
  if (update.type === "final_assessment" && update.passed) {
    current.finalAssessmentPassed = true;
  }

  current.updatedAt = nowIso();
  state.progress[key] = current;
  persistCyberState();
  return current;
}

export interface CyberEligibilityChecklistItem {
  key: string;
  label: string;
  completed: number;
  total: number;
  satisfied: boolean;
}

export interface CyberEligibility {
  eligible: boolean;
  hasActivePass: boolean;
  checklist: CyberEligibilityChecklistItem[];
  blockers: string[];
}

export function getCyberCertificateEligibility(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): CyberEligibility {
  const progress = userId ? getCyberProgress(userId) : emptyCyberProgress();
  const enrollment = getCyberEnrollment(userId, courseId);
  const hasActivePass = Boolean(enrollment);

  const publishedModules = CYBER_MODULES.length;
  const requiredLessons = CYBER_LESSONS.length;
  const requiredLabs = CYBER_LABS.length;
  const requiredCtf = CYBER_CTF_CHALLENGES.length;
  const requiredQuizzes = CYBER_QUIZZES.length;

  const completedLessons = CYBER_LESSONS.filter((l) =>
    progress.completedLessons.includes(l.id)
  ).length;
  const completedLabs = CYBER_LABS.filter((l) => progress.completedLabs.includes(l.id)).length;
  const completedCtf = CYBER_CTF_CHALLENGES.filter((c) =>
    progress.completedCtfChallenges.includes(c.id)
  ).length;
  const passedQuizzes = CYBER_QUIZZES.filter((q) =>
    progress.passedQuizzes.includes(q.id)
  ).length;

  const checklist: CyberEligibilityChecklistItem[] = [
    {
      key: "semester_pass",
      label: "Active CyberSecurity Semester Pass",
      completed: hasActivePass ? 1 : 0,
      total: 1,
      satisfied: hasActivePass,
    },
    {
      key: "modules",
      label: "All published modules available",
      completed: publishedModules,
      total: publishedModules,
      satisfied: publishedModules > 0,
    },
    {
      key: "lessons",
      label: "Required lessons completed",
      completed: completedLessons,
      total: requiredLessons,
      satisfied: requiredLessons > 0 && completedLessons >= requiredLessons,
    },
    {
      key: "labs",
      label: "Required browser labs & incident investigations",
      completed: completedLabs,
      total: requiredLabs,
      satisfied: requiredLabs > 0 && completedLabs >= requiredLabs,
    },
    {
      key: "ctf",
      label: "Required CTF challenges solved",
      completed: completedCtf,
      total: requiredCtf,
      satisfied: requiredCtf > 0 && completedCtf >= requiredCtf,
    },
    {
      key: "quizzes",
      label: "Required module quizzes passed",
      completed: passedQuizzes,
      total: requiredQuizzes,
      satisfied: requiredQuizzes > 0 && passedQuizzes >= requiredQuizzes,
    },
  ];

  if (CYBER_FINAL_ASSESSMENT.required) {
    checklist.push({
      key: "final_assessment",
      label: "Final assessment passed",
      completed: progress.finalAssessmentPassed ? 1 : 0,
      total: 1,
      satisfied: progress.finalAssessmentPassed,
    });
  }

  const blockers = checklist.filter((item) => !item.satisfied).map((item) => item.label);

  return {
    eligible: blockers.length === 0,
    hasActivePass,
    checklist,
    blockers,
  };
}

export function getCyberCertificateForUser(
  userId: string
): CyberCertificate | null {
  const key = normalizeId(userId);
  return loadCyberState().certificates.find((c) => normalizeId(c.userId) === key) || null;
}

export interface CyberPublicCertificate {
  code: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  status: "issued" | "revoked";
  verificationUrl: string;
}

export function issueCyberCertificate(params: {
  userId: string;
  studentName: string;
  pdfPath?: string;
}): { success: boolean; certificate?: CyberCertificate; error?: string } {
  const state = loadCyberState();
  const key = normalizeId(params.userId);

  const existing = state.certificates.find((c) => normalizeId(c.userId) === key);
  if (existing) {
    if (params.pdfPath && !existing.pdfPath) {
      existing.pdfPath = params.pdfPath;
      persistCyberState();
    }
    return { success: true, certificate: existing };
  }

  const eligibility = getCyberCertificateEligibility(params.userId);
  if (!eligibility.eligible) {
    return {
      success: false,
      error: `Certificate eligibility not met: ${eligibility.blockers.join("; ")}.`,
    };
  }

  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase().padEnd(6, "0");
  let code = `PMU-CYB-2026-${randomHex}`;
  while (state.certificates.some((c) => c.code === code)) {
    code = `PMU-CYB-2026-${Math.random().toString(16).substring(2, 8).toUpperCase().padEnd(6, "0")}`;
  }

  const certificate: CyberCertificate = {
    code,
    userId: params.userId,
    studentName: params.studentName,
    courseSlug: CYBER_COURSE_SLUG,
    courseTitle: CYBER_COURSE_TITLE,
    instructorName: CYBER_INSTRUCTOR_NAME,
    issueDate: nowIso(),
    status: "issued",
    pdfPath: params.pdfPath,
    verificationUrl: `https://prepmeupai.in/prepmeup/verify-certificate/${code}`,
  };

  state.certificates.push(certificate);
  persistCyberState();
  return { success: true, certificate };
}

export function getCyberCertificateByCode(
  certificateCode: string
): CyberPublicCertificate | null {
  const code = (certificateCode || "").trim().toUpperCase();
  const cert = loadCyberState().certificates.find(
    (c) => c.code.toUpperCase() === code
  );
  if (!cert) return null;

  // Strict public data boundary: no phone, email, user id, or payment data.
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

export function getCyberCertificateRecordByCode(
  certificateCode: string,
  userId: string
): CyberCertificate | null {
  const code = (certificateCode || "").trim().toUpperCase();
  const cert = loadCyberState().certificates.find((c) => c.code.toUpperCase() === code);
  if (!cert) return null;
  if (normalizeId(cert.userId) !== normalizeId(userId)) return null;
  return cert;
}

// ---------------------------------------------------------------------------
// Mentorship bookings
// ---------------------------------------------------------------------------
export interface CyberMentorshipSlot {
  id: string;
  scheduledAt: string;
  durationMinutes: number;
  instructorName: string;
  isBooked: boolean;
}

/**
 * Deterministic upcoming slots (no live video infrastructure is created).
 * Live sessions are scheduled and handed off out-of-band.
 */
export function getCyberMentorshipSlots(courseId = CYBER_COURSE_SLUG): CyberMentorshipSlot[] {
  const state = loadCyberState();
  const slots: CyberMentorshipSlot[] = [];
  const now = new Date();

  for (let dayOffset = 1; dayOffset <= 7; dayOffset += 1) {
    for (let slotIndex = 0; slotIndex < 2; slotIndex += 1) {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() + dayOffset);
      date.setUTCHours(slotIndex === 0 ? 10 : 15, 0, 0, 0);
      const id = `cyb-slot-${date.toISOString().slice(0, 10).replace(/-/g, "")}-${slotIndex}`;
      const isBooked = state.bookings.some(
        (b) =>
          isSameCourse(b.courseId, courseId) &&
          b.slotId === id &&
          (b.status === "confirmed" || b.status === "rescheduled")
      );
      slots.push({
        id,
        scheduledAt: date.toISOString(),
        durationMinutes: 45,
        instructorName: CYBER_INSTRUCTOR_NAME,
        isBooked,
      });
    }
  }

  return slots;
}

export function getCyberMentorshipBookings(userId: string, courseId = CYBER_COURSE_SLUG) {
  const key = normalizeId(userId);
  return loadCyberState()
    .bookings.filter(
      (b) => normalizeId(b.userId) === key && isSameCourse(b.courseId, courseId)
    )
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}

export function bookCyberMentorshipSession(params: {
  userId: string;
  slotId: string;
  notes?: string;
}): { success: boolean; booking?: CyberMentorshipBooking; error?: string; upgradeRequired?: boolean } {
  const slots = getCyberMentorshipSlots();
  const slot = slots.find((s) => s.id === params.slotId);
  if (!slot) return { success: false, error: "Selected mentorship slot does not exist." };
  if (slot.isBooked) return { success: false, error: "This mentorship slot is already booked." };

  const consumed = consumeCyberMentorshipCredit(params.userId);
  if (!consumed.success || !consumed.packId) {
    return {
      success: false,
      upgradeRequired: true,
      error:
        consumed.error ||
        "No unused CyberSecurity mentorship entitlement. Purchase a Mentorship Pack or Semester Pass.",
    };
  }

  const state = loadCyberState();
  const booking: CyberMentorshipBooking = {
    id: makeId("cyb-book"),
    userId: params.userId,
    courseId: CYBER_COURSE_SLUG,
    slotId: slot.id,
    instructorName: slot.instructorName,
    scheduledAt: slot.scheduledAt,
    durationMinutes: slot.durationMinutes,
    status: "confirmed",
    entitlementPackId: consumed.packId,
    entitlementSource: consumed.source,
    isConsumed: true,
    isRefunded: false,
    notes: params.notes,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  state.bookings.push(booking);
  persistCyberState();
  return { success: true, booking };
}

export function cancelCyberMentorshipBooking(
  userId: string,
  bookingId: string
): { success: boolean; booking?: CyberMentorshipBooking; error?: string } {
  const state = loadCyberState();
  const booking = state.bookings.find(
    (b) => b.id === bookingId && normalizeId(b.userId) === normalizeId(userId)
  );
  if (!booking) return { success: false, error: "Mentorship booking not found." };
  if (booking.status === "completed") {
    return { success: false, error: "Completed sessions cannot be cancelled or refunded." };
  }
  if (booking.status === "cancelled") {
    return { success: false, error: "This session is already cancelled." };
  }

  // Refund exactly once, before completion only.
  if (booking.isConsumed && !booking.isRefunded && booking.entitlementPackId) {
    if (refundCyberMentorshipCredit(booking.entitlementPackId)) {
      booking.isRefunded = true;
    }
  }

  booking.status = "cancelled";
  booking.updatedAt = nowIso();
  persistCyberState();
  return { success: true, booking };
}

export function completeCyberMentorshipBooking(
  userId: string,
  bookingId: string
): { success: boolean; booking?: CyberMentorshipBooking; error?: string } {
  const state = loadCyberState();
  const booking = state.bookings.find(
    (b) => b.id === bookingId && normalizeId(b.userId) === normalizeId(userId)
  );
  if (!booking) return { success: false, error: "Mentorship booking not found." };
  if (booking.status === "cancelled") {
    return { success: false, error: "Cancelled sessions cannot be completed." };
  }

  // Credit was consumed at booking time and is permanently consumed on completion.
  booking.status = "completed";
  booking.isConsumed = true;
  booking.updatedAt = nowIso();
  persistCyberState();
  return { success: true, booking };
}

export function rescheduleCyberMentorshipBooking(params: {
  userId: string;
  bookingId: string;
  slotId: string;
}): { success: boolean; booking?: CyberMentorshipBooking; error?: string } {
  const state = loadCyberState();
  const booking = state.bookings.find(
    (b) => b.id === params.bookingId && normalizeId(b.userId) === normalizeId(params.userId)
  );
  if (!booking) return { success: false, error: "Mentorship booking not found." };
  if (booking.status === "completed") {
    return { success: false, error: "Completed sessions cannot be rescheduled." };
  }
  if (booking.status === "cancelled") {
    return { success: false, error: "Cancelled sessions cannot be rescheduled." };
  }

  const target = getCyberMentorshipSlots().find((s) => s.id === params.slotId);
  if (!target) return { success: false, error: "Target mentorship slot does not exist." };
  if (target.isBooked) {
    return { success: false, error: "Target mentorship slot is already booked." };
  }

  // Rescheduling never refunds or re-consumes a credit.
  booking.rescheduledFromSlotId = booking.slotId;
  booking.slotId = target.id;
  booking.scheduledAt = target.scheduledAt;
  booking.status = "rescheduled";
  booking.updatedAt = nowIso();
  persistCyberState();
  return { success: true, booking };
}

// ---------------------------------------------------------------------------
// Admin revenue summary
// ---------------------------------------------------------------------------
export function getCyberRevenueSummary() {
  const state = loadCyberState();
  const captured = state.payments.filter((p) => p.status === "captured");
  const refunded = state.payments.filter((p) => p.status === "refunded");
  const totalRevenuePaise = captured.reduce((sum, p) => sum + (p.amountInPaise || 0), 0);
  const refundedPaise = refunded.reduce((sum, p) => sum + (p.amountInPaise || 0), 0);

  return {
    totalRevenueRupees: Math.round(totalRevenuePaise / 100),
    refundedRupees: Math.round(refundedPaise / 100),
    totalOrders: state.orders.length,
    paidOrders: state.orders.filter((o) => o.status === "paid").length,
    failedOrders: state.orders.filter((o) => o.status === "failed").length,
    refundedOrders: state.orders.filter((o) => o.status === "refunded").length,
    capturedPayments: captured.length,
    refundedCount: refunded.length,
    earlyAdopterClaims: state.earlyAdopterRedemptions.filter((r) => r.status === "claimed")
      .length,
    earlyAdopterLimit: getCyberEarlyAdopterLimit(),
    activeEnrollments: state.enrollments.filter((e) => e.status === "active").length,
    expiredEnrollments: state.enrollments.filter(
      (e) => e.status === "expired" || e.status === "revoked"
    ).length,
    activeMentorshipPacks: state.mentorshipPacks.filter((p) => p.status === "active").length,
  };
}
