import React from "react";
import Link from "next/link";

interface Props {
  searchParams: Promise<{ status?: string; product?: string; seat?: string }>;
}

export default async function QuantumPaymentSuccessPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const isEarlyAdopter = resolved.status === "claimed";
  const product = resolved.product === "mentorship_pack" ? "mentorship_pack" : "semester_pass";
  const seatNumber = resolved.seat || "";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div
        className="pmu-card"
        style={{
          maxWidth: "600px",
          width: "100%",
          padding: "40px 32px",
          textAlign: "center",
          border: "1px solid rgba(74, 222, 128, 0.4)",
          backgroundColor: "#111114",
          boxShadow: "0 20px 40px rgba(0,0,0,0.7)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: "rgba(74, 222, 128, 0.15)",
            color: "#4ade80",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 20px",
          }}
        >
          ✓
        </div>

        <span className="pmu-badge" style={{ backgroundColor: "rgba(74, 222, 128, 0.2)", color: "#4ade80" }}>
          {isEarlyAdopter ? "🎉 Early Adopter Claim Confirmed" : "💳 Payment Captured & Verified"}
        </span>

        <h1
          className="font-display"
          style={{
            marginTop: "16px",
            fontSize: "clamp(28px, 4vw, 38px)",
            lineHeight: 1,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          {product === "semester_pass" ? "Quantum Pass Activated!" : "Mentorship Pack Ready!"}
        </h1>

        <p style={{ marginTop: "12px", fontSize: "14.5px", lineHeight: 1.6, color: "#a19f95" }}>
          {isEarlyAdopter ? (
            <>
              You have secured <strong>Early Adopter Seat #{seatNumber}</strong> with 100% scholarship. Your Quantum Semester Pass is active for 6 months.
            </>
          ) : product === "semester_pass" ? (
            <>
              Thank you for enrolling! Your transaction has been cryptographically verified. All 20 Quantum Computing Foundations lessons, 5 hardware simulations, module assessments, and 1 included mentorship session are unlocked.
            </>
          ) : (
            <>
              Your Quantum 1-on-1 Mentorship Pack is active. You can now schedule your private 45-minute code review and interview prep session with faculty.
            </>
          )}
        </p>

        {/* Action CTAs */}
        <div style={{ marginTop: "32px", display: "flex", flexDirection: "column", gap: "12px" }}>
          <Link
            href="/prepmeup/courses/quantum-computing-foundations/learn"
            className="pmu-btn-primary"
            style={{ padding: "14px", fontSize: "14px", textDecoration: "none" }}
          >
            Start Course Curriculum (Module 1) →
          </Link>

          <Link
            href="/prepmeup/simulations/quantum"
            className="pmu-btn-secondary"
            style={{ padding: "12px", fontSize: "13px", textDecoration: "none" }}
          >
            Launch Interactive Simulators ⚛️
          </Link>

          <Link
            href="/prepmeup/mentorship"
            className="pmu-btn-secondary"
            style={{ padding: "12px", fontSize: "13px", textDecoration: "none" }}
          >
            Schedule 1-on-1 Faculty Mentorship 📅
          </Link>
        </div>
      </div>
    </main>
  );
}
