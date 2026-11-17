import {
  getQuantumEnrollment,
  getQuantumMentorshipPacks,
  getCyberEnrollment,
  getCyberMentorshipPacks,
  checkUserCourseAccess,
  hasActiveAllAccess,
  getAllAccessEntitlements,
  getAllAccessMentorshipPacks,
  AllAccessEntitlement,
  CourseLesson,
  QuantumQuiz,
  QuantumSimulationMeta,
  CyberLab,
  CyberIncidentCase,
} from "@/app/prepmeup/_lib/trackStore";

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

export interface CyberAccessSummary {
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

  if (totalAvailable > 0) return true;

  // Check all-access mentorship packs
  const aaPacks = getAllAccessMentorshipPacks(userId);
  const aaAvailable = aaPacks.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );
  return aaAvailable > 0;
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

  const hasSemesterPass =
    Boolean(enrollment && enrollment.status === "active") &&
    (enrollment?.accessType === "semester_pass" || enrollment?.accessType === "admin_granted");

  const hasMentorshipPack = availableMentorshipSessions > 0;

  return {
    userId,
    courseId,
    hasSemesterPass,
    hasMentorshipPack,
    availableMentorshipSessions,
    accessType: enrollment?.accessType || "none",
    status: enrollment?.status || "none",
    expiresAt: enrollment?.expiresAt,
    canAccessPaidContent: hasSemesterPass,
    canBookMentorship: availableMentorshipSessions > 0,
  };
}

/**
 * Checks whether user has an active CyberSecurity Semester Pass or admin-granted access
 */
export function hasCyberSemesterPass(
  userId: string | null | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!userId) return false;

  const access = checkUserCourseAccess(userId, courseId);
  if (access.role === "admin" || access.role === "instructor") return true;

  const enrollment = getCyberEnrollment(userId, courseId);
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
 * Checks whether user has an active, unexhausted CyberSecurity Mentorship Pack
 */
export function hasCyberMentorshipPack(
  userId: string | null | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!userId) return false;
  const packs = getCyberMentorshipPacks(userId, courseId);
  return packs.length > 0;
}

/**
 * Checks whether user can access a specific CyberSecurity lab
 */
export function canAccessCyberLab(
  userId: string | null | undefined,
  lab:
    | { isFreePreview?: boolean; is_free_preview?: boolean; slug?: string; id?: string }
    | string
    | null
    | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!lab) return false;
  if (typeof lab === "string") {
    if (lab === "lab-c1-01") return true;
    return hasCyberSemesterPass(userId, courseId);
  }
  const isFree = Boolean(
    lab.isFreePreview ||
      lab.is_free_preview ||
      lab.slug === "lab-c1-01" ||
      lab.id === "lab-c1-01"
  );
  if (isFree) return true;
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * Checks whether user can view a specific CyberSecurity lesson
 */
export function canAccessCyberLesson(
  userId: string | null | undefined,
  lesson:
    | { isFreePreview?: boolean; slug?: string; id?: string }
    | string
    | null
    | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!lesson) return false;
  if (typeof lesson === "string") {
    if (lesson === "lesson-c1-01") return true;
    return hasCyberSemesterPass(userId, courseId);
  }
  if (
    lesson.isFreePreview ||
    lesson.slug === "lesson-c1-01" ||
    lesson.id === "lesson-c1-01"
  ) {
    return true;
  }
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * Checks whether user can access a specific CyberSecurity incident case
 */
export function canAccessCyberIncidentCase(
  userId: string | null | undefined,
  incidentCase:
    | { isFreePreview?: boolean; slug?: string; id?: string }
    | string
    | null
    | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!incidentCase) return false;
  if (typeof incidentCase === "string") {
    if (incidentCase === "case-c1-01") return true;
    return hasCyberSemesterPass(userId, courseId);
  }
  if (
    incidentCase.isFreePreview ||
    incidentCase.slug === "case-c1-01" ||
    incidentCase.id === "case-c1-01"
  ) {
    return true;
  }
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * Checks whether user can take a specific CyberSecurity quiz
 */
