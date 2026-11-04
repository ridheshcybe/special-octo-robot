"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

interface Product {
  slug: string;
  name: string;
  productType: "semester_pass" | "mentorship_pack" | "all_access_pass";
  priceRupees: number;
  durationLabel: string;
  includedCourseSlugs: string[];
  mentorshipSessionsIncluded: number;
}

interface AccessSummary {
  hasBtechAccess: boolean;
  hasQuantumAccess: boolean;
  hasCyberSecurityAccess: boolean;
  hasAllAccess: boolean;
  accessibleCourseSlugs: string[];
  activeEntitlements: number;
  nextExpiry?: string;
  availableMentorshipSessions: number;
  hasActivePass: boolean;
}

interface PricingResponse {
  ok: boolean;
  products: Product[];
  access: AccessSummary | null;
}

const ACCENT_2 = "#ff6a3d";
const MUTED = "#807f78";

const COURSE_LABELS: Record<string, string> = {
  "btech-cse-aiml-semester-1": "B.Tech CSE AI/ML Semester 1",
  "quantum-computing-foundations": "Quantum Computing Foundations",
  "cybersecurity-foundations": "CyberSecurity Foundations",
};

function formatDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const productSlug = searchParams.get("product") || "";
  const orderId = searchParams.get("order") || "";
  const wasFree = searchParams.get("free") === "1";

  const [data, setData] = useState<PricingResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prepmeup/checkout", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (json?.ok) setData(json);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const product = useMemo(
    () => data?.products.find((p) => p.slug === productSlug) || null,
    [data, productSlug]
  );
  const access = data?.access;

  const mentorshipHref = product?.productType === "mentorship_pack" || (product?.mentorshipSessionsIncluded || 0) > 0
    ? "/prepmeup/mentorship"
    : null;

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        padding: "64px 20px 80px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div style={{ maxWidth: "860px", margin: "0 auto" }}>
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "50%",
              backgroundColor: "rgba(74, 222, 128, 0.1)",
              border: "1px solid rgba(74, 222, 128, 0.4)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto",
              fontSize: "28px",
            }}
          >
            ✓
          </div>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(30px, 5vw, 46px)",
              textTransform: "uppercase",
              marginTop: "16px",
              lineHeight: 1,
            }}
          >
            {wasFree ? "Free access activated" : "Payment successful"}
          </h1>
          <p style={{ color: "#a19f95", fontSize: "14.5px", marginTop: "10px" }}>
            {loading
              ? "Confirming your access…"
              : product
              ? `${product.name} is active on your PrepMeUp account.`
              : "Your purchase is confirmed. Open your dashboard to see active access."}
          </p>
          {orderId && (
            <p className="font-mono" style={{ fontSize: "11px", color: MUTED, marginTop: "8px" }}>
              Order reference: {orderId}
            </p>
          )}
        </div>

        <div
          style={{
            marginTop: "32px",
            padding: "22px 24px",
            backgroundColor: "#111114",
            border: "1px solid rgba(243, 241, 234, 0.1)",
            borderRadius: "0.75rem",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Purchased product
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", gap: "12px", marginTop: "10px", flexWrap: "wrap" }}>
            <div>
              <div className="font-display" style={{ fontSize: "24px", textTransform: "uppercase" }}>
                {product?.name || productSlug || "PrepMeUp purchase"}
              </div>
              {product && (
                <div style={{ fontSize: "12.5px", color: MUTED, marginTop: "4px" }}>
                  Access duration: {product.durationLabel}
                  {product.mentorshipSessionsIncluded > 0
                    ? ` • ${product.mentorshipSessionsIncluded} mentorship session included`
                    : ""}
                </div>
              )}
            </div>
            {product && (
              <div className="font-display" style={{ fontSize: "28px", color: "#4ade80" }}>
                {wasFree ? "₹0" : `₹${product.priceRupees.toLocaleString("en-IN")}`}
              </div>
            )}
          </div>
        </div>

        <div
          style={{
            marginTop: "18px",
            padding: "22px 24px",
            backgroundColor: "#111114",
            border: "1px solid rgba(243, 241, 234, 0.1)",
            borderRadius: "0.75rem",
          }}
        >
          <div
            style={{
              fontSize: "11px",
              color: MUTED,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Active access
          </div>

          {loading && <p style={{ color: MUTED, fontSize: "13px", marginTop: "10px" }}>Loading…</p>}

          {!loading && access && access.hasActivePass ? (
            <>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "12px 0 0",
                  display: "grid",
                  gap: "8px",
                  fontSize: "13.5px",
                }}
              >
                {access.accessibleCourseSlugs.map((slug) => (
                  <li key={slug} style={{ display: "flex", gap: "8px", alignItems: "center" }}>
                    <span style={{ color: "#4ade80" }}>✓</span>
                    <span>{COURSE_LABELS[slug] || slug}</span>
                  </li>
                ))}
              </ul>
              <div
                style={{
                  marginTop: "14px",
                  paddingTop: "12px",
                  borderTop: "1px solid rgba(243, 241, 234, 0.08)",
                  display: "flex",
                  justifyContent: "space-between",
                  gap: "12px",
                  fontSize: "12.5px",
                  color: MUTED,
                  flexWrap: "wrap",
                }}
              >
                <span>Valid until {formatDate(access.nextExpiry)}</span>
                <span>
                  Mentorship credits: {access.availableMentorshipSessions}
                </span>
              </div>
            </>
          ) : (
            !loading && (
              <p style={{ color: MUTED, fontSize: "13px", marginTop: "10px" }}>
                Access is activated by the Razorpay webhook. If this page still shows no access,
                refresh in a few seconds — no action is needed and you were not double charged.
              </p>
            )
          )}
        </div>

        <div
          style={{
            marginTop: "24px",
            display: "flex",
            gap: "12px",
            flexWrap: "wrap",
            justifyContent: "center",
          }}
        >
          <Link href="/prepmeup/dashboard" className="pmu-btn-primary" style={{ textDecoration: "none" }}>
            Open dashboard →
          </Link>
          <Link href="/prepmeup/tracks" className="pmu-btn-secondary" style={{ textDecoration: "none" }}>
            Browse tracks
          </Link>
          {mentorshipHref && (
            <Link href={mentorshipHref} className="pmu-btn-secondary" style={{ textDecoration: "none" }}>
              Book mentorship
            </Link>
          )}
          <Link href="/prepmeup/certificates" className="pmu-btn-secondary" style={{ textDecoration: "none" }}>
            Certificates
          </Link>
        </div>

        <div style={{ marginTop: "28px", fontSize: "11.5px", color: MUTED, textAlign: "center" }}>
          Need help with this order?{" "}
          <Link href="/prepmeup/contact" style={{ color: ACCENT_2 }}>
            Contact support
          </Link>{" "}
          and include your order reference.
        </div>
      </div>
    </main>
  );
}
