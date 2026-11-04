"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { adminLoginSchema } from "../../_lib/validation";

export default function AdminLoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = adminLoginSchema.safeParse({ email, password });
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid email or password.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validation.data),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Invalid credentials.");
        setLoading(false);
        return;
      }

      router.push("/prepmeup/admin");
    } catch {
      setError("Network connection error. Try again.");
      setLoading(false);
    }
  };

  return (
    <div className="pmu-auth-shell">
      <div className="pmu-auth-card">
        <div style={{ textAlign: "center" }}>
          <Link href="/prepmeup" className="pmu-brand-logo">
            <span className="pmu-brand-mark">P</span>
            <span className="pmu-brand-title">
              PREPMEUP <span style={{ color: "#ff3b1d" }}>AI</span>
            </span>
          </Link>
          <div style={{ marginTop: "0.75rem" }}>
            <span
              style={{
                display: "inline-block",
                borderRadius: "9999px",
                backgroundColor: "rgba(70,8,9,0.5)",
                border: "1px solid rgba(239,68,68,0.35)",
                padding: "0.25rem 0.75rem",
                fontSize: "0.6875rem",
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#f87171",
              }}
            >
              Authorized Personnel Only
            </span>
          </div>
          <h1
            style={{
              marginTop: "0.75rem",
              fontFamily: 'var(--font-anton), "Anton", sans-serif',
              fontSize: "1.625rem",
              textTransform: "uppercase",
              letterSpacing: "0.04em",
              color: "#f3f1ea",
            }}
          >
            Admin Command Login
          </h1>
          <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#807f78" }}>
            Sign in with administrative credentials to access moderation and syllabus controls.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#807f78",
                marginBottom: "0.5rem",
              }}
            >
              Admin Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="walavalkarridhesh@gmail.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="pmu-input"
              required
              autoFocus
            />
          </div>

          <div>
            <label
              htmlFor="password"
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.06em",
                color: "#807f78",
                marginBottom: "0.5rem",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pmu-input"
              required
            />
          </div>

          {error && (
            <div
              style={{
                borderRadius: "0.375rem",
                border: "1px solid rgba(239,68,68,0.35)",
                backgroundColor: "rgba(70,8,9,0.3)",
                padding: "0.75rem",
                fontSize: "0.75rem",
                color: "#f87171",
              }}
            >
              {error}
            </div>
          )}

          <button type="submit" disabled={loading} className="pmu-btn-primary" style={{ width: "100%" }}>
            {loading ? "Authenticating…" : "Sign In to Admin Portal"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid rgba(243,241,234,0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: "0.75rem",
            color: "#807f78",
          }}
        >
          <Link href="/prepmeup/login">← Student Log In</Link>
          <Link href="/prepmeup">Public Portal</Link>
        </div>
      </div>
    </div>
  );
}
