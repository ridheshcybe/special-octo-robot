import React from "react";
import Link from "next/link";
import { QuantumWorkbenchClient } from "./QuantumWorkbenchClient";
import { getQuantumSimulations } from "@/app/prepmeup/_lib/trackStore";

export const metadata = {
  title: "Quantum Computing Simulations | PrepMeUp AI",
  description: "Interactive Quantum Mechanics & Circuit Visualizers: Bloch Sphere, Superposition, Circuit Builder, Bell Entanglement, and Grover Search.",
};

export default function QuantumSimulationsPage() {
  const simulations = getQuantumSimulations();

  return (
    <div style={{ maxWidth: "1200px", margin: "0 auto", padding: "32px 20px" }}>
      {/* Breadcrumb Header */}
      <div style={{ marginBottom: "24px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#807f78", fontFamily: "monospace", marginBottom: "8px" }}>
          <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
          <span>/</span>
          <Link href="/prepmeup/tracks" style={{ color: "#807f78", textDecoration: "none" }}>Tracks</Link>
          <span>/</span>
          <Link href="/prepmeup/tracks/quantum-computing" style={{ color: "#ff6a3d", textDecoration: "none" }}>Quantum Computing</Link>
          <span>/</span>
          <span style={{ color: "#f3f1ea" }}>Interactive Simulations</span>
        </div>

        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "space-between", alignItems: "flex-end", gap: "16px" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span className="pmu-badge">Phase Q1 Quantum Workbench</span>
              <span className="font-mono" style={{ fontSize: "12px", color: "#00e676" }}>
                5 Browser-Native Engines
              </span>
            </div>
            <h1 className="font-display" style={{ fontSize: "38px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "8px" }}>
              Quantum Mechanics & Circuit Simulations
            </h1>
            <p style={{ fontSize: "15px", color: "#807f78", maxWidth: "700px", marginTop: "4px" }}>
              Explore statevector dynamics, unitary rotations, multi-qubit entanglement, and Grover search speedups with zero external dependencies.
            </p>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link
              href="/prepmeup/courses/quantum-computing-foundations"
              className="pmu-btn-secondary"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              Course Overview →
            </Link>
            <Link
              href="/prepmeup/courses/quantum-computing-foundations/learn"
              className="pmu-btn-primary"
              style={{ padding: "10px 18px", fontSize: "13px" }}
            >
              Curriculum Dashboard →
            </Link>
          </div>
        </div>
      </div>

      {/* Client Workbench with Live Tabs */}
      <QuantumWorkbenchClient simulations={simulations} />
    </div>
  );
}
