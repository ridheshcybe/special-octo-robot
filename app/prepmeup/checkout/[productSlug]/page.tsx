"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { useParams, useRouter } from "next/navigation";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface Product {
  slug: string;
  name: string;
  description: string;
  productType: "semester_pass" | "mentorship_pack" | "all_access_pass";
  priceInPaise: number;
  priceRupees: number;
  earlyAdopterPriceInPaise?: number;
  durationDays: number;
  durationLabel: string;
  includedCourseSlugs: string[];
  includedTrackSlugs: string[];
  isEarlyAdopterEligible: boolean;
  mentorshipSessionsIncluded: number;
  features: string[];
  owned: boolean;
}

interface CheckoutResponse {
  ok: boolean;
  products: Product[];
  signedIn: boolean;
  earlyAdopter: {
    remainingSeats: number;
    isAvailable: boolean;
    alreadyClaimed: boolean;
    limit: number;
  };
}

type CheckoutState =
  | { kind: "idle" }
  | { kind: "creating" }
  | { kind: "pending"; message: string }
  | { kind: "verifying" }
  | { kind: "failed"; message: string }
  | { kind: "already"; message: string };

const ACCENT = "#ff3b1d";
const ACCENT_2 = "#ff6a3d";
const MUTED = "#807f78";

function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

