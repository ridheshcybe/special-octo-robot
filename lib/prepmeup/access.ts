import {
  getQuantumEnrollment,
  getQuantumMentorshipPacks,
  checkUserCourseAccess,
  CourseLesson,
  QuantumQuiz,
  QuantumSimulationMeta,
} from "@/app/prepmeup/_lib/trackStore";
import {
  CYBER_COURSE_SLUG,
  getCyberCertificateEligibility,
  getCyberEnrollment,
  getCyberAvailableMentorshipSessions,
  getCyberIncludedPassMentorshipSessions,
} from "@/app/prepmeup/_lib/cyberStore";
import {
  UNIFIED_COURSES,
  UNIFIED_TRACKS,
  getAvailableMentorshipSessions as getUnifiedMentorshipSessions,
  getMentorshipEntitlements as getUnifiedMentorshipEntitlements,
  getUnifiedAccessSummary as getStoreUnifiedAccessSummary,
  hasActiveAllAccessEntitlement,
  hasActiveCourseEntitlement,
  hasActiveTrackEntitlement,
  type UnifiedAccessSummary,
} from "@/app/prepmeup/_lib/unifiedStore";

export interface QuantumAccessSummary {
  userId: string;
  courseId: string;
  hasSemesterPass: boolean;
  hasMentorshipPack: boolean;
  availableMentorshipSessions: number;
  accessType: "free_preview" | "semester_pass" | "mentorship_pack" | "admin_granted" | "none";
  status: "active" | "expired" | "cancelled" | "revoked" | "none";
  expiresAt?: string;
  canAccessPaidContent: boolean;
  canBookMentorship: boolean;
}

/**
 * Checks whether user has an active Semester Pass or admin-granted access
 */
export function hasQuantumSemesterPass(
  userId: string | null | undefined,
  courseId = "quantum-computing-foundations"
): boolean {
  if (!userId) return false;

  const access = checkUserCourseAccess(userId, courseId);
  if (access.role === "admin" || access.role === "instructor") return true;

  // Phase C3: a unified / All-Access entitlement unlocks the same course.
  if (hasActiveCourseEntitlement(userId, courseId)) return true;

  const enrollment = getQuantumEnrollment(userId, courseId);
  if (!enrollment) return false;

  if (enrollment.status !== "active") return false;

  // Immediate expiration check
  if (enrollment.expiresAt && new Date(enrollment.expiresAt) < new Date()) {
    return false;
  }

  return (
    enrollment.accessType === "semester_pass" ||
    enrollment.accessType === "admin_granted"
  );
}

/**
 * Checks whether user has an active, unexhausted Mentorship Pack
 */
export function hasQuantumMentorshipPack(
  userId: string | null | undefined,
  courseId = "quantum-computing-foundations"
): boolean {
  if (!userId) return false;
  const packs = getQuantumMentorshipPacks(userId, courseId);
  return packs.length > 0;
}

/**
 * Checks whether user can view a specific lesson
 */
export function canAccessQuantumLesson(
  userId: string | null | undefined,
  lesson: { isFreePreview?: boolean } | null | undefined,
  courseId = "quantum-computing-foundations"
): boolean {
  if (!lesson) return false;
  if (lesson.isFreePreview) return true;
  return hasQuantumSemesterPass(userId, courseId);
}

/**
 * Checks whether user can take a specific quiz
 */
export function canAccessQuantumQuiz(
  userId: string | null | undefined,
  quiz: { isFreePreview?: boolean; is_free_preview?: boolean } | null | undefined,
  courseId = "quantum-computing-foundations"
): boolean {
  if (!quiz) return false;
  const isFree = Boolean(quiz.isFreePreview || quiz.is_free_preview);
  if (isFree) return true;
  return hasQuantumSemesterPass(userId, courseId);
}

/**
 * Checks whether user can launch a specific simulation
 */
export function canAccessQuantumSimulation(
  userId: string | null | undefined,
  simulation: { isFreePreview?: boolean; is_free_preview?: boolean } | null | undefined,
  courseId = "quantum-computing-foundations"
): boolean {
  if (!simulation) return false;
  const isFree = Boolean(simulation.isFreePreview || simulation.is_free_preview);
  if (isFree) return true;
  return hasQuantumSemesterPass(userId, courseId);
}

