"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";

interface EarlyAdopterInfo {
  totalLimit: number;
  claimedCount: number;
  remainingSeats: number;
  isAvailable: boolean;
}

export default function UnifiedPricingPage() {
  const [earlyInfo, setEarlyInfo] = useState<EarlyAdopterInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prepmeup/checkout/early-adopter")
      .then((r) => r.json())
      .then((d) => {
        if (d.ok) setEarlyInfo(d);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const remaining = earlyInfo ? earlyInfo.remainingSeats : 10;

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
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: "#807f78",
              fontFamily: "monospace",
            }}
          >
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>
              PrepMeUp
            </Link>
            <span>/</span>
            <span style={{ color: "#ff6a3d" }}>Unified Pricing &amp; All-Access Pass</span>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="pmu-badge">⚡ Complete Engineering &amp; Modern Tech Academy</span>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(36px, 5vw, 56px)",
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
              fontSize: "16.5px",
              color: "#a19f95",
              maxWidth: "760px",
              margin: "14px auto 0",
              lineHeight: 1.6,
            }}
          >
            Choose your learning trajectory: specialized single-track semester passes, private 1-on-1 faculty mentorship, or the all-inclusive <strong>PrepMeUp All-Access Pass</strong> unlocking B.Tech, Quantum, and CyberSecurity in one place.
          </p>
        </div>

        {/* Early Adopter Banner for All-Access Pass */}
        {remaining > 0 && (
          <div
            className="pmu-card-highlight"
            style={{
              padding: "24px 28px",
              marginBottom: "40px",
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
                <span
                  className="pmu-badge"
                  style={{ backgroundColor: "#ff3b1d", color: "#08080a", fontWeight: 700 }}
                >
                  ALL-ACCESS EARLY ADOPTER CAMPAIGN
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: "12px", color: "#4ade80", fontWeight: 700 }}
                >
                  {remaining} of 10 Free Seats Left
                </span>
              </div>
              <h3
                className="font-display"
                style={{
                  fontSize: "22px",
                  color: "#f3f1ea",
                  textTransform: "uppercase",
                  marginTop: "8px",
                }}
              >
                First 10 Scholars Get 100% OFF (₹0) on PrepMeUp All-Access Pass
              </h3>
              <p style={{ fontSize: "13.5px", color: "#a19f95", marginTop: "4px" }}>
                Unlocks B.Tech CSE AI/ML Semester 1, Quantum Computing Foundations, and CyberSecurity Foundations for 6 months.
              </p>
            </div>

            <Link
              href="/prepmeup/checkout/prepmeup-all-access-pass?earlyAdopter=true"
              className="pmu-btn-primary"
              style={{ padding: "12px 24px", textDecoration: "none", fontSize: "13px" }}
            >
              Claim Free All-Access Pass (₹0) →
            </Link>
          </div>
        )}

        {/* Featured All-Access Pass Banner Card */}
        <div
          className="pmu-card"
          style={{
            padding: "36px 32px",
            marginBottom: "40px",
            border: "2px solid #ff3b1d",
            backgroundColor: "#131317",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "-12px",
              right: "32px",
              backgroundColor: "#ff3b1d",
              color: "#08080a",
              fontSize: "11px",
              fontFamily: "monospace",
              fontWeight: 700,
              padding: "4px 12px",
              borderRadius: "4px",
              textTransform: "uppercase",
            }}
          >
            ★ Best Value • All-Inclusive Flagship
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "32px",
              alignItems: "center",
            }}
          >
            <div>
              <span
                className="pmu-badge"
                style={{ backgroundColor: "rgba(255, 59, 29, 0.2)", color: "#ff6a3d" }}
              >
                Multi-Track Academic Entitlement
              </span>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(30px, 4vw, 42px)",
                  color: "#f3f1ea",
                  textTransform: "uppercase",
                  marginTop: "12px",
                }}
              >
                PrepMeUp All-Access Pass
              </h2>
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "8px",
                }}
              >
                <span className="font-display" style={{ fontSize: "44px", color: "#ff6a3d" }}>
                  ₹1,499
                </span>
                <span className="font-mono" style={{ fontSize: "13px", color: "#807f78" }}>
                  / 6 Months Complete Access
                </span>
                <span
                  style={{
                    fontSize: "13px",
                    textDecoration: "line-through",
                    color: "#6b7280",
                    marginLeft: "8px",
                  }}
                >
                  ₹2,097
                </span>
                <span
                  className="font-mono"
                  style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700 }}
                >
                  Save ₹598
                </span>
              </div>
              <p
                style={{
                  fontSize: "14px",
                  color: "#a19f95",
                  marginTop: "12px",
                  lineHeight: 1.6,
                }}
              >
                Unlocks the complete catalog across College Academics, Quantum NISQ Computing, and Defensive CyberSecurity. Includes 2 complimentary live 1-on-1 mentorship sessions and dual academic certificates.
              </p>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "14px",
                fontSize: "13.5px",
                borderLeft: "1px solid #26262c",
                paddingLeft: "24px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#4ade80" }}>✓</span>
                <span>
                  <strong>B.Tech CSE AI/ML Semester 1</strong> (All 6 core subjects, notes, past papers)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#4ade80" }}>✓</span>
                <span>
                  <strong>Quantum Computing Foundations</strong> (20 lessons, 5 simulations &amp; Bloch Sphere)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#4ade80" }}>✓</span>
                <span>
                  <strong>CyberSecurity Foundations &amp; SOC</strong> (20 lessons, 5 browser labs &amp; CTF)
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#4ade80" }}>✓</span>
                <span>
                  <strong>Dual Verified Certificates</strong> with public verification URLs &amp; PDF download
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ color: "#4ade80" }}>✓</span>
                <span>
                  <strong>2 Complimentary 1-on-1 Mentorship Sessions</strong> included (₹998 value)
                </span>
              </div>

              <div style={{ marginTop: "16px" }}>
                <Link
                  href="/prepmeup/checkout/prepmeup-all-access-pass"
                  className="pmu-btn-primary"
                  style={{
                    padding: "16px 28px",
                    fontSize: "14.5px",
                    textDecoration: "none",
                    display: "inline-block",
                    width: "100%",
                    textAlign: "center",
                  }}
                >
                  Get All-Access Pass (₹1,499) →
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Specialized Single Track Semester Passes Grid */}
        <h2
          className="font-display"
          style={{
            fontSize: "26px",
            textTransform: "uppercase",
            color: "#f3f1ea",
            marginBottom: "20px",
          }}
        >
          Specialized Single-Track Semester Passes
        </h2>

        <div className="pmu-grid-3" style={{ alignItems: "stretch", marginBottom: "50px" }}>
          {/* Card 1: B.Tech Semester Pass */}
          <div
            className="pmu-card"
            style={{
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <span className="pmu-badge">College Academics</span>
              <h3
                className="font-display"
                style={{
                  fontSize: "24px",
                  color: "#f3f1ea",
                  textTransform: "uppercase",
                  marginTop: "10px",
                }}
              >
                B.Tech Semester Pass
              </h3>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "36px", color: "#f3f1ea" }}>
                  ₹99
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  / Semester
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a19f95",
                  marginTop: "8px",
                  lineHeight: 1.5,
                }}
              >
                Comprehensive college coursework support for B.Tech Semester 1 students.
              </p>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>All 6 Semester 1 Subjects (CSE1001-CSE1006)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Verified Class Notes &amp; Cheatsheets</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Solved University Past Exam Papers</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Semester Diagnostic &amp; Practice Quizzes</span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/checkout/btech-semester-pass"
              className="pmu-btn-secondary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Buy B.Tech Pass (₹99) →
            </Link>
          </div>

          {/* Card 2: Quantum Semester Pass */}
          <div
            className="pmu-card"
            style={{
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <span className="pmu-badge">Quantum Track</span>
              <h3
                className="font-display"
                style={{
                  fontSize: "24px",
                  color: "#f3f1ea",
                  textTransform: "uppercase",
                  marginTop: "10px",
                }}
              >
                Quantum Semester Pass
              </h3>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "36px", color: "#ff6a3d" }}>
                  ₹999
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  / 6 Months
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a19f95",
                  marginTop: "8px",
                  lineHeight: 1.5,
                }}
              >
                Comprehensive NISQ algorithms, Qiskit circuits, simulations, and certificate.
              </p>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>All 20 Quantum Lessons across 5 modules</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>All 5 Interactive Quantum Simulators</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Official Verified Academic Certificate</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>1 Complimentary 1-on-1 Mentorship Session</span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/checkout/quantum-semester-pass"
              className="pmu-btn-secondary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Buy Quantum Pass (₹999) →
            </Link>
          </div>

          {/* Card 3: CyberSecurity Semester Pass */}
          <div
            className="pmu-card"
            style={{
              padding: "28px 24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "20px",
            }}
          >
            <div>
              <span className="pmu-badge">Cyber Track</span>
              <h3
                className="font-display"
                style={{
                  fontSize: "24px",
                  color: "#f3f1ea",
                  textTransform: "uppercase",
                  marginTop: "10px",
                }}
              >
                CyberSecurity Pass
              </h3>
              <div
                style={{
                  marginTop: "12px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "36px", color: "#ff6a3d" }}>
                  ₹999
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  / 6 Months
                </span>
              </div>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a19f95",
                  marginTop: "8px",
                  lineHeight: 1.5,
                }}
              >
                Hands-on defensive security, in-browser sandbox labs, CTF challenges &amp; certificate.
              </p>

              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "8px",
                  fontSize: "12.5px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>All 20 Defensive Cyber Lessons</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>All 5 Safe In-Browser Labs &amp; SOC Simulators</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>All 5 CTF Challenges with Flag Validation</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>1 Complimentary 1-on-1 Mentorship Session</span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/checkout/cybersecurity-semester-pass"
              className="pmu-btn-secondary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Buy Cyber Pass (₹999) →
            </Link>
          </div>
        </div>

        {/* 1-on-1 Mentorship Packs Section */}
        <h2
          className="font-display"
          style={{
            fontSize: "26px",
            textTransform: "uppercase",
            color: "#f3f1ea",
            marginBottom: "20px",
          }}
        >
          Dedicated 1-on-1 Mentorship Packs (45-Min Live Advisory)
        </h2>

        <div className="pmu-grid-3" style={{ alignItems: "stretch", marginBottom: "60px" }}>
          {/* Mentorship 1: Quantum */}
          <div
            className="pmu-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <span className="pmu-badge">Faculty Mentorship</span>
              <h3
                className="font-display"
                style={{ fontSize: "20px", color: "#f3f1ea", marginTop: "8px" }}
              >
                Quantum Mentorship Pack
              </h3>
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "32px", color: "#f3f1ea" }}>
                  ₹499
                </span>
                <span className="font-mono" style={{ fontSize: "11.5px", color: "#807f78" }}>
                  / 45-Min Session
                </span>
              </div>
              <p style={{ fontSize: "12.5px", color: "#a19f95", marginTop: "6px" }}>
                Private session with Dr. Aravind Vaidya, PhD. Circuit review, Qiskit algorithms, research guidance. Valid 90 days.
              </p>
            </div>
            <Link
              href="/prepmeup/checkout/quantum-mentorship-pack"
              className="pmu-btn-secondary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Book Quantum Session (₹499) →
            </Link>
          </div>

          {/* Mentorship 2: CyberSecurity */}
          <div
            className="pmu-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px",
            }}
          >
            <div>
              <span className="pmu-badge">Security Lead Mentorship</span>
              <h3
                className="font-display"
                style={{ fontSize: "20px", color: "#f3f1ea", marginTop: "8px" }}
              >
                CyberSecurity Mentorship Pack
              </h3>
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "32px", color: "#f3f1ea" }}>
                  ₹499
                </span>
                <span className="font-mono" style={{ fontSize: "11.5px", color: "#807f78" }}>
                  / 45-Min Session
                </span>
              </div>
              <p style={{ fontSize: "12.5px", color: "#a19f95", marginTop: "6px" }}>
                Private session with Senior SOC Security Leads. Defensive architecture, CTF walkthroughs, SOC interview prep. Valid 90 days.
              </p>
            </div>
            <Link
              href="/prepmeup/checkout/cybersecurity-mentorship-pack"
              className="pmu-btn-secondary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Book Cyber Session (₹499) →
            </Link>
          </div>

          {/* Mentorship 3: All-Access */}
          <div
            className="pmu-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "16px",
              border: "1px solid rgba(255, 106, 61, 0.4)",
            }}
          >
            <div>
              <span
                className="pmu-badge"
                style={{ backgroundColor: "rgba(255, 59, 29, 0.15)", color: "#ff6a3d" }}
              >
                Flexible Multi-Track Advisory
              </span>
              <h3
                className="font-display"
                style={{ fontSize: "20px", color: "#f3f1ea", marginTop: "8px" }}
              >
                All-Access Mentorship Pack
              </h3>
              <div
                style={{
                  marginTop: "10px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "32px", color: "#ff6a3d" }}>
                  ₹899
                </span>
                <span className="font-mono" style={{ fontSize: "11.5px", color: "#807f78" }}>
                  / 45-Min Session
                </span>
              </div>
              <p style={{ fontSize: "12.5px", color: "#a19f95", marginTop: "6px" }}>
                Flexible session redeemable across any track. Full engineering portfolio review, graduate school strategy &amp; career coaching.
              </p>
            </div>
            <Link
              href="/prepmeup/checkout/all-access-mentorship-pack"
              className="pmu-btn-primary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Book All-Access Session (₹899) →
            </Link>
          </div>
        </div>

        {/* Feature Comparison Table */}
        <div style={{ marginTop: "20px" }}>
          <h2
            className="font-display"
            style={{
              fontSize: "26px",
              textTransform: "uppercase",
              color: "#f3f1ea",
              textAlign: "center",
              marginBottom: "24px",
            }}
          >
            Comprehensive Plan Comparison
          </h2>

          <div className="pmu-card" style={{ padding: "24px", overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
              <thead>
                <tr
                  style={{
                    borderBottom: "1px solid #26262c",
                    textAlign: "left",
                    color: "#807f78",
                    fontFamily: "monospace",
                    fontSize: "11px",
                  }}
                >
                  <th style={{ padding: "12px 14px" }}>Features &amp; Entitlements</th>
                  <th style={{ padding: "12px 14px" }}>B.Tech (₹99)</th>
                  <th style={{ padding: "12px 14px" }}>Quantum (₹999)</th>
                  <th style={{ padding: "12px 14px" }}>Cyber (₹999)</th>
                  <th style={{ padding: "12px 14px", color: "#ff6a3d" }}>All-Access (₹1,499)</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ borderBottom: "1px solid #1a1a20" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>B.Tech Semester 1 Subjects</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80" }}>✓ (All 6)</td>
                  <td style={{ padding: "12px 14px", color: "#807f78" }}>—</td>
                  <td style={{ padding: "12px 14px", color: "#807f78" }}>—</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80", fontWeight: 700 }}>✓ (All 6)</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1a1a20" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>Quantum Computing (20 Lessons &amp; 5 Sims)</td>
                  <td style={{ padding: "12px 14px", color: "#807f78" }}>—</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80" }}>✓</td>
                  <td style={{ padding: "12px 14px", color: "#807f78" }}>—</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80", fontWeight: 700 }}>✓</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1a1a20" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>CyberSecurity (20 Lessons, 5 Labs &amp; CTF)</td>
                  <td style={{ padding: "12px 14px", color: "#807f78" }}>—</td>
                  <td style={{ padding: "12px 14px", color: "#807f78" }}>—</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80" }}>✓</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80", fontWeight: 700 }}>✓</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1a1a20" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>Academic Certificates of Completion</td>
                  <td style={{ padding: "12px 14px", color: "#807f78" }}>—</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80" }}>✓ (Quantum)</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80" }}>✓ (Cyber)</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80", fontWeight: 700 }}>✓ (Both)</td>
                </tr>
                <tr style={{ borderBottom: "1px solid #1a1a20" }}>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>Complimentary 1-on-1 Mentorship</td>
                  <td style={{ padding: "12px 14px", color: "#807f78" }}>—</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80" }}>1 Session</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80" }}>1 Session</td>
                  <td style={{ padding: "12px 14px", color: "#4ade80", fontWeight: 700 }}>2 Sessions</td>
                </tr>
                <tr>
                  <td style={{ padding: "12px 14px", fontWeight: 600 }}>Access Duration</td>
                  <td style={{ padding: "12px 14px", color: "#a19f95" }}>Semester (180d)</td>
                  <td style={{ padding: "12px 14px", color: "#a19f95" }}>6 Months</td>
                  <td style={{ padding: "12px 14px", color: "#a19f95" }}>6 Months</td>
                  <td style={{ padding: "12px 14px", color: "#ff6a3d", fontWeight: 700 }}>6 Months</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </main>
  );
}
