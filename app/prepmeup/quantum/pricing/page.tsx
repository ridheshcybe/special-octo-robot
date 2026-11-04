"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface EarlyAdopterInfo {
  totalLimit: number;
  claimedCount: number;
  remainingSeats: number;
  isAvailable: boolean;
}

export default function QuantumPricingPage() {
  const [earlyInfo, setEarlyInfo] = useState<EarlyAdopterInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prepmeup/quantum/early-adopter")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setEarlyInfo(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const remaining = earlyInfo ? earlyInfo.remainingSeats : 8;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        padding: "48px 20px 80px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "12.5px", color: "#807f78", fontFamily: "monospace" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
            <span>/</span>
            <Link href="/prepmeup/tracks/quantum-computing" style={{ color: "#807f78", textDecoration: "none" }}>Quantum Track</Link>
            <span>/</span>
            <span style={{ color: "#ff6a3d" }}>Pricing &amp; Enrollment</span>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="pmu-badge">⚛️ Specialized Quantum Computing Academy</span>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(34px, 5vw, 54px)",
              lineHeight: 0.98,
              textTransform: "uppercase",
              color: "#f3f1ea",
              marginTop: "16px",
            }}
          >
            Transparent Commercial Access Plans
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#a19f95",
              maxWidth: "680px",
              margin: "14px auto 0",
              lineHeight: 1.6,
            }}
          >
            Choose your learning trajectory: comprehensive 6-month semester curriculum with verified academic credential, or private 1-on-1 mentorship with PhD faculty.
          </p>
        </div>

        {/* Early Adopter Banner */}
        {remaining > 0 && (
          <div
            className="pmu-card-highlight"
            style={{
              padding: "24px 28px",
              marginBottom: "36px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              border: "1px solid rgba(255, 106, 61, 0.5)",
              backgroundColor: "rgba(255, 59, 29, 0.08)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                <span style={{ fontSize: "20px" }}>🎉</span>
                <span className="pmu-badge" style={{ backgroundColor: "#ff3b1d", color: "#08080a", fontWeight: 700 }}>
                  LIMITED EARLY ADOPTER CAMPAIGN
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
                  {remaining} of 10 Free Seats Left
                </span>
              </div>
              <h3 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
                First 10 Scholars Get 100% OFF (₹0) on Quantum Semester Pass
              </h3>
              <p style={{ fontSize: "13.5px", color: "#a19f95", marginTop: "4px" }}>
                Includes all 20 lessons, all 5 interactive hardware simulations, 5 quizzes, AI tutor, and certificate eligibility.
              </p>
            </div>

            <Link
              href="/prepmeup/quantum/checkout?product=semester_pass&earlyAdopter=true"
              className="pmu-btn-primary"
              style={{ padding: "12px 24px", textDecoration: "none", fontSize: "13px" }}
            >
              Claim Free Access Seat (₹0) →
            </Link>
          </div>
        )}

        {/* Pricing Cards Grid */}
        <div className="pmu-grid-3" style={{ alignItems: "stretch" }}>
          {/* Card 1: Free Preview */}
          <div
            className="pmu-card"
            style={{
              padding: "32px 26px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div>
              <span className="pmu-badge">Free Preview</span>
              <h2 className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "12px" }}>
                Orientation
              </h2>
              <div style={{ marginTop: "14px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span className="font-display" style={{ fontSize: "40px", color: "#f3f1ea" }}>₹0</span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>Forever Free</span>
              </div>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "10px", lineHeight: 1.5 }}>
                Try our production quantum simulation and diagnostic assessment before enrolling.
              </p>

              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Lesson 1.1: Foundations of Quantum Information</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Qubit State Visualizer / 3D Bloch Sphere Simulator</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Module 1 Diagnostic Assessment (5 Questions)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#807f78" }}>
                  <span>✕</span>
                  <span>No certificate eligibility</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px", color: "#807f78" }}>
                  <span>✕</span>
                  <span>No paid 1:1 mentorship sessions</span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/courses/quantum-computing-foundations/learn/lesson-q1-01"
              className="pmu-btn-secondary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Start Free Preview Lesson 1.1 →
            </Link>
          </div>

          {/* Card 2: Quantum Semester Pass (Featured) */}
          <div
            className="pmu-card"
            style={{
              padding: "32px 26px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
              border: "2px solid #ff3b1d",
              backgroundColor: "#141418",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-12px",
                right: "24px",
                backgroundColor: "#ff3b1d",
                color: "#08080a",
                fontSize: "10.5px",
                fontFamily: "monospace",
                fontWeight: 700,
                padding: "3px 10px",
                borderRadius: "4px",
                textTransform: "uppercase",
              }}
            >
              Most Popular • Recommended
            </div>

            <div>
              <span className="pmu-badge" style={{ backgroundColor: "rgba(255, 59, 29, 0.2)", color: "#ff6a3d" }}>
                Full Track Access
              </span>
              <h2 className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "12px" }}>
                Quantum Semester Pass
              </h2>
              <div style={{ marginTop: "14px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span className="font-display" style={{ fontSize: "42px", color: "#ff6a3d" }}>₹999</span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>/ 6 Months Access</span>
              </div>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "10px", lineHeight: 1.5 }}>
                Full comprehensive curriculum access from linear algebra to Qiskit 1.0 algorithms and NISQ quantum computing.
              </p>

              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>All 20 Lessons</strong> across 5 structured modules</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>All 5 Interactive Quantum Simulators</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>All 5 Module Assessments &amp; Exams</strong></span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>Unlimited Quantum AI Tutor</strong> with KaTeX math</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>Official Academic Certificate</strong> with public verification</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>1 Included 1-on-1 Mentorship Session</strong> (45 Mins)</span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/quantum/checkout?product=semester_pass"
              className="pmu-btn-primary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none", fontSize: "14px" }}
            >
              Enroll in Semester Pass (₹999) →
            </Link>
          </div>

          {/* Card 3: 1-on-1 Mentorship Pack */}
          <div
            className="pmu-card"
            style={{
              padding: "32px 26px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "24px",
            }}
          >
            <div>
              <span className="pmu-badge">Live Faculty Coaching</span>
              <h2 className="font-display" style={{ fontSize: "28px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "12px" }}>
                1:1 Mentorship Pack
              </h2>
              <div style={{ marginTop: "14px", display: "flex", alignItems: "baseline", gap: "6px" }}>
                <span className="font-display" style={{ fontSize: "40px", color: "#f3f1ea" }}>₹499</span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>/ 45-Min Session</span>
              </div>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "10px", lineHeight: 1.5 }}>
                Private 1-on-1 interview preparation, research guidance, or circuit debugging with Dr. Aravind Vaidya, PhD.
              </p>

              <div style={{ marginTop: "24px", display: "flex", flexDirection: "column", gap: "10px", fontSize: "13px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>1 Private 45-Minute Live 1:1 Video/Screen Session</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Custom Qiskit / Cirq code review &amp; debugging</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Quantum Research &amp; Industry Career Advising</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Pack valid for 90 days from purchase</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Full credit refunded if cancelled before session</span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/quantum/checkout?product=mentorship_pack"
              className="pmu-btn-secondary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Get Mentorship Pack (₹499) →
            </Link>
          </div>
        </div>

        {/* Legal & Policy Links */}
        <div
          style={{
            marginTop: "48px",
            paddingTop: "24px",
            borderTop: "1px solid #1e1e24",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
            fontSize: "12px",
            color: "#807f78",
          }}
        >
          <div>
            🔒 All transactions securely encrypted and processed via <strong>Razorpay</strong>.
          </div>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/prepmeup/terms" style={{ color: "#807f78", textDecoration: "none" }}>Terms of Service</Link>
            <Link href="/prepmeup/privacy" style={{ color: "#807f78", textDecoration: "none" }}>Privacy Policy</Link>
            <Link href="/prepmeup/refunds" style={{ color: "#807f78", textDecoration: "none" }}>Refund Policy</Link>
            <Link href="/prepmeup/pricing-policy" style={{ color: "#807f78", textDecoration: "none" }}>Pricing Policy</Link>
          </div>
        </div>
      </div>
    </main>
  );
}