/**
 * Checks whether user can book a 1-on-1 mentorship session:
 * Requires either:
 *  1. Active Semester Pass with available included sessions, OR
 *  2. Active unexhausted Mentorship Pack
 */
export function canBookQuantumMentorship(
  userId: string | null | undefined,
  courseId = "quantum-computing-foundations"
): boolean {
  if (!userId) return false;

  const access = checkUserCourseAccess(userId, courseId);
  if (access.role === "admin" || access.role === "instructor") return true;

  // Check mentorship packs
  const packs = getQuantumMentorshipPacks(userId, courseId);
  const totalAvailable = packs.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );

  return totalAvailable > 0;
}

// ============================================================================
// Phase C2: CyberSecurity access enforcement
// ============================================================================

export interface CyberAccessSummary {
  userId: string;
  courseId: string;
  hasSemesterPass: boolean;
  hasMentorshipPack: boolean;
  availableMentorshipSessions: number;
  includedMentorshipSessions: number;
  accessType: "free_preview" | "semester_pass" | "mentorship_pack" | "admin_granted" | "none";
  status: "active" | "expired" | "cancelled" | "revoked" | "none";
  expiresAt?: string;
  canAccessFreePreview: boolean;
  canAccessPaidContent: boolean;
  canBookMentorship: boolean;
  certificateEligible: boolean;
}

function isCyberStaff(userId: string, courseId: string): boolean {
  const access = checkUserCourseAccess(userId, courseId);
  return access.role === "admin" || access.role === "instructor";
}

/**
 * Active CyberSecurity Semester Pass or admin-granted access.
 * Expired access is revoked immediately (the store flips the record on read).
 */
export function hasCyberSemesterPass(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  if (isCyberStaff(userId, courseId)) return true;

  // Phase C3: a unified / All-Access entitlement unlocks the same course.
  if (hasActiveCourseEntitlement(userId, courseId)) return true;

  const enrollment = getCyberEnrollment(userId, courseId);
  if (!enrollment) return false;

  return (
    enrollment.accessType === "semester_pass" || enrollment.accessType === "admin_granted"
  );
}

/**
 * Active, unexpired, unused CyberSecurity Mentorship Pack.
 * Semester-pass included mentorship is provisioned as a pack, so it counts here.
 */
export function hasCyberMentorshipPack(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  if (isCyberStaff(userId, courseId)) return true;
  return getCyberAvailableMentorshipSessions(userId, courseId) > 0;
}

/**
 * Free-preview content requires an authenticated student.
 * Paid lessons require an active Semester Pass (or admin/instructor access).
 */
