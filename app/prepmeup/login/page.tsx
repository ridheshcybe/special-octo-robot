"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authTargetSchema } from "../_lib/validation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/prepmeup/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = authTargetSchema.safeParse(identifier);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Please enter a valid email or phone number");
      return;
    }

    const target = validation.data;
    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          identifier: target.value,
          email: target.type === "email" ? target.value : undefined,
          phone: target.type === "phone" ? target.value : undefined,
          website,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to send code. Please try again.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("pmu_target", target.value);
        sessionStorage.setItem("pmu_target_type", target.type);
        sessionStorage.setItem("pmu_phone", target.value);
      }

      if (data.devMockCode) {
        sessionStorage.setItem("pmu_mock_otp", data.devMockCode);
      }

      router.push(`/prepmeup/verify-otp?redirectTo=${encodeURIComponent(redirectTo)}`);
    } catch {
      setError("Network error. Please check your connection.");
      setLoading(false);
    }
  };

  return (
    <div className="pmu-auth-card">
      <div style={{ textAlign: "center" }}>
        <Link href="/prepmeup" className="pmu-brand-logo">
          <span className="pmu-brand-mark">P</span>
          <span className="pmu-brand-title">
            PREPMEUP <span style={{ color: "#ff3b1d" }}>AI</span>
          </span>
        </Link>
        <h1
          style={{
            marginTop: "1rem",
            fontFamily: 'var(--font-anton), "Anton", sans-serif',
            fontSize: "1.625rem",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
            color: "#f3f1ea",
          }}
        >
          Student Log In
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#807f78" }}>
          Enter your student email (or mobile number) to receive a 6-digit access code.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        <input
          type="text"
          name="website"
          value={website}
          onChange={(e) => setWebsite(e.target.value)}
          style={{ display: "none" }}
          tabIndex={-1}
          autoComplete="off"
        />

        <div>
          <label
            htmlFor="identifier"
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
            Student Email or Mobile Number
          </label>
          <input
            id="identifier"
            type="text"
            placeholder="student@dypiu.ac.in or 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="pmu-input"
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus
            required
          />
          <p style={{ marginTop: "0.375rem", fontSize: "0.6875rem", color: "#807f78" }}>
            We'll send a 6-digit verification code directly to your inbox.
          </p>
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
          {loading ? "Sending Verification Code…" : "Send Verification Code"}
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
        <Link href={`/prepmeup/signup?redirectTo=${encodeURIComponent(redirectTo)}`}>
          New student? <span style={{ color: "#ff3b1d", fontWeight: 600 }}>Sign up</span>
        </Link>
        <Link href="/prepmeup/admin/login">Admin portal ↗</Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="pmu-auth-shell">
      <Suspense fallback={<div style={{ fontSize: "0.75rem", color: "#807f78" }}>Loading authentication…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
