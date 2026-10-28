"use client";

import React, { useState } from "react";
import Link from "next/link";
import { SIMULATIONS_REGISTRY } from "../../_lib/simulationsData";
import { RichMathMarkdown } from "../../_components/RichMathMarkdown";

export default function SimulationsDirectoryPage() {
  const [activeTab, setActiveTab] = useState<"all" | "bee" | "python" | "atlas">("all");

  const simulationsList = Object.values(SIMULATIONS_REGISTRY).filter((sim) => {
    if (activeTab === "all") return true;
    return sim.category === activeTab;
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="pmu-badge">🔬 Interactive Lab Workbench</span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
            ✓ Browser-Native SVG / Canvas • LaTeX Equations
          </span>
        </div>
        <h1
          className="font-display"
          style={{
            marginTop: "12px",
            fontSize: "clamp(28px, 4vw, 42px)",
            lineHeight: 0.98,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          Engineering Simulations Suite
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "700px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          Experiment with interactive BEE electrical circuits and Python memory/execution state visualizers. Adjust sliders in real time to observe how governing mathematical formulas behave.
        </p>

        {/* Filter Tabs */}
        <div style={{ marginTop: "20px", display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {[
            { id: "all" as const, label: `All Simulators (${Object.keys(SIMULATIONS_REGISTRY).length})` },
            { id: "atlas" as const, label: "🌌 Knowledge Atlas (5)" },
            { id: "bee" as const, label: "⚡ Basic Electrical (BEE) (5)" },
            { id: "python" as const, label: "🐍 Python Programming (5)" },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={activeTab === tab.id ? "pmu-btn-primary" : "pmu-btn-secondary"}
              style={{ padding: "9px 16px", fontSize: "11px" }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Featured Visual Atlas Spotlight Banner */}
      <div
        className="pmu-card-highlight"
        style={{
          padding: "26px 30px",
          borderRadius: "16px",
          border: "1px solid rgba(255, 59, 29, 0.4)",
          backgroundColor: "#111114",
          display: "flex",
          flexDirection: "column",
          gap: "16px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "9999px",
                backgroundColor: "#ff3b1d",
                boxShadow: "0 0 10px #ff3b1d",
              }}
            />
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#ff3b1d", textTransform: "uppercase" }}>
              Featured Interactive Engineering Lab
            </span>
            <span className="pmu-badge">Semester 1 Atlas Active</span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/prepmeup/simulations/atlas"
              className="pmu-btn-primary"
              style={{ padding: "8px 18px", fontSize: "11px" }}
            >
              Launch Fullscreen Atlas Lab →
            </Link>
            <a
              href="/atlas.html"
              target="_blank"
              rel="noreferrer"
              className="pmu-btn-secondary"
              style={{ padding: "8px 14px", fontSize: "11px" }}
            >
              Open Standalone Tab ↗
            </a>
          </div>
        </div>

        <div>
          <h2 className="font-display" style={{ fontSize: "26px", textTransform: "uppercase", color: "#f3f1ea", margin: "4px 0" }}>
            Semester 1 Knowledge Atlas &amp; Visual Canvas Suite
          </h2>
          <p style={{ fontSize: "13px", color: "#a19f95", lineHeight: 1.6, maxWidth: "800px" }}>
            Experience real-time interactive vector field warping for matrix transformations, dual-channel AC oscilloscopes for RLC resonance curves, and cycle-by-cycle RISC 5-stage pipeline hazard simulation with hardware data forwarding.
          </p>
        </div>

        {/* Quick Launch Buttons for Specific Atlas Labs */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap", paddingTop: "10px", borderTop: "1px solid #26262c" }}>
          <span className="font-mono" style={{ fontSize: "11px", color: "#807f78", alignSelf: "center", marginRight: "4px" }}>
            Quick Launch Modules:
          </span>
          {[
            { label: "🌌 Curriculum Galaxy", href: "/prepmeup/simulations/atlas" },
            { label: "📐 ACM Matrix Vector Field", href: "/prepmeup/simulations/atlas-acm" },
            { label: "⚡ BEEE AC Oscilloscope", href: "/prepmeup/simulations/atlas-beee" },
            { label: "💻 COA CPU Pipeline", href: "/prepmeup/simulations/atlas-coa" },
            { label: "🏛️ IKS Heritage Timeline", href: "/prepmeup/simulations/atlas-iks" },
          ].map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              style={{
                fontSize: "11px",
                padding: "5px 12px",
                borderRadius: "6px",
                border: "1px solid #26262c",
                backgroundColor: "#17171b",
                color: "#f3f1ea",
                textDecoration: "none",
                fontFamily: "monospace",
                transition: "all 0.15s ease",
              }}
            >
              {item.label} →
            </Link>
          ))}
        </div>
      </div>

      {/* Simulators Grid */}
      <div className="pmu-grid-3">
        {simulationsList.map((sim) => (
          <div
            key={sim.slug}
            className="pmu-card"
            style={{
              padding: "24px",
              display: "flex",
              flexDirection: "column",
              justifyContent: "space-between",
              gap: "18px",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                <span className="pmu-badge">{sim.subjectCode}</span>
                <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
                  ⏱ ~{sim.estimatedMinutes} mins • {sim.difficulty}
                </span>
              </div>

              <h3
                className="font-display"
                style={{
                  marginTop: "14px",
                  fontSize: "22px",
                  lineHeight: 1.15,
                  textTransform: "uppercase",
                  color: "#f3f1ea",
                }}
              >
                {sim.title}
              </h3>

              <p style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.6, color: "#a19f95" }}>
                {sim.summary}
              </p>

              {/* Rendered Governing Formula Preview */}
              <div style={{ marginTop: "12px" }}>
                <RichMathMarkdown content={`$$${sim.theoryFormula}$$`} />
              </div>
            </div>

            <div
              style={{
                borderTop: "1px solid #26262c",
                paddingTop: "14px",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
                ● Interactive Sandbox
              </span>
              <Link
                href={`/prepmeup/simulations/${sim.slug}`}
                className="pmu-btn-primary"
                style={{ padding: "8px 16px", fontSize: "11px" }}
              >
                Launch Simulator →
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
