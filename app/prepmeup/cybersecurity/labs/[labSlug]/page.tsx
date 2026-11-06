import React from "react";
import Link from "next/link";

interface LabDetailProps {
  params: { labSlug: string };
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
  ethicalUseAcceptance: string;
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
}

export const metadata = {
  title: "Lab Detail | CyberSecurity Lab | PrepMeUp AI",
  description: "View detailed lab instructions and flag submission",
};

export default function LabDetail({ params }: LabDetailProps) {
  // In a real implementation, this would fetch from Supabase
  // For now, use hardcoded lab data based on slug
  const labs: Record<string, {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    estimatedTime: string;
    module: string;
    labType: string;
    isFreePreview: boolean;
    status: string;
    ethicalUseAcceptance: string;
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
      description:
        "Introduction to classical and quantum cryptography. Practice encoding/decoding messages using various cipher techniques.",
      difficulty: "beginner",
      estimatedTime: "15 min",
      module: "Cryptographic Protocols",
      labType: "encryption",
      isFreePreview: true,
      status: "published",
      ethicalUseAcceptance:
        "This lab is for educational purposes only. Practice on local test environments. Do not attack real systems.",
      guidedTasks: [
        "Encode the message 'HELLO WORLD' using Caesar cipher with shift 3",
        "Decode the message 'KHOOR ZRUOG' to reveal the original",
        "Create your own Caesar cipher and share it with a peer",
        "Research the differences between classical and quantum cryptography",
      ],
      hints: [
        "Remember: Caesar shift 3 means each letter moves 3 positions forward",
        "A becomes D, B becomes E, C becomes F, etc.",
        "Wrap around at the end of the alphabet (X -> A, Y -> B, Z -> C)",
        "Non-alphabetic characters remain unchanged",
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
      explanationAfterSolving:
        "Great work! You've mastered the basics of classical cryptography. Quantum cryptography offers provably secure communication using quantum key distribution (QKD).",
    },
    "network-scanning-basics": {
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
      ethicalUseAcceptance:
        "This lab is for educational purposes only. Practice on local virtual machines or authorized test networks. Never scan networks without explicit permission.",
      guidedTasks: [
        "Install Nmap on your local system",
        "Run 'nmap -sP 127.0.0.1/24' to discover live hosts",
        "Run 'nmap -sV 127.0.0.1' to identify services and versions",
        'Run "nmap -p 80,443 127.0.0.1" to scan specific ports',
        "Document your findings in a report",
      ],
      hints: [
        "Use 'sudo nmap' for full root privileges",
        "-sP flag performs a ping sweep (fast discovery)",
        "-sV flag probes open ports to determine service versions",
        "Always scan authorized networks only",
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
      explanationAfterSolving:
        "Excellent! You've learned the basics of network reconnaissance. Remember that proper network scanning requires authorization and should only be performed on systems you own or have explicit permission to test.",
    },
    "web-vulnerability-scanning": {
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
      ethicalUseAcceptance:
        "This lab is for educational purposes only. Practice on local test environments or authorized web applications. Never test real-world targets without explicit permission.",
      guidedTasks: [
        "Set up a local vulnerable web application (DVWA or Mutillidae)",
        "Identify reflected XSS vulnerabilities using payload testing",
        "Test for SQL injection using 'OR 1=1' payloads",
        "Test for CSRF vulnerabilities and test proof of concept",
        "Document all findings with remediation recommendations",
      ],
      hints: [
        "Use Burp Suite or OWASP ZAP for proxy-based testing",
        "Reflected XSS payloads: <script>alert(1)</script>",
        "SQLi payloads: ' OR 1=1 --, UNION SELECT 1 --",
        "CSRF tokens should be validated on the server side",
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
      explanationAfterSolving:
        "Well done! You've practiced identifying common web vulnerabilities. Always remember to get proper authorization before testing any web application, and report vulnerabilities responsibly through coordinated disclosure.",
    },
    "cloud-permission-hardening": {
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
      ethicalUseAcceptance:
        "This lab is for educational purposes only. Practice on local/cloud test environments. Never modify real cloud resource permissions without explicit authorization.",
      guidedTasks: [
        "Identify over-permissive IAM policies in your cloud environment",
        "Restrict root account access and enable MFA",
        "Create least-privilege IAM users and roles",
        "Configure security group rules to allow only necessary ports",
        "Review and remove unnecessary cloud administrator privileges",
      ],
      hints: [
        "Start by auditing your current IAM policies",
        "Use the principle of least privilege - grant only what's needed",
        "Enable MFA on all root and admin accounts",
        "Regularly review and rotate access keys",
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
      explanationAfterSolving:
        "Great job hardening your cloud environment! Proper IAM configuration is critical for cloud security. Remember that misconfigured permissions are one of the leading causes of cloud data breaches.",
    },
    "incident-response-simulation": {
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
      ethicalUseAcceptance:
        "This lab is for educational purposes only. Practice on simulated environments. Do not respond to real incidents without proper certification and authorization.",
      guidedTasks: [
        "Identify indicators of compromise (IOCs) from provided log files",
        "Classify the incident severity (low, medium, high, critical)",
        "Create an incident containment plan",
        "Perform forensic analysis of the attack vector",
        "Develop a recovery plan and document lessons learned",
      ],
      hints: [
        "IOCs include: unusual process execution, failed login spikes, large data exfiltration",
        "Incident severity is based on impact and urgency",
        "Containment steps: isolate affected systems, preserve evidence",
        "Always follow your organization's incident response plan",
      ],
      progress: {
        completed: 0,
        maxAttempts: 3,
        explanation: null,
      },
      flagSubmission: {
        submitted: false,
        correct: null,
        attempts: 0,
        maxAttempts: 3,
      },
      explanationAfterSolving:
        "Excellent incident response! You've successfully detected, analyzed, and contained the simulated incident. Remember that effective incident response requires practice, documentation, and continuous improvement of your security posture.",
    },
  };

  const lab = labs[params.labSlug];

  if (!lab) {
    return (
      <div className="pmu-root" style={{ minHeight: "100vh", padding: "40px 20px" }}>
        <h1 style={{ color: "#ff3b1d", fontFamily: "Anton, sans-serif" }}>Lab Not Found</h1>
        <p style={{ color: "#807f78" }}>404</p>
      </div>
    );
  }

  const isFreePreview = lab.isFreePreview;
  const isPublished = lab.status === "published";

  return (
    <div className="pmu-root" style={{ minHeight: "100vh", padding: "40px 20px" }}>
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "13px", color: "#807f78", fontFamily: "monospace" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>PrepMeUp</Link>
            <span>/</span>
            <span style={{ color: "#f3f1ea" }}>CyberSecurity</span>
            <span>/</span>
            <span style={{ color: "#f3f1ea" }}>{lab.title}</span>
          </div>
        </div>

        {/* Ethical Use Acceptance */}
        <div style={{ backgroundColor: "#0f0f0f", borderRadius: "8px", padding: "20px", marginBottom: "24px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <p style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "8px" }}>
            Ethical Use Acceptance
          </p>
          <p style={{ fontSize: "13px", color: "#f3f1ea", lineHeight: "1.6" }}>
            {lab.ethicalUseAcceptance}
          </p>
        </div>

        {/* Lab Details */}
        <div style={{ marginBottom: "32px" }}>
          <div style={{ display: "flex", gap: "24px", marginBottom: "24px" }}>
            <div>
              <p style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "8px" }}>
                Difficulty
              </p>
              <p style={{ fontSize: "14px", color: lab.difficulty === "beginner" ? "#00e676" : lab.difficulty === "intermediate" ? "#ffc107" : "#ff3b1d", fontFamily: "Onest, sans-serif" }}>
                {lab.difficulty}
              </p>

              <p style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "8px" }}>
                Estimated Time
              </p>
              <p style={{ fontSize: "14px", color: "#f3f1ea", fontFamily: "Onest, sans-serif" }}>
                {lab.estimatedTime}
              </p>

              <p style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "8px" }}>
                Module
              </p>
              <p style={{ fontSize: "14px", color: "#f3f1ea", fontFamily: "Onest, sans-serif" }}>
                {lab.module}
              </p>
            </div>

            <div>
              <p style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "8px" }}>
                Type
              </p>
              <p style={{ fontSize: "14px", color: "#f3f1ea", fontFamily: "Onest, sans-serif" }}>
                {lab.labType}
              </p>
            </div>
            {isFreePreview && (
              <span className="pmu-badge"
                style={{ backgroundColor: "rgba(0, 230, 118, 0.15)", color: "#00e676", fontSize: "10px", textTransform: "uppercase", padding: "3px 6px", borderRadius: "4px", marginTop: "8px", display: "inline-block" }}>
                Free Preview
              </span>
            )}
          </div>
        </div>

        {/* Progress */}
        {lab.progress && (
          <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#0f0f0f", borderRadius: "8px" }}>
            <p style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "8px" }}>
              Progress
            </p>
            <div style={{ display: "flex", gap: "16px", marginTop: "8px" }}>
              <span style={{ color: "#ff3b1d" }}>Attempts: </span>
              <span style={{ color: "#f3f1ea" }}>{lab.progress.completed}/{lab.progress.maxAttempts}</span>
              {lab.progress.explanation && (
                <span style={{ color: "#00e676", fontSize: "11px", marginLeft: "8px" }}>✓ Completed</span>
              )}
            </div>
          </div>
        )}

        {/* Guided Tasks */}
        <div style={{ marginTop: "32px" }}>
          <h3 className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "12px" }}>
            Guided Tasks
          </h3>
          <ol style={{ fontSize: "13px", color: "#f3f1ea", lineHeight: "1.6", fontFamily: "Onest, sans-serif" }}>
            {lab.guidedTasks.map((task, index) => (
              <li key={index}>
                {index + 1}. {task}
              </li>
            ))}
          </ol>
        </div>

        {/* Hints */}
        {lab.hints.length > 0 && (
          <div style={{ marginTop: "24px", padding: "16px", backgroundColor: "#0f0f0f", borderRadius: "8px" }}>
            <h4 className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "8px" }}>
              Hints
            </h4>
            <ol style={{ fontSize: "12px", color: "#807f78", lineHeight: "1.5", fontFamily: "Onest, sans-serif" }}>
              {lab.hints.map((hint, index) => (
                <li key={index}>
                  {index + 1}. {hint}
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* Flag Submission Form */}
        <div style={{ marginTop: "32px", padding: "24px", backgroundColor: "#0f0f0f", borderRadius: "8px", border: "1px solid rgba(255, 255, 255, 0.05)" }}>
          <h3 className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", textTransform: "uppercase", marginBottom: "12px" }}>
            Flag Submission
          </h3>

          {lab.flagSubmission.attempts > 0 || lab.flagSubmission.submitted ? (
            <div style={{ marginBottom: "16px" }}>
              <p style={{ fontSize: "12px", color: lab.flagSubmission.correct === true ? "#00e676" : lab.flagSubmission.correct === false ? "#ff3b1d" : "#807f78" }}>
                Status: {lab.flagSubmission.correct === true ? "Flag Correct!" : lab.flagSubmission.correct === false ? "Incorrect Flag - Try Again" : lab.flagSubmission.submitted ? "Submitted Awaiting Review" : "No attempts yet"}
              </p>

{lab.flagSubmission.correct === false && (
                  <p style={{ fontSize: "11px", color: "#ff3b1d", marginTop: "4px" }}>
                    Incorrect flag does not reveal the answer. Try again with different approach.
                  </p>
                )}
            </div>
          ) : (
            <p style={{ fontSize: "12px", color: "#807f78" }}>
              Submit your flag below to verify your solution
            </p>
          )}

          {lab.flagSubmission.attempts < lab.flagSubmission.maxAttempts && !lab.flagSubmission.submitted && (
            <form style={{ marginTop: "16px" }}>
              <div style={{ marginBottom: "12px" }}>
                <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "#f3f1ea" }}>
                  Enter Flag:
                </label>
                <input
                  type="text"
                  placeholder="FLAG{...}"
                  maxLength={100}
                />
              </div>

              <button
                type="submit"
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
            </form>
          )}

          {lab.flagSubmission.attempts >= lab.flagSubmission.maxAttempts && !lab.flagSubmission.submitted && (
            <p style={{ fontSize: "11px", color: "#ff3b1d", marginTop: "12px" }}>
              Maximum attempts reached. The explanation is available after solving or trying again later.
            </p>
          )}

          {lab.flagSubmission.submitted && lab.flagSubmission.correct === null && (
            <p style={{ fontSize: "11px", color: "#ff6a3d", marginTop: "8px" }}>
              Flag submitted - awaiting review. You'll be notified once it's verified.
            </p>
          )}
        </div>

        {/* Explanation After Solving */}
        {lab.progress.explanation && (
          <div style={{ marginTop: "24px", padding: "20px", backgroundColor: "#0f0f0f", borderRadius: "8px", borderTop: "3px solid #00e676" }}>
            <p style={{ fontSize: "13px", color: "#f3f1ea", lineHeight: "1.6", fontFamily: "Onest, sans-serif" }}>
              {lab.progress.explanation}
            </p>
          </div>
        )}

        {/* Navigation / Related Content */}
        <div style={{ marginTop: "32px", paddingTop: "24px", borderTop: "1px solid rgba(255, 255, 255, 0.05)" }}>
          {isFreePreview && (
            <Link
              href="/prepmeup/cybersecurity/labs"
              className="pmu-btn-secondary"
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                color: "#807f78",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Back to Labs
            </Link>
          )}

          {!isFreePreview && isPublished && (
            <Link
              href="/prepmeup/cybersecurity/labs"
              className="pmu-btn-primary"
              style={{
                padding: "8px 16px",
                fontSize: "12px",
                color: "#ff3b1d",
                textTransform: "uppercase",
                textDecoration: "none",
              }}
            >
              Continue to Another Lab
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
