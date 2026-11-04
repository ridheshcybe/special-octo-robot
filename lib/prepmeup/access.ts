import {
  getQuantumEnrollment,
  getQuantumMentorshipPacks,
  getCyberEnrollment,
  getCyberMentorshipPacks,
  checkUserCourseAccess,
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

  return totalAvailable > 0;
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

  return totalAvailable > 0;
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
