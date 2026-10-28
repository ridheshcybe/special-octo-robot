"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { phoneSchema } from "../_lib/validation";

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/prepmeup/dashboard";

  const [phone, setPhone] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [website, setWebsite] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = phoneSchema.safeParse(phone);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Invalid phone number");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: validation.data, website }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to send code.");
        setLoading(false);
        return;
      }

      if (typeof window !== "undefined") {
        sessionStorage.setItem("pmu_phone", validation.data);
      }

      if (data.devMockCode) {
        sessionStorage.setItem("pmu_mock_otp", data.devMockCode);
      }

      router.push(`/prepmeup/verify-otp?redirectTo=${encodeURIComponent(redirectTo)}`);
    } catch {
      setError("Network error. Please try again.");
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
        <div style={{ marginTop: "0.75rem" }}>
          <span className="pmu-pill-accent">Semester 1 Access</span>
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
          Create Student Account
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#807f78" }}>
          Sign up in 30 seconds with your WhatsApp number. No passwords to remember.
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
            htmlFor="phone"
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
            WhatsApp Mobile Number
          </label>
          <div style={{ display: "flex" }}>
            <span
              style={{
                display: "inline-flex",
                alignItems: "center",
                borderTopLeftRadius: "0.375rem",
                borderBottomLeftRadius: "0.375rem",
                border: "1px solid rgba(243,241,234,0.16)",
                borderRight: "none",
                backgroundColor: "#17171b",
                padding: "0 0.875rem",
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "#807f78",
              }}
            >
              +91
            </span>
            <input
              id="phone"
              type="tel"
              placeholder="9876543210"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="pmu-input"
              style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
              autoFocus
              required
            />
          </div>
          <p style={{ marginTop: "0.375rem", fontSize: "0.6875rem", color: "#807f78" }}>
            We respect your privacy. Zero marketing calls or auto-debits.
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
          {loading ? "Sending WhatsApp Code…" : "Sign Up & Get Access"}
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
        <Link href={`/prepmeup/login?redirectTo=${encodeURIComponent(redirectTo)}`}>
          Already registered? <span style={{ color: "#ff3b1d", fontWeight: 600 }}>Log in</span>
        </Link>
        <Link href="/prepmeup">← Back</Link>
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <div className="pmu-auth-shell">
      <Suspense fallback={<div style={{ fontSize: "0.75rem", color: "#807f78" }}>Loading…</div>}>
        <SignupForm />
      </Suspense>
    </div>
  );
}
