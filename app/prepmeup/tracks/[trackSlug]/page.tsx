import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getTrackBySlug, getCoursesByTrack, getInstructorBySlug } from "../../_lib/trackStore";

interface Props {
  params: Promise<{ trackSlug: string }>;
}

export async function generateMetadata({ params }: Props) {
  const { trackSlug } = await params;
  const track = getTrackBySlug(trackSlug);
  if (!track) return { title: "Track Not Found | PrepMeUp AI" };
  return {
    title: `${track.title} Track | PrepMeUp AI`,
    description: track.description,
  };
}

export default async function TrackDetailPage({ params }: Props) {
  const { trackSlug } = await params;
  const track = getTrackBySlug(trackSlug);

  if (!track) {
    notFound();
  }

  // If user requested the B.Tech track, redirect or link directly to the subjects
  const isBtech = track.slug === "btech-cse-aiml";
  const courses = getCoursesByTrack(track.slug);
  const instructor = getInstructorBySlug("dr-aravind-vaidya");

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
            <span style={{ color: "#f3f1ea" }}>{track.title}</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="pmu-badge" style={{ backgroundColor: "rgba(255, 59, 29, 0.15)", color: "#ff6a3d" }}>
                  {track.badge || "Live Track"}
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#00e676" }}>
                  Phase Q1 Foundation
                </span>
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
                {track.title} Track
              </h1>
              <p style={{ fontSize: "16px", color: "#807f78", maxWidth: "720px", marginTop: "6px" }}>
                {track.description}
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
              <Link
                href="/prepmeup/courses/quantum-computing-foundations/learn"
                className="pmu-btn-primary"
                style={{ padding: "12px 24px", fontSize: "13px" }}
              >
                Start Free Preview →
              </Link>
            </div>
          </div>
        </div>

        {/* Featured Course Card */}
        {courses.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <h2 className="font-mono" style={{ fontSize: "13px", color: "#ff6a3d", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
              Track Curriculum & Primary Course
            </h2>

            {courses.map((course) => (
              <div
                key={course.slug}
                className="pmu-card"
                style={{ padding: "36px", border: "1px solid rgba(255, 59, 29, 0.3)" }}
              >
                <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ maxWidth: "780px" }}>
                    <div style={{ display: "flex", flexWrap: "wrap", alignItems: "center", gap: "10px" }}>
                      <span className="pmu-badge">Course 01</span>
                      <span className="font-mono" style={{ fontSize: "12px", color: "#00e676" }}>
                        Format: {course.format.toUpperCase()} (Recorded + 1:1 Live Mentorship)
                      </span>
                      <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                        Level: {course.level}
                      </span>
                    </div>

                    <h3 className="font-display" style={{ fontSize: "32px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "12px" }}>
                      {course.title}
                    </h3>
                    <p className="font-mono" style={{ fontSize: "15px", color: "#ff6a3d", marginTop: "4px" }}>
                      {course.subtitle}
                    </p>
                    <p style={{ fontSize: "15px", lineHeight: "1.65", color: "#807f78", marginTop: "12px" }}>
                      {course.description}
                    </p>

                    {/* Highlights Grid */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "14px", marginTop: "20px" }}>
                      <div style={{ padding: "12px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
                        <div className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>Modules & Lessons</div>
                        <div className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", marginTop: "2px" }}>
                          5 Modules • 20 Lessons
                        </div>
                      </div>

                      <div style={{ padding: "12px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
                        <div className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>Interactive Simulators</div>
                        <div className="font-display" style={{ fontSize: "20px", color: "#00e676", marginTop: "2px" }}>
                          5 Live Engines
                        </div>
                      </div>

                      <div style={{ padding: "12px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
                        <div className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>Mentorship & Assessment</div>
                        <div className="font-display" style={{ fontSize: "20px", color: "#ff6a3d", marginTop: "2px" }}>
                          1:1 VIP Sessions
                        </div>
                      </div>
                    </div>

                    {/* Tools & Frameworks */}
                    <div style={{ marginTop: "20px", display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                      <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>Tools Mastered:</span>
                      {course.tools.map((t) => (
                        <span key={t} className="pmu-badge" style={{ backgroundColor: "#17171b", color: "#f3f1ea", fontSize: "11px" }}>
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Actions Column */}
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", minWidth: "240px" }}>
                    <div style={{ padding: "20px", backgroundColor: "#17171b", borderRadius: "10px", border: "1px solid rgba(243, 241, 234, 0.1)", textAlign: "center" }}>
                      <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
                        Course Pricing
                      </span>
                      <div className="font-display" style={{ fontSize: "36px", color: "#f3f1ea", marginTop: "4px" }}>
                        ₹{course.priceInr}
                      </div>
                      <span className="font-mono" style={{ fontSize: "11px", color: "#00e676" }}>
                        Included in Tier 3 VIP
                      </span>
                    </div>

                    <Link
                      href={`/prepmeup/courses/${course.slug}/learn`}
                      className="pmu-btn-primary"
                      style={{ padding: "14px", textAlign: "center", textDecoration: "none" }}
                    >
                      Start Free Preview →
                    </Link>
                    <Link
                      href={`/prepmeup/courses/${course.slug}`}
                      className="pmu-btn-secondary"
                      style={{ padding: "12px", textAlign: "center", textDecoration: "none" }}
                    >
                      View Syllabus & Specs
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Instructor Preview Section */}
        {instructor && (
          <div style={{ marginTop: "36px" }}>
            <h2 className="font-mono" style={{ fontSize: "13px", color: "#ff6a3d", textTransform: "uppercase", letterSpacing: "1px", marginBottom: "14px" }}>
              Lead Academic Instructor
            </h2>
            <div className="pmu-card" style={{ padding: "30px", display: "flex", flexWrap: "wrap", alignItems: "center", justifyContent: "space-between", gap: "20px" }}>
              <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
                <div style={{ width: "80px", height: "80px", borderRadius: "50%", overflow: "hidden", border: "2px solid #ff3b1d", flexShrink: 0 }}>
                  <img src={instructor.avatarUrl} alt={instructor.fullName} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                </div>
                <div>
                  <h3 className="font-display" style={{ fontSize: "24px", color: "#f3f1ea", textTransform: "uppercase" }}>
                    {instructor.fullName}
                  </h3>
                  <p style={{ fontSize: "13px", color: "#ff6a3d", marginTop: "2px" }}>
                    {instructor.title}
                  </p>
                  <p style={{ fontSize: "13px", color: "#807f78", marginTop: "6px", maxWidth: "600px" }}>
                    {instructor.bio}
                  </p>
                </div>
              </div>

              <Link
                href={`/prepmeup/instructors/${instructor.slug}`}
                className="pmu-btn-secondary"
                style={{ padding: "10px 18px", fontSize: "13px" }}
              >
                Instructor Bio & Credentials →
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
