"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export function StudentGrowthAutopilotCard() {
  const [data, setData] = useState<any>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<
    "whatsappClassBroadcast" | "whatsappQuizChallenge" | "whatsappSquadPitch"
  >("whatsappClassBroadcast");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [syncing, setSyncing] = useState<boolean>(false);

  const loadAutopilot = () => {
    fetch("/api/prepmeup/growth/autopilot")
      .then((res) => (res.ok ? res.json() : null))
      .then((res) => {
        if (res?.ok && res.data) {
          setData(res.data);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadAutopilot();
  }, []);

  const handleCopy = (text: string, key: string) => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(text).catch(() => {});
    }
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2200);
  };

  const handleRunDailySync = async () => {
    setSyncing(true);
    try {
      const res = await fetch("/api/prepmeup/growth/autopilot", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "run_daily_automation" }),
      });
      const json = await res.json();
      if (json?.ok) {
        loadAutopilot();
      }
    } catch {
    } finally {
      setSyncing(false);
    }
  };

  if (!data) return null;

  const refCode = data.referral?.referrerCode || "REF-CAMPUS";
  const refUrl = `https://prepmeupai.in/prepmeup?ref=${refCode}`;
  const activeMessage =
    data.digest?.[selectedTemplate] ||
    `Check out today's Semester 1 Daily Capsule & SGPA Calculator on PrepMeUp: ${refUrl}`;

  return (
    <section
      className="pmu-card-highlight"
      style={{
        padding: "26px 30px",
        borderRadius: "16px",
        border: "1px solid rgba(34, 197, 94, 0.4)",
        backgroundColor: "#111114",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "12px",
          marginBottom: "18px",
        }}
      >
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px" }}>
            <span
              className="pmu-badge"
              style={{
                backgroundColor: "rgba(34,197,94,0.16)",
                color: "#4ade80",
                borderColor: "rgba(34,197,94,0.4)",
              }}
            >
              🚀 Campus Referral &amp; Daily Broadcast Autopilot
            </span>
            <span className="font-mono" style={{ fontSize: "11px", color: "#a19f95" }}>
              Your Code: <strong style={{ color: "#4ade80" }}>{refCode}</strong> •{" "}
              {data.referral?.conversions || 0} Classmates Joined
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: "26px", textTransform: "uppercase", color: "#f3f1ea" }}>
            Share Daily Capsule to Class WhatsApp &amp; Unlock VIP Rewards
          </h2>
        </div>

        <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
          <button
            type="button"
            onClick={handleRunDailySync}
            disabled={syncing}
            className="pmu-btn-secondary"
            style={{ padding: "8px 14px", fontSize: "11px" }}
          >
            {syncing ? "↻ Syncing Daily Digest…" : "↻ Auto-Refresh Today's Broadcast"}
          </button>
          <Link
            href="/prepmeup/checkout?tier=tier2_squad"
            className="pmu-btn-primary"
            style={{ padding: "8px 16px", fontSize: "11px", backgroundColor: "#22c55e", color: "#08080a" }}
          >
            👥 3-Friend Squad Pass (₹149/Each) →
          </Link>
        </div>
      </div>

      {/* If student has Squad Invite codes, show them */}
      {Array.isArray(data.mySquadInvites) && data.mySquadInvites.length > 0 && (
        <div
          style={{
            marginBottom: "18px",
            padding: "14px 18px",
            borderRadius: "10px",
            backgroundColor: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.4)",
          }}
        >
          <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700, textTransform: "uppercase" }}>
            🎟️ Your Active Study Squad Friend Invite Codes (100% Off Tier 2 Pro):
          </span>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "8px" }}>
            {data.mySquadInvites.map((inv: any) => (
              <div
                key={inv.code}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  backgroundColor: "#08080a",
                  border: "1px solid #26262c",
                  display: "flex",
                  alignItems: "center",
                  gap: "10px",
                  fontSize: "12px",
                }}
              >
                <code className="font-mono" style={{ color: "#4ade80", fontWeight: 700 }}>
                  {inv.code}
                </code>
                <span className="font-mono" style={{ fontSize: "11px", color: inv.redeemedBy ? "#807f78" : "#fbbf24" }}>
                  {inv.redeemedBy ? `✓ Claimed by ${inv.redeemedBy.name}` : "Available (Unclaimed)"}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="pmu-grid-2" style={{ gap: "20px", alignItems: "stretch" }}>
        {/* Left: Referral Link & Reward Tracker */}
        <div
          style={{
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#08080a",
            border: "1px solid #26262c",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "14px",
          }}
        >
          <div>
            <span className="font-mono" style={{ fontSize: "11px", color: "#ff3b1d", fontWeight: 700, textTransform: "uppercase" }}>
              🎁 Personal Referral Link (Gives Friends ₹30 Off)
            </span>
            <p style={{ marginTop: "6px", fontSize: "13px", color: "#a19f95", lineHeight: 1.55 }}>
              When 2 classmates use your referral link or code <strong style={{ color: "#f3f1ea" }}>{refCode}</strong>, you automatically unlock code <strong style={{ color: "#4ade80" }}>VIP100</strong> (₹100 off Tier 3 Unlimited 1:1 Mentorship).
            </p>
            <div
              style={{
                marginTop: "12px",
                padding: "10px 12px",
                borderRadius: "6px",
                backgroundColor: "#111114",
                border: "1px solid #26262c",
                fontFamily: "monospace",
                fontSize: "12px",
                color: "#4ade80",
                wordBreak: "break-all",
              }}
            >
              {refUrl}
            </div>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              onClick={() => handleCopy(refUrl, "ref")}
              className="pmu-btn-secondary"
              style={{ flex: 1, fontSize: "11px", padding: "9px 14px" }}
            >
              {copiedKey === "ref" ? "✓ Referral Link Copied!" : "📋 Copy Referral Link"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(
                `Hey! I'm using PrepMeUp for B.Tech Sem-1 notes, 17 interactive circuit/CPU simulators & AI doubt solving. Use my code ${refCode} for ₹30 off: ${refUrl}`
              )}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fetch("/api/prepmeup/growth/autopilot", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "track_share" }),
                }).catch(() => {});
              }}
              className="pmu-btn-primary"
              style={{
                flex: 1,
                fontSize: "11px",
                padding: "9px 14px",
                backgroundColor: "#22c55e",
                color: "#08080a",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              📲 Invite on WhatsApp →
            </a>
          </div>
        </div>

        {/* Right: Automated Daily WhatsApp Broadcast Ready-to-Forward Box */}
        <div
          style={{
            padding: "20px",
            borderRadius: "10px",
            backgroundColor: "#08080a",
            border: "1px solid #26262c",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            gap: "12px",
          }}
        >
          <div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "6px", marginBottom: "10px" }}>
              {[
                { key: "whatsappClassBroadcast" as const, label: "📢 Daily Class Drop" },
                { key: "whatsappQuizChallenge" as const, label: "⚡ Quiz Challenge" },
                { key: "whatsappSquadPitch" as const, label: "👥 Squad Split Pitch" },
              ].map((tab) => (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setSelectedTemplate(tab.key)}
                  className="font-mono"
                  style={{
                    padding: "5px 10px",
                    borderRadius: "4px",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    cursor: "pointer",
                    border: selectedTemplate === tab.key ? "1px solid #ff3b1d" : "1px solid #26262c",
                    backgroundColor: selectedTemplate === tab.key ? "rgba(255,59,29,0.15)" : "#111114",
                    color: selectedTemplate === tab.key ? "#ff3b1d" : "#a19f95",
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            <pre
              className="font-mono"
              style={{
                padding: "12px",
                borderRadius: "6px",
                backgroundColor: "#111114",
                border: "1px solid #26262c",
                fontSize: "11.5px",
                color: "#d6d3cb",
                whiteSpace: "pre-wrap",
                maxHeight: "130px",
                overflowY: "auto",
                lineHeight: 1.5,
              }}
            >
              {activeMessage}
            </pre>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
            <button
              type="button"
              onClick={() => handleCopy(activeMessage, "broadcast")}
              className="pmu-btn-secondary"
              style={{ flex: 1, fontSize: "11px", padding: "9px 14px" }}
            >
              {copiedKey === "broadcast" ? "✓ Message Copied!" : "📋 Copy Broadcast Text"}
            </button>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(activeMessage)}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={() => {
                fetch("/api/prepmeup/growth/autopilot", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ action: "track_share" }),
                }).catch(() => {});
              }}
              className="pmu-btn-primary"
              style={{
                flex: 1,
                fontSize: "11px",
                padding: "9px 14px",
                textDecoration: "none",
                textAlign: "center",
              }}
            >
              📲 Forward to Class Group →
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
