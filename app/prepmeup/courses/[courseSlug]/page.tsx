import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getCourseBySlug,
  getCourseModulesAndLessons,
  getInstructorBySlug,
} from "../../_lib/trackStore";

interface Props {
  params: Promise<{ courseSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { courseSlug } = await params;
  const course = getCourseBySlug(courseSlug);
  if (!course) return { title: "Course Not Found | PrepMeUp AI" };
  return {
    title: `${course.title} | PrepMeUp AI`,
    description: course.description,
  };
}

export default async function CourseDetailPage({ params }: Props) {
  const { courseSlug } = await params;
  const { course, modules } = getCourseModulesAndLessons(courseSlug);

  if (!course) {
    notFound();
  }

  const instructor = getInstructorBySlug(course.instructorSlug);

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
            <Link href={`/prepmeup/tracks/${course.trackSlug}`} style={{ color: "#ff6a3d", textDecoration: "none" }}>{course.trackSlug}</Link>
            <span>/</span>
            <span style={{ color: "#f3f1ea" }}>{course.title}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="pmu-badge">Phase Q1 Course</span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#00e676" }}>
                  Level: {course.level.toUpperCase()}
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  Format: {course.format.toUpperCase()}
                </span>
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
                {course.title}
              </h1>
              <p className="font-mono" style={{ fontSize: "16px", color: "#ff6a3d", marginTop: "4px" }}>
                {course.subtitle}
              </p>
            </div>

            <div style={{ display: "flex", gap: "10px" }}>
              <Link
                href={`/prepmeup/courses/${course.slug}/learn`}
                className="pmu-btn-primary"
                style={{ padding: "14px 28px", fontSize: "14px" }}
              >
                Start Free Preview →
              </Link>
            </div>
          </div>
        </div>

        {/* Course Overview Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "32px", marginTop: "24px" }}>
          {/* Main Content: Description, Prerequisites, Curriculum */}
          <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
            <div className="pmu-card" style={{ padding: "30px" }}>
              <h2 className="font-display" style={{ fontSize: "24px", color: "#f3f1ea", textTransform: "uppercase" }}>
                Course Description
              </h2>
              <p style={{ fontSize: "15px", lineHeight: "1.7", color: "#807f78", marginTop: "12px" }}>
                {course.description}
              </p>

              <div style={{ marginTop: "20px", padding: "16px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
                <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d", textTransform: "uppercase", letterSpacing: "1px" }}>
                  Prerequisites:
                </span>
                <p style={{ fontSize: "14px", color: "#f3f1ea", marginTop: "4px" }}>
                  {course.prerequisite}
                </p>
              </div>
            </div>

            {/* Curriculum Accordion Breakdown */}
            <div className="pmu-card" style={{ padding: "30px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px" }}>
                <h2 className="font-display" style={{ fontSize: "24px", color: "#f3f1ea", textTransform: "uppercase" }}>
                  Curriculum Breakdown ({modules.length} Modules • {course.totalLessons} Lessons)
                </h2>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {modules.map((m) => (
                  <div
                    key={m.id}
                    style={{
                      backgroundColor: "#08080a",
                      border: "1px solid rgba(243, 241, 234, 0.1)",
                      borderRadius: "10px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "12px" }}>
                      <div>
                        <span className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase" }}>
                          Module {m.moduleNumber}
                        </span>
                        <h3 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", marginTop: "2px", textTransform: "uppercase" }}>
                          {m.title}
                        </h3>
                        <p style={{ fontSize: "13px", color: "#807f78", marginTop: "4px" }}>
                          {m.description}
                        </p>
                      </div>
                      <span className="font-mono" style={{ fontSize: "12px", color: "#807f78", whiteSpace: "nowrap" }}>
                        {m.lessons.length} Lessons
                      </span>
                    </div>

                    {/* Lesson Items */}
                    <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "8px" }}>
                      {m.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          style={{
                            padding: "10px 14px",
                            backgroundColor: lesson.isFreePreview ? "rgba(0, 230, 118, 0.05)" : "#111114",
                            border: `1px solid ${lesson.isFreePreview ? "rgba(0, 230, 118, 0.3)" : "rgba(243, 241, 234, 0.05)"}`,
                            borderRadius: "6px",
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                          }}
                        >
                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="font-mono" style={{ fontSize: "12px", color: lesson.isFreePreview ? "#00e676" : "#807f78" }}>
                              {lesson.moduleNumber}.{lesson.lessonNumber}
                            </span>
                            <span style={{ fontSize: "13px", color: "#f3f1ea", fontWeight: lesson.isFreePreview ? "bold" : "normal" }}>
                              {lesson.title}
                            </span>
                            {lesson.isFreePreview && (
                              <span style={{ fontSize: "9px", padding: "2px 6px", borderRadius: "4px", backgroundColor: "#00e676", color: "#08080a", fontWeight: "bold" }}>
                                FREE PREVIEW
                              </span>
                            )}
                          </div>

                          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                            <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                              {lesson.duration}
                            </span>
                            <Link
                              href={`/prepmeup/courses/${course.slug}/learn/${lesson.id}`}
                              style={{ fontSize: "12px", color: "#ff6a3d", textDecoration: "none" }}
                            >
                              {lesson.isFreePreview ? "Open →" : "🔒"}
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Key Specs, Instructor, Pricing, Benefits */}
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Enrollment Box */}
            <div className="pmu-card" style={{ padding: "28px", border: "1px solid rgba(255, 59, 29, 0.4)" }}>
              <span className="pmu-badge">Course Admission</span>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginTop: "12px" }}>
                <span className="font-display" style={{ fontSize: "42px", color: "#f3f1ea" }}>
                  ₹{course.priceInr}
                </span>
                <span style={{ fontSize: "13px", color: "#807f78" }}>one-time full enrollment</span>
              </div>

              <div style={{ marginTop: "18px", display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link
                  href={`/prepmeup/courses/${course.slug}/learn`}
                  className="pmu-btn-primary"
                  style={{ width: "100%", padding: "14px", textAlign: "center", textDecoration: "none" }}
                >
                  🚀 Start Free Preview Lesson
                </Link>
                <Link
                  href="/prepmeup/checkout"
                  className="pmu-btn-secondary"
                  style={{ width: "100%", padding: "12px", textAlign: "center", textDecoration: "none" }}
                >
                  Unlock Full Track (All Modules + VIP)
                </Link>
              </div>

              <div style={{ marginTop: "24px", borderTop: "1px solid rgba(243, 241, 234, 0.1)", paddingTop: "18px", display: "flex", flexDirection: "column", gap: "12px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#f3f1ea" }}>
                  <span>✓</span>
                  <span>5 Interactive Quantum Simulators included</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#f3f1ea" }}>
                  <span>✓</span>
                  <span>1:1 Live Mentorship & Interview Prep</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#f3f1ea" }}>
                  <span>✓</span>
                  <span>Academic Course Completion Certificate</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "13px", color: "#f3f1ea" }}>
                  <span>✓</span>
                  <span>Qiskit & Statevector Code Lab Projects</span>
                </div>
              </div>
            </div>

            {/* Instructor Box */}
            {instructor && (
              <div className="pmu-card" style={{ padding: "26px" }}>
                <span className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase" }}>
                  Course Lead
                </span>
                <div style={{ display: "flex", gap: "16px", alignItems: "center", marginTop: "12px" }}>
                  <img
                    src={instructor.avatarUrl}
                    alt={instructor.fullName}
                    style={{ width: "64px", height: "64px", borderRadius: "50%", objectFit: "cover", border: "2px solid #ff3b1d" }}
                  />
                  <div>
                    <h4 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", textTransform: "uppercase" }}>
                      {instructor.fullName}
                    </h4>
                    <p style={{ fontSize: "12px", color: "#807f78", marginTop: "2px" }}>
                      {instructor.title}
                    </p>
                  </div>
                </div>

                <p style={{ fontSize: "13px", lineHeight: "1.6", color: "#807f78", marginTop: "14px" }}>
                  {instructor.bio}
                </p>

                <div style={{ marginTop: "16px" }}>
                  <Link
                    href={`/prepmeup/instructors/${instructor.slug}`}
                    style={{ fontSize: "12px", color: "#ff6a3d", textDecoration: "none" }}
                  >
                    View Instructor Full Profile →
                  </Link>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
