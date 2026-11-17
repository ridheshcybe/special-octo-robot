import React from "react";
import Link from "next/link";

interface LabAttemptProps {
  params: { labSlug: string; attemptId: string };
}

export const metadata = {
  title: "Lab Attempt | CyberSecurity Lab | PrepMeUp AI",
  description: "View your lab attempt progress and results",
};

export default function LabAttempt({ params }: LabAttemptProps) {
  const attemptId = params.attemptId;

  const labs: Record<string, {
    id: string;
    title: string;
    description: string;
    difficulty: "beginner" | "intermediate" | "advanced";
    estimatedTime: string;
    module: string;
    labType: "encryption" | "scanning" | "web-vuln" | "cloud" | "incident";
    isFreePreview: boolean;
    status: "published" | "draft";
    guidedTasks: string[];
    hints: string[];
    progress: {
      completed: number;
      maxAttempts: number;
      explanation: string | null;
    };
    flagSubmission: {
      submitted: boolean;
      correct: boolean | null;
      attempts: number;
      maxAttempts: number;
    };
    explanationAfterSolving: string;
  }> = {
    "basic-crypto-challenge": {
      id: "lab-cyber-01",
      title: "Basic Cryptography Challenge",
      description: "Introduction to classical and quantum cryptography. Practice encoding/decoding messages using various cipher techniques.",
      difficulty: "beginner",
      estimatedTime: "15 min",
      module: "Cryptographic Protocols",
      labType: "encryption",
      isFreePreview: true,
      status: "published",
      guidedTasks: [
        "Encode the message 'HELLO WORLD' using Caesar cipher with shift 3",
        "Decode the message 'KHOOR ZRUOG' to reveal the original",
        "Create your own Caesar cipher and share it with a peer",
        "Research the differences between classical and quantum cryptography"
      ],
      hints: [
        "Remember: Caesar shift 3 means each letter moves 3 positions forward",
        "A becomes D, B becomes E, C becomes F, etc.",
        "Wrap around at the end of the alphabet (X -> A, Y -> B, Z -> C)",
        "Non-alphabetic characters remain unchanged"
      ],
      progress: {
        completed: 0,
        maxAttempts: 5,
        explanation: null,
      },
      flagSubmission: {
        submitted: false,
        correct: null,
        attempts: 0,
        maxAttempts: 5,
      },
      explanationAfterSolving: "Great work! You've mastered the basics of classical cryptography.",
    },
    "network-scanning-basics": {
      id: "lab-cyber-02",
      title: "Network Scanning Basics",
      description: "Learn safe network reconnaissance techniques using Nmap and other tools. Identify open ports and services.",
      difficulty: "beginner",
      estimatedTime: "20 min",
      module: "Network Security",
      labType: "scanning",
      isFreePreview: false,
      status: "published",
      guidedTasks: [
        "Install Nmap on your local system",
        "Run 'nmap -sP 127.0.0.1/24' to discover live hosts",
        "Run 'nmap -sV 127.0.0.1' to identify services and versions",
        "Run \"nmap -p 80,443 127.0.0.1\" to scan specific ports",
        "Document your findings in a report"
      ],
      hints: [
        "Use 'sudo nmap' for full root privileges",
        "The -sP flag performs a ping sweep (fast discovery)",
        "The -sV flag probes open ports to determine service versions",
        "Always scan authorized networks only"
      ],
      progress: {
        completed: 0,
        maxAttempts: 5,
        explanation: null,
      },
      flagSubmission: {
        submitted: false,
        correct: null,
        attempts: 0,
        maxAttempts: 5,
      },
      explanationAfterSolving: "Excellent! You've learned the basics of network reconnaissance.",
    },
  };

  const lab = labs[params.labSlug];
  const attempt = {
    id: params.attemptId,
    labId: lab?.id,
    startedAt: new Date().toISOString(),
    completed: false,
    flagsSubmitted: 0,
    correctFlags: 0,
  };

  if (!lab) {
    return (
      <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
        <h1 style={{ color: "#ff3b1d", fontFamily: "Anton, sans-serif" }}>Lab Not Found</h1>
        <p style={{ color: "#807f78" }}>(404)</p>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        <h2 style={{ color: "#f3f1ea", marginBottom: "24px" }}>
          {lab.title} - Attempt {attemptId}
        </h2>

        <div style={{ backgroundColor: "#0f0f0f", borderRadius: "8px", padding: "24px", marginBottom: "24px" }}>
          <p style={{ color: "#ff3b1d", marginBottom: "8px" }}>Attempt ID: {attemptId}</p>
          <p style={{ color: "#807f78" }}>Started: {new Date(attempt.startedAt).toLocaleDateString()}</p>

          <p style={{ color: attempt.completed ? "#00e676" : "#ff3b1d" }}>
            Status: {attempt.completed ? "Completed" : "In Progress"}
          </p>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h3 style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "12px" }}>
            Guided Tasks
          </h3>
          <ol style={{ fontSize: "13px", color: "#f3f1ea", lineHeight: "1.6", fontFamily: "Onest, sans-serif" }}>
            {lab.guidedTasks.map((task, index) => (
              <li key={index}>{index + 1}. {task}</li>
            ))}
          </ol>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <h4 style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "8px" }}>
            Hints
          </h4>
          <ol style={{ fontSize: "12px", color: "#807f78", lineHeight: "1.5", fontFamily: "Onest, sans-serif" }}>
            {lab.hints.map((hint, index) => (
              <li key={index}>{index + 1}. {hint}</li>
            ))}
          </ol>
        </div>

        <div style={{ marginBottom: "32px" }}>
          <p style={{ color: "#807f78" }}>Enter Flag:</p>
          <input
            type="text"
            style={{
              width: "100%",
              padding: "8px",
              backgroundColor: "#17171b",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              color: "#f3f1ea",
              fontFamily: "Onest, sans-serif",
              fontSize: "14px",
            }}
            placeholder="FLAG{...}"
            maxLength={100}
          />
          <button
            style={{
              width: "100%",
              padding: "10px",
              fontSize: "13px",
              textTransform: "uppercase",
              backgroundColor: "#ff3b1d",
              color: "#08080a",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              marginTop: "8px",
            }}
          >
            Submit Flag
          </button>
        </div>

        {attempt.completed && lab.progress.explanation && (
          <div style={{ marginTop: "24px", padding: "20px", backgroundColor: "#0f0f0f", borderRadius: "8px", borderTop: "3px solid #00e676" }}>
            <p style={{ fontSize: "13px", color: "#f3f1ea", lineHeight: "1.6", fontFamily: "Onest, sans-serif" }}>
              {lab.progress.explanation}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}