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

  const [target, setTarget] = useState("");
  const [targetType, setTargetType] = useState<"email" | "phone">("email");
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [cooldown, setCooldown] = useState(60);
  const [devMockHint, setDevMockHint] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem("pmu_target") || sessionStorage.getItem("pmu_phone") || "";
      if (stored) {
        setTarget(stored);
        const isEmail = stored.includes("@") || sessionStorage.getItem("pmu_target_type") === "email";
        setTargetType(isEmail ? "email" : "phone");
      }
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
        body: JSON.stringify({
          target,
          identifier: target,
          email: target.includes("@") ? target : undefined,
          phone: !target.includes("@") ? target : undefined,
          code,
        }),
      });

      const data = await res.json();
      if (!res.ok || !data.ok) {
        setError(data.error || "Incorrect verification code. Please try again.");
        setLoading(false);
        return;
      }

      setSuccess("Verification successful. Redirecting to student dashboard…");

      if (typeof window !== "undefined") {
        sessionStorage.removeItem("pmu_mock_otp");
      }

      setTimeout(() => {
        window.location.href = data.redirectTo || redirectTo || "/prepmeup/dashboard";
      }, 500);
    } catch {
      setError("Network error. Please try again.");
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || resending || !target) return;
    setResending(true);
    setError(null);

    try {
      const res = await fetch("/api/prepmeup/auth/send-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          target,
          identifier: target,
          email: target.includes("@") ? target : undefined,
          phone: !target.includes("@") ? target : undefined,
        }),
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
      setSuccess(`New verification code sent to ${target}.`);
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
          Enter 6-digit code
        </h1>
        <p style={{ marginTop: "0.375rem", fontSize: "0.8125rem", color: "#6F6B62" }}>
          {targetType === "email" ? "We sent a verification code to:" : "We sent a verification code to:"}{" "}
          <span style={{ fontWeight: 600, color: "#1C1A17" }}>{target || "your account"}</span>
        </p>

        {devMockHint && (
          <div
            style={{
              marginTop: "0.75rem",
              borderRadius: "6px",
              border: "1px solid #E8E4DB",
              backgroundColor: "#F4F2ED",
              padding: "0.5rem",
              fontSize: "0.75rem",
              color: "#1C1A17",
            }}
          >
            Local Dev Mock OTP: <strong>{devMockHint}</strong>
          </div>
        )}
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ marginTop: "1.5rem", display: "flex", flexDirection: "column", gap: "1.25rem" }}
      >
        <div>
          <label
            htmlFor="otp"
            style={{
              display: "block",
              textAlign: "center",
              fontSize: "0.75rem",
              fontWeight: 600,
              color: "#1C1A17",
              marginBottom: "0.375rem",
            }}
          >
            Verification code
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
              paddingTop: "0.75rem",
              paddingBottom: "0.75rem",
              textAlign: "center",
              fontFamily: "monospace",
              fontSize: "1.5rem",
              letterSpacing: "0.3em",
            }}
            autoFocus
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

        {success && (
          <div
            style={{
              borderRadius: "6px",
              border: "1px solid #E8E4DB",
              backgroundColor: "#F4F2ED",
              padding: "0.75rem",
              fontSize: "0.75rem",
              color: "#1F7A4D",
            }}
          >
            {success}
          </div>
        )}

        <button
          type="submit"
          disabled={loading || code.length !== 6}
          className="pmu-btn-primary"
          style={{ width: "100%", justifyContent: "center" }}
        >
          {loading ? "Verifying code…" : "Verify & continue"}
        </button>
      </form>

      <div
        style={{
          marginTop: "1.5rem",
          paddingTop: "1rem",
          borderTop: "1px solid #E8E4DB",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "0.5rem",
          fontSize: "0.75rem",
          color: "#6F6B62",
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
              style={{ fontWeight: 600, color: "#C2331B", background: "none", border: "none", cursor: "pointer" }}
            >
              {resending ? "Sending…" : "Resend Code"}
            </button>
          )}
        </div>
        <Link href="/prepmeup/login" style={{ color: "#6F6B62", textDecoration: "none" }}>
          Change email or mobile
        </Link>
      </div>
    </div>
  );
}

export default function VerifyOtpPage() {
  return (
    <div className="pmu-auth-shell">
      <Suspense fallback={<div style={{ fontSize: "0.75rem", color: "#6F6B62" }}>Loading verification…</div>}>
        <VerifyOtpForm />
      </Suspense>
    </div>
  );
}
