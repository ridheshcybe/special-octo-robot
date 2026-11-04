import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCourseModulesAndLessons } from "../../../_lib/trackStore";

interface Props {
  params: Promise<{ courseSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { courseSlug } = await params;
  const { course } = getCourseModulesAndLessons(courseSlug);
  if (!course) return { title: "Curriculum Dashboard | PrepMeUp AI" };
  return {
    title: `Learn: ${course.title} | PrepMeUp AI`,
    description: `Curriculum and study modules for ${course.title}`,
  };
}

export default async function CourseLearnDashboardPage({ params }: Props) {
  const { courseSlug } = await params;
  const { course, modules } = getCourseModulesAndLessons(courseSlug);

  if (!course) {
    notFound();
  }

  return (
    <div className="pmu-root" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#807f78", fontFamily: "monospace", marginBottom: "8px" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
            <span>/</span>
            <Link href="/prepmeup/tracks" style={{ color: "#807f78", textDecoration: "none" }}>Tracks</Link>
            <span>/</span>
            <Link href={`/prepmeup/courses/${course.slug}`} style={{ color: "#ff6a3d", textDecoration: "none" }}>{course.title}</Link>
            <span>/</span>
            <span style={{ color: "#f3f1ea" }}>Study Dashboard</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="pmu-badge">Course Learning Environment</span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#00e676" }}>
                  ⭐ Free Preview Enabled on Module 1.1
                </span>
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(28px, 4.5vw, 42px)", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
                {course.title}
              </h1>
              <p style={{ fontSize: "15px", color: "#807f78", maxWidth: "700px", marginTop: "4px" }}>
                Master quantum mechanics and circuit engineering step by step. Complete lessons, run interactive simulations, and take diagnostic assessments.
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href="/prepmeup/simulations/quantum"
                className="pmu-btn-secondary"
                style={{ padding: "12px 20px", fontSize: "13px" }}
              >
                🔬 Quantum Simulators →
              </Link>
            </div>
          </div>
        </div>

        {/* Free Preview Banner */}
        <div style={{ padding: "20px 24px", backgroundColor: "#111114", border: "1px solid rgba(0, 230, 118, 0.4)", borderRadius: "12px", marginBottom: "28px", display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "center", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ fontSize: "16px" }}>🎁</span>
              <span className="font-mono" style={{ fontSize: "12px", color: "#00e676", fontWeight: "bold", textTransform: "uppercase" }}>
                Free Preview Access Active
              </span>
            </div>
            <p style={{ fontSize: "14px", color: "#f3f1ea", marginTop: "4px" }}>
              Lesson 1.1 (Classical vs Quantum Computing), the Qubit State Visualizer, and Module 1 Diagnostic are unlocked for everyone.
            </p>
          </div>

          <Link
            href="/prepmeup/courses/quantum-computing-foundations/learn/lesson-q1-01"
            className="pmu-btn-primary"
            style={{ padding: "10px 20px", fontSize: "13px", whiteSpace: "nowrap" }}
          >
            Launch Free Lesson 1.1 →
          </Link>
        </div>

        {/* Modules & Lessons Grid */}
        <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
          {modules.map((m) => (
            <div key={m.id} className="pmu-card" style={{ padding: "28px" }}>
              <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "12px", marginBottom: "16px" }}>
                <div>
                  <span className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", letterSpacing: "1px" }}>
                    Module {m.moduleNumber}
                  </span>
                  <h2 className="font-display" style={{ fontSize: "24px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "2px" }}>
                    {m.title}
                  </h2>
                  <p style={{ fontSize: "14px", color: "#807f78", marginTop: "4px" }}>
                    {m.description}
                  </p>
                </div>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  {m.lessons.length} lessons
                </span>
              </div>

              {/* Lessons List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {m.lessons.map((lesson) => (
                  <Link
                    key={lesson.id}
                    href={`/prepmeup/courses/${course.slug}/learn/${lesson.id}`}
                    style={{ textDecoration: "none" }}
                  >
                    <div
                      style={{
                        padding: "16px 20px",
                        backgroundColor: lesson.isFreePreview ? "rgba(0, 230, 118, 0.05)" : "#08080a",
                        border: `1px solid ${lesson.isFreePreview ? "rgba(0, 230, 118, 0.4)" : "rgba(243, 241, 234, 0.08)"}`,
                        borderRadius: "8px",
                        display: "flex",
                        flexWrap: "wrap",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "12px",
                        transition: "border-color 0.2s",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span
                          className="font-mono"
                          style={{
                            fontSize: "13px",
                            fontWeight: "bold",
                            color: lesson.isFreePreview ? "#00e676" : "#ff6a3d",
                            width: "32px",
                          }}
                        >
                          {lesson.moduleNumber}.{lesson.lessonNumber}
                        </span>

                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            <span style={{ fontSize: "15px", color: "#f3f1ea", fontWeight: lesson.isFreePreview ? 600 : 400 }}>
                              {lesson.title}
                            </span>
                            {lesson.isFreePreview && (
                              <span style={{ fontSize: "10px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#00e676", color: "#08080a", fontWeight: "bold" }}>
                                FREE PREVIEW
                              </span>
                            )}
                          </div>
                          <p style={{ fontSize: "13px", color: "#807f78", marginTop: "2px" }}>
                            {lesson.description}
                          </p>
                        </div>
                      </div>

                      <div style={{ display: "flex", alignItems: "center", gap: "14px" }}>
                        <span className="pmu-badge" style={{ backgroundColor: "#17171b", color: "#807f78", fontSize: "11px" }}>
                          {lesson.lessonType.toUpperCase()}
                        </span>
                        <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                          {lesson.duration}
                        </span>
                        <span style={{ fontSize: "14px", color: lesson.isFreePreview ? "#00e676" : "#807f78" }}>
                          {lesson.isFreePreview ? "Start →" : "🔒"}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
