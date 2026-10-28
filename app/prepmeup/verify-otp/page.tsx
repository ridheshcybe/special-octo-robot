"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useState } from "react";
import { otpSchema, sanitizeRedirect } from "../_lib/validation";

function VerifyOtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const rawRedirectTo = searchParams.get("redirectTo");
  const redirectTo = sanitizeRedirect(rawRedirectTo);

  const [phone, setPhone] = useState("");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [devMockHint, setDevMockHint] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("pmu_phone");
      if (stored) setPhone(stored);
      const mock = sessionStorage.getItem("pmu_mock_otp");
      if (mock) setDevMockHint(mock);
    }
  }, []);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => Math.max(0, c - 1));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const validation = otpSchema.safeParse(code);
    if (!validation.success) {
      setError(validation.error.issues[0]?.message ?? "Please enter a 6-digit OTP");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/auth/verify-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Incorrect verification code. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Verification successful! Directing to student hub…");

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pmu_mock_otp");
      }

      setTimeout(() => {
        router.push(data.redirectTo || redirectTo);
      }, 700);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending) return;
    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/prepmeup/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Failed to resend code.");
        setResending(false);
        return;
      }

      setCooldown(60);
      if (data.devMockCode) {
        setDevMockHint(data.devMockCode);
      }
      setSuccess("New verification code sent via WhatsApp.");
      setResending(false);
    } catch {
      setError("Failed to resend. Please check connection.");
      setResending(false);
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
          Enter 6-Digit Code
        </h1>
        <p style={{ marginTop: "0.5rem", fontSize: "0.8125rem", color: "#807f78" }}>
          We sent a verification code to WhatsApp on:{" "}
          <span style={{ fontWeight: 600, color: "#f3f1ea" }}>{phone || "your number"}</span>
        </p>

        {devMockHint && (
          <div
            style={{
              marginTop: "0.75rem",
              borderRadius: "0.375rem",
              border: "1px solid rgba(245,158,11,0.35)",
              backgroundColor: "rgba(70,25,1,0.3)",
              padding: "0.625rem",
              fontSize: "0.75rem",
              color: "#fcd34d",
            }}
          >
            🛠️ Local Dev Mock OTP: <strong>{devMockHint}</strong>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: "1.75rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        <div>
          <label
            htmlFor="otp"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              color: "#807f78",
              marginBottom: "0.5rem",
            }}
          >
            Verification Code
          </label>
          <input
            id="otp"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            placeholder="123456"
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
            className="pmu-input"
            style={{
              paddingTop: "0.875rem",
              paddingBottom: "0.875rem",
              textAlign: "center",
              fontFamily: "monospace",
              fontSize: "1.5rem",
              letterSpacing: "0.4em",
            }}
            autoFocus
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

        {success && (
          <div
            style={{
              borderRadius: "0.375rem",
              border: "1px solid rgba(16,185,129,0.35)",
              backgroundColor: "rgba(0,44,34,0.3)",
              padding: "0.75rem",
              fontSize: "0.75rem",
              color: "#34d399",
            }}
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="pmu-btn-primary"
          style={{ width: "100%" }}
        >
          {loading ? "Verifying Code…" : "Verify & Continue"}
        </button>
      </form>

      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid rgba(243,241,234,0.1)",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.75rem",
          fontSize: "0.75rem",
          color: "#807f78",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
          <span>Didn&apos;t receive code?</span>
          {cooldown > 0 ? (
            <span>Resend in {cooldown}s</span>
          ) : (
            <button
              type="button"
              onClick={handleResend}
              disabled={resending}
              style={{ fontWeight: 600, color: "#ff3b1d" }}
            >
              {resending ? "Sending…" : "Resend WhatsApp Code"}
            </button>
          )}
        </div>
        <Link href="/prepmeup/login">Change mobile number</Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="pmu-auth-shell">
      <Suspense fallback={<div style={{ fontSize: "0.75rem", color: "#807f78" }}>Loading verification…</div>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
