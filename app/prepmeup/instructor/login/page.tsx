"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function InstructorLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("vaidya@quantum.prepmeupai.in");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    try {
      const res = await fetch("/api/prepmeup/instructor/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emailOrSlug: email }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Authentication failed");
      }

      router.push("/prepmeup/instructor");
      router.refresh();
    } catch (err: any) {
      setErrorMsg(err.message || "Could not log in as instructor");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pmu-root" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "20px" }}>
      <div className="pmu-card" style={{ width: "100%", maxWidth: "440px", padding: "36px", border: "1px solid rgba(255, 59, 29, 0.4)" }}>
        <div style={{ textAlign: "center", marginBottom: "24px" }}>
          <span className="pmu-badge" style={{ backgroundColor: "rgba(255, 59, 29, 0.15)", color: "#ff6a3d" }}>
            Faculty & Instructor Portal
          </span>
          <h1 className="font-display" style={{ fontSize: "32px", color: "#f3f1ea", textTransform: "uppercase", marginTop: "10px" }}>
            Instructor Sign In
          </h1>
          <p style={{ fontSize: "14px", color: "#807f78", marginTop: "4px" }}>
            Manage assigned tracks, course modules, student submissions, and live mentorship requests.
          </p>
        </div>

        {errorMsg && (
          <div style={{ padding: "12px", backgroundColor: "rgba(255, 59, 29, 0.15)", border: "1px solid #ff3b1d", borderRadius: "8px", fontSize: "13px", color: "#ff6a3d", marginBottom: "16px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label className="font-mono" style={{ fontSize: "11px", color: "#807f78", textTransform: "uppercase" }}>
              Faculty Email or Faculty ID
            </label>
            <input
              type="text"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. vaidya@quantum.prepmeupai.in"
              required
              className="pmu-input"
              style={{
                width: "100%",
                marginTop: "6px",
                padding: "12px 14px",
                backgroundColor: "#08080a",
                border: "1px solid rgba(243, 241, 234, 0.15)",
                borderRadius: "8px",
                color: "#f3f1ea",
                fontFamily: "monospace",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="pmu-btn-primary"
            style={{ width: "100%", padding: "14px", marginTop: "8px" }}
          >
            {loading ? "Authenticating Faculty..." : "Sign In to Faculty Portal →"}
          </button>
        </form>

        <div style={{ marginTop: "24px", textAlign: "center", borderTop: "1px solid rgba(243, 241, 234, 0.08)", paddingTop: "16px", fontSize: "12px", color: "#807f78" }}>
          <div>Demo Credentials: <code>dr-aravind-vaidya</code></div>
          <div style={{ marginTop: "10px" }}>
            <Link href="/prepmeup" style={{ color: "#807f78", textDecoration: "none" }}>
              ← Return to PrepMeUp Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
