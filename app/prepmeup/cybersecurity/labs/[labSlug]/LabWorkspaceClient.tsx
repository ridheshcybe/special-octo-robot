"use client";

import React, { useState } from "react";
import Link from "next/link";
import { CyberLab, CyberLabProgress } from "@/app/prepmeup/_lib/trackStore";

interface LabWorkspaceClientProps {
  lab: CyberLab;
  hasAccess: boolean;
  initialAcceptedPolicy: boolean;
  userProgress?: CyberLabProgress;
  userTarget?: string | null;
}

export default function LabWorkspaceClient({
  lab,
  hasAccess,
  initialAcceptedPolicy,
  userProgress,
  userTarget,
}: LabWorkspaceClientProps) {
  // Policy Modal state
  const [hasAcceptedPolicy, setHasAcceptedPolicy] = useState(initialAcceptedPolicy);
  const [pledgeChecked, setPledgeChecked] = useState(false);
  const [policyLoading, setPolicyLoading] = useState(false);

  // Flag Submission state
  const [flagInput, setFlagInput] = useState("");
  const [submittingFlag, setSubmittingFlag] = useState(false);
  const [flagMessage, setFlagMessage] = useState<{
    text: string;
    isCorrect: boolean;
  } | null>(null);
  const [isCompleted, setIsCompleted] = useState(userProgress?.status === "completed");
  const [score, setScore] = useState(userProgress?.score || 0);

  // Active Tab: Sandbox vs AI Tutor
  const [activeWorkspaceTab, setActiveWorkspaceTab] = useState<"sandbox" | "ai_tutor">("sandbox");

  // AI Tutor State
  const [aiQuestion, setAiQuestion] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [aiConversation, setAiConversation] = useState<
    Array<{ sender: "user" | "ai"; text: string; notice?: string }>
  >([]);

  // Sandbox 1: Header Inspector state
  const [headerAuditRun, setHeaderAuditRun] = useState(false);
  const [headerPatched, setHeaderPatched] = useState(false);

  // Sandbox 2: Nmap Terminal state
  const [terminalInput, setTerminalInput] = useState("nmap -sV 10.0.0.1");
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "PrepMeUp Cyber Sandbox Terminal v2.4 (Simulated Environment)",
    "Type 'help' or 'nmap -sV 10.0.0.1' to begin reconnaissance.",
  ]);
  const [terminalRunning, setTerminalRunning] = useState(false);

  // Sandbox 3: SQLi Sandbox state
  const [sqliUser, setSqliUser] = useState("' OR '1'='1");
  const [sqliPass, setSqliPass] = useState("");
  const [parameterizedMode, setParameterizedMode] = useState(false);
  const [sqliExecuted, setSqliExecuted] = useState(false);

  // Sandbox 4: SOC Log Viewer state
  const [logFilter, setLogFilter] = useState("ALL");
  const [selectedIncidentIp, setSelectedIncidentIp] = useState("");
  const [isolatedSuccess, setIsolatedSuccess] = useState(false);

  // Sandbox 5: Crypto CTF state
  const [xorKey, setXorKey] = useState(0);
  const [cryptoDecryptedText, setCryptoDecryptedText] = useState("");

  const task = lab.tasks[0];

  // 1. Accept Ethical Policy
  const handleAcceptPolicy = async () => {
    if (!pledgeChecked) return;
    setPolicyLoading(true);
    try {
      const res = await fetch(`/api/prepmeup/cybersecurity/labs/${lab.slug}/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ policyVersion: "1.0" }),
      });
      const data = await res.json();
      if (data.ok) {
        setHasAcceptedPolicy(true);
      }
    } catch (e) {
      console.error("Policy acceptance failed", e);
    } finally {
      setPolicyLoading(false);
    }
  };

  // 2. Submit Flag
  const handleSubmitFlag = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!flagInput.trim()) return;
    setSubmittingFlag(true);
    setFlagMessage(null);

    try {
      const res = await fetch(`/api/prepmeup/cybersecurity/labs/${lab.slug}/submit-flag`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          flag: flagInput.trim(),
          taskId: task?.id,
        }),
      });

      const data = await res.json();
      if (res.ok && data.ok) {
        if (data.isCorrect) {
          setIsCompleted(true);
          setScore(data.pointsAwarded || task.points);
          setFlagMessage({
            text: `🎯 ${data.message} (+${data.pointsAwarded} pts awarded)`,
            isCorrect: true,
          });
        } else {
          setFlagMessage({
            text: `❌ ${data.message}`,
            isCorrect: false,
          });
        }
      } else {
        setFlagMessage({
          text: `⚠️ ${data.error || "Flag verification failed."}`,
          isCorrect: false,
        });
      }
    } catch (e: any) {
      setFlagMessage({
        text: "Error submitting flag. Check network connection.",
        isCorrect: false,
      });
    } finally {
      setSubmittingFlag(false);
    }
  };

  // 3. Ask Cyber AI Tutor
  const handleAskAI = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiQuestion.trim()) return;

    const query = aiQuestion.trim();
    setAiQuestion("");
    setAiLoading(true);

    setAiConversation((prev) => [...prev, { sender: "user", text: query }]);

    try {
      const res = await fetch("/api/prepmeup/ai/cybersecurity/doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: query }),
      });
      const data = await res.json();

      if (data.ok && data.data) {
        setAiConversation((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.data.answer,
            notice: data.data.safetyNotice,
          },
        ]);
      } else {
        setAiConversation((prev) => [
          ...prev,
          {
            sender: "ai",
            text: data.error || "Unable to answer inquiry at this time.",
          },
        ]);
      }
    } catch (err) {
      setAiConversation((prev) => [
        ...prev,
        { sender: "ai", text: "Network error contacting Cyber AI tutor." },
      ]);
    } finally {
      setAiLoading(false);
    }
  };

  // Nmap Terminal Command Runner
  const handleRunTerminal = () => {
    if (!terminalInput.trim() || terminalRunning) return;
    const cmd = terminalInput.trim();
    setTerminalRunning(true);

    setTerminalLogs((prev) => [...prev, `analyst@prepmeup-sandbox:~$ ${cmd}`]);

    setTimeout(() => {
      if (cmd.toLowerCase() === "help") {
        setTerminalLogs((prev) => [
          ...prev,
          "Available simulated commands:",
          "  nmap -sV 10.0.0.1      - Probe open ports & determine service info",
          "  nmap -sC 10.0.0.1      - Run default NSE security audit scripts",
          "  nmap -p- 10.0.0.1      - Scan all 65,535 TCP ports",
          "  clear                  - Clear terminal screen",
        ]);
      } else if (cmd.toLowerCase() === "clear") {
        setTerminalLogs([]);
      } else if (cmd.includes("nmap")) {
        setTerminalLogs((prev) => [
          ...prev,
          "Starting Nmap 7.94 ( https://nmap.org ) at 2026-11-04 18:30 IST",
          "Nmap scan report for target.internal (10.0.0.1)",
          "Host is up (0.00042s latency).",
          "Not shown: 997 closed tcp ports (reset)",
          "PORT     STATE SERVICE VERSION",
          "22/tcp   OPEN  ssh     OpenSSH 8.2p1 Ubuntu 4ubuntu0.5",
          "80/tcp   OPEN  http    Apache httpd 2.4.41 ((Ubuntu))",
          "3306/tcp OPEN  mysql   MySQL 8.0.32",
          "",
          "Service Info: OS: Linux; CPE: cpe:/o:linux:linux_kernel",
          "[+] RECONNAISSANCE FLAG CAPTURED: PMU{p0rt_22_80_d1sc0v3r3d}",
        ]);
      } else {
        setTerminalLogs((prev) => [
          ...prev,
          `bash: ${cmd}: command not found. Type 'help' for available sandbox commands.`,
        ]);
      }
      setTerminalRunning(false);
    }, 600);
  };

  // Crypto XOR Slider change
  const handleXorSlider = (keyVal: number) => {
    setXorKey(keyVal);
    // Ciphertext bytes for "PMU{x0r_b4s364_cr4ck3d}" when XORed with 0x30
    const rawPlaintext = "PMU{x0r_b4s364_cr4ck3d}";
    const key = keyVal & 0xff;
    let out = "";
    for (let i = 0; i < rawPlaintext.length; i++) {
      const code = rawPlaintext.charCodeAt(i);
      // If key is 0x30 (48 decimal), show plain text. Otherwise simulate XOR shifting.
      const shifted = String.fromCharCode(code ^ (0x30 ^ key));
      out += shifted;
    }
    setCryptoDecryptedText(out);
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      {/* 1. Ethical Conduct Gate Modal */}
      {!hasAcceptedPolicy && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 9999,
            backgroundColor: "rgba(0,0,0,0.85)",
            backdropFilter: "blur(6px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
          }}
        >
          <div
            style={{
              backgroundColor: "#111114",
              border: "1px solid rgba(255, 59, 29, 0.4)",
              borderRadius: "16px",
              maxWidth: "600px",
              width: "100%",
              padding: "32px",
              boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "16px" }}>
              <span style={{ fontSize: "24px" }}>⚖️</span>
              <h2 style={{ fontSize: "20px", fontWeight: 700, margin: 0, color: "#f3f1ea" }}>
                Authorized Testing &amp; Ethical Hacking Pledge
              </h2>
            </div>
            <p style={{ color: "#a19f95", fontSize: "14px", lineHeight: 1.6, marginBottom: "16px" }}>
              Before entering PrepMeUp AI CyberSecurity laboratories, all learners must formally
              acknowledge and agree to the following ethical engagement standards:
            </p>
            <div
              style={{
                backgroundColor: "#17171b",
                border: "1px solid #28282e",
                borderRadius: "8px",
                padding: "16px",
                fontSize: "13px",
                color: "#d1cfc7",
                lineHeight: 1.5,
                marginBottom: "20px",
                maxHeight: "180px",
                overflowY: "auto",
              }}
            >
              <ul style={{ paddingLeft: "18px", margin: 0, display: "flex", flexDirection: "column", gap: "8px" }}>
                <li>
                  <strong>Authorized Sandboxes Only:</strong> Security inspection techniques may only
                  be executed within designated synthetic browser environments.
                </li>
                <li>
                  <strong>No External Attack Traffic:</strong> You agree not to attempt exploitation,
                  automated scanning, or denial of service against public systems or third parties.
                </li>
                <li>
                  <strong>Defensive Purpose:</strong> All captured security vulnerabilities and CTF flags
                  are strictly intended for defensive remediation and architectural hardening.
                </li>
              </ul>
            </div>

            <label
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: "10px",
                cursor: "pointer",
                marginBottom: "24px",
                fontSize: "13.5px",
                color: "#f3f1ea",
              }}
            >
              <input
                type="checkbox"
                checked={pledgeChecked}
                onChange={(e) => setPledgeChecked(e.target.checked)}
                style={{ marginTop: "3px" }}
              />
              <span>
                I agree to adhere to the Ethical Hacking Guidelines, conduct exercises exclusively
                within authorized browser sandboxes, and uphold professional security standards.
              </span>
            </label>

            <button
              onClick={handleAcceptPolicy}
              disabled={!pledgeChecked || policyLoading}
              style={{
                width: "100%",
                backgroundColor: pledgeChecked ? "#ff3b1d" : "#28282e",
                color: pledgeChecked ? "#ffffff" : "#807f78",
                border: "none",
                borderRadius: "8px",
                padding: "14px",
                fontWeight: 700,
                fontSize: "14px",
                cursor: pledgeChecked ? "pointer" : "not-allowed",
                transition: "background-color 0.2s",
              }}
            >
              {policyLoading ? "Registering Acceptance..." : "Accept Pledge & Launch Lab"}
            </button>
          </div>
        </div>
      )}

      {/* Top Navigation Bar */}
      <header
        style={{
          borderBottom: "1px solid #1c1c20",
          backgroundColor: "#0d0d10",
          padding: "16px 24px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <Link
            href="/prepmeup/cybersecurity/labs"
            style={{
              color: "#807f78",
              textDecoration: "none",
              fontSize: "13px",
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            ← Back to Labs
          </Link>
          <span style={{ color: "#2e2e34" }}>|</span>
          <span style={{ fontSize: "14px", fontWeight: 700, color: "#f3f1ea" }}>
            {lab.title}
          </span>
          {lab.isFreePreview ? (
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                fontWeight: 700,
              }}
            >
              FREE PREVIEW
            </span>
          ) : (
            <span
              style={{
                fontSize: "11px",
                padding: "2px 8px",
                borderRadius: "4px",
                backgroundColor: "rgba(255, 106, 61, 0.15)",
                color: "#ff6a3d",
                fontWeight: 700,
              }}
            >
              ENROLLED LAB
            </span>
          )}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          <div style={{ fontSize: "12px", color: "#807f78", fontFamily: "monospace" }}>
            Score: <strong style={{ color: "#ff6a3d" }}>{score} pts</strong>
          </div>
          {isCompleted && (
            <span
              style={{
                fontSize: "12px",
                backgroundColor: "rgba(16, 185, 129, 0.15)",
                color: "#10b981",
                padding: "4px 10px",
                borderRadius: "6px",
                fontWeight: 700,
              }}
            >
              ✓ COMPLETED
            </span>
          )}
        </div>
      </header>

      {/* Main Workspace Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "minmax(320px, 420px) 1fr",
          minHeight: "calc(100vh - 65px)",
        }}
      >
        {/* Left Pane: Task Details, Instructions, Flag Submission */}
        <div
          style={{
            backgroundColor: "#111114",
            borderRight: "1px solid #1c1c20",
            padding: "28px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            overflowY: "auto",
          }}
        >
          <div>
            {/* Tab switch: Task Brief vs Cyber AI Tutor */}
            <div
              style={{
                display: "flex",
                backgroundColor: "#17171b",
                borderRadius: "8px",
                padding: "4px",
                marginBottom: "24px",
              }}
            >
              <button
                onClick={() => setActiveWorkspaceTab("sandbox")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: activeWorkspaceTab === "sandbox" ? "#222228" : "transparent",
                  color: activeWorkspaceTab === "sandbox" ? "#f3f1ea" : "#807f78",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                📋 Task Instructions
              </button>
              <button
                onClick={() => setActiveWorkspaceTab("ai_tutor")}
                style={{
                  flex: 1,
                  padding: "8px",
                  borderRadius: "6px",
                  border: "none",
                  backgroundColor: activeWorkspaceTab === "ai_tutor" ? "#222228" : "transparent",
                  color: activeWorkspaceTab === "ai_tutor" ? "#f3f1ea" : "#807f78",
                  fontSize: "13px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                🤖 Defensive AI Tutor
              </button>
            </div>

            {activeWorkspaceTab === "sandbox" ? (
              <>
                <div style={{ marginBottom: "20px" }}>
                  <span style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>
                    TASK 1 of 1 • {task?.points || 25} POINTS
                  </span>
                  <h2 style={{ fontSize: "20px", fontWeight: 700, margin: "6px 0 12px", color: "#f3f1ea" }}>
                    {task?.title || "Complete Security Audit"}
                  </h2>
                  <p style={{ color: "#a19f95", fontSize: "14px", lineHeight: 1.6 }}>
                    {task?.instructions || lab.description}
                  </p>
                </div>

                {/* Hint Accordion */}
                {task?.hint && (
                  <div
                    style={{
                      backgroundColor: "#17171b",
                      border: "1px solid #28282e",
                      borderRadius: "8px",
                      padding: "14px 16px",
                      marginBottom: "24px",
                    }}
                  >
                    <div style={{ fontSize: "12px", fontWeight: 700, color: "#ff6a3d", marginBottom: "4px" }}>
                      💡 INVESTIGATION HINT
                    </div>
                    <div style={{ fontSize: "13px", color: "#d1cfc7", lineHeight: 1.5 }}>
                      {task.hint}
                    </div>
                  </div>
                )}
              </>
            ) : (
              /* Cyber AI Tutor Tab */
              <div style={{ display: "flex", flexDirection: "column", height: "480px" }}>
                <div style={{ fontSize: "13px", color: "#a19f95", marginBottom: "12px" }}>
                  Ask questions about security concepts, headers, TCP scans, or remediation.
                  Offensive exploit generation requests are strictly refused.
                </div>

                <div
                  style={{
                    flex: 1,
                    overflowY: "auto",
                    display: "flex",
                    flexDirection: "column",
                    gap: "12px",
                    paddingRight: "6px",
                  }}
                >
                  {aiConversation.length === 0 && (
                    <div style={{ textAlign: "center", color: "#807f78", fontSize: "13px", marginTop: "40px" }}>
                      No inquiries yet. Try asking:
                      <div
                        onClick={() => setAiQuestion("Why is HSTS header required for PCI-DSS?")}
                        style={{
                          backgroundColor: "#17171b",
                          padding: "8px",
                          borderRadius: "6px",
                          margin: "8px 0",
                          cursor: "pointer",
                          color: "#d1cfc7",
                        }}
                      >
                        &quot;Why is HSTS header required for PCI-DSS?&quot;
                      </div>
                      <div
                        onClick={() => setAiQuestion("How do prepared statements stop SQL injection?")}
                        style={{
                          backgroundColor: "#17171b",
                          padding: "8px",
                          borderRadius: "6px",
                          margin: "8px 0",
                          cursor: "pointer",
                          color: "#d1cfc7",
                        }}
                      >
                        &quot;How do prepared statements stop SQL injection?&quot;
                      </div>
                    </div>
                  )}

                  {aiConversation.map((msg, i) => (
                    <div
                      key={i}
                      style={{
                        alignSelf: msg.sender === "user" ? "flex-end" : "flex-start",
                        maxWidth: "90%",
                        backgroundColor: msg.sender === "user" ? "#ff3b1d22" : "#17171b",
                        border: msg.sender === "user" ? "1px solid #ff3b1d55" : "1px solid #28282e",
                        borderRadius: "8px",
                        padding: "10px 14px",
                        fontSize: "13px",
                      }}
                    >
                      {msg.notice && (
                        <div style={{ color: "#f59e0b", fontSize: "11.5px", fontWeight: 700, marginBottom: "4px" }}>
                          ⚠️ {msg.notice}
                        </div>
                      )}
                      <div style={{ whiteSpace: "pre-wrap", color: "#f3f1ea", lineHeight: 1.5 }}>
                        {msg.text}
                      </div>
                    </div>
                  ))}
                </div>

                <form onSubmit={handleAskAI} style={{ display: "flex", gap: "8px", marginTop: "12px" }}>
                  <input
                    type="text"
                    value={aiQuestion}
                    onChange={(e) => setAiQuestion(e.target.value)}
                    placeholder="Ask security question..."
                    style={{
                      flex: 1,
                      backgroundColor: "#17171b",
                      border: "1px solid #28282e",
                      borderRadius: "6px",
                      padding: "8px 12px",
                      color: "#f3f1ea",
                      fontSize: "13px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    disabled={aiLoading}
                    style={{
                      backgroundColor: "#ff3b1d",
                      border: "none",
                      color: "#ffffff",
                      borderRadius: "6px",
                      padding: "8px 14px",
                      fontSize: "13px",
                      fontWeight: 600,
                      cursor: "pointer",
                    }}
                  >
                    {aiLoading ? "..." : "Send"}
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* CTF Flag Submission Form */}
          <div
            style={{
              borderTop: "1px solid #1c1c20",
              paddingTop: "20px",
              marginTop: "20px",
            }}
          >
            <div style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
              🏁 Capture The Flag Submission
            </div>
            <form onSubmit={handleSubmitFlag} style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <div style={{ display: "flex", gap: "8px" }}>
                <input
                  type="text"
                  value={flagInput}
                  onChange={(e) => setFlagInput(e.target.value)}
                  placeholder="PMU{...}"
                  style={{
                    flex: 1,
                    backgroundColor: "#17171b",
                    border: "1px solid #2e2e34",
                    borderRadius: "6px",
                    padding: "10px 12px",
                    color: "#f3f1ea",
                    fontFamily: "monospace",
                    fontSize: "13px",
                    outline: "none",
                  }}
                />
                <button
                  type="submit"
                  disabled={submittingFlag || !flagInput.trim()}
                  style={{
                    backgroundColor: "#ff3b1d",
                    border: "none",
                    color: "#ffffff",
                    borderRadius: "6px",
                    padding: "10px 16px",
                    fontWeight: 700,
                    fontSize: "13px",
                    cursor: "pointer",
                  }}
                >
                  {submittingFlag ? "Verifying..." : "Submit Flag"}
                </button>
              </div>

              {flagMessage && (
                <div
                  style={{
                    fontSize: "12.5px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    backgroundColor: flagMessage.isCorrect ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                    border: flagMessage.isCorrect ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                    color: flagMessage.isCorrect ? "#10b981" : "#ef4444",
                    fontWeight: 600,
                  }}
                >
                  {flagMessage.text}
                </div>
              )}
            </form>
          </div>
        </div>

        {/* Right Pane: Interactive Sandbox Environment */}
        <div style={{ backgroundColor: "#08080a", padding: "28px", overflowY: "auto" }}>
          {!hasAccess ? (
            <div
              style={{
                backgroundColor: "#111114",
                border: "1px solid rgba(255, 59, 29, 0.4)",
                borderRadius: "16px",
                padding: "48px 32px",
                textAlign: "center",
                maxWidth: "600px",
                margin: "40px auto 0",
              }}
            >
              <div style={{ fontSize: "42px", marginBottom: "16px" }}>🔒</div>
              <h3 style={{ fontSize: "24px", fontWeight: 700, color: "#f3f1ea", marginBottom: "8px" }}>
                Enrolled Student Lab Access Required
              </h3>
              <p style={{ color: "#a19f95", fontSize: "14.5px", lineHeight: 1.6, marginBottom: "24px" }}>
                This advanced laboratory environment is reserved for students enrolled in the CyberSecurity
                Foundations pass. You can try the free preview Lab 1 anytime or register for VIP early access.
              </p>
              <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
                <Link
                  href="/prepmeup/cybersecurity/pricing"
                  style={{
                    backgroundColor: "#ff3b1d",
                    color: "#ffffff",
                    padding: "12px 24px",
                    borderRadius: "8px",
                    fontWeight: 700,
                    fontSize: "14px",
                    textDecoration: "none",
                  }}
                >
                  View Waitlist &amp; Passes →
                </Link>
                <Link
                  href="/prepmeup/cybersecurity/labs/http-header-and-cookie-security-analyzer"
                  style={{
                    backgroundColor: "#17171b",
                    border: "1px solid #38383e",
                    color: "#f3f1ea",
                    padding: "12px 20px",
                    borderRadius: "8px",
                    fontWeight: 600,
                    fontSize: "14px",
                    textDecoration: "none",
                  }}
                >
                  Try Free Lab 1
                </Link>
              </div>
            </div>
          ) : (
            /* RENDER SANDBOX BASED ON CONFIG */
            <div>
              {/* SANDBOX 1: Header Inspector */}
              {lab.sandboxConfig?.interactiveType === "header_inspector" && (
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#f3f1ea" }}>
                      🔍 Simulated HTTP Request / Response Inspector
                    </h3>
                    <button
                      onClick={() => {
                        setHeaderAuditRun(true);
                      }}
                      style={{
                        backgroundColor: "#17171b",
                        border: "1px solid #38383e",
                        color: "#f3f1ea",
                        borderRadius: "6px",
                        padding: "6px 14px",
                        fontSize: "12.5px",
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Audit Headers
                    </button>
                  </div>

                  {/* Browser Bar Simulator */}
                  <div
                    style={{
                      backgroundColor: "#111114",
                      border: "1px solid #26262b",
                      borderRadius: "10px",
                      padding: "10px 16px",
                      display: "flex",
                      alignItems: "center",
                      gap: "10px",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      marginBottom: "16px",
                    }}
                  >
                    <span style={{ color: "#10b981" }}>HTTPS</span>
                    <span style={{ color: "#807f78" }}>|</span>
                    <span style={{ color: "#f3f1ea" }}>https://shop.demo-sandbox.internal/api/checkout</span>
                  </div>

                  {/* Headers Table */}
                  <div
                    style={{
                      backgroundColor: "#111114",
                      border: "1px solid #26262b",
                      borderRadius: "12px",
                      padding: "20px",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#807f78", textTransform: "uppercase", fontWeight: 700, marginBottom: "12px" }}>
                      HTTP Response Headers (Target Server)
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", fontFamily: "monospace", fontSize: "13px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1c1c20", paddingBottom: "6px" }}>
                        <span style={{ color: "#a19f95" }}>Content-Type:</span>
                        <span style={{ color: "#f3f1ea" }}>application/json</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1c1c20", paddingBottom: "6px" }}>
                        <span style={{ color: "#a19f95" }}>X-Frame-Options:</span>
                        <span style={{ color: "#10b981" }}>DENY</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1c1c20", paddingBottom: "6px" }}>
                        <span style={{ color: "#a19f95" }}>X-Content-Type-Options:</span>
                        <span style={{ color: "#10b981" }}>nosniff</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderBottom: "1px solid #1c1c20", paddingBottom: "6px" }}>
                        <span style={{ color: "#a19f95" }}>Strict-Transport-Security:</span>
                        <span style={{ color: headerPatched ? "#10b981" : "#ef4444" }}>
                          {headerPatched
                            ? "max-age=63072000; includeSubDomains; preload"
                            : "MISSING (Required for HTTPS TLS enforcement)"}
                        </span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between" }}>
                        <span style={{ color: "#a19f95" }}>Set-Cookie:</span>
                        <span style={{ color: headerPatched ? "#10b981" : "#f59e0b" }}>
                          {headerPatched
                            ? "session=token; Secure; HttpOnly; SameSite=Strict"
                            : "session=token; Path=/"}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Audit Actions */}
                  <div
                    style={{
                      backgroundColor: "#17171b",
                      border: "1px solid #28282e",
                      borderRadius: "12px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f3f1ea" }}>
                          Security Compliance Score: {headerPatched ? "100% (A+)" : "50% (F)"}
                        </div>
                        <div style={{ fontSize: "12px", color: "#807f78" }}>
                          {headerPatched
                            ? "All defensive headers and cookie flags applied successfully."
                            : "HSTS header missing and insecure session cookie detected."}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          setHeaderPatched(true);
                        }}
                        style={{
                          backgroundColor: "#ff3b1d",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: "6px",
                          padding: "8px 16px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Apply Defensive Patch
                      </button>
                    </div>

                    {headerPatched && (
                      <div
                        style={{
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          borderRadius: "8px",
                          padding: "14px",
                          marginTop: "14px",
                        }}
                      >
                        <div style={{ color: "#10b981", fontSize: "13px", fontWeight: 700, marginBottom: "4px" }}>
                          ✓ Remediation Flag Discovered:
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <code style={{ fontFamily: "monospace", color: "#f3f1ea", fontSize: "14px" }}>
                            PMU&#123;h3ad3r_s3cur1ty_mast3r&#125;
                          </code>
                          <button
                            onClick={() => setFlagInput("PMU{h3ad3r_s3cur1ty_mast3r}")}
                            style={{
                              backgroundColor: "#17171b",
                              border: "1px solid #38383e",
                              color: "#d1cfc7",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            Auto-Fill Flag
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SANDBOX 2: Nmap Terminal */}
              {lab.sandboxConfig?.interactiveType === "nmap_simulator" && (
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#f3f1ea" }}>
                      💻 Synthetic Nmap Terminal Simulator
                    </h3>
                    <div style={{ fontSize: "12px", color: "#10b981", fontFamily: "monospace" }}>
                      ● Target: 10.0.0.1 (Sandbox Gateway)
                    </div>
                  </div>

                  {/* Terminal Screen */}
                  <div
                    style={{
                      backgroundColor: "#050507",
                      border: "1px solid #26262b",
                      borderRadius: "12px",
                      padding: "20px",
                      fontFamily: "monospace",
                      fontSize: "13px",
                      minHeight: "340px",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "space-between",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: "4px", overflowY: "auto" }}>
                      {terminalLogs.map((log, i) => (
                        <div
                          key={i}
                          style={{
                            color: log.includes("FLAG") ? "#10b981" : log.includes("analyst@") ? "#ff6a3d" : "#a19f95",
                            lineHeight: 1.4,
                          }}
                        >
                          {log}
                        </div>
                      ))}
                      {terminalRunning && <div style={{ color: "#ff6a3d" }}>[~] Executing TCP SYN stealth probe...</div>}
                    </div>

                    <div style={{ display: "flex", gap: "8px", marginTop: "16px", borderTop: "1px solid #1c1c20", paddingTop: "12px" }}>
                      <span style={{ color: "#10b981" }}>analyst@sandbox:~$</span>
                      <input
                        type="text"
                        value={terminalInput}
                        onChange={(e) => setTerminalInput(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleRunTerminal()}
                        placeholder="nmap -sV 10.0.0.1"
                        style={{
                          flex: 1,
                          backgroundColor: "transparent",
                          border: "none",
                          color: "#f3f1ea",
                          fontFamily: "monospace",
                          fontSize: "13px",
                          outline: "none",
                        }}
                      />
                      <button
                        onClick={handleRunTerminal}
                        style={{
                          backgroundColor: "#17171b",
                          border: "1px solid #38383e",
                          color: "#f3f1ea",
                          borderRadius: "4px",
                          padding: "4px 10px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Execute
                      </button>
                    </div>
                  </div>

                  {terminalLogs.some((l) => l.includes("FLAG")) && (
                    <div style={{ marginTop: "16px", textAlign: "right" }}>
                      <button
                        onClick={() => setFlagInput("PMU{p0rt_22_80_d1sc0v3r3d}")}
                        style={{
                          backgroundColor: "#17171b",
                          border: "1px solid #38383e",
                          color: "#10b981",
                          padding: "6px 12px",
                          borderRadius: "6px",
                          fontSize: "12px",
                          cursor: "pointer",
                        }}
                      >
                        Auto-Fill Discovered Flag
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* SANDBOX 3: SQLi Sandbox */}
              {lab.sandboxConfig?.interactiveType === "sqli_sandbox" && (
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 16px", color: "#f3f1ea" }}>
                    🛡️ Web Defense: SQL Injection vs. Parameterized Query
                  </h3>

                  <div
                    style={{
                      backgroundColor: "#111114",
                      border: "1px solid #26262b",
                      borderRadius: "12px",
                      padding: "24px",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                      <span style={{ fontSize: "14px", fontWeight: 700, color: "#f3f1ea" }}>
                        Defense Toggle: Prepared Statements
                      </span>
                      <button
                        onClick={() => {
                          setParameterizedMode(!parameterizedMode);
                          setSqliExecuted(false);
                        }}
                        style={{
                          backgroundColor: parameterizedMode ? "#10b981" : "#28282e",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: "999px",
                          padding: "6px 16px",
                          fontSize: "12px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        {parameterizedMode ? "✓ Parameterized (Secure)" : "✕ String Concatenation (Vulnerable)"}
                      </button>
                    </div>

                    {/* Query Visualizer */}
                    <div
                      style={{
                        backgroundColor: "#08080a",
                        border: "1px solid #28282e",
                        borderRadius: "8px",
                        padding: "14px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        color: "#a19f95",
                        marginBottom: "16px",
                        lineHeight: 1.5,
                      }}
                    >
                      <div style={{ color: "#807f78", fontSize: "11px", marginBottom: "4px" }}>GENERATED SQL COMMAND:</div>
                      {!parameterizedMode ? (
                        <div>
                          SELECT * FROM users WHERE username = &apos;<span style={{ color: "#ff6a3d" }}>{sqliUser}</span>&apos; AND password = &apos;{sqliPass}&apos;;
                        </div>
                      ) : (
                        <div>
                          SELECT * FROM users WHERE username = $1 AND password = $2;
                          <div style={{ color: "#10b981", marginTop: "4px" }}>
                            Parameters: [$1 = &quot;{sqliUser}&quot;, $2 = &quot;{sqliPass}&quot;]
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Form Simulator */}
                    <div style={{ display: "flex", gap: "10px", marginBottom: "16px" }}>
                      <input
                        type="text"
                        value={sqliUser}
                        onChange={(e) => setSqliUser(e.target.value)}
                        placeholder="Username"
                        style={{
                          flex: 1,
                          backgroundColor: "#17171b",
                          border: "1px solid #2e2e34",
                          borderRadius: "6px",
                          padding: "10px",
                          color: "#f3f1ea",
                          fontSize: "13px",
                          fontFamily: "monospace",
                        }}
                      />
                      <button
                        onClick={() => setSqliExecuted(true)}
                        style={{
                          backgroundColor: "#ff3b1d",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: "6px",
                          padding: "10px 18px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: "pointer",
                        }}
                      >
                        Test Query
                      </button>
                    </div>

                    {sqliExecuted && (
                      <div
                        style={{
                          padding: "14px",
                          borderRadius: "8px",
                          backgroundColor: parameterizedMode ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                          border: parameterizedMode ? "1px solid rgba(16, 185, 129, 0.3)" : "1px solid rgba(239, 68, 68, 0.3)",
                        }}
                      >
                        {parameterizedMode ? (
                          <div>
                            <div style={{ color: "#10b981", fontWeight: 700, fontSize: "13px" }}>
                              ✓ Attack Neutralized! Parameterized query evaluated payload as a string literal.
                            </div>
                            <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "12px", color: "#d1cfc7" }}>Defense Flag:</span>
                              <code style={{ color: "#f3f1ea", fontFamily: "monospace" }}>PMU&#123;s4n1t1z3_y0ur_1nputs_4lw4ys&#125;</code>
                              <button
                                onClick={() => setFlagInput("PMU{s4n1t1z3_y0ur_1nputs_4lw4ys}")}
                                style={{
                                  backgroundColor: "#17171b",
                                  border: "1px solid #38383e",
                                  color: "#d1cfc7",
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "11px",
                                  cursor: "pointer",
                                }}
                              >
                                Auto-Fill
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div style={{ color: "#ef4444", fontWeight: 600, fontSize: "13px" }}>
                            ✕ Tautology &apos;1&apos;=&apos;1&apos; succeeded! Authentication bypassed. Toggle &quot;Prepared Statements&quot; above to remediate.
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SANDBOX 4: SOC Log Viewer */}
              {lab.sandboxConfig?.interactiveType === "soc_log_viewer" && (
                <div style={{ maxWidth: "840px", margin: "0 auto" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
                    <h3 style={{ fontSize: "18px", fontWeight: 700, margin: 0, color: "#f3f1ea" }}>
                      🚨 SOC SIEM Alert Triage Dashboard
                    </h3>
                    <div style={{ display: "flex", gap: "6px" }}>
                      {["ALL", "CRITICAL", "WARN"].map((f) => (
                        <button
                          key={f}
                          onClick={() => setLogFilter(f)}
                          style={{
                            backgroundColor: logFilter === f ? "#ff3b1d" : "#17171b",
                            border: "1px solid #28282e",
                            color: "#ffffff",
                            borderRadius: "4px",
                            padding: "4px 10px",
                            fontSize: "11px",
                            fontWeight: 600,
                            cursor: "pointer",
                          }}
                        >
                          {f}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div
                    style={{
                      backgroundColor: "#111114",
                      border: "1px solid #26262b",
                      borderRadius: "12px",
                      padding: "16px",
                      marginBottom: "20px",
                      maxHeight: "320px",
                      overflowY: "auto",
                      fontFamily: "monospace",
                      fontSize: "12.5px",
                    }}
                  >
                    {[
                      { ts: "10:14:02", ip: "192.168.1.105", ev: "Failed SSH login for user root (attempt 1)", sev: "WARN" },
                      { ts: "10:14:05", ip: "192.168.1.105", ev: "Failed SSH login for user root (attempt 2)", sev: "WARN" },
                      { ts: "10:14:08", ip: "192.168.1.105", ev: "Failed SSH login for user root (attempt 3)", sev: "WARN" },
                      { ts: "10:14:15", ip: "192.168.1.105", ev: "Accepted password for root from 192.168.1.105 port 44322 ssh2", sev: "CRITICAL" },
                      { ts: "10:15:30", ip: "192.168.1.105", ev: "Privilege escalation detected: sudo /bin/bash", sev: "CRITICAL" },
                      { ts: "10:16:01", ip: "10.0.0.55", ev: "Internal health check GET /healthz 200 OK", sev: "INFO" },
                    ]
                      .filter((l) => (logFilter === "ALL" ? true : l.sev === logFilter))
                      .map((l, i) => (
                        <div
                          key={i}
                          onClick={() => setSelectedIncidentIp(l.ip)}
                          style={{
                            padding: "8px 10px",
                            borderRadius: "6px",
                            borderBottom: "1px solid #1c1c20",
                            backgroundColor: selectedIncidentIp === l.ip ? "#1f1f26" : "transparent",
                            cursor: "pointer",
                            display: "grid",
                            gridTemplateColumns: "80px 120px 1fr 80px",
                            gap: "8px",
                            alignItems: "center",
                          }}
                        >
                          <span style={{ color: "#807f78" }}>{l.ts}</span>
                          <span style={{ color: "#ff6a3d" }}>{l.ip}</span>
                          <span style={{ color: "#d1cfc7" }}>{l.ev}</span>
                          <span
                            style={{
                              color: l.sev === "CRITICAL" ? "#ef4444" : l.sev === "WARN" ? "#f59e0b" : "#10b981",
                              fontWeight: 700,
                              fontSize: "11px",
                            }}
                          >
                            {l.sev}
                          </span>
                        </div>
                      ))}
                  </div>

                  {/* Incident Remediation Box */}
                  <div
                    style={{
                      backgroundColor: "#17171b",
                      border: "1px solid #28282e",
                      borderRadius: "12px",
                      padding: "20px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <div>
                        <div style={{ fontSize: "14px", fontWeight: 700, color: "#f3f1ea" }}>
                          Incident Containment Playbook
                        </div>
                        <div style={{ fontSize: "12px", color: "#807f78" }}>
                          Selected Malicious IP: {selectedIncidentIp || "Click a log event to select suspicious IP"}
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedIncidentIp === "192.168.1.105") {
                            setIsolatedSuccess(true);
                          }
                        }}
                        disabled={!selectedIncidentIp}
                        style={{
                          backgroundColor: selectedIncidentIp ? "#ef4444" : "#28282e",
                          border: "none",
                          color: "#ffffff",
                          borderRadius: "6px",
                          padding: "8px 16px",
                          fontSize: "13px",
                          fontWeight: 700,
                          cursor: selectedIncidentIp ? "pointer" : "not-allowed",
                        }}
                      >
                        Isolate Compromised Host
                      </button>
                    </div>

                    {isolatedSuccess && (
                      <div
                        style={{
                          backgroundColor: "rgba(16, 185, 129, 0.12)",
                          border: "1px solid rgba(16, 185, 129, 0.3)",
                          borderRadius: "8px",
                          padding: "14px",
                          marginTop: "16px",
                        }}
                      >
                        <div style={{ color: "#10b981", fontWeight: 700, fontSize: "13px" }}>
                          ✓ Host quarantined! Malicious lateral movement contained.
                        </div>
                        <div style={{ marginTop: "6px", display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={{ fontSize: "12px", color: "#d1cfc7" }}>SOC Flag:</span>
                          <code style={{ color: "#f3f1ea", fontFamily: "monospace" }}>PMU&#123;s0c_1nc1d3nt_1s0l4t3d&#125;</code>
                          <button
                            onClick={() => setFlagInput("PMU{s0c_1nc1d3nt_1s0l4t3d}")}
                            style={{
                              backgroundColor: "#17171b",
                              border: "1px solid #38383e",
                              color: "#d1cfc7",
                              padding: "2px 8px",
                              borderRadius: "4px",
                              fontSize: "11px",
                              cursor: "pointer",
                            }}
                          >
                            Auto-Fill
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* SANDBOX 5: Crypto CTF */}
              {lab.sandboxConfig?.interactiveType === "crypto_ctf" && (
                <div style={{ maxWidth: "800px", margin: "0 auto" }}>
                  <h3 style={{ fontSize: "18px", fontWeight: 700, margin: "0 0 16px", color: "#f3f1ea" }}>
                    🔐 Forensic Cryptanalysis &amp; XOR Flag Unmasker
                  </h3>

                  <div
                    style={{
                      backgroundColor: "#111114",
                      border: "1px solid #26262b",
                      borderRadius: "12px",
                      padding: "24px",
                      marginBottom: "20px",
                    }}
                  >
                    <div style={{ fontSize: "12px", color: "#807f78", textTransform: "uppercase", fontWeight: 700, marginBottom: "8px" }}>
                      Encrypted CTF Artifact (Hex Dump)
                    </div>
                    <div
                      style={{
                        backgroundColor: "#08080a",
                        border: "1px solid #28282e",
                        borderRadius: "8px",
                        padding: "12px",
                        fontFamily: "monospace",
                        fontSize: "13px",
                        color: "#ff6a3d",
                        marginBottom: "20px",
                      }}
                    >
                      70 7d 75 4b 58 40 52 5f 42 51 43 04 00 5f 53 42 41 51 40 55 54
                    </div>

                    <div style={{ marginBottom: "20px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                        <span style={{ fontSize: "13.5px", fontWeight: 600, color: "#f3f1ea" }}>
                          Single-Byte XOR Key: 0x{xorKey.toString(16).toUpperCase().padStart(2, "0")} ({xorKey})
                        </span>
                        <button
                          onClick={() => handleXorSlider(48)}
                          style={{
                            backgroundColor: "#17171b",
                            border: "1px solid #38383e",
                            color: "#ff6a3d",
                            borderRadius: "4px",
                            padding: "2px 8px",
                            fontSize: "11px",
                            cursor: "pointer",
                          }}
                        >
                          Auto Brute-Force Key (0x30)
                        </button>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="255"
                        value={xorKey}
                        onChange={(e) => handleXorSlider(Number(e.target.value))}
                        style={{ width: "100%", accentColor: "#ff3b1d", cursor: "pointer" }}
                      />
                    </div>

                    {/* Decrypted Output */}
                    <div
                      style={{
                        backgroundColor: "#08080a",
                        border: "1px solid #28282e",
                        borderRadius: "8px",
                        padding: "16px",
                      }}
                    >
                      <div style={{ fontSize: "12px", color: "#807f78", textTransform: "uppercase", fontWeight: 700, marginBottom: "6px" }}>
                        Decrypted Stream Result:
                      </div>
                      <div
                        style={{
                          fontFamily: "monospace",
                          fontSize: "16px",
                          color: cryptoDecryptedText.includes("PMU{") ? "#10b981" : "#807f78",
                          fontWeight: 700,
                        }}
                      >
                        {cryptoDecryptedText || "Adjust XOR key slider to uncover flag..."}
                      </div>
                    </div>

                    {cryptoDecryptedText.includes("PMU{") && (
                      <div style={{ marginTop: "16px", textAlign: "right" }}>
                        <button
                          onClick={() => setFlagInput("PMU{x0r_b4s364_cr4ck3d}")}
                          style={{
                            backgroundColor: "#17171b",
                            border: "1px solid #38383e",
                            color: "#10b981",
                            padding: "6px 12px",
                            borderRadius: "6px",
                            fontSize: "12px",
                            cursor: "pointer",
                          }}
                        >
                          Auto-Fill Flag
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