export function canAccessCyberQuiz(
  userId: string | null | undefined,
  quiz:
    | { isFreePreview?: boolean; is_free_preview?: boolean; slug?: string; id?: string }
    | string
    | null
    | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!quiz) return false;
  if (typeof quiz === "string") {
    if (quiz === "quiz-cyber-01") return true;
    return hasCyberSemesterPass(userId, courseId);
  }
  const isFree = Boolean(
    quiz.isFreePreview ||
      quiz.is_free_preview ||
      quiz.slug === "quiz-cyber-01" ||
      quiz.id === "quiz-cyber-01"
  );
  if (isFree) return true;
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * Checks whether user can book a 1-on-1 CyberSecurity mentorship session
 */
export function canBookCyberMentorship(
  userId: string | null | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!userId) return false;

  const access = checkUserCourseAccess(userId, courseId);
  if (access.role === "admin" || access.role === "instructor") return true;

  const packs = getCyberMentorshipPacks(userId, courseId);
  const totalAvailable = packs.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );

  if (totalAvailable > 0) return true;

  // Check all-access mentorship packs
  const aaPacks = getAllAccessMentorshipPacks(userId);
  const aaAvailable = aaPacks.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );
  return aaAvailable > 0;
}

/**
 * Returns comprehensive CyberSecurity access summary for a student
 */
export function getCyberAccessSummary(
  userId: string | null | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): CyberAccessSummary {
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

  const enrollment = getCyberEnrollment(userId, courseId);
  const packs = getCyberMentorshipPacks(userId, courseId);
  const availableMentorshipSessions = packs.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );

  const hasSemesterPass =
    Boolean(enrollment && enrollment.status === "active") &&
    (enrollment?.accessType === "semester_pass" || enrollment?.accessType === "admin_granted");

  const hasMentorshipPack = availableMentorshipSessions > 0;

  return {
    userId,
    courseId,
    hasSemesterPass,
    hasMentorshipPack,
    availableMentorshipSessions,
    accessType: enrollment?.accessType || "none",
    status: enrollment?.status || "none",
    expiresAt: enrollment?.expiresAt,
    canAccessPaidContent: hasSemesterPass,
    canBookMentorship: availableMentorshipSessions > 0,
  };
}

// ============================================================================
// Phase C3: Centralized Access Enforcement & Unified Entitlements
// ============================================================================

export interface UnifiedAccessSummary {
  userId: string;
  hasAllAccess: boolean;
  hasBtechAccess: boolean;
  hasQuantumAccess: boolean;
  hasCyberSecurityAccess: boolean;
  allAccessEntitlement?: AllAccessEntitlement;
  totalMentorshipSessions: number;
  activeEnrollmentsCount: number;
}

export function hasAllAccess(userId: string | null | undefined): boolean {
  if (!userId) return false;
  return hasActiveAllAccess(userId);
}

export function hasBtechAccess(userId: string | null | undefined): boolean {
  if (!userId) return false;
  if (hasAllAccess(userId)) return true;
  const access = checkUserCourseAccess(userId, "btech-cse-aiml-sem1");
  return access.hasAccess;
}

export function hasQuantumAccess(
  userId: string | null | undefined,
  courseId = "quantum-computing-foundations"
): boolean {
  if (!userId) return false;
  if (hasAllAccess(userId)) return true;
  return hasQuantumSemesterPass(userId, courseId);
}

export function hasCyberSecurityAccess(
  userId: string | null | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!userId) return false;
  if (hasAllAccess(userId)) return true;
  return hasCyberSemesterPass(userId, courseId);
}

/**
 * Checks whether user can access an entire track.
 * Note: All-Access pass only includes btech, quantum, and cybersecurity tracks.
 * Future unincluded tracks are strictly gated.
 */
export function canAccessTrack(
  userId: string | null | undefined,
  trackSlug: string
): boolean {
  if (!userId) return false;
  const roleCheck = checkUserCourseAccess(userId, trackSlug);
  if (roleCheck.role === "admin") return true;

  const slug = trackSlug.toLowerCase();
  if (slug === "quantum-computing" || slug.includes("quantum")) {
    return hasQuantumAccess(userId);
  }
  if (slug === "cybersecurity" || slug.includes("cyber")) {
    return hasCyberSecurityAccess(userId);
  }
  if (slug.includes("btech") || slug.includes("cse") || slug.includes("aiml")) {
    return hasBtechAccess(userId);
  }

  // If track is not part of the standard All-Access definition, return false
  return false;
}

