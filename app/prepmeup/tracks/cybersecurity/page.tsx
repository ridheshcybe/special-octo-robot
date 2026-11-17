import React from "react";
import Link from "next/link";
import { getAllTracks, getCoursesByTrack } from "@/app/prepmeup/_lib/trackStore";

export const metadata = {
  title: "CyberSecurity Track | PrepMeUp AI",
  description: "Learn CyberSecurity defensive engineering, cryptographic protocols, and cloud penetration testing fundamentals",
};

export default function CyberSecurityTracksPage() {
  const tracks = getAllTracks();
  const cybersecurityTrack = tracks.find((t) => t.slug === "cybersecurity") || null;
  const courses = cybersecurityTrack ? getCoursesByTrack("cybersecurity") : [];

  const isComingSoon = cybersecurityTrack?.status === "coming_soon";

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
                {cybersecurityTrack?.title || "CyberSecurity"}
              </h1>
              <p style={{ fontSize: "16px", color: "#807f78", maxWidth: "720px", marginTop: "6px" }}>
                {cybersecurityTrack?.description || "Defensive security engineering, cryptographic protocols, cloud penetration testing, and security operations fundamentals."}
              </p>
            </div>

            <Link href="/prepmeup/courses/quantum-computing-foundations" className="pmu-btn-primary" style={{ padding: "12px 24px", fontSize: "14px" }}>
              Explore Quantum Track →
            </Link>
          </div>
        </div>

        {/* Track Card */}
        <div
          style={{
            padding: "32px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            opacity: isComingSoon ? 0.75 : 1,
            border: isComingSoon ? undefined : "1px solid rgba(255, 59, 29, 0.4)",
            borderRadius: "8px",
            backgroundColor: "#08080a",
            marginBottom: "32px",
          }}
        >
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
              <span
                className="pmu-badge"
                style={{
                  backgroundColor: isComingSoon
                    ? "rgba(128, 127, 120, 0.15)"
                    : "rgba(255, 59, 29, 0.15)",
                  color: isComingSoon ? "#807f78" : "#ff6a3d",
                }}
              >
                {isComingSoon ? "Coming Soon" : "Live Track"}
              </span>

              <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                {cybersecurityTrack?.courseCount || 1} { (cybersecurityTrack?.courseCount || 1) === 1 ? "Course" : "Courses" }
              </span>
            </div>

            <h2 className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "16px" }}>
              {cybersecurityTrack?.title || "CyberSecurity"}
            </h2>

            <p style={{ fontSize: "14px", lineHeight: "1.65", color: "#807f78", marginTop: "10px" }}>
              {cybersecurityTrack?.description || "Defensive security engineering, cryptographic protocols, cloud penetration testing, and security operations fundamentals."}
            </p>
          </div>

          {/* Curriculum Overview */}
          {cybersecurityTrack && (
            <div style={{ marginTop: "24px", paddingTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
              <h3 className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "12px" }}>
                Curriculum Overview
              </h3>
              <div style={{ fontSize: "13px", color: "#f3f1ea", lineHeight: "1.8" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#00e676", fontWeight: "bold" }}>•</span>
                  <span>Cryptographic Protocols & Modern Encryption</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#00e676", fontWeight: "bold" }}>•</span>
                  <span>Cloud Security & Penetration Testing</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#00e676", fontWeight: "bold" }}>•</span>
                  <span>Security Operations & Incident Response</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#00e676", fontWeight: "bold" }}>•</span>
                  <span>Cryptography & Key Management</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#00e676", fontWeight: "bold" }}>•</span>
                  <span>Compliance & Regulatory Standards</span>
                </div>
              </div>
            </div>
          )}

          {/* Free-preview CTA */}
          {isComingSoon ? (
            <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#0f0f0f", borderRadius: "8px" }}>
              <p style={{ fontSize: "12px", color: "#807f78", textTransform: "uppercase", marginBottom: "8px" }}>
                Coming Soon
              </p>
              <p style={{ fontSize: "13px", color: "#ff6a3d" }}>
                Stay tuned for the CyberSecurity track launch
              </p>
            </div>
          ) : (
            <Link
              href="/prepmeup/courses/cybersecurity-foundations"
              className="pmu-btn-primary"
              style={{
                width: "100%",
                padding: "12px",
                fontSize: "14px",
                marginTop: "16px",
                textTransform: "uppercase",
              }}
            >
              Start Free Preview
            </Link>
          )}
        </div>

        {/* Courses Grid */}
        {courses.length > 0 && (
          <div style={{ marginTop: "32px" }}>
            <h3 className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "12px" }}>
              Included Courses
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: "24px" }}>
              {courses.map((course) => (
                <div
                  key={course.slug}
                  className="pmu-card"
                  style={{
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#0f0f0f",
                    borderRadius: "8px",
                    border: course.isFreePreviewEnabled ? "1px solid rgba(0, 230, 118, 0.2)" : undefined,
                  }}
                >
                  <div>
                    <span
                      className="pmu-badge"
                      style={{
                        backgroundColor: course.isFreePreviewEnabled
                          ? "rgba(0, 230, 118, 0.15)"
                          : "rgba(255, 59, 29, 0.15)",
                        color: course.isFreePreviewEnabled ? "#00e676" : "#ff6a3d",
                      }}
                    >
                      {course.isFreePreviewEnabled ? "Free Preview" : "Paid"}
                    </span>

                    <h3 className="font-display" style={{ fontSize: "16px", color: "#f3f1ea", marginBottom: "8px" }}>
                      {course.title}
                    </h3>

                    <p style={{ fontSize: "12px", color: "#807f78", lineHeight: "1.5" }}>
                      {course.description || ""}
                    </p>
                  </div>

                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                      {course.totalLessons} lessons
                    </span>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                      {course.simulationsCount || 0} simulations
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}