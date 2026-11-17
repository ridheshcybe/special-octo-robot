"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { UnifiedProduct } from "@/app/prepmeup/_lib/trackStore";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

interface Props {
  product: UnifiedProduct;
  initialEarlyAdopter: boolean;
}

export default function UnifiedCheckoutClient({ product, initialEarlyAdopter }: Props) {
  const router = useRouter();
  const [isEarlyAdopter, setIsEarlyAdopter] = useState<boolean>(
    initialEarlyAdopter && product.isEarlyAdopterEligible
  );
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [alreadyPurchased, setAlreadyPurchased] = useState(false);
  const [earlySeatsRemaining, setEarlySeatsRemaining] = useState<number>(0);

  useEffect(() => {
    if (product.isEarlyAdopterEligible) {
      fetch("/api/prepmeup/checkout/early-adopter")
        .then((r) => r.json())
        .then((d) => {
          if (d.ok) {
            setEarlySeatsRemaining(d.remainingSeats);
            if (d.remainingSeats <= 0) {
              setIsEarlyAdopter(false);
            }
          }
        })
        .catch(() => {});
    }

    // Dynamically inject Razorpay Standard Checkout script strictly on this checkout page.
    let scriptElement: HTMLScriptElement | null = null;
    if (typeof window !== "undefined" && !window.Razorpay) {
      scriptElement = document.createElement("script");
      scriptElement.src = "https://checkout.razorpay.com/v1/checkout.js";
      scriptElement.async = true;
      document.body.appendChild(scriptElement);
    }

    return () => {
      if (scriptElement && scriptElement.parentNode) {
        scriptElement.parentNode.removeChild(scriptElement);
      }
    };
  }, [product.isEarlyAdopterEligible]);

  const basePrice = Math.round(product.priceInPaise / 100);
  const discount = isEarlyAdopter && product.isEarlyAdopterEligible ? basePrice : 0;
  const finalPayable = Math.max(0, basePrice - discount);

  const handleCheckout = async () => {
    setLoading(true);
    setErrorMsg(null);

    try {
      // 1. Request Order Creation from Unified Checkout API
      const res = await fetch("/api/prepmeup/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productSlug: product.slug,
          claimEarlyAdopter: isEarlyAdopter && product.isEarlyAdopterEligible,
        }),
      });

      const data = await res.json();

      if (!res.ok || !data.ok) {
        if (data.alreadyPurchased) {
          setAlreadyPurchased(true);
        }
        throw new Error(data.error || "Failed to create checkout order.");
      }

      // 2. Early Adopter 100% Free Claim Path (Amount = 0)
      if (data.earlyAdopterClaimed) {
        router.push(
          `/prepmeup/checkout/success?status=claimed&product=${product.slug}&seat=${data.redemptionNumber}`
        );
        return;
      }

      // 3. Paid Razorpay Checkout Path
      if (typeof window !== "undefined" && window.Razorpay) {
        const options = {
          key: data.keyId,
          amount: data.amount,
          currency: data.currency || "INR",
          name: "PrepMeUp AI",
          description: product.name,
          order_id: data.orderId,
          theme: { color: "#ff3b1d" },
          handler: async function (response: any) {
            try {
              const verifyRes = await fetch("/api/prepmeup/checkout/verify", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  razorpayOrderId: response.razorpay_order_id || data.orderId,
                  razorpayPaymentId: response.razorpay_payment_id,
                  razorpaySignature: response.razorpay_signature,
                }),
              });
              const verifyData = await verifyRes.json();
              if (verifyRes.ok && verifyData.ok) {
                router.push(`/prepmeup/checkout/success?status=paid&product=${product.slug}`);
              } else {
                setErrorMsg(verifyData.error || "Payment verification failed.");
              }
            } catch (err: any) {
              setErrorMsg(err.message || "Network error during payment verification.");
            }
          },
        };

        const rzp = new window.Razorpay(options);
        rzp.on("payment.failed", function (response: any) {
          setErrorMsg(response.error?.description || "Payment failed at gateway.");
        });
        rzp.open();
      } else {
        // Fallback for test / SSR environments
        const mockVerify = await fetch("/api/prepmeup/checkout/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            razorpayOrderId: data.orderId,
            razorpayPaymentId: `pay_mock_${Date.now()}`,
            razorpaySignature: "mock_test_signature",
          }),
        });
        const verifyData = await mockVerify.json();
        if (mockVerify.ok && verifyData.ok) {
          router.push(`/prepmeup/checkout/success?status=paid&product=${product.slug}`);
        } else {
          setErrorMsg(verifyData.error || "Test verification failed.");
        }
      }
    } catch (err: any) {
      setErrorMsg(err.message || "An unexpected checkout error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Product Details Header */}
      <div className="pmu-card" style={{ padding: "26px 28px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span className="pmu-badge" style={{ fontSize: "11px" }}>
            {product.productType.replace("_", " ").toUpperCase()}
          </span>
          <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
            {product.durationDays} Days Entitlement
          </span>
        </div>

        <h1
          className="font-display"
          style={{
            fontSize: "clamp(26px, 4vw, 36px)",
            color: "#f3f1ea",
            textTransform: "uppercase",
            marginTop: "12px",
          }}
        >
          {product.name}
        </h1>
        <p style={{ fontSize: "14px", color: "#a19f95", marginTop: "8px", lineHeight: 1.6 }}>
          {product.description}
        </p>

        {/* Inclusions checklist */}
        <div
          style={{
            marginTop: "20px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "10px",
            fontSize: "13px",
            backgroundColor: "#0d0d10",
            padding: "16px",
            borderRadius: "8px",
            border: "1px solid #1f1f26",
          }}
        >
          {product.features.map((feat, idx) => (
            <div key={idx} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span style={{ color: "#4ade80" }}>✓</span>
              <span>{feat}</span>
            </div>
          ))}
        </div>

        {/* Early Adopter Checkbox Toggle */}
        {product.isEarlyAdopterEligible && earlySeatsRemaining > 0 && (
          <div
            style={{
              marginTop: "20px",
              padding: "14px 18px",
              borderRadius: "8px",
              border: "1px dashed rgba(74, 222, 128, 0.4)",
              backgroundColor: "rgba(74, 222, 128, 0.08)",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "12px",
            }}
          >
            <div>
              <div style={{ fontSize: "13.5px", fontWeight: 700, color: "#4ade80" }}>
                🎉 Early Adopter 100% Free Seat Available ({earlySeatsRemaining} seats left)
              </div>
              <div style={{ fontSize: "12px", color: "#a19f95", marginTop: "2px" }}>
                Claim server-side atomic scholarship to activate All-Access Pass for ₹0.
              </div>
            </div>

            <label
              style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}
            >
              <input
                type="checkbox"
                checked={isEarlyAdopter}
                onChange={(e) => setIsEarlyAdopter(e.target.checked)}
                style={{ width: "18px", height: "18px", accentColor: "#4ade80" }}
              />
              <span style={{ fontSize: "12.5px", fontWeight: 700, color: "#f3f1ea" }}>
                Apply ₹0 Claim
              </span>
            </label>
          </div>
        )}
      </div>

      {/* Order Summary & Pricing Breakdown */}
      <div className="pmu-card" style={{ padding: "26px 28px" }}>
        <h2
          className="font-display"
          style={{ fontSize: "22px", color: "#f3f1ea", textTransform: "uppercase" }}
        >
          Order Summary
        </h2>

        <div
          style={{
            marginTop: "16px",
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            fontSize: "13.5px",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
            <span>Item:</span>
            <strong style={{ color: "#f3f1ea" }}>{product.name}</strong>
          </div>

          <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
            <span>Base Price:</span>
            <span>₹{basePrice}.00</span>
          </div>

          {discount > 0 && (
            <div
              style={{ display: "flex", justifyContent: "space-between", color: "#4ade80" }}
            >
              <span>Early Adopter 100% Scholarship:</span>
              <span>- ₹{discount}.00</span>
            </div>
          )}

          <div
            style={{
              borderTop: "1px solid #26262c",
              paddingTop: "12px",
              marginTop: "4px",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "baseline",
            }}
          >
            <span style={{ fontSize: "15px", fontWeight: 700, color: "#f3f1ea" }}>
              Total Payable Amount:
            </span>
            <span
              className="font-display"
              style={{
                fontSize: "28px",
                color: finalPayable === 0 ? "#4ade80" : "#ff6a3d",
              }}
            >
              ₹{finalPayable}.00
            </span>
          </div>
        </div>

        {alreadyPurchased && (
          <div
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              borderRadius: "6px",
              backgroundColor: "rgba(59, 130, 246, 0.15)",
              border: "1px solid rgba(59, 130, 246, 0.4)",
              color: "#93c5fd",
              fontSize: "13px",
            }}
          >
            ✓ You already have an active access entitlement for this product.
          </div>
        )}

        {errorMsg && (
          <div
            role="alert"
            style={{
              marginTop: "16px",
              padding: "12px 16px",
              borderRadius: "6px",
              backgroundColor: "rgba(239, 68, 68, 0.15)",
              border: "1px solid rgba(239, 68, 68, 0.4)",
              color: "#fca5a5",
              fontSize: "13px",
            }}
          >
            ⚠️ {errorMsg}
          </div>
        )}

        {/* Checkout Button */}
        <div style={{ marginTop: "24px" }}>
          {alreadyPurchased ? (
            <Link
              href="/prepmeup/dashboard"
              className="pmu-btn-primary"
              style={{
                width: "100%",
                textAlign: "center",
                textDecoration: "none",
                display: "block",
              }}
            >
              Go to Student Dashboard →
            </Link>
          ) : (
            <button
              type="button"
              disabled={loading}
              onClick={handleCheckout}
              className="pmu-btn-primary"
              style={{ width: "100%", padding: "16px", fontSize: "15px" }}
            >
              {loading
                ? "Securing Checkout Session…"
                : finalPayable === 0
                ? "Claim 100% Free Access Now (₹0) →"
                : `Pay ₹${finalPayable} via Razorpay →`}
            </button>
          )}
        </div>

        {/* Security & Policies */}
        <div
          style={{
            marginTop: "18px",
            textAlign: "center",
            fontSize: "11.5px",
            color: "#807f78",
          }}
        >
          By proceeding, you agree to PrepMeUp AI{" "}
          <Link href="/prepmeup/terms" style={{ color: "#a19f95" }}>
            Terms
          </Link>
          ,{" "}
          <Link href="/prepmeup/privacy" style={{ color: "#a19f95" }}>
            Privacy
          </Link>
          ,{" "}
          <Link href="/prepmeup/refunds" style={{ color: "#a19f95" }}>
            Refunds
          </Link>
          , and{" "}
          <Link href="/prepmeup/pricing-policy" style={{ color: "#a19f95" }}>
            Pricing Policies
          </Link>
          .
        </div>
      </div>
    </div>
  );
}