/**
 * Checks whether user can access a specific course.
 */
export function canAccessCourse(
  userId: string | null | undefined,
  courseSlug: string
): boolean {
  if (!userId) return false;
  const roleCheck = checkUserCourseAccess(userId, courseSlug);
  if (roleCheck.hasAccess) return true;

  const slug = courseSlug.toLowerCase();
  if (slug.includes("quantum")) return hasQuantumAccess(userId, courseSlug);
  if (slug.includes("cybersecurity")) return hasCyberSecurityAccess(userId, courseSlug);
  if (slug.includes("btech") || slug.includes("aiml")) return hasBtechAccess(userId);

  return false;
}

/**
 * Central lesson access check (free preview vs paid access)
 */
export function canAccessLesson(
  userId: string | null | undefined,
  lesson:
    | { isFreePreview?: boolean; is_free_preview?: boolean; slug?: string; id?: string; courseSlug?: string }
    | string
    | null
    | undefined
): boolean {
  if (!lesson) return false;

  if (typeof lesson === "string") {
    if (lesson === "lesson-q1-01" || lesson === "lesson-c1-01") return true;
    if (lesson.startsWith("lesson-q")) return hasQuantumAccess(userId);
    if (lesson.startsWith("lesson-c")) return hasCyberSecurityAccess(userId);
    return hasBtechAccess(userId);
  }

  const isFree = Boolean(
    lesson.isFreePreview ||
      lesson.is_free_preview ||
      lesson.slug === "lesson-q1-01" ||
      lesson.id === "lesson-q1-01" ||
      lesson.slug === "lesson-c1-01" ||
      lesson.id === "lesson-c1-01"
  );
  if (isFree) return true;

  const courseSlug =
    lesson.courseSlug ||
    (lesson.slug?.startsWith("lesson-q")
      ? "quantum-computing-foundations"
      : lesson.slug?.startsWith("lesson-c")
      ? "cybersecurity-foundations-ethical-hacking-soc-ctf"
      : "btech-cse-aiml-sem1");

  return canAccessCourse(userId, courseSlug);
}

/**
 * Central quiz access check
 */
export function canAccessQuiz(
  userId: string | null | undefined,
  quiz:
    | { isFreePreview?: boolean; is_free_preview?: boolean; slug?: string; id?: string; courseSlug?: string }
    | string
    | null
    | undefined
): boolean {
  if (!quiz) return false;

  if (typeof quiz === "string") {
    if (quiz === "quiz-q1-01" || quiz === "quiz-cyber-01") return true;
    if (quiz.includes("quantum") || quiz.startsWith("quiz-q")) return hasQuantumAccess(userId);
    if (quiz.includes("cyber") || quiz.startsWith("quiz-c")) return hasCyberSecurityAccess(userId);
    return hasBtechAccess(userId);
  }

  const isFree = Boolean(
    quiz.isFreePreview ||
      quiz.is_free_preview ||
      quiz.slug === "quiz-q1-01" ||
      quiz.id === "quiz-q1-01" ||
      quiz.slug === "quiz-cyber-01" ||
      quiz.id === "quiz-cyber-01"
  );
  if (isFree) return true;

  const courseSlug =
    quiz.courseSlug ||
    (quiz.slug?.includes("quantum")
      ? "quantum-computing-foundations"
      : quiz.slug?.includes("cyber")
      ? "cybersecurity-foundations-ethical-hacking-soc-ctf"
      : "btech-cse-aiml-sem1");

  return canAccessCourse(userId, courseSlug);
}

/**
 * Central simulation access check
 */
export function canAccessSimulation(
  userId: string | null | undefined,
  simulation:
    | { isFreePreview?: boolean; slug?: string; id?: string; courseSlug?: string }
    | string
    | null
    | undefined
): boolean {
  if (!simulation) return false;

  if (typeof simulation === "string") {
    if (simulation === "bloch-sphere" || simulation === "qubit-visualizer") return true;
    if (simulation.includes("quantum")) return hasQuantumAccess(userId);
    if (simulation.includes("cyber") || simulation.includes("lab")) return hasCyberSecurityAccess(userId);
    return hasBtechAccess(userId);
  }

  if (
    simulation.isFreePreview ||
    simulation.slug === "bloch-sphere" ||
    simulation.slug === "qubit-visualizer"
  ) {
    return true;
  }

  const courseSlug = simulation.courseSlug || "quantum-computing-foundations";
  return canAccessCourse(userId, courseSlug);
}

