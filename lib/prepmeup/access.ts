import {
  getQuantumEnrollment,
  getQuantumMentorshipPacks,
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
 * Checks whether user can access a specific CyberSecurity lab
 */
export function canAccessCyberLab(
  userId: string | null | undefined,
  lab: { isFreePreview?: boolean } | null | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!lab) return false;
  if (lab.isFreePreview) return true;
  if (!userId) return false;
  const access = checkUserCourseAccess(userId, courseId);
  return access.hasAccess;
}

/**
 * Checks whether user can view a specific CyberSecurity lesson
 */
export function canAccessCyberLesson(
  userId: string | null | undefined,
  lesson: { isFreePreview?: boolean } | null | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!lesson) return false;
  if (lesson.isFreePreview) return true;
  if (!userId) return false;
  const access = checkUserCourseAccess(userId, courseId);
  return access.hasAccess;
}

/**
 * Checks whether user can access a specific CyberSecurity incident case
 */
export function canAccessCyberIncidentCase(
  userId: string | null | undefined,
  incidentCase: { isFreePreview?: boolean } | null | undefined,
  courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf"
): boolean {
  if (!incidentCase) return false;
  if (incidentCase.isFreePreview) return true;
  if (!userId) return false;
  const access = checkUserCourseAccess(userId, courseId);
  return access.hasAccess;
}
