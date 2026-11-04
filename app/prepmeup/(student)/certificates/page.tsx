"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InteractiveWaitLoader } from "../../_components/InteractiveWaitLoader";

interface CertificateProgress {
  lessonsCompleted: number;
  totalLessons: number;
  simulationsCompleted: number;
  totalSimulations: number;
  quizzesPassed: number;
  totalQuizzes: number;
  completionPercentage: number;
  status: "not_eligible" | "eligible" | "issued";
  isEligible: boolean;
}

interface CertificateData {
  code: string;
  studentName: string;
  courseTitle: string;
  instructorName: string;
  issueDate: string;
  status: "issued" | "revoked";
  verificationUrl: string;
}

export default function StudentCertificatesPage() {
  const [progress, setProgress] = useState<CertificateProgress | null>(null);
  const [certificate, setCertificate] = useState<CertificateData | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [studentName, setStudentName] = useState("");
  const [claiming, setClaiming] = useState(false);

  const fetchStatus = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/prepmeup/certificates", { cache: "no-store" });
      const data = await res.json();
      if (res.ok && data.ok) {
        setProgress(data.progress);
        setCertificate(data.certificate);
      } else {
        setErrorMsg(data.error || "Failed to load certificate progress.");
      }
    } catch (err: any) {
      setErrorMsg(err?.message || "Failed to connect to certificate registry.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStatus();
  }, []);

  const handleClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      alert("Please enter the legal name you wish to appear on your certificate.");
      return;
    }

    setClaiming(true);
    try {
      const res = await fetch("/api/prepmeup/certificates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName: studentName.trim() }),
      });
      const data = await res.json();
      if (res.ok && data.ok) {
        setCertificate(data.certificate);
        fetchStatus();
      } else {
        alert(data.error || "Failed to issue certificate.");
      }
    } catch (err: any) {
      alert(err.message || "Network error.");
    } finally {
      setClaiming(false);
    }
  };

  if (loading) {
    return (
      <InteractiveWaitLoader
        title="Checking Academic Certificate Registry…"
        subtitle="Verifying completed quantum lessons, interactive simulations, and quiz attempts."
      />
    );
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
      {/* Header */}
      <div className="pmu-card" style={{ padding: "28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="pmu-badge">🎓 Verified Academic Credentials</span>
          <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
            Cryptographically Verifiable
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
          Quantum Computing Certification
        </h1>
        <p style={{ marginTop: "8px", maxWidth: "680px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          Earn an official, industry-recognized academic credential signed by faculty upon fulfilling all 20 theoretical lessons, 5 interactive laboratory simulations, and 5 module assessments.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid rgba(239,68,68,0.4)",
            backgroundColor: "rgba(239,68,68,0.1)",
            color: "#fca5a5",
            fontSize: "13px",
          }}
        >
          {errorMsg}
        </div>
      )}

      {/* Main Grid */}
      <div className="pmu-grid-3">
        {/* Progress & Eligibility Card (Spans 2 columns) */}
        <div style={{ gridColumn: "span 2", display: "flex", flexDirection: "column", gap: "20px" }}>
          <div className="pmu-card" style={{ padding: "26px" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: "16px" }}>
              <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", color: "#ff6a3d" }}>
                Course: Quantum Computing Foundations
              </span>
              <span
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 8px",
                  borderRadius: "4px",
                  backgroundColor:
                    progress?.status === "issued"
                      ? "rgba(74,222,128,0.2)"
                      : progress?.isEligible
                      ? "rgba(255,106,61,0.2)"
                      : "rgba(255,255,255,0.06)",
                  color:
                    progress?.status === "issued"
                      ? "#4ade80"
                      : progress?.isEligible
                      ? "#ff6a3d"
                      : "#807f78",
                }}
              >
                {progress?.status === "issued"
                  ? "✓ CERTIFICATE ISSUED"
                  : progress?.isEligible
                  ? "★ ELIGIBLE TO CLAIM"
                  : "IN PROGRESS"}
              </span>
            </div>

            <h2 className="font-display" style={{ fontSize: "24px", color: "#f3f1ea", textTransform: "uppercase" }}>
              Eligibility Criteria Checklist
            </h2>

            <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "14px" }}>
              {/* Criterion 1: Lessons */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#0d0d10",
                  border: "1px solid #26262c",
                }}
              >
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#f3f1ea" }}>
                    1. Complete All 20 Quantum Lessons
                  </div>
                  <div style={{ fontSize: "12px", color: "#a19f95", marginTop: "2px" }}>
                    Modules 1 through 5 syllabus coverage
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: (progress?.lessonsCompleted || 0) >= 20 ? "#4ade80" : "#ff6a3d",
                    }}
                  >
                    {progress?.lessonsCompleted || 0} / 20 Lessons
                  </span>
                  <div style={{ fontSize: "11px", color: "#807f78" }}>
                    {(progress?.lessonsCompleted || 0) >= 20 ? "✓ Completed" : "Pending"}
                  </div>
                </div>
              </div>

              {/* Criterion 2: Simulations */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#0d0d10",
                  border: "1px solid #26262c",
                }}
              >
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#f3f1ea" }}>
                    2. Experiment with 5 Quantum Simulations
                  </div>
                  <div style={{ fontSize: "12px", color: "#a19f95", marginTop: "2px" }}>
                    Bloch Sphere, Superposition, Circuit Builder, Bell State, Grover
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: (progress?.simulationsCompleted || 0) >= 5 ? "#4ade80" : "#ff6a3d",
                    }}
                  >
                    {progress?.simulationsCompleted || 0} / 5 Simulations
                  </span>
                  <div style={{ fontSize: "11px", color: "#807f78" }}>
                    {(progress?.simulationsCompleted || 0) >= 5 ? "✓ Completed" : "Pending"}
                  </div>
                </div>
              </div>

              {/* Criterion 3: Quizzes */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "14px 16px",
                  borderRadius: "8px",
                  backgroundColor: "#0d0d10",
                  border: "1px solid #26262c",
                }}
              >
                <div>
                  <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#f3f1ea" }}>
                    3. Pass All 5 Module Assessments
                  </div>
                  <div style={{ fontSize: "12px", color: "#a19f95", marginTop: "2px" }}>
                    Score &ge; 60% on each module quiz in the arena
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span
                    className="font-mono"
                    style={{
                      fontSize: "13px",
                      fontWeight: 700,
                      color: (progress?.quizzesPassed || 0) >= 5 ? "#4ade80" : "#ff6a3d",
                    }}
                  >
                    {progress?.quizzesPassed || 0} / 5 Passed
                  </span>
                  <div style={{ fontSize: "11px", color: "#807f78" }}>
                    {(progress?.quizzesPassed || 0) >= 5 ? "✓ Completed" : "Pending"}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Links */}
            <div style={{ marginTop: "22px", display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <Link href="/prepmeup/courses/quantum-computing-foundations" className="pmu-btn-secondary" style={{ fontSize: "12px" }}>
                Browse Quantum Lessons →
              </Link>
              <Link href="/prepmeup/simulations/quantum" className="pmu-btn-secondary" style={{ fontSize: "12px" }}>
                Launch Quantum Simulators →
              </Link>
              <Link href="/prepmeup/quizzes" className="pmu-btn-secondary" style={{ fontSize: "12px" }}>
                Attempt Module Quizzes →
              </Link>
            </div>
          </div>
        </div>

        {/* Claim / Certificate Card (1 Column) */}
        <div>
          {certificate ? (
            <div
              className="pmu-card"
              style={{
                padding: "26px",
                border: "1px solid rgba(74,222,128,0.4)",
                backgroundColor: "#111114",
                display: "flex",
                flexDirection: "column",
                gap: "18px",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <span style={{ fontSize: "20px" }}>🎖️</span>
                <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700 }}>
                  OFFICIALLY ISSUED
                </span>
              </div>

              <div>
                <h3 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase" }}>
                  Your Credential
                </h3>
                <p style={{ fontSize: "12.5px", color: "#a19f95", marginTop: "4px" }}>
                  Recipient: <strong style={{ color: "#ff6a3d" }}>{certificate.studentName}</strong>
                </p>
                <p className="font-mono" style={{ fontSize: "11px", color: "#807f78", marginTop: "2px" }}>
                  Code: {certificate.code}
                </p>
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <Link
                  href={`/prepmeup/verify-certificate/${certificate.code}`}
                  target="_blank"
                  className="pmu-btn-primary"
                  style={{ textAlign: "center", fontSize: "12px" }}
                >
                  View Public Verification ↗
                </Link>

                <a
                  href={`/api/prepmeup/certificates/${certificate.code}/pdf`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="pmu-btn-secondary"
                  style={{ textAlign: "center", fontSize: "12px" }}
                >
                  Download Official SVG/PDF 📥
                </a>
              </div>
            </div>
          ) : progress?.isEligible ? (
            <div
              className="pmu-card-highlight"
              style={{
                padding: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "16px",
              }}
            >
              <span className="pmu-badge">🎉 Congratulations!</span>
              <h3 className="font-display" style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase" }}>
                Claim Your Certificate
              </h3>
              <p style={{ fontSize: "13px", color: "#a19f95", lineHeight: 1.5 }}>
                You have satisfied all academic requirements. Enter your official name below to generate your cryptographically signed credential.
              </p>

              <form onSubmit={handleClaim} style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                <input
                  type="text"
                  placeholder="Full Legal Name"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  className="pmu-input"
                  style={{ fontSize: "13px" }}
                  required
                />
                <button
                  type="submit"
                  disabled={claiming}
                  className="pmu-btn-primary"
                  style={{ width: "100%", textAlign: "center" }}
                >
                  {claiming ? "Generating Credential…" : "Issue Verified Certificate →"}
                </button>
              </form>
            </div>
          ) : (
            <div
              className="pmu-card"
              style={{
                padding: "26px",
                display: "flex",
                flexDirection: "column",
                gap: "14px",
              }}
            >
              <span className="pmu-badge">Requirements Incomplete</span>
              <h3 className="font-display" style={{ fontSize: "20px", color: "#f3f1ea", textTransform: "uppercase" }}>
                Certificate Locked
              </h3>
              <p style={{ fontSize: "13px", color: "#a19f95", lineHeight: 1.5 }}>
                Complete all 20 lessons, launch all 5 interactive hardware simulations, and pass all 5 module assessments to unlock certificate claiming.
              </p>
              <div
                style={{
                  padding: "10px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#0d0d10",
                  border: "1px solid #26262c",
                  fontSize: "11px",
                  color: "#807f78",
                }}
              >
                💡 Tip: Check your Progress tab for detailed module-wise milestones.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
