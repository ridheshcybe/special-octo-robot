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

export interface MentorshipSessionItem {
  id: string;
  courseSlug: string;
  instructorSlug: string;
  studentName: string;
  studentEmail: string;
  sessionType: "mentorship" | "interview_prep" | "doubt_clearing";
  scheduledAt: string;
  durationMinutes: number;
  meetingUrl?: string;
  status: "requested" | "confirmed" | "completed" | "cancelled" | "rescheduled";
  studentNotes: string;
  instructorNotes: string;
}

interface TrackStoreState {
  tracks: Track[];
  instructors: Instructor[];
  courses: Course[];
  modules: CourseModule[];
  lessons: CourseLesson[];
  simulations: QuantumSimulationMeta[];
  mentorshipSessions: MentorshipSessionItem[];
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
      return cachedState!;
    }
  } catch (err) {
    console.error("[TrackStore] Error loading CMS data:", err);
  }

  // Fallback defaults if file read fails
  cachedState = {
    tracks: [
      {
        id: "11111111-2222-3333-4444-555555550001",
        slug: "btech-cse-aiml",
        title: "B.Tech CSE AI/ML",
        description: "University-aligned engineering curriculum covering Semester 1 through graduation.",
        icon: "terminal",
        status: "published",
        displayOrder: 1,
        courseCount: 6,
        badge: "Active Semester 1",
      },
      {
        id: "11111111-2222-3333-4444-555555550002",
        slug: "quantum-computing",
        title: "Quantum Computing",
        description: "From Hilbert spaces and Bloch spheres to quantum algorithms and Qiskit.",
        icon: "cpu",
        status: "published",
        displayOrder: 2,
        courseCount: 1,
        badge: "Phase Q1 Live",
      },
      {
        id: "11111111-2222-3333-4444-555555550003",
        slug: "cybersecurity",
        title: "CyberSecurity",
        description: "Defensive security engineering, cryptographic protocols, cloud penetration testing.",
        icon: "shield",
        status: "coming_soon",
        displayOrder: 3,
        courseCount: 0,
        badge: "Coming Soon",
      },
    ],
    instructors: [],
    courses: [],
    modules: [],
    lessons: [],
    simulations: [],
    mentorshipSessions: [],
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
// Public Track Queries
// ----------------------------------------------------------------------------
export function getAllTracks(): Track[] {
  const state = loadState();
  return [...state.tracks].sort((a, b) => a.displayOrder - b.displayOrder);
}

export function getTrackBySlug(slug: string): Track | null {
  const state = loadState();
  return state.tracks.find((t) => t.slug === slug) || null;
}

// ----------------------------------------------------------------------------
// Public Course Queries
// ----------------------------------------------------------------------------
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
    return {
      lesson: null,
      course,
      module: null,
      prevLessonId: null,
      nextLessonId: null,
    };
  }

  const lesson = allCourseLessons[index];
  const moduleObj = state.modules.find((m) => m.id === lesson.moduleId) || null;
  const prevLessonId = index > 0 ? allCourseLessons[index - 1].id : null;
  const nextLessonId = index < allCourseLessons.length - 1 ? allCourseLessons[index + 1].id : null;

  return {
    lesson,
    course,
    module: moduleObj,
    prevLessonId,
    nextLessonId,
  };
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

// ----------------------------------------------------------------------------
// Instructor Content Modifications (Strict Course Scoping)
// ----------------------------------------------------------------------------
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
  // Verify instructor owns this course
  if (
    course.instructorSlug !== instructorIdentifier &&
    course.instructorId !== instructorIdentifier &&
    instructorIdentifier !== "admin"
  ) {
    return { success: false, error: "Unauthorized: Instructors can manage only their own courses" };
  }

  // Update course
  const updatedCourse: Course = {
    ...course,
    ...updates,
    // Status can be updated by instructor to 'draft' or 'under_review'; published requires admin
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
    status: "draft", // AI-generated or newly created content remains draft until approved
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
      status: "draft", // AI/Instructor drafts are unapproved initially
      contentMarkdown: lessonData.contentMarkdown || "",
    };
    state.lessons.push(newLesson);
    persistState();
    return { success: true, lesson: newLesson };
  }
}

// ----------------------------------------------------------------------------
// Entitlement / Access Gate Rule
// ----------------------------------------------------------------------------
export function checkUserCourseAccess(
  userTarget: string | null | undefined,
  courseSlug: string
): { hasAccess: boolean; isFreePreviewOnly: boolean; role: "guest" | "student" | "instructor" | "admin" } {
  if (!userTarget) {
    return { hasAccess: false, isFreePreviewOnly: true, role: "guest" };
  }

  // Admin access
  if (userTarget === "walavalkarridhesh@gmail.com" || userTarget.includes("admin")) {
    return { hasAccess: true, isFreePreviewOnly: false, role: "admin" };
  }

  // Instructor access
  if (userTarget.includes("vaidya") || userTarget.includes("instructor")) {
    return { hasAccess: true, isFreePreviewOnly: false, role: "instructor" };
  }

  // Check student user store
  const allUsers = getAllAppUsers();
  const user = allUsers.find((u) => u.target.toLowerCase() === userTarget.toLowerCase() || u.id === userTarget);

  if (user) {
    // If student has Tier 2 Pro, Tier 3 Unlimited, or quantum pass
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
