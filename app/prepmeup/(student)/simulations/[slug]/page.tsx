"use client";

import React, { use } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SIMULATIONS_REGISTRY } from "../../../_lib/simulationsData";
import { RichMathMarkdown } from "../../../_components/RichMathMarkdown";

// BEE Simulation Components
import { OhmsLawSim } from "../_components/bee/OhmsLawSim";
import { ResistorNetworkSim } from "../_components/bee/ResistorNetworkSim";
import { PowerEnergySim } from "../_components/bee/PowerEnergySim";
import { ACWaveformSim } from "../_components/bee/ACWaveformSim";
import { KirchhoffSim } from "../_components/bee/KirchhoffSim";

// Python Simulation Components
import { VariableMemorySim } from "../_components/python/VariableMemorySim";
import { LoopExecutionSim } from "../_components/python/LoopExecutionSim";
import { CallStackSim } from "../_components/python/CallStackSim";
import { DataStructureSim } from "../_components/python/DataStructureSim";
import { CodeTracingSim } from "../_components/python/CodeTracingSim";
import { AtlasSimViewer } from "../_components/AtlasSimViewer";
import { DynamicInteractiveSim } from "../../../_components/DynamicInteractiveSim";

interface SimulationPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export default function SimulationRunnerPage({ params }: SimulationPageProps) {
  const { slug } = use(params);
  const sim = SIMULATIONS_REGISTRY[slug];

  if (!sim) {
    notFound();
  }

  const renderSimComponent = () => {
    switch (sim.componentKey) {
      case "OhmsLawSim":
        return <OhmsLawSim />;
      case "ResistorNetworkSim":
        return <ResistorNetworkSim />;
      case "PowerEnergySim":
        return <PowerEnergySim />;
      case "ACWaveformSim":
        return <ACWaveformSim />;
      case "KirchhoffSim":
        return <KirchhoffSim />;
      case "VariableMemorySim":
        return <VariableMemorySim />;
      case "LoopExecutionSim":
        return <LoopExecutionSim />;
      case "CallStackSim":
        return <CallStackSim />;
      case "DataStructureSim":
        return <DataStructureSim />;
      case "CodeTracingSim":
        return <CodeTracingSim />;
      case "AtlasSimViewer":
        return <AtlasSimViewer slug={slug} />;
      case "DynamicInteractiveSim":
      default:
        return (
          <DynamicInteractiveSim
            title={sim.title}
            subjectCode={sim.subjectCode}
            theoryFormula={sim.theoryFormula}
            theoryGuide={sim.theoryGuide}
            simType={
              sim.subjectCode === "CSE1004" ? "protocol" :
              sim.subjectCode === "CSE1001" ? "matrix" :
              sim.subjectCode === "CSE1003" ? "pipeline" : "protocol"
            }
          />
        );
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Navigation & Header Card */}
      <div
        className="pmu-card"
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
          <Link
            href="/prepmeup/simulations"
            className="font-mono"
            style={{ fontSize: "12px", fontWeight: 600, color: "#a19f95", textDecoration: "none" }}
          >
            ← Back to All Engineering Simulators
          </Link>
          <div style={{ marginTop: "12px", display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">{sim.subjectCode}</span>
            <span className="font-mono" style={{ fontSize: "12px", color: "#a19f95" }}>
              {sim.subjectName} • {sim.difficulty}
            </span>
          </div>
          <h1
            className="font-display"
            style={{
              marginTop: "10px",
              fontSize: "clamp(26px, 3.5vw, 38px)",
              lineHeight: 0.98,
              textTransform: "uppercase",
              color: "#f3f1ea",
            }}
          >
            {sim.title}
          </h1>
        </div>

        <Link href={`/prepmeup/subjects/${sim.subjectSlug}`} className="pmu-btn-secondary">
          📖 View Subject LaTeX Notes →
        </Link>
      </div>

      {/* Main Simulation Workspace Grid */}
      <div className="pmu-grid-3" style={{ alignItems: "start" }}>
        {/* Interactive Sandbox Area (Spans 2 columns) */}
        <div style={{ gridColumn: "span 2" }}>
          <div className="pmu-card" style={{ padding: "28px" }}>
            {renderSimComponent()}
          </div>
        </div>

        {/* Theory & Pedagogical Guide Sidebar (LaTeX Rendered) */}
        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div className="pmu-card" style={{ padding: "24px" }}>
            <span className="pmu-badge">Mathematical Model</span>
            <h3
              className="font-display"
              style={{ marginTop: "10px", fontSize: "22px", textTransform: "uppercase", color: "#f3f1ea" }}
            >
              Theory &amp; Governing Equations
            </h3>
            <p style={{ marginTop: "4px", fontSize: "12.5px", color: "#a19f95" }}>
              Analytical principles modeled in this interactive visualizer:
            </p>

            <div style={{ marginTop: "12px" }}>
              <RichMathMarkdown content={`$$${sim.theoryFormula}$$`} />
            </div>

            <div style={{ marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #26262c" }}>
              <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
                Key Exam Concepts:
              </span>
              <div style={{ marginTop: "8px" }}>
                <RichMathMarkdown content={sim.theoryGuide.map((g) => `- ${g}`).join("\n")} />
              </div>
            </div>
          </div>

          <div className="pmu-card" style={{ padding: "20px" }}>
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#4ade80" }}>
              ⚡ Browser-Native Runtime
            </span>
            <p style={{ marginTop: "6px", fontSize: "12.5px", lineHeight: 1.6, color: "#a19f95" }}>
              This simulator executes at 60 FPS directly in your browser using client SVG, HTML5 Canvas, and React state.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
