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

      window.location.href = "/prepmeup/admin";
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
              PrepMeUp <span>AI</span>
            </span>
          </Link>
          <div style={{ marginTop: "0.75rem" }}>
            <span
              className="pmu-badge"
              style={{
                backgroundColor: "#F6E7E3",
                borderColor: "#E8E4DB",
                color: "#C2331B",
              }}
            >
              Authorized personnel only
            </span>
          </div>
          <h1
            style={{
              marginTop: "0.75rem",
              fontSize: "1.375rem",
              fontWeight: 700,
              color: "#1C1A17",
              letterSpacing: "-0.015em",
            }}
          >
            Admin portal login
          </h1>
          <p style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "#6F6B62" }}>
            Sign in with administrative credentials to access moderation and syllabus controls.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
        >
          <div>
            <label
              htmlFor="email"
              style={{
                display: "block",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#1C1A17",
                marginBottom: "0.375rem",
              }}
            >
              Admin email
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
                color: "#1C1A17",
                marginBottom: "0.375rem",
              }}
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pmu-input"
              required
            />
          </div>

          {error && (
            <div
              style={{
                borderRadius: "6px",
                border: "1px solid #E8E4DB",
                backgroundColor: "#F6E7E3",
                padding: "0.75rem",
                fontSize: "0.75rem",
                color: "#C2331B",
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="pmu-btn-primary"
            style={{ width: "100%", justifyContent: "center" }}
          >
            {loading ? "Authenticating…" : "Sign in to portal"}
          </button>
        </form>

        <div
          style={{
            marginTop: "1.5rem",
            paddingTop: "1rem",
            borderTop: "1px solid #E8E4DB",
            textAlign: "center",
          }}
        >
          <Link href="/prepmeup/login" style={{ fontSize: "0.75rem", color: "#6F6B62", textDecoration: "none" }}>
            ← Back to Student Sign-in
          </Link>
        </div>
      </div>
    </div>
  );
}
