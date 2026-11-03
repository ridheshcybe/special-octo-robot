"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Course, CourseModule, CourseLesson, Instructor, MentorshipSessionItem } from "../_lib/trackStore";
import { AppUser } from "../_lib/studentStore";

interface Props {
  instructor: Instructor | null;
  courses: Course[];
  modules: Array<CourseModule & { lessons: CourseLesson[] }>;
  mentorshipRequests: MentorshipSessionItem[];
  students: AppUser[];
  isAdmin: boolean;
}

type TabType =
  | "courses"
  | "create_course"
  | "modules"
  | "students"
  | "mentorship"
  | "quizzes"
  | "workflow";

export function InstructorDashboardClient({
  instructor,
  courses: initialCourses,
  modules: initialModules,
  mentorshipRequests: initialRequests,
  students,
  isAdmin,
}: Props) {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>("courses");
  const [courses, setCourses] = useState<Course[]>(initialCourses);
  const [modules, setModules] = useState(initialModules);
  const [requests, setRequests] = useState<MentorshipSessionItem[]>(initialRequests);

  // Form states
  const [newCourseTitle, setNewCourseTitle] = useState("");
  const [newCourseSubtitle, setNewCourseSubtitle] = useState("");
  const [newCoursePrereq, setNewCoursePrereq] = useState("Basic Python");
  const [newCourseLevel, setNewCourseLevel] = useState<"beginner" | "intermediate" | "advanced">("intermediate");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState("");

  // New Lesson form state
  const [selectedModuleId, setSelectedModuleId] = useState(modules[0]?.id || "");
  const [newLessonTitle, setNewLessonTitle] = useState("");
  const [newLessonType, setNewLessonType] = useState<"video" | "pdf" | "quiz" | "simulation" | "coding_lab">("video");
  const [newLessonDesc, setNewLessonDesc] = useState("");

  const handleLogout = async () => {
    await fetch("/api/prepmeup/instructor/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "logout" }),
    });
    router.push("/prepmeup/instructor/login");
    router.refresh();
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCourseTitle.trim()) return;

    setIsSubmitting(true);
    setFeedbackMsg("");

    try {
      const slug = newCourseTitle
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

      const res = await fetch("/api/prepmeup/instructor/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "create_course",
          courseData: {
            slug,
            trackSlug: "quantum-computing",
            title: newCourseTitle,
            subtitle: newCourseSubtitle,
            description: "Advanced curriculum draft developed by faculty. Pending admin publishing review.",
            level: newCourseLevel,
            language: "English",
            format: "hybrid",
            prerequisite: newCoursePrereq,
            thumbnailUrl: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?auto=format&fit=crop&w=1200&q=80",
            isFreePreviewEnabled: true,
            durationHours: 12,
            totalLessons: 4,
            simulationsCount: 1,
            quizzesCount: 1,
            includesMentorship: true,
            includesCertificate: true,
            priceInr: 299,
            tools: ["Qiskit", "PennyLane"],
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to create course");

      setCourses((prev) => [...prev, data.course]);
      setFeedbackMsg(`✓ Course "${data.course.title}" created in DRAFT status! Pending admin review.`);
      setNewCourseTitle("");
      setNewCourseSubtitle("");
      setActiveTab("courses");
    } catch (err: any) {
      setFeedbackMsg(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLessonTitle.trim() || !selectedModuleId) return;

    setIsSubmitting(true);
    setFeedbackMsg("");

    try {
      const res = await fetch("/api/prepmeup/instructor/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "save_lesson",
          courseSlug: "quantum-computing-foundations",
          lessonData: {
            moduleId: selectedModuleId,
            title: newLessonTitle,
            description: newLessonDesc || "Curated faculty lesson content.",
            lessonType: newLessonType,
            duration: "15 min",
            isFreePreview: false,
            contentMarkdown: `### ${newLessonTitle}\n\nFaculty lesson draft created in instructor portal.`,
          },
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to add lesson");

      setFeedbackMsg(`✓ Lesson "${data.lesson.title}" saved in DRAFT status!`);
      setNewLessonTitle("");
      setNewLessonDesc("");
    } catch (err: any) {
      setFeedbackMsg(`Error: ${err.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateSessionStatus = async (sessionId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/prepmeup/instructor/manage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "update_mentorship_status",
          sessionId,
          sessionStatus: newStatus,
        }),
      });

      const data = await res.json();
      if (data.ok) {
        setRequests((prev) =>
          prev.map((s) => (s.id === sessionId ? { ...s, status: newStatus as any } : s))
        );
      }
    } catch {}
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Faculty Header Card */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
            <div style={{ width: "64px", height: "64px", borderRadius: "50%", overflow: "hidden", border: "2px solid #ff3b1d", flexShrink: 0 }}>
              <img
                src={instructor?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80"}
                alt={instructor?.fullName || "Faculty"}
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </div>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="pmu-badge" style={{ backgroundColor: "rgba(0, 230, 118, 0.15)", color: "#00e676" }}>
                  Verified Instructor
                </span>
                {isAdmin && (
                  <span className="pmu-badge" style={{ backgroundColor: "rgba(255, 59, 29, 0.15)", color: "#ff6a3d" }}>
                    Admin Privileges
                  </span>
                )}
              </div>
              <h1 className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "4px" }}>
                {instructor?.fullName || "Faculty Portal"}
              </h1>
              <p style={{ fontSize: "13px", color: "#807f78" }}>
                {instructor?.title || "Quantum Track Lead"}
              </p>
            </div>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/prepmeup/courses/quantum-computing-foundations"
              className="pmu-btn-secondary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              Public Course Page ↗
            </Link>
            <button
              onClick={handleLogout}
              className="pmu-btn-secondary"
              style={{ padding: "8px 16px", fontSize: "12px", color: "#ff3b1d", borderColor: "#ff3b1d" }}
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "24px", borderTop: "1px solid rgba(243, 241, 234, 0.08)", paddingTop: "16px" }}>
          {[
            { id: "courses", label: `My Courses (${courses.length})` },
            { id: "create_course", label: "+ Create Course" },
            { id: "modules", label: "Modules & Lessons" },
            { id: "students", label: `Students (${students.length})` },
            { id: "mentorship", label: `Mentorship Requests (${requests.length})` },
            { id: "quizzes", label: "Quiz Performance" },
            { id: "workflow", label: "Course Status" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as TabType);
                setFeedbackMsg("");
              }}
              className={activeTab === tab.id ? "pmu-btn-primary" : "pmu-btn-secondary"}
              style={{ padding: "8px 16px", fontSize: "13px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {feedbackMsg && (
        <div style={{ padding: "14px 18px", backgroundColor: "#111114", border: "1px solid #00e676", borderRadius: "8px", color: "#00e676", fontSize: "13px", fontFamily: "monospace" }}>
          {feedbackMsg}
        </div>
      )}

      {/* Tab 1: My Courses */}
      {activeTab === "courses" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase" }}>
              Assigned Courses (Scoped to Faculty)
            </h2>
            <button
              onClick={() => setActiveTab("create_course")}
              className="pmu-btn-primary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              + Create New Course Draft
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
            {courses.map((c) => (
              <div key={c.slug} className="pmu-card" style={{ padding: "24px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span
                    className="pmu-badge"
                    style={{
                      backgroundColor: c.status === "published" ? "rgba(0, 230, 118, 0.15)" : "rgba(255, 106, 61, 0.15)",
                      color: c.status === "published" ? "#00e676" : "#ff6a3d",
                    }}
                  >
                    {c.status.toUpperCase()}
                  </span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                    ₹{c.priceInr}
                  </span>
                </div>

                <h3 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "10px" }}>
                  {c.title}
                </h3>
                <p style={{ fontSize: "13px", color: "#807f78", marginTop: "4px" }}>
                  {c.subtitle}
                </p>

                <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#08080a", borderRadius: "6px", display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: "monospace", color: "#807f78" }}>
                  <span>{c.totalLessons} Lessons</span>
                  <span>{c.simulationsCount} Simulators</span>
                  <span>{c.quizzesCount} Quizzes</span>
                </div>

                <div style={{ marginTop: "16px", display: "flex", gap: "8px" }}>
                  <Link
                    href={`/prepmeup/courses/${c.slug}/learn`}
                    className="pmu-btn-primary"
                    style={{ flex: 1, padding: "8px", fontSize: "12px", textAlign: "center", textDecoration: "none" }}
                  >
                    Curriculum →
                  </Link>
                  <button
                    onClick={() => setActiveTab("modules")}
                    className="pmu-btn-secondary"
                    style={{ padding: "8px 12px", fontSize: "12px" }}
                  >
                    Manage Lessons
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Create Course */}
      {activeTab === "create_course" && (
        <div className="pmu-card" style={{ padding: "32px", maxWidth: "700px" }}>
          <h2 className="font-display" style={{ fontSize: "24px", color: "#f3f1ea", textTransform: "uppercase" }}>
            Create Course Draft
          </h2>
          <p style={{ fontSize: "13px", color: "#807f78", marginTop: "4px" }}>
            Faculty courses are saved in <strong>DRAFT</strong> status until approved and published by platform administration.
          </p>

          <form onSubmit={handleCreateCourse} style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "20px" }}>
            <div>
              <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                Course Title
              </label>
              <input
                type="text"
                value={newCourseTitle}
                onChange={(e) => setNewCourseTitle(e.target.value)}
                placeholder="e.g. Variational Quantum Eigensolvers & VQE"
                required
                className="pmu-input"
                style={{ width: "100%", marginTop: "6px", padding: "10px 14px", backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.15)", borderRadius: "6px", color: "#f3f1ea" }}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                Course Subtitle
              </label>
              <input
                type="text"
                value={newCourseSubtitle}
                onChange={(e) => setNewCourseSubtitle(e.target.value)}
                placeholder="e.g. Hybrid Quantum-Classical Optimization in Qiskit"
                required
                className="pmu-input"
                style={{ width: "100%", marginTop: "6px", padding: "10px 14px", backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.15)", borderRadius: "6px", color: "#f3f1ea" }}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                Target Difficulty Level
              </label>
              <select
                value={newCourseLevel}
                onChange={(e) => setNewCourseLevel(e.target.value as any)}
                style={{ width: "100%", marginTop: "6px", padding: "10px 14px", backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.15)", borderRadius: "6px", color: "#f3f1ea" }}
              >
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                Prerequisites
              </label>
              <input
                type="text"
                value={newCoursePrereq}
                onChange={(e) => setNewCoursePrereq(e.target.value)}
                placeholder="e.g. Basic Python & Linear Algebra"
                className="pmu-input"
                style={{ width: "100%", marginTop: "6px", padding: "10px 14px", backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.15)", borderRadius: "6px", color: "#f3f1ea" }}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="pmu-btn-primary"
              style={{ width: "100%", padding: "12px", marginTop: "8px" }}
            >
              {isSubmitting ? "Creating Draft..." : "Create Course in Draft Status →"}
            </button>
          </form>
        </div>
      )}

      {/* Tab 3: Modules and Lessons */}
      {activeTab === "modules" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "24px" }}>
          {/* Module List & Add Lesson */}
          <div className="pmu-card" style={{ padding: "26px" }}>
            <h2 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", textTransform: "uppercase" }}>
              Add Lesson to Module
            </h2>

            <form onSubmit={handleCreateLesson} style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "16px" }}>
              <div>
                <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                  Select Target Module
                </label>
                <select
                  value={selectedModuleId}
                  onChange={(e) => setSelectedModuleId(e.target.value)}
                  style={{ width: "100%", marginTop: "6px", padding: "10px", backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.15)", borderRadius: "6px", color: "#f3f1ea" }}
                >
                  {modules.map((m) => (
                    <option key={m.id} value={m.id}>
                      Module {m.moduleNumber}: {m.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                  Lesson Title
                </label>
                <input
                  type="text"
                  value={newLessonTitle}
                  onChange={(e) => setNewLessonTitle(e.target.value)}
                  placeholder="e.g. Constructing Parameterized Quantum Circuits"
                  required
                  style={{ width: "100%", marginTop: "6px", padding: "10px", backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.15)", borderRadius: "6px", color: "#f3f1ea" }}
                />
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                  Lesson Format
                </label>
                <select
                  value={newLessonType}
                  onChange={(e) => setNewLessonType(e.target.value as any)}
                  style={{ width: "100%", marginTop: "6px", padding: "10px", backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.15)", borderRadius: "6px", color: "#f3f1ea" }}
                >
                  <option value="video">Video Lecture</option>
                  <option value="pdf">Theoretical PDF / Notes</option>
                  <option value="simulation">Interactive Simulator</option>
                  <option value="coding_lab">Qiskit Coding Lab</option>
                  <option value="quiz">Diagnostic Quiz</option>
                </select>
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                  Description / Abstract
                </label>
                <textarea
                  value={newLessonDesc}
                  onChange={(e) => setNewLessonDesc(e.target.value)}
                  rows={3}
                  placeholder="Summary of learning objectives and derivations..."
                  style={{ width: "100%", marginTop: "6px", padding: "10px", backgroundColor: "#08080a", border: "1px solid rgba(243, 241, 234, 0.15)", borderRadius: "6px", color: "#f3f1ea", fontSize: "13px" }}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="pmu-btn-primary"
                style={{ width: "100%", padding: "12px", marginTop: "6px" }}
              >
                {isSubmitting ? "Adding Lesson..." : "Save Lesson (Draft) →"}
              </button>
            </form>
          </div>

          {/* Existing Modules Summary */}
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {modules.map((m) => (
              <div key={m.id} className="pmu-card" style={{ padding: "18px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase" }}>
                    Module {m.moduleNumber}
                  </span>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                    {m.lessons.length} lessons
                  </span>
                </div>
                <h3 className="font-display" style={{ fontSize: "18px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "4px" }}>
                  {m.title}
                </h3>

                <div style={{ marginTop: "10px", display: "flex", flexDirection: "column", gap: "6px" }}>
                  {m.lessons.slice(0, 3).map((l) => (
                    <div key={l.id} style={{ fontSize: "12px", color: "#807f78", display: "flex", justifyContent: "space-between" }}>
                      <span>• {l.title}</span>
                      <span className="font-mono" style={{ color: l.isFreePreview ? "#00e676" : "#807f78" }}>
                        {l.isFreePreview ? "FREE PREVIEW" : "PAID"}
                      </span>
                    </div>
                  ))}
                  {m.lessons.length > 3 && (
                    <span style={{ fontSize: "11px", color: "#ff6a3d" }}>+{m.lessons.length - 3} more lessons</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Students */}
      {activeTab === "students" && (
        <div className="pmu-card" style={{ padding: "28px" }}>
          <h2 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase", marginBottom: "16px" }}>
            Enrolled Student Cohort ({students.length})
          </h2>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(243, 241, 234, 0.1)", textAlign: "left" }}>
                  <th style={{ padding: "12px", color: "#ff6a3d", fontFamily: "monospace" }}>Student</th>
                  <th style={{ padding: "12px", color: "#ff6a3d", fontFamily: "monospace" }}>Email / ID</th>
                  <th style={{ padding: "12px", color: "#ff6a3d", fontFamily: "monospace" }}>Tier</th>
                  <th style={{ padding: "12px", color: "#ff6a3d", fontFamily: "monospace" }}>Status</th>
                  <th style={{ padding: "12px", color: "#ff6a3d", fontFamily: "monospace" }}>Activity</th>
                </tr>
              </thead>
              <tbody>
                {students.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(243, 241, 234, 0.05)" }}>
                    <td style={{ padding: "12px", color: "#f3f1ea", fontWeight: "bold" }}>{u.name}</td>
                    <td style={{ padding: "12px", color: "#807f78", fontFamily: "monospace" }}>{u.target}</td>
                    <td style={{ padding: "12px" }}>
                      <span className="pmu-badge" style={{ fontSize: "10px" }}>{u.tier}</span>
                    </td>
                    <td style={{ padding: "12px", color: u.isOnline ? "#00e676" : "#807f78" }}>
                      {u.isOnline ? "● Active Now" : "Offline"}
                    </td>
                    <td style={{ padding: "12px", color: "#807f78", fontSize: "12px" }}>{u.lastActivity}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Mentorship Requests */}
      {activeTab === "mentorship" && (
        <div className="pmu-card" style={{ padding: "28px" }}>
          <h2 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase", marginBottom: "16px" }}>
            1:1 Mentorship & Interview Prep Requests ({requests.length})
          </h2>

          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {requests.map((req) => (
              <div key={req.id} style={{ padding: "20px", backgroundColor: "#08080a", borderRadius: "10px", border: "1px solid rgba(243, 241, 234, 0.1)" }}>
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <span className="pmu-badge" style={{ backgroundColor: req.status === "confirmed" ? "rgba(0, 230, 118, 0.15)" : "rgba(255, 106, 61, 0.15)", color: req.status === "confirmed" ? "#00e676" : "#ff6a3d" }}>
                        {req.status.toUpperCase()}
                      </span>
                      <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                        Type: {req.sessionType.toUpperCase()} ({req.durationMinutes} min)
                      </span>
                    </div>

                    <h3 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", marginTop: "8px" }}>
                      {req.studentName} ({req.studentEmail})
                    </h3>
                    <p style={{ fontSize: "13px", color: "#807f78", marginTop: "4px" }}>
                      <strong>Student Goal:</strong> {req.studentNotes}
                    </p>
                    <p style={{ fontSize: "13px", color: "#807f78", marginTop: "2px" }}>
                      <strong>Instructor Agenda:</strong> {req.instructorNotes}
                    </p>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    {req.status !== "confirmed" && (
                      <button
                        onClick={() => updateSessionStatus(req.id, "confirmed")}
                        className="pmu-btn-primary"
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                      >
                        Confirm Slot
                      </button>
                    )}
                    {req.status !== "completed" && (
                      <button
                        onClick={() => updateSessionStatus(req.id, "completed")}
                        className="pmu-btn-secondary"
                        style={{ padding: "6px 14px", fontSize: "12px" }}
                      >
                        Mark Completed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Quiz Performance */}
      {activeTab === "quizzes" && (
        <div className="pmu-card" style={{ padding: "28px" }}>
          <h2 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase", marginBottom: "16px" }}>
            Course Diagnostic Quizzes (5 Module Assessments)
          </h2>
          <p style={{ fontSize: "13px", color: "#807f78", marginBottom: "20px" }}>
            Quizzes are currently in <strong>DRAFT</strong> status until faculty verifies answer distributions.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {[
              { num: 1, title: "Quantum Essentials & Bloch Sphere", preview: true },
              { num: 2, title: "Unitary Gates & Circuit Construction", preview: false },
              { num: 3, title: "Entanglement, Bell States & EPR", preview: false },
              { num: 4, title: "Quantum Oracles & Grover Search", preview: false },
              { num: 5, title: "Qiskit Circuit Engineering", preview: false },
            ].map((q) => (
              <div key={q.num} style={{ padding: "18px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d" }}>Module {q.num}</span>
                  <span className="pmu-badge" style={{ backgroundColor: "#17171b", color: "#807f78", fontSize: "10px" }}>DRAFT</span>
                </div>
                <h4 className="font-display" style={{ fontSize: "18px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
                  {q.title}
                </h4>
                <div style={{ marginTop: "12px", display: "flex", justifyContent: "space-between", fontSize: "12px", fontFamily: "monospace", color: "#807f78" }}>
                  <span>5 Questions</span>
                  <span>Pass: 60%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 7: Course Status & Workflow */}
      {activeTab === "workflow" && (
        <div className="pmu-card" style={{ padding: "32px", maxWidth: "800px" }}>
          <h2 className="font-display" style={{ fontSize: "24px", color: "#f3f1ea", textTransform: "uppercase" }}>
            Curriculum Lifecycle & Publishing Workflow
          </h2>
          <p style={{ fontSize: "14px", color: "#807f78", marginTop: "6px" }}>
            PrepMeUp AI maintains strict academic honesty and verification rules:
          </p>

          <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ padding: "16px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
              <div className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d", textTransform: "uppercase" }}>
                1. Faculty Draft Creation
              </div>
              <p style={{ fontSize: "13px", color: "#f3f1ea", marginTop: "4px" }}>
                Instructors formulate lesson syllabi, upload problem sets, or use the AI Simulator Generator. All content starts in <code>draft</code> status.
              </p>
            </div>

            <div style={{ padding: "16px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
              <div className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d", textTransform: "uppercase" }}>
                2. Academic Quality Review
              </div>
              <p style={{ fontSize: "13px", color: "#f3f1ea", marginTop: "4px" }}>
                LaTeX math equations, circuit truth tables, and Qiskit code syntax are verified against academic standards.
              </p>
            </div>

            <div style={{ padding: "16px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(0, 230, 118, 0.3)" }}>
              <div className="font-mono" style={{ fontSize: "12px", color: "#00e676", textTransform: "uppercase" }}>
                3. Admin Publication
              </div>
              <p style={{ fontSize: "13px", color: "#f3f1ea", marginTop: "4px" }}>
                Platform administrators approve and publish the course to the public multi-track catalog.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
