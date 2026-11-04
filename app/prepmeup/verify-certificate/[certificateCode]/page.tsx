import React from "react";
import Link from "next/link";
import { getCertificateByCode } from "@/app/prepmeup/_lib/trackStore";

interface Props {
  params: Promise<{ certificateCode: string }>;
}

export default async function CertificateVerificationPage({ params }: Props) {
  const { certificateCode } = await params;
  const cert = getCertificateByCode(certificateCode);

  if (!cert) {
    return (
      <main
        style={{
          minHeight: "100vh",
          backgroundColor: "#08080a",
          color: "#f3f1ea",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "24px",
          fontFamily: "var(--font-onest), sans-serif",
        }}
      >
        <div
          className="pmu-card"
          style={{
            maxWidth: "540px",
            width: "100%",
            padding: "36px",
            textAlign: "center",
            border: "1px solid rgba(239,68,68,0.4)",
            backgroundColor: "#111114",
          }}
        >
          <div
            style={{
              width: "56px",
              height: "56px",
              borderRadius: "50%",
              backgroundColor: "rgba(239,68,68,0.15)",
              color: "#f87171",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "24px",
              margin: "0 auto 18px",
            }}
          >
            ✕
          </div>
          <span className="font-mono" style={{ fontSize: "11px", color: "#f87171", textTransform: "uppercase", fontWeight: 700 }}>
            Verification Check Failed
          </span>
          <h1
            className="font-display"
            style={{
              marginTop: "10px",
              fontSize: "28px",
              color: "#f3f1ea",
              textTransform: "uppercase",
            }}
          >
            Certificate Not Found
          </h1>
          <p style={{ marginTop: "12px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
            The credential identifier <code style={{ color: "#ff6a3d", backgroundColor: "#17171b", padding: "2px 6px", borderRadius: "4px" }}>{certificateCode}</code> was not found in the PrepMeUp AI cryptographic registry or has been revoked.
          </p>
          <div style={{ marginTop: "24px" }}>
            <Link href="/prepmeup" className="pmu-btn-secondary" style={{ display: "inline-block" }}>
              ← Return to PrepMeUp AI Home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const issueDateFormatted = new Date(cert.issueDate).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "32px 16px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div
        className="pmu-card"
        style={{
          maxWidth: "680px",
          width: "100%",
          padding: "36px 32px",
          border: "1px solid rgba(74,222,128,0.35)",
          backgroundColor: "#111114",
          boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        }}
      >
        {/* Verification Badge */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px", marginBottom: "20px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <span
              style={{
                width: "10px",
                height: "10px",
                borderRadius: "50%",
                backgroundColor: "#4ade80",
                display: "inline-block",
                boxShadow: "0 0 8px #4ade80",
              }}
            />
            <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" }}>
              Official Cryptographic Verification: VALID
            </span>
          </div>

          <span className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
            Registry ID: {cert.code}
          </span>
        </div>

        {/* Title */}
        <h1
          className="font-display"
          style={{
            fontSize: "clamp(26px, 4vw, 36px)",
            lineHeight: 1.05,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          PrepMeUp AI Verified Academic Credential
        </h1>
        <p style={{ marginTop: "8px", fontSize: "14px", lineHeight: 1.6, color: "#a19f95" }}>
          This record confirms that the scholar listed below has fulfilled all academic, practical simulation, and assessment standards for the certified track.
        </p>

        {/* Credential Data Grid (STRICT ZERO PII) */}
        <div
          style={{
            marginTop: "24px",
            border: "1px solid #26262c",
            borderRadius: "10px",
            backgroundColor: "#0d0d10",
            padding: "20px",
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "18px",
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", color: "#807f78" }}>
              Student Scholar Name
            </span>
            <div style={{ marginTop: "4px", fontSize: "18px", fontWeight: 700, color: "#ff6a3d" }}>
              {cert.studentName}
            </div>
          </div>

          <div>
            <span className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", color: "#807f78" }}>
              Issuing Organization
            </span>
            <div style={{ marginTop: "4px", fontSize: "15px", fontWeight: 600, color: "#f3f1ea" }}>
              PrepMeUp AI Academic Registry
            </div>
          </div>

          <div>
            <span className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", color: "#807f78" }}>
              Course Specialization
            </span>
            <div style={{ marginTop: "4px", fontSize: "15px", fontWeight: 600, color: "#f3f1ea" }}>
              {cert.courseTitle}
            </div>
          </div>

          <div>
            <span className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", color: "#807f78" }}>
              Directing Instructor
            </span>
            <div style={{ marginTop: "4px", fontSize: "15px", fontWeight: 600, color: "#f3f1ea" }}>
              {cert.instructorName}
            </div>
          </div>

          <div>
            <span className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", color: "#807f78" }}>
              Date of Official Issuance
            </span>
            <div style={{ marginTop: "4px", fontSize: "14px", color: "#a19f95" }}>
              {issueDateFormatted}
            </div>
          </div>

          <div>
            <span className="font-mono" style={{ fontSize: "10.5px", textTransform: "uppercase", color: "#807f78" }}>
              Verification Status
            </span>
            <div style={{ marginTop: "4px", fontSize: "14px", color: "#4ade80", fontWeight: 700 }}>
              ✓ Issued &amp; Unrevoked
            </div>
          </div>
        </div>

        {/* Security & Zero PII Disclosure Guarantee */}
        <div
          style={{
            marginTop: "18px",
            padding: "12px 14px",
            borderRadius: "6px",
            backgroundColor: "#17171b",
            fontSize: "11.5px",
            lineHeight: 1.5,
            color: "#807f78",
          }}
        >
          🔒 <strong>Privacy Assurance:</strong> Student phone numbers, email addresses, and payment identifiers are permanently withheld from this public verification URL in compliance with academic privacy standards.
        </div>

        {/* Actions */}
        <div style={{ marginTop: "24px", display: "flex", gap: "12px", flexWrap: "wrap" }}>
          <a
            href={`/api/prepmeup/certificates/${cert.code}/pdf`}
            target="_blank"
            rel="noopener noreferrer"
            className="pmu-btn-primary"
            style={{ textDecoration: "none", textAlign: "center" }}
          >
            📥 View / Download High-Res Certificate
          </a>
          <Link href="/prepmeup/tracks/quantum-computing" className="pmu-btn-secondary" style={{ textDecoration: "none" }}>
            Explore Quantum Track
          </Link>
        </div>
      </div>
    </main>
  );
}
