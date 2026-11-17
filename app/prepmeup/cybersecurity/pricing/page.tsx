"use client";

import React from "react";
import { PageHeader, EmptyState } from "../../_components/ui";

export default function CyberSecurityPricingPage() {
  return (
    <main className="pmu-container" style={{ paddingTop: "40px", paddingBottom: "80px", display: "flex", flexDirection: "column", gap: "24px" }}>
      <PageHeader title="CyberSecurity" subtitle="Under construction — coming soon." />
      <EmptyState
        title="Coming Soon"
        description="CyberSecurity is currently under construction. Check back soon or explore your active Semester 1 courses."
        action={{ label: "Back to Pricing", href: "/prepmeup/pricing" }}
      />
    </main>
  );
}

function _LegacyUnused() {
  const [earlyInfo, setEarlyInfo] = useState<EarlyAdopterInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prepmeup/cybersecurity/early-adopter")
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
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
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
            <Link
              href="/prepmeup/tracks/cybersecurity"
              style={{ color: "#807f78", textDecoration: "none" }}
            >
              CyberSecurity Track
            </Link>
            <span>/</span>
            <span style={{ color: "#ff6a3d" }}>Pricing &amp; Enrollment</span>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="pmu-badge">🛡️ Defensive Security &amp; SOC Academy</span>
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
              maxWidth: "700px",
              margin: "14px auto 0",
              lineHeight: 1.6,
            }}
          >
            Select your training trajectory: comprehensive 6-month defensive security curriculum with verified academic credential, or private 1-on-1 mentorship with certified SOC security engineers.
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
                <span
                  className="pmu-badge"
                  style={{ backgroundColor: "#ff3b1d", color: "#08080a", fontWeight: 700 }}
                >
                  LIMITED EARLY ADOPTER CAMPAIGN
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
                First 10 Defenders Get 100% OFF (₹0) on CyberSecurity Semester Pass
              </h3>
              <p style={{ fontSize: "13.5px", color: "#a19f95", marginTop: "4px" }}>
                Includes all 20 lessons, all 5 in-browser safe defense labs, CTF challenges, AI tutor, and official certificate.
              </p>
            </div>

            <Link
              href="/prepmeup/cybersecurity/checkout?product=semester_pass&earlyAdopter=true"
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
              <h2
                className="font-display"
                style={{
                  fontSize: "28px",
                  color: "#f3f1ea",
                  textTransform: "uppercase",
                  marginTop: "12px",
                }}
              >
                Orientation
              </h2>
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "40px", color: "#f3f1ea" }}>
                  ₹0
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  Forever Free
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "10px", lineHeight: 1.5 }}>
                Test our in-browser defensive sandbox lab, diagnostic assessment, and incident case before enrolling.
              </p>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Lesson 1.1: Security Fundamentals &amp; CIA Triad</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Interactive SQLi Lab: Blind Parameter Defense</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Module 1 Diagnostic Assessment (5 Questions)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>SOC Incident Case: Equifax Apache Struts Analysis</span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", color: "#807f78" }}
                >
                  <span>✕</span>
                  <span>No certificate eligibility</span>
                </div>
                <div
                  style={{ display: "flex", alignItems: "center", gap: "8px", color: "#807f78" }}
                >
                  <span>✕</span>
                  <span>No 1:1 mentorship sessions</span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/courses/cybersecurity-foundations-ethical-hacking-soc-ctf/learn/lesson-c1-01"
              className="pmu-btn-secondary"
              style={{ width: "100%", textAlign: "center", textDecoration: "none" }}
            >
              Start Free Preview Lesson 1.1 →
            </Link>
          </div>

          {/* Card 2: CyberSecurity Semester Pass (Featured) */}
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
              <span
                className="pmu-badge"
                style={{ backgroundColor: "rgba(255, 59, 29, 0.2)", color: "#ff6a3d" }}
              >
                Full Track Access
              </span>
              <h2
                className="font-display"
                style={{
                  fontSize: "28px",
                  color: "#f3f1ea",
                  textTransform: "uppercase",
                  marginTop: "12px",
                }}
              >
                CyberSecurity Semester Pass
              </h2>
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "42px", color: "#ff6a3d" }}>
                  ₹999
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  / 6 Months Access
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "10px", lineHeight: 1.5 }}>
                Complete defensive engineering curriculum covering AppSec, Network Defense, Cryptography, Incident Response &amp; SIEM log triage.
              </p>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>
                    <strong>All 20 Lessons</strong> across 5 structured defense modules
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>
                    <strong>All 5 Safe In-Browser Labs</strong> &amp; SOC triage simulators
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>
                    <strong>All 5 CTF Challenges</strong> with secure flag validation
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>
                    <strong>Unlimited Cyber AI Tutor</strong> with security-hardened guardrails
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>
                    <strong>Academic Certificate of Completion</strong> with public QR verification
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>
                    <strong>1 Complimentary 1-on-1 Mentorship</strong> session included
                  </span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/cybersecurity/checkout?product=semester_pass"
              className="pmu-btn-primary"
              style={{
                width: "100%",
                textAlign: "center",
                textDecoration: "none",
                padding: "14px",
                fontSize: "14px",
              }}
            >
              Enroll in CyberSecurity Pass (₹999) →
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
              <span className="pmu-badge">Live Advisory</span>
              <h2
                className="font-display"
                style={{
                  fontSize: "28px",
                  color: "#f3f1ea",
                  textTransform: "uppercase",
                  marginTop: "12px",
                }}
              >
                1-on-1 Mentorship Pack
              </h2>
              <div
                style={{
                  marginTop: "14px",
                  display: "flex",
                  alignItems: "baseline",
                  gap: "6px",
                }}
              >
                <span className="font-display" style={{ fontSize: "40px", color: "#f3f1ea" }}>
                  ₹499
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  / 45-Min Session
                </span>
              </div>
              <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "10px", lineHeight: 1.5 }}>
                Private 1-on-1 advisory with experienced SOC analysts and defensive security leads. Valid for 90 days.
              </p>

              <div
                style={{
                  marginTop: "24px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                  fontSize: "13px",
                }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>
                    <strong>45-Minute Private Session</strong> with verified security leads
                  </span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>CTF walkthroughs &amp; lab remediation guidance</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>SOC Analyst L1/L2 Technical Interview Prep</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>Resume &amp; portfolio project review</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span>90-day flexible booking validity</span>
                </div>
              </div>
            </div>

            <Link
              href="/prepmeup/cybersecurity/checkout?product=mentorship_pack"
              className="pmu-btn-secondary"
              style={{
                width: "100%",
                textAlign: "center",
                textDecoration: "none",
                padding: "14px",
                fontSize: "14px",
              }}
            >
              Book Mentorship Pack (₹499) →
            </Link>
          </div>
        </div>

        {/* Security & Ethical FAQ */}
        <div style={{ marginTop: "64px" }}>
          <h2
            className="font-display"
            style={{
              fontSize: "28px",
              textTransform: "uppercase",
              color: "#f3f1ea",
              textAlign: "center",
              marginBottom: "32px",
            }}
          >
            Frequently Asked Questions
          </h2>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
              gap: "20px",
            }}
          >
            <div className="pmu-card" style={{ padding: "20px 24px" }}>
              <h3 className="font-display" style={{ fontSize: "16px", color: "#ff6a3d" }}>
                How do safe in-browser labs work?
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a19f95",
                  marginTop: "8px",
                  lineHeight: 1.6,
                }}
              >
                All labs run in a controlled client-side simulated environment (Web Worker sandbox). No real network attack traffic is generated and no external infrastructure is targeted.
              </p>
            </div>

            <div className="pmu-card" style={{ padding: "20px 24px" }}>
              <h3 className="font-display" style={{ fontSize: "16px", color: "#ff6a3d" }}>
                How does the Early Adopter 100% scholarship work?
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a19f95",
                  marginTop: "8px",
                  lineHeight: 1.6,
                }}
              >
                The first 10 students who claim the CyberSecurity Semester Pass receive full 6-month access at ₹0. Once all 10 seats are claimed, normal checkout applies.
              </p>
            </div>

            <div className="pmu-card" style={{ padding: "20px 24px" }}>
              <h3 className="font-display" style={{ fontSize: "16px", color: "#ff6a3d" }}>
                Are certificates cryptographically verifiable?
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a19f95",
                  marginTop: "8px",
                  lineHeight: 1.6,
                }}
              >
                Yes. Each completion certificate has a unique tamper-evident verification code (`PMU-CYB-2026-XXXXXX`) and a public verification URL with an instant PDF download.
              </p>
            </div>

            <div className="pmu-card" style={{ padding: "20px 24px" }}>
              <h3 className="font-display" style={{ fontSize: "16px", color: "#ff6a3d" }}>
                What payment methods are supported?
              </h3>
              <p
                style={{
                  fontSize: "13px",
                  color: "#a19f95",
                  marginTop: "8px",
                  lineHeight: 1.6,
                }}
              >
                We support UPI (Google Pay, PhonePe, Paytm), NetBanking across 50+ Indian banks, debit/credit cards, and digital wallets powered by Razorpay.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
