"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { PrepMeUpNav } from "../_components/PrepMeUpNav";
import { PrepMeUpFooter } from "../_components/PrepMeUpFooter";
import { OwnerReviewBanner } from "../_components/OwnerReviewBanner";

// TODO(owner): Release Blocker 1 — Hero "Semester 1 free for everyone" contradicts the ₹99 B.Tech pass on pricing and the ₹199 / ₹499 tiers in the landing stat strip.
// TODO(owner): Release Blocker 2 — ₹999 Quantum/Cyber passes and the ₹1,499 All-Access Pass sell tracks marked "under construction".
// TODO(owner): Release Blocker 3 — Mentorship packs name "Dr. Aravind Vaidya, PhD" and "Senior SOC Security Leads" - unverified people.
// TODO(owner): Release Blocker 4 — "Solved University Past Exam Papers" and "6 Past Paper Archives" claims vs the FAQ saying paper sources are unavailable.

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
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }}>
      <PrepMeUpNav />

      {/* Owner Review Banners for unresolved release blockers */}
      <OwnerReviewBanner
        id="blocker-1"
        blockerNumber={1}
        summary="Access & Pricing Conflict"
        detail="The marketing hero advertises Semester 1 as free, while this page lists the B.Tech Semester Pass at ₹99. Confirm whether Semester 1 is complimentary or requires the ₹99 pass."
      />
      <OwnerReviewBanner
        id="blocker-2"
        blockerNumber={2}
        summary="Selling Tracks Marked Under Construction"
        detail="The ₹999 Quantum and Cyber passes and the ₹1,499 All-Access Pass offer checkout for tracks that are flagged as 'Under Construction • Coming Soon'."
      />
      <OwnerReviewBanner
        id="blocker-3"
        blockerNumber={3}
        summary="Unverified Mentor Personas"
        detail="Mentorship packs reference 'Dr. Aravind Vaidya, PhD' and 'Senior SOC Security Leads'. Replace or verify these identities before commercial launch."
      />
      <OwnerReviewBanner
        id="blocker-4"
        blockerNumber={4}
        summary="Unverified Past Exam Papers Claim"
        detail="Plan features include 'Solved University Past Exam Papers', while FAQ states paper resources are currently unavailable."
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
          <div style={{ marginBottom: "20px" }}>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px",
                color: "#6F6B62",
              }}
            >
              <Link href="/prepmeup" style={{ color: "#6F6B62", textDecoration: "none" }}>
                PrepMeUp
              </Link>
              <span>/</span>
              <span style={{ color: "#C2331B", fontWeight: 600 }}>Pricing &amp; passes</span>
            </div>
          </div>

          {/* Hero Section */}
          <div style={{ textAlign: "center", marginBottom: "36px" }}>
            <span className="pmu-badge">Academic &amp; coursework passes</span>
            <h1
              style={{
                fontSize: "clamp(30px, 4.5vw, 44px)",
                fontWeight: 700,
                lineHeight: 1.15,
                color: "#1C1A17",
                marginTop: "12px",
                letterSpacing: "-0.02em",
              }}
            >
              Transparent academic access plans
            </h1>
            <p
              style={{
                fontSize: "16px",
                color: "#6F6B62",
                maxWidth: "720px",
                margin: "12px auto 0",
                lineHeight: 1.6,
              }}
            >
              Choose your learning path: single-track semester passes, 1:1 faculty mentorship, or the multi-track PrepMeUp All-Access Pass.
            </p>
          </div>

          {/* Early Adopter Banner */}
          {remaining > 0 && (
            <div
              className="pmu-card"
              style={{
                padding: "20px 24px",
                marginBottom: "32px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                flexWrap: "wrap",
                gap: "16px",
                border: "1px solid #E8E4DB",
                backgroundColor: "#F6E7E3",
              }}
            >
              <div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span
                    className="pmu-badge"
                    style={{ backgroundColor: "#FFFFFF", color: "#C2331B", borderColor: "#E8E4DB" }}
                  >
                    Early adopter campaign
                  </span>
                  <span
                    className="font-mono"
                    style={{ fontSize: "12px", color: "#1F7A4D", fontWeight: 600 }}
                  >
                    {remaining} of 10 seats remaining
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: "18px",
                    fontWeight: 700,
                    color: "#1C1A17",
                    marginTop: "6px",
                  }}
                >
                  First 10 scholars receive early access to the All-Access Pass
                </h3>
                <p style={{ fontSize: "13px", color: "#6F6B62", marginTop: "2px" }}>
                  Unlocks B.Tech CSE AI/ML Semester 1, Quantum Computing Foundations, and CyberSecurity Foundations for 6 months.
                </p>
              </div>

              <Link
                href="/prepmeup/checkout/prepmeup-all-access-pass?earlyAdopter=true"
                className="pmu-btn-primary"
                style={{ padding: "10px 20px", textDecoration: "none", fontSize: "13px" }}
              >
                Claim early adopter pass →
              </Link>
            </div>
          )}

          {/* Featured All-Access Pass Banner Card */}
          <div
            className="pmu-card"
            style={{
              padding: "32px 28px",
              marginBottom: "36px",
              border: "1.5px solid #C2331B",
              backgroundColor: "#FFFFFF",
              position: "relative",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "-11px",
                right: "24px",
                backgroundColor: "#F6E7E3",
                color: "#C2331B",
                border: "1px solid #E8E4DB",
                fontSize: "11px",
                fontWeight: 600,
                padding: "3px 10px",
                borderRadius: "9999px",
              }}
            >
              All-inclusive pass
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                gap: "28px",
                alignItems: "center",
              }}
            >
              <div>
                <span className="pmu-badge">Multi-track entitlement</span>
                <h2
                  style={{
                    fontSize: "clamp(26px, 3.5vw, 34px)",
                    fontWeight: 700,
                    color: "#1C1A17",
                    marginTop: "8px",
                    letterSpacing: "-0.015em",
                  }}
                >
                  PrepMeUp All-Access Pass
                </h2>
                <div
                  style={{
                    marginTop: "12px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "8px",
                  }}
                >
                  <span style={{ fontSize: "36px", fontWeight: 700, color: "#1C1A17" }}>
                    ₹1,499
                  </span>
                  <span style={{ fontSize: "13px", color: "#6F6B62" }}>
                    / 6 months access
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "14px",
                    color: "#6F6B62",
                    marginTop: "10px",
                    lineHeight: 1.55,
                  }}
                >
                  Access across College Academics, Quantum NISQ Computing, and Defensive CyberSecurity. Includes 2 complimentary 1:1 mentorship sessions and course completion certificates.
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "13px",
                  borderLeft: "1px solid #E8E4DB",
                  paddingLeft: "24px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                  <span><strong>B.Tech CSE AI/ML Semester 1:</strong> 6 core subjects and LaTeX notes</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                  <span><strong>Quantum Computing Foundations:</strong> 20 lessons and 5 simulators</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                  <span><strong>CyberSecurity Foundations:</strong> 20 lessons and 5 browser labs</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                  <span><strong>Course certificates:</strong> public verification URL and PDF download</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                  <span><strong>2 complimentary 1:1 mentorship sessions</strong> included</span>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <Link
                    href="/prepmeup/checkout/prepmeup-all-access-pass"
                    className="pmu-btn-primary"
                    style={{
                      padding: "12px 24px",
                      fontSize: "14px",
                      textDecoration: "none",
                      display: "inline-block",
                      width: "100%",
                      textAlign: "center",
                    }}
                  >
                    Select All-Access Pass (₹1,499)
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Specialized Single Track Semester Passes Grid */}
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#1C1A17",
              marginBottom: "16px",
            }}
          >
            Single-track semester passes
          </h2>

          <div className="pmu-grid-3" style={{ alignItems: "stretch", marginBottom: "40px" }}>
            {/* Card 1: B.Tech Semester Pass */}
            <div
              className="pmu-card"
              style={{
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px",
              }}
            >
              <div>
                <span className="pmu-badge">College academics</span>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1C1A17",
                    marginTop: "8px",
                  }}
                >
                  B.Tech Semester Pass
                </h3>
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "30px", fontWeight: 700, color: "#1C1A17" }}>
                    ₹99
                  </span>
                  <span style={{ fontSize: "12px", color: "#6F6B62" }}>
                    / semester
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6F6B62",
                    marginTop: "6px",
                    lineHeight: 1.5,
                  }}
                >
                  College coursework support for B.Tech Semester 1 students.
                </p>

                <div
                  style={{
                    marginTop: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>All 6 Semester 1 subjects (CSE1001-CSE1006)</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>LaTeX study notes and derivations</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>Topic practice quizzes and simulations</span>
                  </div>
                </div>
              </div>

              <Link
                href="/prepmeup/checkout/btech-semester-pass"
                className="pmu-btn-secondary"
                style={{ width: "100%", textAlign: "center", textDecoration: "none", justifyContent: "center" }}
              >
                Select B.Tech pass (₹99)
              </Link>
            </div>

            {/* Card 2: Quantum Semester Pass */}
            <div
              className="pmu-card"
              style={{
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px",
              }}
            >
              <div>
                <span className="pmu-badge">Quantum track</span>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1C1A17",
                    marginTop: "8px",
                  }}
                >
                  Quantum Semester Pass
                </h3>
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "30px", fontWeight: 700, color: "#1C1A17" }}>
                    ₹999
                  </span>
                  <span style={{ fontSize: "12px", color: "#6F6B62" }}>
                    / 6 months
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6F6B62",
                    marginTop: "6px",
                    lineHeight: 1.5,
                  }}
                >
                  NISQ algorithms, Qiskit circuits, simulations, and certificate.
                </p>

                <div
                  style={{
                    marginTop: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>20 quantum lessons across 5 modules</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>5 interactive quantum simulators</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>Academic certificate of completion</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>1 included 1:1 mentorship session</span>
                  </div>
                </div>
              </div>

              <Link
                href="/prepmeup/checkout/quantum-semester-pass"
                className="pmu-btn-secondary"
                style={{ width: "100%", textAlign: "center", textDecoration: "none", justifyContent: "center" }}
              >
                Select Quantum pass (₹999)
              </Link>
            </div>

            {/* Card 3: CyberSecurity Semester Pass */}
            <div
              className="pmu-card"
              style={{
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "18px",
              }}
            >
              <div>
                <span className="pmu-badge">Cyber track</span>
                <h3
                  style={{
                    fontSize: "20px",
                    fontWeight: 700,
                    color: "#1C1A17",
                    marginTop: "8px",
                  }}
                >
                  CyberSecurity Pass
                </h3>
                <div
                  style={{
                    marginTop: "10px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "30px", fontWeight: 700, color: "#1C1A17" }}>
                    ₹999
                  </span>
                  <span style={{ fontSize: "12px", color: "#6F6B62" }}>
                    / 6 months
                  </span>
                </div>
                <p
                  style={{
                    fontSize: "13px",
                    color: "#6F6B62",
                    marginTop: "6px",
                    lineHeight: 1.5,
                  }}
                >
                  Defensive security, in-browser sandbox labs, and CTF challenges.
                </p>

                <div
                  style={{
                    marginTop: "14px",
                    display: "flex",
                    flexDirection: "column",
                    gap: "6px",
                    fontSize: "12.5px",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>20 defensive security lessons</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>5 in-browser sandbox labs</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>5 CTF challenges with flag checks</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ color: "#C2331B", fontWeight: 600 }}>—</span>
                    <span>1 included 1:1 mentorship session</span>
                  </div>
                </div>
              </div>

              <Link
                href="/prepmeup/checkout/cybersecurity-semester-pass"
                className="pmu-btn-secondary"
                style={{ width: "100%", textAlign: "center", textDecoration: "none", justifyContent: "center" }}
              >
                Select Cyber pass (₹999)
              </Link>
            </div>
          </div>

          {/* 1-on-1 Mentorship Packs Section */}
          <h2
            style={{
              fontSize: "22px",
              fontWeight: 700,
              color: "#1C1A17",
              marginBottom: "16px",
            }}
          >
            1-on-1 faculty mentorship packs (45-min live session)
          </h2>

          <div className="pmu-grid-3" style={{ alignItems: "stretch", marginBottom: "40px" }}>
            {/* Mentorship 1: Quantum */}
            <div
              className="pmu-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <span className="pmu-badge">Faculty mentorship</span>
                <h3
                  style={{ fontSize: "18px", fontWeight: 700, color: "#1C1A17", marginTop: "6px" }}
                >
                  Quantum Mentorship Pack
                </h3>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "28px", fontWeight: 700, color: "#1C1A17" }}>
                    ₹499
                  </span>
                  <span style={{ fontSize: "11px", color: "#6F6B62" }}>
                    / session
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "#6F6B62", marginTop: "4px" }}>
                  Private session for circuit review, Qiskit algorithms, and study guidance. Valid 90 days.
                </p>
              </div>
              <Link
                href="/prepmeup/checkout/quantum-mentorship-pack"
                className="pmu-btn-secondary"
                style={{ width: "100%", textAlign: "center", textDecoration: "none", justifyContent: "center" }}
              >
                Book Quantum session (₹499)
              </Link>
            </div>

            {/* Mentorship 2: CyberSecurity */}
            <div
              className="pmu-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <span className="pmu-badge">Security lead mentorship</span>
                <h3
                  style={{ fontSize: "18px", fontWeight: 700, color: "#1C1A17", marginTop: "6px" }}
                >
                  CyberSecurity Mentorship Pack
                </h3>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "28px", fontWeight: 700, color: "#1C1A17" }}>
                    ₹499
                  </span>
                  <span style={{ fontSize: "11px", color: "#6F6B62" }}>
                    / session
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "#6F6B62", marginTop: "4px" }}>
                  Private session for defensive architecture, CTF walkthroughs, and technical review. Valid 90 days.
                </p>
              </div>
              <Link
                href="/prepmeup/checkout/cybersecurity-mentorship-pack"
                className="pmu-btn-secondary"
                style={{ width: "100%", textAlign: "center", textDecoration: "none", justifyContent: "center" }}
              >
                Book Cyber session (₹499)
              </Link>
            </div>

            {/* Mentorship 3: All-Access */}
            <div
              className="pmu-card"
              style={{
                padding: "20px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                gap: "16px",
              }}
            >
              <div>
                <span className="pmu-badge">Multi-track advisory</span>
                <h3
                  style={{ fontSize: "18px", fontWeight: 700, color: "#1C1A17", marginTop: "6px" }}
                >
                  All-Access Mentorship Pack
                </h3>
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    alignItems: "baseline",
                    gap: "6px",
                  }}
                >
                  <span style={{ fontSize: "28px", fontWeight: 700, color: "#1C1A17" }}>
                    ₹899
                  </span>
                  <span style={{ fontSize: "11px", color: "#6F6B62" }}>
                    / session
                  </span>
                </div>
                <p style={{ fontSize: "12.5px", color: "#6F6B62", marginTop: "4px" }}>
                  Flexible session across any track. Portfolio review, academic strategy, and technical guidance.
                </p>
              </div>
              <Link
                href="/prepmeup/checkout/all-access-mentorship-pack"
                className="pmu-btn-primary"
                style={{ width: "100%", textAlign: "center", textDecoration: "none", justifyContent: "center" }}
              >
                Book All-Access session (₹899)
              </Link>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div style={{ marginTop: "20px" }}>
            <h2
              style={{
                fontSize: "22px",
                fontWeight: 700,
                color: "#1C1A17",
                textAlign: "center",
                marginBottom: "16px",
              }}
            >
              Plan comparison
            </h2>

            <div className="pmu-card" style={{ padding: "20px", overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
                <thead>
                  <tr
                    style={{
                      borderBottom: "1px solid #E8E4DB",
                      textAlign: "left",
                      color: "#6F6B62",
                      fontSize: "12px",
                    }}
                  >
                    <th style={{ padding: "10px 12px" }}>Features</th>
                    <th style={{ padding: "10px 12px" }}>B.Tech (₹99)</th>
                    <th style={{ padding: "10px 12px" }}>Quantum (₹999)</th>
                    <th style={{ padding: "10px 12px" }}>Cyber (₹999)</th>
                    <th style={{ padding: "10px 12px", color: "#C2331B", fontWeight: 600 }}>All-Access (₹1,499)</th>
                  </tr>
                </thead>
                <tbody>
                  <tr style={{ borderBottom: "1px solid #E8E4DB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>B.Tech Semester 1 subjects</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17" }}>Included (6)</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>—</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>—</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17", fontWeight: 600 }}>Included (6)</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E8E4DB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Quantum Computing track</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>—</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17" }}>Included</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>—</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17", fontWeight: 600 }}>Included</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E8E4DB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>CyberSecurity track</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>—</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>—</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17" }}>Included</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17", fontWeight: 600 }}>Included</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E8E4DB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Certificates of completion</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>—</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17" }}>Quantum</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17" }}>Cyber</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17", fontWeight: 600 }}>Both</td>
                  </tr>
                  <tr style={{ borderBottom: "1px solid #E8E4DB" }}>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>1:1 Mentorship sessions</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>—</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17" }}>1 session</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17" }}>1 session</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17", fontWeight: 600 }}>2 sessions</td>
                  </tr>
                  <tr>
                    <td style={{ padding: "10px 12px", fontWeight: 600 }}>Access duration</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>180 days</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>6 months</td>
                    <td style={{ padding: "10px 12px", color: "#6F6B62" }}>6 months</td>
                    <td style={{ padding: "10px 12px", color: "#1C1A17", fontWeight: 600 }}>6 months</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </main>

      <PrepMeUpFooter />
    </div>
  );
}