/**
 * Central mentorship booking check
 */
export function canBookMentorship(
  userId: string | null | undefined,
  courseSlug?: string
): boolean {
  if (!userId) return false;

  const access = checkUserCourseAccess(userId, courseSlug || "all-access");
  if (access.role === "admin" || access.role === "instructor") return true;

  // 1. All-Access mentorship packs
  const allAccessPacks = getAllAccessMentorshipPacks(userId);
  const allAccessAvailable = allAccessPacks.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );
  if (allAccessAvailable > 0) return true;

  // 2. Quantum mentorship packs
  if (!courseSlug || courseSlug.includes("quantum")) {
    const qPacks = getQuantumMentorshipPacks(userId);
    const qAvailable = qPacks.reduce(
      (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
      0
    );
    if (qAvailable > 0) return true;
  }

  // 3. CyberSecurity mentorship packs
  if (!courseSlug || courseSlug.includes("cybersecurity")) {
    const cPacks = getCyberMentorshipPacks(userId);
    const cAvailable = cPacks.reduce(
      (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
      0
    );
    if (cAvailable > 0) return true;
  }

  return false;
}

/**
 * Detailed mentorship entitlement query
 */
export function getMentorshipEntitlement(
  userId: string | null | undefined,
  courseSlug?: string
): {
  totalAvailable: number;
  canBook: boolean;
  packTypes: string[];
} {
  if (!userId) {
    return { totalAvailable: 0, canBook: false, packTypes: [] };
  }

  const allAccessPacks = getAllAccessMentorshipPacks(userId);
  const qPacks = getQuantumMentorshipPacks(userId);
  const cPacks = getCyberMentorshipPacks(userId);

  const allAccessAvailable = allAccessPacks.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );
  const qAvailable = qPacks.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );
  const cAvailable = cPacks.reduce(
    (sum, p) => sum + Math.max(0, p.totalSessions - p.usedSessions),
    0
  );

  let totalAvailable = allAccessAvailable;
  const packTypes: string[] = [];

  if (allAccessAvailable > 0) packTypes.push("all_access");
  if (!courseSlug || courseSlug.includes("quantum")) {
    totalAvailable += qAvailable;
    if (qAvailable > 0) packTypes.push("quantum");
  }
  if (!courseSlug || courseSlug.includes("cybersecurity")) {
    totalAvailable += cAvailable;
    if (cAvailable > 0) packTypes.push("cybersecurity");
  }

  return {
    totalAvailable,
    canBook: totalAvailable > 0,
    packTypes,
  };
}

/**
 * Returns complete unified access summary for a student
 */
export function getUnifiedAccessSummary(
  userId: string | null | undefined
): UnifiedAccessSummary {
  if (!userId) {
    return {
      userId: "",
      hasAllAccess: false,
      hasBtechAccess: false,
      hasQuantumAccess: false,
      hasCyberSecurityAccess: false,
      totalMentorshipSessions: 0,
      activeEnrollmentsCount: 0,
    };
  }

  const allAccess = hasAllAccess(userId);
  const btech = hasBtechAccess(userId);
  const quantum = hasQuantumAccess(userId);
  const cyber = hasCyberSecurityAccess(userId);

  const entitlements = getAllAccessEntitlements(userId);
  const activeAllAccess = entitlements.find((e) => e.status === "active");

  const mentorship = getMentorshipEntitlement(userId);

  let activeCount = 0;
  if (btech) activeCount++;
  if (quantum) activeCount++;
  if (cyber) activeCount++;

  return {
    userId,
    hasAllAccess: allAccess,
    hasBtechAccess: btech,
    hasQuantumAccess: quantum,
    hasCyberSecurityAccess: cyber,
    allAccessEntitlement: activeAllAccess,
    totalMentorshipSessions: mentorship.totalAvailable,
    activeEnrollmentsCount: activeCount,
  };
}
