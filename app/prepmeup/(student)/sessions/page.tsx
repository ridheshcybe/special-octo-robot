import React from "react";
import type { Metadata } from "next";
import { cookies } from "next/headers";
import { CalendarBookingScheduler } from "../../_components/CalendarBookingScheduler";

export const metadata: Metadata = {
  title: "1:1 Live Mentorship & Calendar — PrepMeUp AI",
  description: "Schedule 1:1 live video calls with senior engineering mentors for math proofs, circuit analysis, coding labs, and career roadmap.",
};

export default async function StudentSessionsPage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get("pmu-session")?.value;

  let studentName = "Engineering Student";
  let whatsapp = "";
  let tier = "tier1";

  if (sessionCookie) {
    try {
      const parsed = JSON.parse(sessionCookie);
      if (parsed.fullName) studentName = parsed.fullName;
      if (parsed.phone) whatsapp = parsed.phone;
      if (parsed.tier) tier = parsed.tier;
    } catch {}
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Banner */}
      <div
        className="pmu-card-highlight"
        style={{
          padding: "24px 28px",
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "16px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
            <span className="pmu-badge">Live Video Mentorship</span>
            <span
              className="font-mono"
              style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.08em", color: "#4ade80" }}
            >
              Google Meet 1:1 Rooms
            </span>
          </div>
          <h1
            className="font-display"
            style={{ fontSize: "clamp(24px, 3.5vw, 36px)", textTransform: "uppercase", color: "#f3f1ea", margin: 0 }}
          >
            1:1 Mentorship &amp; Academic Scheduling
          </h1>
          <p style={{ marginTop: "6px", fontSize: "14px", color: "#a19f95", maxWidth: "680px" }}>
            Get personalized live guidance from faculty and senior rankers. Clarify complex derivations, debug your Python assignments line-by-line, or review your tech resume.
          </p>
        </div>

        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "6px" }}>
          <span
            className="font-mono"
            style={{
              padding: "4px 10px",
              borderRadius: "4px",
              backgroundColor: tier === "tier3" ? "rgba(74,222,128,0.15)" : "rgba(255,106,61,0.15)",
              color: tier === "tier3" ? "#4ade80" : "#ff6a3d",
              fontSize: "12px",
              fontWeight: 700,
            }}
          >
            {tier === "tier3" ? "★ TIER 3 VIP: UNLIMITED SESSIONS" : tier === "tier2" ? "TIER 2: 1 INCLUDED SESSION" : "TIER 1 BASIC"}
          </span>
          <span style={{ fontSize: "11px", color: "#807f78" }}>
            {tier === "tier3" ? "Book anytime with zero limits" : "Upgrade to Tier 3 VIP for unlimited video calls"}
          </span>
        </div>
      </div>

      {/* Interactive Scheduler Component */}
      <CalendarBookingScheduler
        initialTier={tier}
        studentNameProp={studentName}
        whatsappProp={whatsapp}
      />
    </div>
  );
}
