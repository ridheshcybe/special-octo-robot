import React from "react";
import Link from "next/link";
import { getAllTracks } from "../_lib/trackStore";

export const metadata = {
  title: "Learning Tracks | PrepMeUp AI",
  description: "Explore specialized engineering and science learning tracks: B.Tech CSE AI/ML, Quantum Computing, and CyberSecurity.",
};

export default function TracksDirectoryPage() {
  const tracks = getAllTracks();

  return (
    <div className="pmu-root" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "28px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#807f78", fontFamily: "monospace", marginBottom: "8px" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
            <span>/</span>
            <span style={{ color: "#f3f1ea" }}>Tracks</span>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span className="pmu-badge">Multi-Track Architecture</span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#ff6a3d" }}>
                  Phase Q1 Expansion
                </span>
              </div>
              <h1 className="font-display" style={{ fontSize: "clamp(32px, 5vw, 48px)", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
                Specialized Learning Tracks
              </h1>
              <p style={{ fontSize: "16px", color: "#807f78", maxWidth: "720px", marginTop: "6px" }}>
                Structured multi-course career tracks built with syllabus-grounded AI tutors, interactive physics & computing simulations, and 1:1 mentorship.
              </p>
            </div>

            <Link href="/prepmeup/courses/quantum-computing-foundations" className="pmu-btn-primary" style={{ padding: "12px 24px", fontSize: "14px" }}>
              Explore Quantum Track →
            </Link>
          </div>
        </div>

        {/* Tracks Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(340px, 1fr))", gap: "24px", marginTop: "32px" }}>
          {tracks.map((track) => {
            const isComingSoon = track.status === "coming_soon";
            const targetUrl =
              track.slug === "btech-cse-aiml"
                ? "/prepmeup/subjects"
                : `/prepmeup/tracks/${track.slug}`;

            return (
              <div
                key={track.slug}
                className="pmu-card"
                style={{
                  padding: "32px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  opacity: isComingSoon ? 0.75 : 1,
                  position: "relative",
                  border: track.slug === "quantum-computing" ? "1px solid rgba(255, 59, 29, 0.4)" : undefined,
                }}
              >
                <div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                    <span
                      className="pmu-badge"
                      style={{
                        backgroundColor: isComingSoon
                          ? "rgba(128, 127, 120, 0.15)"
                          : track.slug === "quantum-computing"
                          ? "rgba(255, 59, 29, 0.15)"
                          : "rgba(0, 230, 118, 0.15)",
                        color: isComingSoon
                          ? "#807f78"
                          : track.slug === "quantum-computing"
                          ? "#ff6a3d"
                          : "#00e676",
                      }}
                    >
                      {track.badge || (isComingSoon ? "Coming Soon" : "Live Track")}
                    </span>

                    <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                      {track.courseCount} {track.courseCount === 1 ? "Course" : "Courses"}
                    </span>
                  </div>

                  <h2 className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "16px" }}>
                    {track.title}
                  </h2>

                  <p style={{ fontSize: "14px", lineHeight: "1.65", color: "#807f78", marginTop: "10px" }}>
                    {track.description}
                  </p>

                  {track.slug === "quantum-computing" && (
                    <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
                      <div className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase" }}>
                        Featured Course:
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#f3f1ea", marginTop: "2px" }}>
                        Quantum Computing Foundations
                      </div>
                      <div style={{ fontSize: "11px", color: "#807f78", marginTop: "2px" }}>
                        Dr. Aravind Vaidya, PhD • 5 Modules • 5 Interactive Simulators
                      </div>
                    </div>
                  )}

                  {track.slug === "btech-cse-aiml" && (
                    <div style={{ marginTop: "16px", padding: "12px", backgroundColor: "#08080a", borderRadius: "8px", border: "1px solid rgba(243, 241, 234, 0.08)" }}>
                      <div className="font-mono" style={{ fontSize: "11px", color: "#00e676", textTransform: "uppercase" }}>
                        Active Curriculum:
                      </div>
                      <div style={{ fontSize: "13px", fontWeight: "bold", color: "#f3f1ea", marginTop: "2px" }}>
                        Semester 1 Engineering Suite (CSE1001-CSE1006)
                      </div>
                      <div style={{ fontSize: "11px", color: "#807f78", marginTop: "2px" }}>
                        58 Curriculum Topics • 6 Past Paper Archives • AI Tutor
                      </div>
                    </div>
                  )}
                </div>

                <div style={{ marginTop: "28px" }}>
                  {isComingSoon ? (
                    <button
                      disabled
                      className="pmu-btn-secondary"
                      style={{ width: "100%", padding: "12px", opacity: 0.6, cursor: "not-allowed" }}
                    >
                      Notify When Live
                    </button>
                  ) : (
                    <Link
                      href={targetUrl}
                      className={track.slug === "quantum-computing" ? "pmu-btn-primary" : "pmu-btn-secondary"}
                      style={{ width: "100%", padding: "12px", textAlign: "center", display: "block", textDecoration: "none" }}
                    >
                      {track.slug === "btech-cse-aiml" ? "View B.Tech Subjects →" : "View Quantum Track →"}
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