export function canAccessCyberLesson(
  userId: string | null | undefined,
  lesson: { id?: string; isFreePreview?: boolean; is_free_preview?: boolean } | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  if (!lesson) return false;
  if (lesson.isFreePreview || lesson.is_free_preview) return true;
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * Browser labs and incident investigations follow lesson rules.
 */
export function canAccessCyberLab(
  userId: string | null | undefined,
  lab: { id?: string; isFreePreview?: boolean; is_free_preview?: boolean } | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  if (!lab) return false;
  if (lab.isFreePreview || lab.is_free_preview) return true;
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * Quizzes follow lesson rules; the free-preview quiz stays open to authenticated students.
 */
export function canAccessCyberQuiz(
  userId: string | null | undefined,
  quiz: { id?: string; isFreePreview?: boolean; is_free_preview?: boolean } | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  if (!quiz) return false;
  if (quiz.isFreePreview || quiz.is_free_preview) return true;
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * CTF challenges are always paid content.
 */
export function canAccessCyberCtf(
  userId: string | null | undefined,
  challenge: { id?: string; isFreePreview?: boolean; is_free_preview?: boolean } | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  if (!challenge) return false;
  if (challenge.isFreePreview || challenge.is_free_preview) return true;
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * The final assessment is paid content and only meaningful with an active pass.
 */
export function canAccessCyberFinalAssessment(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * Mentorship booking requires either:
 *  1. An active Semester Pass with included mentorship benefit, OR
 *  2. An active unused Mentorship Pack.
 */
export function canBookCyberMentorship(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  if (isCyberStaff(userId, courseId)) return true;
  if (getCyberAvailableMentorshipSessions(userId, courseId) <= 0) return false;

  const included = getCyberIncludedPassMentorshipSessions(userId, courseId);
  return included > 0 || hasCyberSemesterPass(userId, courseId) || hasCyberMentorshipPack(userId, courseId);
}

/**
 * CyberSecurity certificate eligibility also requires an active Semester Pass.
 */
export function canClaimCyberCertificate(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  if (!hasCyberSemesterPass(userId, courseId)) return false;
  return getCyberCertificateEligibility(userId, courseId).eligible;
}

/**
 * Comprehensive CyberSecurity access summary for dashboards and route guards.
 */
export function getCyberAccessSummary(
  userId: string | null | undefined,
  courseId = CYBER_COURSE_SLUG
): CyberAccessSummary {
  if (!userId) {
    return {
      userId: "",
      courseId,
      hasSemesterPass: false,
      hasMentorshipPack: false,
      availableMentorshipSessions: 0,
      includedMentorshipSessions: 0,
      accessType: "none",
      status: "none",
      canAccessFreePreview: false,
      canAccessPaidContent: false,
      canBookMentorship: false,
      certificateEligible: false,
    };
  }

  if (isCyberStaff(userId, courseId)) {
    const eligibility = getCyberCertificateEligibility(userId, courseId);
    return {
      userId,
      courseId,
      hasSemesterPass: true,
      hasMentorshipPack: true,
      availableMentorshipSessions: 99,
      includedMentorshipSessions: 99,
      accessType: "admin_granted",
      status: "active",
      canAccessFreePreview: true,
      canAccessPaidContent: true,
      canBookMentorship: true,
      certificateEligible: eligibility.eligible,
    };
  }

  const enrollment = getCyberEnrollment(userId, courseId);
  const unifiedCourseAccess = hasActiveCourseEntitlement(userId, courseId);
  const availableMentorshipSessions =
    getCyberAvailableMentorshipSessions(userId, courseId) +
    getUnifiedMentorshipSessions(userId, courseId);
  const hasSemesterPass = Boolean(enrollment) || unifiedCourseAccess;
  const eligibility = getCyberCertificateEligibility(userId, courseId);

  return {
    userId,
    courseId,
    hasSemesterPass,
    hasMentorshipPack: availableMentorshipSessions > 0,
    availableMentorshipSessions,
    includedMentorshipSessions: getCyberIncludedPassMentorshipSessions(userId, courseId),
    accessType: enrollment?.accessType || (unifiedCourseAccess ? "semester_pass" : "none"),
    status: enrollment?.status || (unifiedCourseAccess ? "active" : "none"),
    expiresAt: enrollment?.expiresAt,
    canAccessFreePreview: true,
    canAccessPaidContent: hasSemesterPass,
    canBookMentorship: availableMentorshipSessions > 0,
    certificateEligible: eligibility.eligible,
  };
}

/**
 * Returns comprehensive access summary for a student
 */
export function getQuantumAccessSummary(
  userId: string | null | undefined,
  courseId = "quantum-computing-foundations"
): QuantumAccessSummary {
  if (!userId) {
    return {
      userId: "",
      courseId,
      hasSemesterPass: false,
      hasMentorshipPack: false,
      availableMentorshipSessions: 0,
      accessType: "none",
      status: "none",
      canAccessPaidContent: false,
      canBookMentorship: false,
    };
  }

  const roleAccess = checkUserCourseAccess(userId, courseId);
  if (roleAccess.role === "admin" || roleAccess.role === "instructor") {
    return {
      userId,
      courseId,
      hasSemesterPass: true,
      hasMentorshipPack: true,
      availableMentorshipSessions: 99,
      accessType: "admin_granted",
      status: "active",
      canAccessPaidContent: true,
      canBookMentorship: true,
    };
  }

  const enrollment = getQuantumEnrollment(userId, courseId);
  const packs = getQuantumMentorshipPacks(userId, courseId);
  const availableMentorshipSessions = packs.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );

  const unifiedCourseAccess = hasActiveCourseEntitlement(userId, courseId);
  const hasSemesterPass =
    unifiedCourseAccess ||
    (Boolean(enrollment && enrollment.status === "active") &&
      (enrollment?.accessType === "semester_pass" || enrollment?.accessType === "admin_granted"));

  const hasMentorshipPack = availableMentorshipSessions > 0;

  return {
    userId,
    courseId,
    hasSemesterPass,
    hasMentorshipPack,
    availableMentorshipSessions,
    accessType: enrollment?.accessType || (unifiedCourseAccess ? "semester_pass" : "none"),
    status: enrollment?.status || (unifiedCourseAccess ? "active" : "none"),
    expiresAt: enrollment?.expiresAt,
    canAccessPaidContent: hasSemesterPass,
    canBookMentorship: availableMentorshipSessions > 0,
  };
}

// ============================================================================
// Phase C3: Unified pricing, All-Access Pass & entitlement enforcement
//
// Entitlement records are the only source of paid access. Expired records are
// flipped to `expired` on read by the unified store, so paid content locks the
// moment the horizon passes. All-Access covers exactly its included tracks and
// courses — future tracks are never inherited implicitly.
// ============================================================================

export type UnifiedContentMeta = {
  isFreePreview?: boolean;
  is_free_preview?: boolean;
  courseSlug?: string;
};

export type MentorshipEntitlementSource =
  | "unified_mentorship_pack"
  | "unified_semester_pass"
  | "quantum_mentorship_pack"
  | "cyber_mentorship_pack"
  | "none";

export interface MentorshipEntitlementView {
  courseSlug: string;
  availableSessions: number;
  source: MentorshipEntitlementSource;
  entitlementId?: string;
  expiresAt?: string;
}

function resolveCourseSlug(courseSlug: string | null | undefined): string | null {
  if (!courseSlug) return null;
  const normalized = courseSlug.trim().toLowerCase();
  if (UNIFIED_COURSES[normalized]) return normalized;
  const byId = Object.values(UNIFIED_COURSES).find((course) => course.courseId === normalized);
  return byId?.slug || null;
}

function isUnifiedStaff(userId: string, courseSlug: string): boolean {
  const access = checkUserCourseAccess(userId, courseSlug);
  return access.role === "admin" || access.role === "instructor";
}

/** Full unified access picture (passes, tracks, courses, mentorship credits). */
export function getUnifiedAccessSummary(
  userId: string | null | undefined
): UnifiedAccessSummary {
  return getStoreUnifiedAccessSummary(userId);
}

/** Active B.Tech CSE AI/ML Semester 1 access. */
export function hasBtechAccess(
  userId: string | null | undefined,
  courseSlug = "btech-cse-aiml-semester-1"
): boolean {
  if (!userId) return false;
  if (isUnifiedStaff(userId, courseSlug)) return true;
  return hasActiveCourseEntitlement(userId, courseSlug);
}

export function hasQuantumAccess(
  userId: string | null | undefined,
  courseSlug = "quantum-computing-foundations"
): boolean {
  if (!userId) return false;
  return hasQuantumSemesterPass(userId, courseSlug);
}

export function hasCyberSecurityAccess(
  userId: string | null | undefined,
  courseSlug = CYBER_COURSE_SLUG
): boolean {
  if (!userId) return false;
  return hasCyberSemesterPass(userId, courseSlug);
}

/** True only when one active entitlement covers all three included tracks. */
export function hasAllAccess(userId: string | null | undefined): boolean {
  if (!userId) return false;
  if (hasActiveAllAccessEntitlement(userId)) return true;
  return getStoreUnifiedAccessSummary(userId).hasAllAccess;
}

/** Track-level guard. Unknown/future tracks are never granted implicitly. */
export function canAccessTrack(
  userId: string | null | undefined,
  trackSlug: string | null | undefined
): boolean {
  if (!userId || !trackSlug) return false;
  const normalized = trackSlug.trim().toLowerCase();
  const track = UNIFIED_TRACKS[normalized];
  if (!track) return false;

  const primaryCourse = track.courseSlugs[0];
  if (primaryCourse && isUnifiedStaff(userId, primaryCourse)) return true;

  if (normalized === "quantum-computing" && hasQuantumSemesterPass(userId)) return true;
  if (normalized === "cybersecurity" && hasCyberSemesterPass(userId)) return true;

  return hasActiveTrackEntitlement(userId, normalized);
}

/** Course-level paid guard (free previews are handled by callers). */
export function canAccessCourse(
  userId: string | null | undefined,
  courseSlug: string | null | undefined
): boolean {
  if (!userId) return false;
  const slug = resolveCourseSlug(courseSlug);
  if (!slug) return false;

  if (isUnifiedStaff(userId, slug)) return true;
  if (hasActiveCourseEntitlement(userId, slug)) return true;

  if (slug === "quantum-computing-foundations") return hasQuantumSemesterPass(userId, slug);
  if (slug === CYBER_COURSE_SLUG) return hasCyberSemesterPass(userId, slug);

  return false;
}

function resolveContentCourse(
  meta: UnifiedContentMeta | null | undefined,
  courseSlug?: string
): string | null {
  return resolveCourseSlug(courseSlug || meta?.courseSlug);
}

function contentIsFree(meta: UnifiedContentMeta | null | undefined): boolean {
  return Boolean(meta && (meta.isFreePreview || meta.is_free_preview));
}

/** Free-preview lessons stay open to authenticated students; paid ones need access. */
export function canAccessLesson(
  userId: string | null | undefined,
  lesson: UnifiedContentMeta | null | undefined,
  courseSlug?: string
): boolean {
  if (!userId || !lesson) return false;
  if (contentIsFree(lesson)) return true;
  const slug = resolveContentCourse(lesson, courseSlug);
  return slug ? canAccessCourse(userId, slug) : false;
}

export function canAccessQuiz(
  userId: string | null | undefined,
  quiz: UnifiedContentMeta | null | undefined,
  courseSlug?: string
): boolean {
  if (!userId || !quiz) return false;
  if (contentIsFree(quiz)) return true;
  const slug = resolveContentCourse(quiz, courseSlug);
  return slug ? canAccessCourse(userId, slug) : false;
}

export function canAccessSimulation(
  userId: string | null | undefined,
  simulation: UnifiedContentMeta | null | undefined,
  courseSlug?: string
): boolean {
  if (!userId || !simulation) return false;
  if (contentIsFree(simulation)) return true;
  const slug = resolveContentCourse(simulation, courseSlug);
  return slug ? canAccessCourse(userId, slug) : false;
}

/**
 * Returns the mentorship credit that would fund a booking for this course.
 * Unified credits are checked first; Phase Q3 / C2 packs remain valid.
 */
export function getMentorshipEntitlement(
  userId: string | null | undefined,
  courseSlug: string
): MentorshipEntitlementView {
  const resolved = resolveCourseSlug(courseSlug) || courseSlug;
  if (!userId || !UNIFIED_COURSES[resolved]) {
    return { courseSlug: resolved, availableSessions: 0, source: "none" };
  }

  const unified = getUnifiedMentorshipEntitlements(userId, resolved)[0];
  if (unified) {
    return {
      courseSlug: resolved,
      availableSessions: Math.max(
        0,
        (unified.sessionsTotal || 0) - (unified.sessionsUsed || 0)
      ),
      source: unified.productSlug.includes("mentorship")
        ? "unified_mentorship_pack"
        : "unified_semester_pass",
      entitlementId: unified.id,
      expiresAt: unified.expiresAt,
    };
  }

  if (resolved === "quantum-computing-foundations") {
    const packs = getQuantumMentorshipPacks(userId, resolved);
    const availableSessions = packs.reduce(
      (sum, pack) => sum + Math.max(0, pack.totalSessions - pack.usedSessions),
      0
    );
    if (availableSessions > 0) {
      return {
        courseSlug: resolved,
        availableSessions,
        source: "quantum_mentorship_pack",
        expiresAt: packs[0]?.expiresAt,
      };
    }
  }

  if (resolved === CYBER_COURSE_SLUG) {
    const availableSessions = getCyberAvailableMentorshipSessions(userId, resolved);
    if (availableSessions > 0) {
      return {
        courseSlug: resolved,
        availableSessions,
        source: "cyber_mentorship_pack",
      };
    }
  }

  return { courseSlug: resolved, availableSessions: 0, source: "none" };
}

/**
 * Booking guard: requires an unused credit (unified or legacy) or staff access.
 */
export function canBookMentorship(
  userId: string | null | undefined,
  courseSlug: string
): boolean {
  if (!userId) return false;
  const resolved = resolveCourseSlug(courseSlug) || courseSlug;
  if (!UNIFIED_COURSES[resolved]) return false;
  if (isUnifiedStaff(userId, resolved)) return true;
  return getMentorshipEntitlement(userId, resolved).availableSessions > 0;
}
