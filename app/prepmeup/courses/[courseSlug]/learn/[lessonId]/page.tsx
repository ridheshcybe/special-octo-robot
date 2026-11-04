import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cookies } from "next/headers";
import { getLessonById, checkUserCourseAccess } from "../../../../_lib/trackStore";
import { canAccessQuantumLesson } from "@/lib/prepmeup/access";
import { RichMathMarkdown } from "@/app/prepmeup/_components/RichMathMarkdown";

interface Props {
  params: Promise<{ courseSlug: string; lessonId: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { courseSlug, lessonId } = await params;
  const { lesson, course } = getLessonById(courseSlug, lessonId);
  if (!lesson || !course) return { title: "Lesson | PrepMeUp AI" };
  return {
    title: `${lesson.title} — ${course.title} | PrepMeUp AI`,
    description: lesson.description,
  };
}

export default async function LessonViewerPage({ params }: Props) {
  const { courseSlug, lessonId } = await params;
  const { lesson, course, module: moduleObj, prevLessonId, nextLessonId } = getLessonById(courseSlug, lessonId);

  if (!lesson || !course) {
    notFound();
  }

  // Check user entitlement
  const cookieStore = await cookies();
  const studentSession = cookieStore.get("pmu_student_session");
  const adminSession = cookieStore.get("pmu_admin_session");
  const instructorSession = cookieStore.get("pmu_instructor_session");

  let userIdentifier: string | null = null;
  if (adminSession?.value) {
    userIdentifier = "admin";
  } else if (instructorSession?.value) {
    userIdentifier = "instructor";
  } else if (studentSession?.value) {
    try {
      const parsed = JSON.parse(studentSession.value);
      userIdentifier = parsed.userId || parsed.email || parsed.phone;
    } catch {}
  }

  const access = checkUserCourseAccess(userIdentifier, courseSlug);
  const isLocked = !lesson.isFreePreview && !access.hasAccess;
  // Central access verification
  const isAuthorized = canAccessQuantumLesson(userIdentifier, lesson, courseSlug);

  return (
    <div className="pmu-root" style={{ minHeight: "100vh", padding: "32px 20px" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#807f78", fontFamily: "monospace", marginBottom: "8px" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
            <span>/</span>
            <Link href="/prepmeup/tracks" style={{ color: "#807f78", textDecoration: "none" }}>Tracks</Link>
            <span>/</span>
            <Link href={`/prepmeup/courses/${course.slug}`} style={{ color: "#807f78", textDecoration: "none" }}>{course.title}</Link>
            <span>/</span>
            <Link href={`/prepmeup/courses/${course.slug}/learn`} style={{ color: "#ff6a3d", textDecoration: "none" }}>Syllabus</Link>
            <span>/</span>
            <span style={{ color: "#f3f1ea" }}>Lesson {lesson.moduleNumber}.{lesson.lessonNumber}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="pmu-badge">
                  Module {lesson.moduleNumber} • Lesson {lesson.lessonNumber}
                </span>
                {lesson.isFreePreview ? (
                  <span
                    className="pmu-badge"
                    style={{
                      backgroundColor: "rgba(0, 230, 118, 0.15)",
                      color: "#00e676",
                      borderColor: "rgba(0, 230, 118, 0.4)",
                    }}
                  >
                    ⭐ FREE PREVIEW
                  </span>
                ) : (
                  <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                    🔒 Enrolled Members
                  </span>
                )}
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  {lesson.duration}
                </span>
              </div>

              <h1 className="font-display" style={{ fontSize: "clamp(26px, 4vw, 38px)", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
                {lesson.title}
              </h1>
              <p style={{ fontSize: "15px", color: "#807f78", marginTop: "4px" }}>
                {lesson.description}
              </p>
            </div>

            {/* Back to syllabus */}
            <Link
              href={`/prepmeup/courses/${course.slug}/learn`}
              className="pmu-btn-secondary"
              style={{ padding: "8px 16px", fontSize: "12px" }}
            >
              ← Syllabus List
            </Link>
          </div>
        </div>

        {/* Lesson Body Content or Locked Overlay */}
        {isLocked ? (
          <div className="pmu-card" style={{ padding: "48px 32px", textAlign: "center", border: "1px solid rgba(255, 59, 29, 0.4)" }}>
            <div style={{ fontSize: "48px", marginBottom: "16px" }}>🔒</div>
            <span className="pmu-badge" style={{ backgroundColor: "rgba(255, 59, 29, 0.15)", color: "#ff6a3d" }}>
              Enrolled Members Only
            </span>
            <h2 className="font-display" style={{ fontSize: "32px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "12px" }}>
              This Lesson Is Locked
            </h2>
            <p style={{ fontSize: "15px", color: "#807f78", maxWidth: "560px", margin: "10px auto 0", lineHeight: "1.6" }}>
              &quot;{lesson.title}&quot; is part of the comprehensive {course.title} curriculum. Unlock full access to all 5 modules, interactive simulations, live 1:1 mentorship, and course certificates.
            </p>

            <div style={{ marginTop: "24px", display: "flex", justifyContent: "center", gap: "14px", flexWrap: "wrap" }}>
              <Link href="/prepmeup/quantum/pricing" className="pmu-btn-primary" style={{ padding: "14px 28px", fontSize: "14px" }}>
                Unlock Quantum Track (₹{course.priceInr}) →
              </Link>
              <Link href={`/prepmeup/courses/${course.slug}/learn/lesson-q1-01`} className="pmu-btn-secondary" style={{ padding: "14px 24px", fontSize: "14px" }}>
                Try Free Preview Lesson 1.1
              </Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Interactive Media Container (Video / PDF / Simulator) */}
            {lesson.lessonType === "video" && lesson.videoUrl && (
              <div className="pmu-card" style={{ padding: "12px", overflow: "hidden", backgroundColor: "#08080a" }}>
                <div style={{ position: "relative", paddingBottom: "56.25%", height: 0, overflow: "hidden", borderRadius: "8px" }}>
                  <iframe
                    src={lesson.videoUrl}
                    title={lesson.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", border: 0 }}
                  />
                </div>
              </div>
            )}

            {/* Related Tools & Interactivities Row */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px" }}>
              {lesson.simulationSlug && (
                <Link
                  href="/prepmeup/simulations/quantum"
                  className="pmu-card"
                  style={{
                    flex: 1,
                    minWidth: "260px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    textDecoration: "none",
                    border: "1px solid rgba(0, 230, 118, 0.4)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>🔬</span>
                    <div>
                      <div className="font-mono" style={{ fontSize: "11px", color: "#00e676", textTransform: "uppercase" }}>
                        Interactive Simulation Ready
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#f3f1ea" }}>
                        Launch Quantum Visualizer
                      </div>
                    </div>
                  </div>
                  <span style={{ color: "#00e676", fontSize: "18px" }}>→</span>
                </Link>
              )}

              {lesson.quizId && (
                <div
                  className="pmu-card"
                  style={{
                    flex: 1,
                    minWidth: "260px",
                    padding: "16px 20px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    border: "1px solid rgba(255, 106, 61, 0.4)",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <span style={{ fontSize: "24px" }}>📝</span>
                    <div>
                      <div className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase" }}>
                        Module Diagnostic Quiz
                      </div>
                      <div style={{ fontSize: "14px", fontWeight: "bold", color: "#f3f1ea" }}>
                        Module {lesson.moduleNumber} Assessment (Draft)
                      </div>
                    </div>
                  </div>
                  <span className="pmu-badge" style={{ backgroundColor: "#17171b", color: "#807f78", fontSize: "11px" }}>
                    Ready for Review
                  </span>
                </div>
              )}
            </div>

            {/* Structured Lesson Content Markdown */}
            {lesson.contentMarkdown && (
              <div className="pmu-card" style={{ padding: "36px" }}>
                <RichMathMarkdown content={lesson.contentMarkdown} />
              </div>
            )}

            {/* Note on downloading per requirement */}
            <div style={{ padding: "12px 18px", backgroundColor: "#111114", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)", display: "flex", alignItems: "center", gap: "10px", fontSize: "12px", color: "#807f78" }}>
              <span>🛡️</span>
              <span>Proprietary PrepMeUp Quantum Course Material. Streaming & in-browser interactive inspection only (no downloads permitted).</span>
            </div>
          </div>
        )}

        {/* Previous / Next Lesson Navigation Footer */}
        <div style={{ marginTop: "32px", display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid rgba(243, 241, 234, 0.1)", paddingTop: "20px" }}>
          {prevLessonId ? (
            <Link
              href={`/prepmeup/courses/${course.slug}/learn/${prevLessonId}`}
              className="pmu-btn-secondary"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              ← Previous Lesson
            </Link>
          ) : (
            <div />
          )}

          {nextLessonId ? (
            <Link
              href={`/prepmeup/courses/${course.slug}/learn/${nextLessonId}`}
              className="pmu-btn-primary"
              style={{ padding: "10px 20px", fontSize: "13px" }}
            >
              Next Lesson →
            </Link>
          ) : (
            <Link
              href={`/prepmeup/courses/${course.slug}/learn`}
              className="pmu-btn-secondary"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              Complete Curriculum ✓
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
