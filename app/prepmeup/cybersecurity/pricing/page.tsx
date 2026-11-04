"use client";

import React, { useState } from "react";
import Link from "next/link";

export default function CyberSecurityPricingPage() {
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [waitlistRole, setWaitlistRole] = useState("student");
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!waitlistEmail || !waitlistEmail.includes("@")) return;
    setLoading(true);
    // Simulate instantaneous client-side waitlist recording
    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 450);
  };

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
            <span style={{ color: "#ff6a3d" }}>Pricing &amp; Waitlist</span>
          </div>
        </div>

        {/* Hero Section */}
        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span
            className="pmu-badge"
            style={{
              display: "inline-block",
              padding: "4px 12px",
              borderRadius: "999px",
              backgroundColor: "rgba(255, 59, 29, 0.12)",
              border: "1px solid rgba(255, 59, 29, 0.3)",
              color: "#ff6a3d",
              fontSize: "12px",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.5px",
            }}
          >
            🛡️ Defensive Security &amp; SOC Academy
          </span>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(34px, 5vw, 54px)",
              lineHeight: 1.05,
              textTransform: "uppercase",
              color: "#f3f1ea",
              marginTop: "16px",
            }}
          >
            CyberSecurity Pass &amp; Early Access
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#a19f95",
              maxWidth: "680px",
              margin: "12px auto 0",
              lineHeight: 1.6,
            }}
          >
            Master ethical hacking, defensive web architecture, and SOC incident triage
            through safe, client-side browser sandboxes and CTF challenges.
          </p>
        </div>

        {/* Pricing Cards Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
            gap: "24px",
            marginBottom: "56px",
          }}
        >
          {/* Card 1: Free Preview */}
          <div
            style={{
              backgroundColor: "#111114",
              border: "1px solid #26262b",
              borderRadius: "16px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
            }}
          >
            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(16, 185, 129, 0.1)",
                  border: "1px solid rgba(16, 185, 129, 0.25)",
                  color: "#10b981",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                FREE PREVIEW TIER
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
                Educational Trial
              </h2>
              <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginBottom: "16px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#f3f1ea" }}>₹0</span>
                <span style={{ color: "#807f78", fontSize: "14px" }}>/ lifetime free</span>
              </div>
              <p style={{ color: "#a19f95", fontSize: "14px", lineHeight: 1.5, marginBottom: "24px" }}>
                Immediate zero-cost preview access to foundational security concepts and
                your first hands-on browser lab.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "#d1cfc7" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Lesson 1.1: Foundations of Cyber Defense
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Lab 1: HTTP Header &amp; Cookie Security Analyzer
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Quiz 1: Cyber Security Fundamentals (5 questions)
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Incident Case 1: Triage Overview
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#10b981" }}>✓</span> Cyber AI Doubt Assistant (Defensive Mode)
                </li>
              </ul>
            </div>
            <div style={{ marginTop: "32px" }}>
              <Link
                href="/prepmeup/cybersecurity/labs/http-header-and-cookie-security-analyzer"
                style={{
                  display: "block",
                  textAlign: "center",
                  backgroundColor: "#17171b",
                  border: "1px solid #38383e",
                  color: "#f3f1ea",
                  padding: "12px 20px",
                  borderRadius: "8px",
                  fontWeight: 600,
                  fontSize: "14px",
                  textDecoration: "none",
                }}
              >
                Launch Free Lab 1 →
              </Link>
            </div>
          </div>

          {/* Card 2: Full CyberSecurity Pass (Coming Soon) */}
          <div
            style={{
              backgroundColor: "#111116",
              border: "1px solid rgba(255, 59, 29, 0.6)",
              borderRadius: "16px",
              padding: "32px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              position: "relative",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: "16px",
                right: "16px",
                padding: "4px 10px",
                borderRadius: "999px",
                backgroundColor: "#ff3b1d",
                color: "#ffffff",
                fontSize: "11px",
                fontWeight: 700,
                textTransform: "uppercase",
              }}
            >
              WAITLIST STAGE
            </div>

            <div>
              <div
                style={{
                  display: "inline-block",
                  padding: "3px 8px",
                  borderRadius: "6px",
                  backgroundColor: "rgba(255, 106, 61, 0.15)",
                  border: "1px solid rgba(255, 106, 61, 0.3)",
                  color: "#ff6a3d",
                  fontSize: "11px",
                  fontFamily: "monospace",
                  fontWeight: 600,
                  marginBottom: "12px",
                }}
              >
                ALL-INCLUSIVE LAB PASS
              </div>
              <h2 style={{ fontSize: "22px", fontWeight: 700, margin: "0 0 8px" }}>
                Complete CyberSecurity Pass
              </h2>
              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "16px" }}>
                <span style={{ fontSize: "36px", fontWeight: 800, color: "#f3f1ea" }}>₹1,499</span>
                <span style={{ color: "#807f78", fontSize: "14px", textDecoration: "line-through" }}>₹2,999</span>
                <span style={{ color: "#ff6a3d", fontSize: "12px", fontWeight: 600 }}>50% OFF FOR WAITLIST</span>
              </div>
              <p style={{ color: "#a19f95", fontSize: "14px", lineHeight: 1.5, marginBottom: "24px" }}>
                Unrestricted access to all 5 modules, all 5 browser sandboxes, complete CTF challenge flag
                verification, SOC log triages, and verified certificate of completion.
              </p>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: "10px", fontSize: "14px", color: "#d1cfc7" }}>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ff6a3d" }}>✓</span> All 20 Lessons across 5 Specialized Modules
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ff6a3d" }}>✓</span> All 5 Controlled Browser Sandboxes (Nmap, SQLi, SOC, CTF)
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ff6a3d" }}>✓</span> Real-Time CTF Flag Verification &amp; Points Tracker
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ff6a3d" }}>✓</span> Industry SOC Playbook &amp; Incident Case Studies
                </li>
                <li style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: "#ff6a3d" }}>✓</span> Digitally Verifiable PrepMeUp AI Security Credential
                </li>
              </ul>
            </div>

            <div style={{ marginTop: "32px" }}>
              {!submitted ? (
                <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                  <input
                    type="email"
                    required
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    placeholder="Enter your email to join waitlist"
                    style={{
                      backgroundColor: "#08080a",
                      border: "1px solid #38383e",
                      borderRadius: "8px",
                      padding: "12px 14px",
                      color: "#f3f1ea",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    style={{
                      backgroundColor: "#ff3b1d",
                      border: "none",
                      color: "#ffffff",
                      padding: "12px 20px",
                      borderRadius: "8px",
                      fontWeight: 700,
                      fontSize: "14px",
                      cursor: "pointer",
                      transition: "opacity 0.2s",
                    }}
                  >
                    {loading ? "Registering..." : "Join VIP Waitlist (Save 50%)"}
                  </button>
                </form>
              ) : (
                <div
                  style={{
                    backgroundColor: "rgba(16, 185, 129, 0.12)",
                    border: "1px solid rgba(16, 185, 129, 0.3)",
                    padding: "14px",
                    borderRadius: "8px",
                    textAlign: "center",
                    color: "#10b981",
                    fontSize: "14px",
                    fontWeight: 600,
                  }}
                >
                  ✓ You are on the VIP Waitlist! You will receive launch access and the 50% discount code first.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Ethical Standards & Safety Architecture */}
        <div
          style={{
            backgroundColor: "#111114",
            border: "1px solid #26262b",
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          <h3
            style={{
              fontSize: "18px",
              fontWeight: 700,
              color: "#f3f1ea",
              marginBottom: "12px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span>⚖️</span> Ethical Hacking &amp; Authorized Educational Sandbox Policy
          </h3>
          <p style={{ color: "#a19f95", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px" }}>
            PrepMeUp AI operates in strict accordance with the Information Technology Act,
            international computer security standards, and the EC-Council Code of Ethics.
            All interactive labs run entirely inside safe, controlled, synthetic browser sandboxes.
          </p>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
              gap: "16px",
              fontSize: "13px",
              color: "#d1cfc7",
            }}
          >
            <div style={{ backgroundColor: "#17171b", padding: "16px", borderRadius: "8px" }}>
              <strong style={{ color: "#f3f1ea" }}>Zero Offensive Infrastructure</strong>
              <p style={{ margin: "6px 0 0", color: "#807f78" }}>
                No live attack traffic, external vulnerability scanning, or weaponized payload generation is supported.
              </p>
            </div>
            <div style={{ backgroundColor: "#17171b", padding: "16px", borderRadius: "8px" }}>
              <strong style={{ color: "#f3f1ea" }}>Explicit Policy Acceptance</strong>
              <p style={{ margin: "6px 0 0", color: "#807f78" }}>
                Learners must formally accept the Ethical Conduct Pledge prior to launching lab simulations.
              </p>
            </div>
            <div style={{ backgroundColor: "#17171b", padding: "16px", borderRadius: "8px" }}>
              <strong style={{ color: "#f3f1ea" }}>Defensive First Pedagogy</strong>
              <p style={{ margin: "6px 0 0", color: "#807f78" }}>
                Every vulnerability demonstrated is paired with industry-standard remediation code and logging guidelines.
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
