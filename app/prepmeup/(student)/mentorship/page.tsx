import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getAvailableMentorshipSlots, getStudentMentorshipSessions } from "@/app/prepmeup/_lib/trackStore";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { MentorshipBookingClient } from "./MentorshipBookingClient";

export const metadata = {
  title: "1-on-1 Quantum Mentorship Booking | PrepMeUp AI",
  description: "Book private 1:1 sessions with Dr. Aravind Vaidya, PhD for quantum doubt clearing, interview prep, and research guidance.",
};

export default async function MentorshipPage() {
  const cookieStore = await cookies();
  const identity = resolveSessionIdentity(cookieStore);

  const availableSlots = getAvailableMentorshipSlots("quantum-computing-foundations");
  const identifier = identity ? identity.email || identity.phone || identity.canonicalId : "";
  const existingSessions = identifier ? getStudentMentorshipSessions(identifier) : [];

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Header */}
      <div style={{ marginBottom: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#807f78", fontFamily: "monospace", marginBottom: "8px" }}>
          <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
          <span>/</span>
          <Link href="/prepmeup/tracks/quantum-computing" style={{ color: "#ff6a3d", textDecoration: "none" }}>Quantum Track</Link>
          <span>/</span>
          <span style={{ color: "#f3f1ea" }}>1:1 Live Mentorship</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="pmu-badge" style={{ backgroundColor: "rgba(255, 59, 29, 0.15)", color: "#ff6a3d" }}>
                🎯 Private Faculty Sessions
              </span>
              <span className="font-mono" style={{ fontSize: "12px", color: "#00e676" }}>
                Dr. Aravind Vaidya, PhD
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: "clamp(28px, 4.5vw, 42px)", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
              1-on-1 Mentorship &amp; Interview Prep
            </h1>
            <p style={{ fontSize: "15px", color: "#807f78", maxWidth: "700px", marginTop: "4px" }}>
              Book dedicated 45-minute private sessions with faculty. Get quantum equations debugged, practice mock quantum algorithm interviews, and review Qiskit research code.
            </p>
          </div>

          <Link
            href="/prepmeup/courses/quantum-computing-foundations"
            className="pmu-btn-secondary"
            style={{ padding: "10px 18px", fontSize: "13px" }}
          >
            Course Syllabus →
          </Link>
        </div>
      </div>

      <MentorshipBookingClient
        availableSlots={availableSlots}
        initialSessions={existingSessions}
        isLoggedIn={Boolean(identity)}
      />
    </div>
  );
}
