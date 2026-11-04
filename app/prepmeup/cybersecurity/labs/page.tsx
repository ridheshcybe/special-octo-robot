import React from "react";
import Link from "next/link";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { getAllCyberLabs, getAllUserCyberProgress } from "@/app/prepmeup/_lib/trackStore";
import { canAccessCyberLab } from "@/lib/prepmeup/access";

export const dynamic = "force-dynamic";

export default async function CyberLabsDirectoryPage() {
  const cookieStore = await cookies();
  const identity = resolveSessionIdentity(cookieStore);
  const userIdentifier = identity?.email || identity?.phone || identity?.canonicalId || null;

  const labs = getAllCyberLabs();
  const userProgress = getAllUserCyberProgress(identity?.canonicalId || "");
  const progressMap = new Map(userProgress.map((p) => [p.labId, p]));

  const totalPoints = labs.reduce((sum, l) => sum + (l.tasks[0]?.points || 0), 0);
  const earnedPoints = userProgress
    .filter((p) => p.status === "completed")
    .reduce((sum, p) => sum + (p.score || 0), 0);

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        padding: "48px 20px 80px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div style={{ maxWidth: "1140px", margin: "0 auto" }}>
        {/* Navigation Breadcrumb */}
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: "#807f78",
              fontFamily: "monospace",
            }}
          >
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>
              PrepMeUp
            </Link>
            <span>/</span>
            <Link
              href="/prepmeup/tracks/cybersecurity"
              style={{ color: "#807f78", textDecoration: "none" }}
            >
              CyberSecurity Track
            </Link>
            <span>/</span>
            <span style={{ color: "#ff6a3d" }}>Browser Labs &amp; CTF</span>
          </div>
        </div>

        {/* Header Banner */}
        <div
          style={{
            backgroundColor: "#111114",
            border: "1px solid #26262b",
            borderRadius: "16px",
            padding: "32px",
            marginBottom: "32px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-start",
            flexWrap: "wrap",
            gap: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
              <span
                style={{
                  display: "inline-block",
                  padding: "3px 10px",
                  borderRadius: "999px",
                  backgroundColor: "rgba(255, 59, 29, 0.12)",
                  border: "1px solid rgba(255, 59, 29, 0.3)",
                  color: "#ff6a3d",
                  fontSize: "11.5px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                }}
              >
                🛡️ Controlled Browser Sandboxes
              </span>
              <span style={{ fontSize: "12px", color: "#10b981", fontFamily: "monospace" }}>
                ● 100% Client-Side Safe • Ethical Hacking Verified
              </span>
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(28px, 4vw, 42px)",
                lineHeight: 1.05,
                textTransform: "uppercase",
                color: "#f3f1ea",
                margin: "4px 0 12px",
              }}
            >
              CyberSecurity Labs &amp; CTF Arena
            </h1>
            <p style={{ color: "#a19f95", fontSize: "15px", maxWidth: "680px", margin: 0, lineHeight: 1.5 }}>
              Hands-on defensive engineering, web vulnerability analysis, and SOC log investigations.
              Solve tasks, capture verified SHA-256 flags, and earn skill badges.
            </p>
          </div>

          {/* User Score Card */}
          <div
            style={{
              backgroundColor: "#17171b",
              border: "1px solid #2e2e34",
              borderRadius: "12px",
              padding: "20px 24px",
              minWidth: "220px",
              textAlign: "center",
            }}
          >
            <div style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase", fontWeight: 700 }}>
              CTF Flag Score
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#ff6a3d", margin: "4px 0" }}>
              {earnedPoints} / {totalPoints}
            </div>
            <div style={{ fontSize: "12px", color: "#a19f95" }}>
              {userProgress.filter((p) => p.status === "completed").length} of {labs.length} Labs Solved
            </div>
          </div>
        </div>

        {/* Labs Grid */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "24px" }}>
          {labs.map((lab, idx) => {
            const hasAccess = canAccessCyberLab(userIdentifier, lab);
            const prog = progressMap.get(lab.id);
            const isCompleted = prog?.status === "completed";
            const task = lab.tasks[0];
            const points = task?.points || 0;

            let difficultyColor = "#10b981";
            if (lab.difficulty === "intermediate") difficultyColor = "#f59e0b";
            if (lab.difficulty === "advanced") difficultyColor = "#ef4444";

            return (
              <div
                key={lab.id}
                style={{
                  backgroundColor: "#111114",
                  border: isCompleted ? "1px solid rgba(16, 185, 129, 0.4)" : "1px solid #26262b",
                  borderRadius: "16px",
                  padding: "24px",
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                  position: "relative",
                  transition: "transform 0.2s, border-color 0.2s",
                }}
              >
                <div>
                  {/* Badges row */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "14px" }}>
                    <div style={{ display: "flex", gap: "6px", alignItems: "center" }}>
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: "4px",
                          backgroundColor: `${difficultyColor}22`,
                          color: difficultyColor,
                          textTransform: "uppercase",
                          border: `1px solid ${difficultyColor}44`,
                        }}
                      >
                        {lab.difficulty}
                      </span>
                      {lab.isFreePreview ? (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(16, 185, 129, 0.15)",
                            color: "#10b981",
                            border: "1px solid rgba(16, 185, 129, 0.3)",
                          }}
                        >
                          FREE PREVIEW
                        </span>
                      ) : (
                        <span
                          style={{
                            fontSize: "11px",
                            fontWeight: 700,
                            padding: "2px 8px",
                            borderRadius: "4px",
                            backgroundColor: "rgba(255, 106, 61, 0.15)",
                            color: "#ff6a3d",
                            border: "1px solid rgba(255, 106, 61, 0.3)",
                          }}
                        >
                          ENROLLED ONLY
                        </span>
                      )}
                    </div>

                    {isCompleted && (
                      <span
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: "#10b981",
                          display: "flex",
                          alignItems: "center",
                          gap: "4px",
                        }}
                      >
                        ✓ SOLVED
                      </span>
                    )}
                  </div>

                  <h3
                    style={{
                      fontSize: "18px",
                      fontWeight: 700,
                      color: "#f3f1ea",
                      margin: "0 0 8px",
                      lineHeight: 1.3,
                    }}
                  >
                    Lab {idx + 1}: {lab.title}
                  </h3>

                  <p
                    style={{
                      fontSize: "13.5px",
                      color: "#a19f95",
                      lineHeight: 1.5,
                      marginBottom: "18px",
                    }}
                  >
                    {lab.description}
                  </p>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "16px",
                      fontSize: "12px",
                      color: "#807f78",
                      fontFamily: "monospace",
                      paddingTop: "12px",
                      borderTop: "1px solid #1c1c20",
                    }}
                  >
                    <span>⏱ {lab.estimatedMinutes} mins</span>
                    <span>🏆 {points} Points</span>
                    <span>🧩 1 Flag</span>
                  </div>
                </div>

                <div style={{ marginTop: "24px" }}>
                  {hasAccess ? (
                    <Link
                      href={`/prepmeup/cybersecurity/labs/${lab.slug}`}
                      style={{
                        display: "block",
                        textAlign: "center",
                        backgroundColor: isCompleted ? "#17171b" : "#ff3b1d",
                        border: isCompleted ? "1px solid #38383e" : "none",
                        color: "#ffffff",
                        padding: "10px 16px",
                        borderRadius: "8px",
                        fontWeight: 600,
                        fontSize: "13.5px",
                        textDecoration: "none",
                      }}
                    >
                      {isCompleted ? "Review Lab Workspace →" : "Launch Lab Sandbox →"}
                    </Link>
                  ) : (
                    <div style={{ display: "flex", gap: "8px" }}>
                      <Link
                        href={`/prepmeup/cybersecurity/labs/${lab.slug}`}
                        style={{
                          flex: 1,
                          textAlign: "center",
                          backgroundColor: "#17171b",
                          border: "1px solid #2e2e34",
                          color: "#807f78",
                          padding: "10px 12px",
                          borderRadius: "8px",
                          fontWeight: 500,
                          fontSize: "13px",
                          textDecoration: "none",
                        }}
                      >
                        Preview Task 🔒
                      </Link>
                      <Link
                        href="/prepmeup/cybersecurity/pricing"
                        style={{
                          textAlign: "center",
                          backgroundColor: "rgba(255, 59, 29, 0.15)",
                          border: "1px solid rgba(255, 59, 29, 0.35)",
                          color: "#ff6a3d",
                          padding: "10px 14px",
                          borderRadius: "8px",
                          fontWeight: 600,
                          fontSize: "13px",
                          textDecoration: "none",
                        }}
                      >
                        Unlock Pass
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </main>
  );
}
