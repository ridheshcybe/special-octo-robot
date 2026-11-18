"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { authTargetSchema } from "../_lib/validation";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/prepmeup/dashboard";

  const [identifier, setIdentifier] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState("");
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    let active = true;
    fetch("/api/prepmeup/auth/me")
      .then((r) => r.json())
      .then((data) => {
        if (!active) return;
        if (data.ok && data.authenticated) {
          window.location.href = redirectTo || "/prepmeup/dashboard";
        } else {
          setCheckingAuth(false);
        }
      })
      .catch(() => {
        if (active) setCheckingAuth(false);
      });
    return () => {
      active = false;
    };
  }, [redirectTo]);

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

  if (checkingAuth) {
    return (
      <div className="pmu-auth-card" style={{ textAlign: "center", padding: "2.5rem 1.5rem" }}>
        <p style={{ fontSize: "0.8125rem", color: "#6F6B62" }}>Checking student session…</p>
      </div>
    );
  }

  return (
    <div className="pmu-auth-card">
      <div style={{ textAlign: "center" }}>
        <Link href="/prepmeup" className="pmu-brand-logo">
          <span className="pmu-brand-mark">P</span>
          <span className="pmu-brand-title">
            PrepMeUp <span>AI</span>
          </span>
        </Link>
        <h1
          style={{
            marginTop: "1rem",
            fontSize: "1.375rem",
            fontWeight: 700,
            color: "#1C1A17",
            letterSpacing: "-0.015em",
          }}
        >
          Student sign-in
        </h1>
        <p style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "#6F6B62" }}>
          Enter your student email or mobile number to receive a 6-digit access code.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
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
              color: "#1C1A17",
              marginBottom: "0.375rem",
            }}
          >
            Student email or mobile number
          </label>
          <input
            id="identifier"
            type="text"
            placeholder="student@example.ac.in or 9876543210"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            className="pmu-input"
            autoCapitalize="none"
            autoCorrect="off"
            autoFocus
            required
          />
          <p style={{ marginTop: "0.375rem", fontSize: "0.6875rem", color: "#6F6B62" }}>
            We will send a 6-digit verification code directly to your email or phone.
          </p>
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

        <button type="submit" disabled={loading} className="pmu-btn-primary" style={{ width: "100%", justifyContent: "center" }}>
          {loading ? "Sending verification code…" : "Send verification code"}
        </button>
      </form>

      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid #E8E4DB",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          fontSize: "0.75rem",
          color: "#6F6B62",
        }}
      >
        <Link href={`/prepmeup/signup?redirectTo=${encodeURIComponent(redirectTo)}`} style={{ color: "#6F6B62", textDecoration: "none" }}>
          New student? <span style={{ color: "#C2331B", fontWeight: 600 }}>Sign up</span>
        </Link>
        <Link href="/prepmeup/admin/login" style={{ color: "#6F6B62", textDecoration: "none" }}>
          Admin portal ↗
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="pmu-auth-shell">
      <Suspense fallback={<div style={{ fontSize: "0.75rem", color: "#6F6B62" }}>Loading authentication…</div>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
