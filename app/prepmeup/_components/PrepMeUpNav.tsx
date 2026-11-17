"use client";

import Link from "next/link";
import { useState } from "react";

export function PrepMeUpNav() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="pmu-header">
      <div className="pmu-container pmu-header-inner">
        {/* Brand & Back link */}
        <div className="pmu-brand-group">
          <Link href="/" className="pmu-back-link">
            <span>←</span>
            <span>Ridhesh.dev</span>
          </Link>
          <div className="pmu-brand-divider" />
          <Link href="/prepmeup" className="pmu-brand-logo">
            <span className="pmu-brand-mark">P</span>
            <span className="pmu-brand-title">
              PREPMEUP <span style={{ color: "#ff3b1d" }}>AI</span>
            </span>
          </Link>
        </div>

        {/* Desktop Links */}
        <nav className="pmu-nav-desktop">
          <Link href="/prepmeup/tracks" className="pmu-nav-link">
            Tracks
          </Link>
          <Link href="/prepmeup#subjects" className="pmu-nav-link">
            Subjects
          </Link>
          <Link href="/prepmeup/pricing" className="pmu-nav-link">
            Pricing
          </Link>
        </nav>

        {/* CTAs */}
        <div className="pmu-nav-ctas">
          <Link href="/prepmeup/dashboard" className="pmu-nav-link">
            Student Portal
          </Link>
          <Link href="/prepmeup/pricing" className="pmu-btn-sm">
            Get Access
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="pmu-mobile-controls">
          <Link
            href="/"
            style={{ fontSize: "0.75rem", color: "#807f78", textDecoration: "none" }}
          >
            ← Portfolio
          </Link>
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            style={{
              display: "flex",
              height: "2.25rem",
              width: "2.25rem",
              alignItems: "center",
              justifyContent: "center",
              borderRadius: "0.375rem",
              border: "1px solid rgba(243,241,234,0.15)",
              color: "#f3f1ea",
              background: "transparent",
            }}
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="pmu-mobile-drawer">
          <nav style={{ display: "flex", flexDirection: "column", gap: "0.875rem" }}>
            <Link
              href="/prepmeup/tracks"
              onClick={() => setMobileMenuOpen(false)}
              className="pmu-nav-link"
              style={{ fontSize: "0.875rem" }}
            >
              Tracks
            </Link>
            <Link
              href="/prepmeup#subjects"
              onClick={() => setMobileMenuOpen(false)}
              className="pmu-nav-link"
              style={{ fontSize: "0.875rem" }}
            >
              Subjects
            </Link>
            <Link
              href="/prepmeup/pricing"
              onClick={() => setMobileMenuOpen(false)}
              className="pmu-nav-link"
              style={{ fontSize: "0.875rem" }}
            >
              Pricing
            </Link>
            <div style={{ marginTop: "0.5rem", display: "flex", flexDirection: "column", gap: "0.625rem" }}>
              <Link
                href="/prepmeup/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="pmu-btn-secondary"
                style={{ width: "100%" }}
              >
                Student Portal
              </Link>
              <Link
                href="/prepmeup/pricing"
                onClick={() => setMobileMenuOpen(false)}
                className="pmu-btn-primary"
                style={{ width: "100%" }}
              >
                Get Access
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