export default function UnifiedCheckoutPage() {
  const params = useParams<{ productSlug: string }>();
  const router = useRouter();
  const productSlug = params?.productSlug || "";

  const [data, setData] = useState<CheckoutResponse | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState<CheckoutState>({ kind: "idle" });

  useEffect(() => {
    fetch("/api/prepmeup/checkout", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!json?.ok) throw new Error(json?.error || "Could not load checkout.");
        setData(json);
      })
      .catch((err) => setLoadError(err?.message || "Could not load checkout."))
      .finally(() => setLoading(false));
  }, []);

  const product = useMemo(
    () => data?.products.find((p) => p.slug === productSlug) || null,
    [data, productSlug]
  );

  const earlyApplied = Boolean(
    product?.isEarlyAdopterEligible &&
      data?.earlyAdopter &&
      (data.earlyAdopter.isAvailable || data.earlyAdopter.alreadyClaimed)
  );
  const payablePaise = earlyApplied ? 0 : product?.priceInPaise || 0;

  const verifyPayment = useCallback(
    async (razorpayOrderId: string, razorpayPaymentId: string, razorpaySignature?: string) => {
      setState({ kind: "verifying" });
      try {
        const res = await fetch("/api/prepmeup/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ razorpayOrderId, razorpayPaymentId, razorpaySignature }),
        });
        const json = await res.json();
        if (!res.ok || !json?.ok || !json?.verified) {
          setState({
            kind: "failed",
            message: json?.error || "Payment could not be verified. You have not been charged access.",
          });
          return;
        }
        router.push(
          `/prepmeup/checkout/success?product=${encodeURIComponent(
            productSlug
          )}&order=${encodeURIComponent(razorpayOrderId)}`
        );
      } catch (err: any) {
        setState({
          kind: "failed",
          message: err?.message || "Payment verification failed. Please contact support.",
        });
      }
    },
    [productSlug, router]
  );

  const handleCheckout = useCallback(async () => {
    if (!product) return;
    setState({ kind: "creating" });

    try {
      const res = await fetch("/api/prepmeup/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ productSlug: product.slug, claimEarlyAdopter: true }),
      });
      const json = await res.json();

      if (!res.ok || !json?.ok) {
        if (json?.alreadyPurchased) {
          setState({
            kind: "already",
            message: json?.error || "You already have active access to this product.",
          });
        } else {
          setState({
            kind: "failed",
            message: json?.error || "Could not start checkout. Please try again.",
          });
        }
        return;
      }

      if (json.freeAccess) {
        router.push(
          `/prepmeup/checkout/success?product=${encodeURIComponent(
            product.slug
          )}&order=${encodeURIComponent(json.orderId || "")}&free=1`
        );
        return;
      }

      if (json.keyId && json.isLiveRazorpay && typeof window !== "undefined" && window.Razorpay) {
        const rzp = new window.Razorpay({
          key: json.keyId,
          amount: json.amount,
          currency: json.currency || "INR",
          name: "PrepMeUp AI",
          description: json.productName || product.name,
          order_id: json.orderId,
          theme: { color: ACCENT },
          handler: (response: any) => {
            verifyPayment(
              response.razorpay_order_id || json.orderId,
              response.razorpay_payment_id,
              response.razorpay_signature
            );
          },
          modal: {
            ondismiss: () =>
              setState({
                kind: "pending",
                message: "Payment window closed. Your order is still pending — you can retry.",
              }),
          },
        });
        rzp.open();
        return;
      }

      // Local / sandbox mode: no gateway keys configured, order was created in
      // test sandbox. The server verifies a mock payment in non-production only.
      await verifyPayment(json.orderId, `pay_mock_${Date.now()}`);
    } catch (err: any) {
      setState({
        kind: "failed",
        message: err?.message || "Could not start checkout. Please try again.",
      });
    }
  }, [product, router, verifyPayment]);

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#08080a", color: "#f3f1ea", padding: "80px 20px" }}>
        <p style={{ textAlign: "center", color: MUTED }}>Loading checkout…</p>
      </main>
    );
  }

  if (loadError || !product) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#08080a", color: "#f3f1ea", padding: "80px 20px" }}>
        <div style={{ maxWidth: "560px", margin: "0 auto", textAlign: "center" }}>
          <h1 className="font-display" style={{ fontSize: "32px", textTransform: "uppercase" }}>
            Plan not found
          </h1>
          <p style={{ color: MUTED, marginTop: "10px" }}>
            {loadError || "This product is not available. Pick a plan from the pricing page."}
          </p>
          <Link
            href="/prepmeup/pricing"
            className="pmu-btn-primary"
            style={{ marginTop: "22px", textDecoration: "none" }}
          >
            Back to pricing →
          </Link>
        </div>
      </main>
    );
  }

  const busy = state.kind === "creating" || state.kind === "verifying";

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        padding: "48px 20px 80px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />

      <div style={{ maxWidth: "980px", margin: "0 auto" }}>
        <div style={{ marginBottom: "28px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: MUTED,
              fontFamily: "monospace",
            }}
          >
            <Link href="/prepmeup" style={{ color: MUTED, textDecoration: "none" }}>
              PrepMeUp
            </Link>
            <span>/</span>
            <Link href="/prepmeup/pricing" style={{ color: MUTED, textDecoration: "none" }}>
              Pricing
            </Link>
            <span>/</span>
            <span style={{ color: ACCENT_2 }}>Checkout</span>
          </div>
        </div>

        <div className="pmu-grid-2" style={{ alignItems: "start", gap: "24px" }}>
          <div>
            <span className="pmu-badge">Secure Checkout</span>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(30px, 4.5vw, 44px)",
                textTransform: "uppercase",
                marginTop: "12px",
                lineHeight: 1,
              }}
            >
              {product.name}
            </h1>
            <p style={{ color: "#a19f95", fontSize: "14px", marginTop: "10px", lineHeight: 1.6 }}>
              {product.description}
            </p>

            <div
              style={{
                marginTop: "22px",
                padding: "18px 20px",
                backgroundColor: "#111114",
                border: "1px solid rgba(243, 241, 234, 0.1)",
                borderRadius: "0.75rem",
              }}
            >
              <div style={{ fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                What&apos;s included
              </div>
              <ul
                style={{
                  listStyle: "none",
                  padding: 0,
                  margin: "12px 0 0",
                  display: "grid",
                  gap: "8px",
                  fontSize: "13px",
                  color: "#d6d2c8",
                }}
              >
                {product.features.map((feature) => (
                  <li key={feature} style={{ display: "flex", gap: "8px" }}>
                    <span style={{ color: "#4ade80" }}>✓</span>
                    <span>{feature}</span>
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
                  fontSize: "12.5px",
                  color: MUTED,
                }}
              >
                <span>Access duration</span>
                <span style={{ color: "#f3f1ea" }}>{product.durationLabel}</span>
              </div>
              {product.mentorshipSessionsIncluded > 0 && (
                <div
                  style={{
                    marginTop: "8px",
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "12.5px",
                    color: MUTED,
                  }}
                >
                  <span>Mentorship sessions</span>
                  <span style={{ color: "#f3f1ea" }}>
                    {product.mentorshipSessionsIncluded} included
                  </span>
                </div>
              )}
            </div>
          </div>

          <div className="pmu-card-highlight" style={{ padding: "26px 24px", gap: "18px" }}>
            <div>
              <div style={{ fontSize: "11px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
                Order summary
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", marginTop: "16px", fontSize: "14px" }}>
                <span style={{ color: "#c9c6bd" }}>{product.name}</span>
                <span
                  style={{
                    color: earlyApplied ? MUTED : "#f3f1ea",
                    textDecoration: earlyApplied ? "line-through" : "none",
                  }}
                >
                  {rupees(product.priceRupees)}
                </span>
              </div>

              {earlyApplied && (
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginTop: "8px",
                    fontSize: "13px",
                    color: "#4ade80",
                  }}
                >
                  <span>Early Adopter discount</span>
                  <span>−{rupees(product.priceRupees)}</span>
                </div>
              )}

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "baseline",
                  marginTop: "16px",
                  paddingTop: "14px",
                  borderTop: "1px solid rgba(243, 241, 234, 0.1)",
                }}
              >
                <span style={{ fontSize: "12px", color: MUTED, textTransform: "uppercase" }}>
                  Final payable
                </span>
                <span className="font-display" style={{ fontSize: "34px" }}>
                  {rupees(Math.round(payablePaise / 100))}
                </span>
              </div>

              {earlyApplied && (
                <p style={{ fontSize: "11.5px", color: ACCENT_2, marginTop: "6px" }}>
                  {data?.earlyAdopter.alreadyClaimed
                    ? "Your Early Adopter seat is already claimed — this pass is free."
                    : `${data?.earlyAdopter.remainingSeats} Early Adopter seats remaining.`}
                </p>
              )}
            </div>

            {state.kind === "already" && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "0.5rem",
                  backgroundColor: "rgba(74, 222, 128, 0.08)",
                  border: "1px solid rgba(74, 222, 128, 0.35)",
                  fontSize: "12.5px",
                  color: "#4ade80",
                }}
              >
                {state.message}
                <div style={{ marginTop: "8px" }}>
                  <Link href="/prepmeup/dashboard" style={{ color: "#4ade80" }}>
                    Go to your dashboard →
                  </Link>
                </div>
              </div>
            )}

            {(state.kind === "failed" || state.kind === "pending") && (
              <div
                style={{
                  padding: "12px 14px",
                  borderRadius: "0.5rem",
                  backgroundColor:
                    state.kind === "failed" ? "rgba(248, 113, 113, 0.08)" : "rgba(255, 176, 32, 0.08)",
                  border: `1px solid ${
                    state.kind === "failed" ? "rgba(248, 113, 113, 0.4)" : "rgba(255, 176, 32, 0.35)"
                  }`,
                  fontSize: "12.5px",
                  color: state.kind === "failed" ? "#f87171" : "#ffb020",
                }}
              >
                {state.message}
              </div>
            )}

            {!data?.signedIn ? (
              <Link
                href={`/prepmeup/login?redirectTo=${encodeURIComponent(
                  `/prepmeup/checkout/${product.slug}`
                )}`}
                className="pmu-btn-primary"
                style={{ textDecoration: "none", width: "100%" }}
              >
                Sign in to continue →
              </Link>
            ) : product.owned ? (
              <div>
                <div
                  style={{
                    padding: "12px 14px",
                    borderRadius: "0.5rem",
                    backgroundColor: "rgba(74, 222, 128, 0.08)",
                    border: "1px solid rgba(74, 222, 128, 0.35)",
                    fontSize: "12.5px",
                    color: "#4ade80",
                    marginBottom: "10px",
                  }}
                >
                  You already have active access to this plan.
                </div>
                <Link
                  href="/prepmeup/dashboard"
                  className="pmu-btn-secondary"
                  style={{ textDecoration: "none", width: "100%" }}
                >
                  Go to dashboard →
                </Link>
              </div>
            ) : (
              <button
                type="button"
                className="pmu-btn-primary"
                onClick={handleCheckout}
                disabled={busy}
                style={{ width: "100%" }}
              >
                {state.kind === "creating"
                  ? "Creating order…"
                  : state.kind === "verifying"
                  ? "Verifying payment…"
                  : payablePaise === 0
                  ? "Claim free access →"
                  : `Pay ${rupees(Math.round(payablePaise / 100))} securely →`}
              </button>
            )}

            <div style={{ fontSize: "11px", color: MUTED, lineHeight: 1.6 }}>
              Payments are processed by Razorpay. Access activates after server-side signature
              verification or the Razorpay webhook, whichever arrives first.
            </div>

            <div
              style={{
                display: "flex",
                gap: "12px",
                flexWrap: "wrap",
                fontSize: "11px",
                color: MUTED,
                paddingTop: "10px",
                borderTop: "1px solid rgba(243, 241, 234, 0.08)",
              }}
            >
              <Link href="/prepmeup/terms" style={{ color: MUTED }}>
                Terms
              </Link>
              <Link href="/prepmeup/privacy" style={{ color: MUTED }}>
                Privacy
              </Link>
              <Link href="/prepmeup/refunds" style={{ color: MUTED }}>
                Refunds
              </Link>
              <Link href="/prepmeup/pricing-policy" style={{ color: MUTED }}>
                Pricing policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
