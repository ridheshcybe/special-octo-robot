import React from "react";
import Link from "next/link";
import { getAllTracks } from "../_lib/trackStore";
import { PrepMeUpNav } from "../_components/PrepMeUpNav";
import { PrepMeUpFooter } from "../_components/PrepMeUpFooter";
import { OwnerReviewBanner } from "../_components/OwnerReviewBanner";

// TODO(owner): Release Blocker 2 — ₹999 Quantum/Cyber passes and the ₹1,499 All-Access Pass sell tracks marked "under construction".
// TODO(owner): Release Blocker 3 — Mentorship packs name "Dr. Aravind Vaidya, PhD" and "Senior SOC Security Leads" - unverified people.
// TODO(owner): Release Blocker 4 — "Solved University Past Exam Papers" and "6 Past Paper Archives" claims vs the FAQ saying paper sources are unavailable.

export const metadata = {
  title: "Learning Tracks | PrepMeUp AI",
  description: "Explore engineering and computer science learning tracks: B.Tech CSE AI/ML, Quantum Computing, and CyberSecurity.",
};

export default function TracksDirectoryPage() {
  const tracks = getAllTracks();

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PrepMeUpNav />

      {/* Owner Review Banners for unresolved release blockers */}
      <OwnerReviewBanner
        id="blocker-2"
        blockerNumber={2}
        summary="Tracks Status vs Commercial Passes"
        detail="Track directory displays courses with coming soon or under-construction statuses while commercial passes are currently listed for purchase."
      />
      <OwnerReviewBanner
        id="blocker-3"
        blockerNumber={3}
        summary="Faculty Persona Verification"
        detail="Featured quantum course references 'Dr. Aravind Vaidya, PhD' as lead instructor. Confirm identity credentials."
      />
      <OwnerReviewBanner
        id="blocker-4"
        blockerNumber={4}
        summary="Past Paper Archives Claim"
        detail="Active curriculum card states '6 Past Paper Archives', while FAQ and curriculum status confirm source-backed archives are pending."
      />

      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#FAF9F6",
          color: "#1C1A17",
          padding: "40px 20px 80px",
          fontFamily: "var(--font-onest), sans-serif",
        }}
      >
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          {/* Navigation Breadcrumb */}
          <div style={{ marginBottom: "24px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#6F6B62", marginBottom: "8px" }}>
              <Link href="/prepmeup" style={{ color: "#6F6B62", textDecoration: "none" }}>PrepMeUp</Link>
              <span>/</span>
              <span style={{ color: "#C2331B", fontWeight: 600 }}>Tracks</span>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span className="pmu-badge">Curriculum catalog</span>
                </div>
                <h1 style={{ fontSize: "clamp(28px, 4vw, 40px)", fontWeight: 700, color: "#1C1A17", marginTop: "8px", letterSpacing: "-0.02em" }}>
                  Specialized learning tracks
                </h1>
                <p style={{ fontSize: "15px", color: "#6F6B62", maxWidth: "700px", marginTop: "6px", lineHeight: 1.6 }}>
                  Structured multi-course career tracks built with syllabus-grounded AI tutors, interactive simulators, and faculty mentorship.
                </p>
              </div>

              <Link href="/prepmeup/subjects" className="pmu-btn-primary" style={{ padding: "10px 20px", fontSize: "14px" }}>
                Explore Semester 1
              </Link>
            </div>
          </div>

          {/* Tracks Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px", marginTop: "24px" }}>
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
                    padding: "24px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                    backgroundColor: "#FFFFFF",
                    border: track.slug === "btech-cse-aiml" ? "1.5px solid #C2331B" : "1px solid #E8E4DB",
                    position: "relative",
                  }}
                >
                  <div>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: "10px" }}>
                      <span
                        className="pmu-badge"
                        style={{
                          backgroundColor: isComingSoon
                            ? "#F4F2ED"
                            : track.slug === "btech-cse-aiml"
                            ? "#F6E7E3"
                            : "#F4F2ED",
                          color: isComingSoon
                            ? "#6F6B62"
                            : track.slug === "btech-cse-aiml"
                            ? "#C2331B"
                            : "#1C1A17",
                          borderColor: "#E8E4DB",
                        }}
                      >
                        {track.badge || (isComingSoon ? "Under construction" : "Active track")}
                      </span>

                      <span className="font-mono" style={{ fontSize: "12px", color: "#6F6B62" }}>
                        {track.courseCount} {track.courseCount === 1 ? "course" : "courses"}
                      </span>
                    </div>

                    <h2 style={{ fontSize: "20px", fontWeight: 700, color: "#1C1A17", marginTop: "12px" }}>
                      {track.title}
                    </h2>

                    <p style={{ fontSize: "13.5px", lineHeight: "1.6", color: "#6F6B62", marginTop: "8px" }}>
                      {track.description}
                    </p>

                    {track.slug === "quantum-computing" && (
                      <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#F4F2ED", borderRadius: "8px", border: "1px solid #E8E4DB" }}>
                        <div style={{ fontSize: "11px", color: "#C2331B", fontWeight: 600, textTransform: "uppercase" }}>
                          Course preview:
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1C1A17", marginTop: "2px" }}>
                          Quantum Computing Foundations
                        </div>
                        <div style={{ fontSize: "11px", color: "#6F6B62", marginTop: "2px" }}>
                          Dr. Aravind Vaidya, PhD • 5 modules • 5 interactive simulators
                        </div>
                      </div>
                    )}

                    {track.slug === "btech-cse-aiml" && (
                      <div style={{ marginTop: "14px", padding: "12px", backgroundColor: "#F4F2ED", borderRadius: "8px", border: "1px solid #E8E4DB" }}>
                        <div style={{ fontSize: "11px", color: "#C2331B", fontWeight: 600, textTransform: "uppercase" }}>
                          Active curriculum:
                        </div>
                        <div style={{ fontSize: "13px", fontWeight: 600, color: "#1C1A17", marginTop: "2px" }}>
                          Semester 1 Engineering Suite (CSE1001-CSE1006)
                        </div>
                        <div style={{ fontSize: "11px", color: "#6F6B62", marginTop: "2px" }}>
                          58 curriculum topics • 6 subjects • AI tutor
                        </div>
                      </div>
                    )}
                  </div>

                  <div style={{ marginTop: "20px", paddingTop: "12px", borderTop: "1px solid #E8E4DB" }}>
                    {isComingSoon ? (
                      <Link
                        href={targetUrl}
                        className="pmu-btn-secondary"
                        style={{ width: "100%", padding: "10px", textAlign: "center", display: "block", textDecoration: "none", justifyContent: "center" }}
                      >
                        Track status &amp; updates
                      </Link>
                    ) : (
                      <Link
                        href={targetUrl}
                        className={track.slug === "btech-cse-aiml" ? "pmu-btn-primary" : "pmu-btn-secondary"}
                        style={{ width: "100%", padding: "10px", textAlign: "center", display: "block", textDecoration: "none", justifyContent: "center" }}
                      >
                        {track.slug === "btech-cse-aiml" ? "View B.Tech subjects →" : "View track overview →"}
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>

      <PrepMeUpFooter />
    </div>
  );
}
