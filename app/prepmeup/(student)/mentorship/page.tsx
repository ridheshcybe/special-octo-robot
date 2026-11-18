import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { getAvailableMentorshipSlots, getStudentMentorshipSessions } from "@/app/prepmeup/_lib/trackStore";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { MentorshipBookingClient } from "./MentorshipBookingClient";

export const metadata = {
  title: "1-on-1 Faculty Mentorship Booking | PrepMeUp AI",
  description: "Book private 1:1 sessions for doubt clearing, interview prep, and research guidance.",
};

export default async function MentorshipPage() {
  const cookieStore = await cookies();
  const identity = resolveSessionIdentity(cookieStore);

  const availableSlots = getAvailableMentorshipSlots("quantum-computing-foundations");
  const identifier = identity ? identity.email || identity.phone || identity.canonicalId : "";
  const existingSessions = identifier ? getStudentMentorshipSessions(identifier) : [];

  return (
    <div style={{ maxWidth: "1150px", margin: "0 auto", padding: "24px 0" }}>
      {/* Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#6F6B62", marginBottom: "8px" }}>
          <Link href="/prepmeup" style={{ color: "#6F6B62", textDecoration: "none" }}>PrepMeUp</Link>
          <span>/</span>
          <Link href="/prepmeup/tracks/quantum-computing" style={{ color: "#C2331B", textDecoration: "none" }}>Quantum Track</Link>
          <span>/</span>
          <span style={{ color: "#1C1A17" }}>1:1 live mentorship</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span className="pmu-badge">
                Private faculty sessions
              </span>
              <span style={{ fontSize: "12px", color: "#6F6B62" }}>
                Dr. Aravind Vaidya, PhD
              </span>
            </div>
            <h1 style={{ fontSize: "clamp(26px, 3.8vw, 36px)", fontWeight: 700, color: "#1C1A17", marginTop: "8px", letterSpacing: "-0.015em" }}>
              1-on-1 mentorship &amp; academic guidance
            </h1>
            <p style={{ fontSize: "14px", color: "#6F6B62", maxWidth: "700px", marginTop: "4px", lineHeight: 1.6 }}>
              Book dedicated 45-minute private sessions with faculty. Debug coursework equations, practice technical interviews, and review algorithm code.
            </p>
          </div>

          <Link
            href="/prepmeup/courses/quantum-computing-foundations"
            className="pmu-btn-secondary"
            style={{ padding: "8px 16px", fontSize: "13px" }}
          >
            Course syllabus →
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
