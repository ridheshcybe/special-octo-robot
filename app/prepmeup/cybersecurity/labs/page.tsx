import React from "react";
import Link from "next/link";

interface CybersecurityLabsPageProps {
  style?: React.CSSProperties;
}

interface Lab {
  id: string;
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
  estimatedTime: string;
  module: string;
  labType: "encryption" | "scanning" | "web-vuln" | "cloud" | "incident";
  isFreePreview: boolean;
  status: "published" | "draft";
}

export const metadata = {
  title: "CyberSecurity Labs | PrepMeUp AI",
  description: "Practice cybersecurity labs and capture flags in a safe environment",
};

export default function CybersecurityLabsPage({ style }: CybersecurityLabsPageProps) {
  const labs: Lab[] = [
    {
      id: "lab-cyber-01",
      title: "Basic Cryptography Challenge",
      description:
        "Introduction to classical and quantum cryptography. Practice encoding/decoding messages using various cipher techniques.",
      difficulty: "beginner",
      estimatedTime: "15 min",
      module: "Cryptographic Protocols",
      labType: "encryption",
      isFreePreview: true,
      status: "published",
    },
    {
      id: "lab-cyber-02",
      title: "Network Scanning Basics",
      description:
        "Learn safe network reconnaissance techniques using Nmap and other tools. Identify open ports and services.",
      difficulty: "beginner",
      estimatedTime: "20 min",
      module: "Network Security",
      labType: "scanning",
      isFreePreview: false,
      status: "published",
    },
    {
      id: "lab-cyber-03",
      title: "Web Vulnerability Scanning",
      description:
        "Practice identifying common web vulnerabilities including XSS, SQLi, and CSRF using safe test environments.",
      difficulty: "intermediate",
      estimatedTime: "30 min",
      module: "Web Security",
      labType: "web-vuln",
      isFreePreview: false,
      status: "published",
    },
    {
      id: "lab-cyber-04",
      title: "Cloud Permission Hardening",
      description:
        "Configure IAM policies and security groups for cloud environments. Restrict unnecessary permissions.",
      difficulty: "intermediate",
      estimatedTime: "25 min",
      module: "Cloud Security",
      labType: "cloud",
      isFreePreview: false,
      status: "published",
    },
    {
      id: "lab-cyber-05",
      title: "Incident Response Simulation",
      description:
        "Simulate a security incident and practice detection, analysis, and containment procedures.",
      difficulty: "advanced",
      estimatedTime: "45 min",
      module: "Security Operations",
      labType: "incident",
      isFreePreview: false,
      status: "published",
    },
  ];

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h1 style={{ fontSize: "clamp(28px, 5vw, 40px)", color: "#f3f1ea", textTransform: "uppercase", marginBottom: "8px" }}>
          CyberSecurity Labs
        </h1>
        <p style={{ fontSize: "14px", color: "#807f78" }}>
          Practice cybersecurity labs and capture flags in a safe environment
        </p>

        <div style={{ marginTop: "32px" }}>
          {labs.map((lab) => (
            <div
              key={lab.id}
              style={{
                backgroundColor: "#17171b",
                borderRadius: "8px",
                padding: "24px",
                marginBottom: "24px",
                border: "1px solid rgba(255, 255, 255, 0.05)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "16px", marginBottom: "16px" }}>
                <span style={{ color: lab.isFreePreview ? "#00e676" : "#ff3b1d" }}>
                  {lab.isFreePreview ? "Free Preview" : lab.title}
                </span>
                <span style={{ color: "#807f78", fontSize: "12px" }}>
                  {lab.difficulty} • {lab.estimatedTime}
                </span>
              </div>

              <p style={{ fontSize: "13px", color: "#f3f1ea", lineHeight: "1.6", fontFamily: "Onest, sans-serif" }}>
                {lab.description}
              </p>

              <div style={{ marginTop: "16px" }}>
                {lab.isFreePreview ? (
                  <Link
                    href="/prepmeup/cybersecurity/labs/"
                    style={{
                      padding: "8px 16px",
                      fontSize: "12px",
                      color: "#ff3b1d",
                      textTransform: "uppercase",
                      textDecoration: "none",
                    }}
                  >
                    Start Lab
                  </Link>
                ) : (
                  <Link
                    href={`/prepmeup/cybersecurity/labs/${lab.id}`}
                    style={{
                      padding: "8px 16px",
                      fontSize: "12px",
                      color: "#ff3b1d",
                      textTransform: "uppercase",
                      textDecoration: "none",
                    }}
                  >
                    View Details
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
