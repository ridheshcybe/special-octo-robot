import React from "react";
import Link from "next/link";
import { PrepMeUpNav } from "../_components/PrepMeUpNav";
import { PrepMeUpFooter } from "../_components/PrepMeUpFooter";

interface LegalShellProps {
  title: string;
  subtitle: string;
  lastUpdated?: string;
  children: React.ReactNode;
}

export function LegalShell({
  title,
  subtitle,
  lastUpdated = "October 2026",
  children,
}: LegalShellProps) {
  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#08080a", color: "#f3f1ea" }}>
      <PrepMeUpNav />

      <main style={{ flex: 1, paddingTop: "3.5rem", paddingBottom: "5rem" }}>
        <div className="pmu-container" style={{ maxWidth: "860px" }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: "2rem", display: "flex", alignItems: "center", gap: "8px", fontSize: "12px", fontFamily: "monospace" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }} className="hover:text-[#f3f1ea]">
              PrepMeUp AI
            </Link>
            <span style={{ color: "#404044" }}>/</span>
            <span style={{ color: "#ff6a3d" }}>Legal &amp; Policy</span>
          </div>

          {/* Header */}
          <div style={{ borderBottom: "1px solid rgba(243,241,234,0.12)", paddingBottom: "2rem", marginBottom: "2.5rem" }}>
            <span
              style={{
                display: "inline-block",
                padding: "4px 10px",
                borderRadius: "9999px",
                fontSize: "11px",
                fontFamily: "monospace",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                backgroundColor: "rgba(255,59,29,0.12)",
                color: "#ff6a3d",
                border: "1px solid rgba(255,59,29,0.3)",
                marginBottom: "12px",
              }}
            >
              Academic Policy &amp; Terms
            </span>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(2rem, 5vw, 3.25rem)",
                lineHeight: 1.05,
                textTransform: "uppercase",
                letterSpacing: "-0.02em",
                color: "#f3f1ea",
                margin: 0,
              }}
            >
              {title}
            </h1>
            <p style={{ marginTop: "12px", fontSize: "15px", lineHeight: 1.6, color: "#a19f95" }}>
              {subtitle}
            </p>
            <p style={{ marginTop: "8px", fontSize: "12px", fontFamily: "monospace", color: "#606066" }}>
              Last updated: {lastUpdated} • Direct Student Service
            </p>
          </div>

          {/* Content Card */}
          <div
            className="pmu-card"
            style={{
              padding: "36px 32px",
              backgroundColor: "#111114",
              border: "1px solid rgba(243,241,234,0.1)",
              borderRadius: "12px",
              lineHeight: 1.75,
              fontSize: "14px",
              color: "#c7c5bc",
            }}
          >
            {children}
          </div>

          {/* Quick Legal Switcher */}
          <div
            style={{
              marginTop: "2.5rem",
              padding: "16px 20px",
              borderRadius: "8px",
              border: "1px solid rgba(243,241,234,0.08)",
              backgroundColor: "#0d0d10",
              display: "flex",
              flexWrap: "wrap",
              gap: "16px",
              alignItems: "center",
              justifyContent: "space-between",
              fontSize: "12px",
            }}
          >
            <span style={{ color: "#807f78", fontWeight: 600 }}>Other Policies:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "14px" }}>
              <Link href="/prepmeup/terms" style={{ color: "#f3f1ea", textDecoration: "none" }} className="hover:text-[#ff3b1d]">
                Terms of Service
              </Link>
              <Link href="/prepmeup/privacy" style={{ color: "#f3f1ea", textDecoration: "none" }} className="hover:text-[#ff3b1d]">
                Privacy Policy
              </Link>
              <Link href="/prepmeup/refunds" style={{ color: "#f3f1ea", textDecoration: "none" }} className="hover:text-[#ff3b1d]">
                Refunds
              </Link>
              <Link href="/prepmeup/pricing-policy" style={{ color: "#f3f1ea", textDecoration: "none" }} className="hover:text-[#ff3b1d]">
                Pricing &amp; Delivery
              </Link>
              <Link href="/prepmeup/contact" style={{ color: "#f3f1ea", textDecoration: "none" }} className="hover:text-[#ff3b1d]">
                Merchant Contact
              </Link>
            </div>
          </div>
        </div>
      </main>

      <PrepMeUpFooter />
    </div>
  );
}

export function LegalSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section style={{ marginBottom: "28px" }}>
      <h2
        style={{
          fontFamily: 'var(--font-anton), "Anton", sans-serif',
          fontSize: "18px",
          textTransform: "uppercase",
          letterSpacing: "0.04em",
          color: "#f3f1ea",
          marginBottom: "12px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}
      >
        <span style={{ color: "#ff3b1d" }}>■</span>
        <span>{title}</span>
      </h2>
      <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>{children}</div>
    </section>
  );
}
