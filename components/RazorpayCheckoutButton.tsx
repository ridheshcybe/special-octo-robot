"use client";

import React, { useState } from "react";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export interface RazorpayCheckoutButtonProps {
  amount?: number; // In paise (e.g., 5000 = ₹50, minimum 100)
  currency?: string;
  receipt?: string;
  name?: string;
  description?: string;
  prefill?: {
    name?: string;
    email?: string;
    contact?: string;
  };
  notes?: Record<string, string>;
  buttonText?: string;
  className?: string;
  style?: React.CSSProperties;
  onSuccess?: (result: {
    orderId: string;
    paymentId: string;
    signature: string;
    verification: any;
  }) => void;
  onFailure?: (error: any) => void;
  onDismiss?: () => void;
}

/**
 * Loads the official Razorpay Standard Checkout JavaScript SDK dynamically
 */
function loadRazorpaySdk(): Promise<boolean> {
  return new Promise((resolve) => {
    if (typeof window !== "undefined" && window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export function RazorpayCheckoutButton({
  amount = 5000, // 5000 paise = ₹50.00
  currency = "INR",
  receipt,
  name = "PrepMeUp AI",
  description = "Standard Razorpay Checkout",
  prefill = {
    name: "Engineering Student",
    email: "student@prepmeup.ai",
    contact: "+919820743178",
  },
  notes = {},
  buttonText,
  className = "",
  style,
  onSuccess,
  onFailure,
  onDismiss,
}: RazorpayCheckoutButtonProps) {
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [paymentSuccess, setPaymentSuccess] = useState<boolean>(false);

  const displayPriceRupees = (amount / 100).toFixed(amount % 100 === 0 ? 0 : 2);
  const label = buttonText || `Pay ₹${displayPriceRupees} via Razorpay`;

  const handlePayment = async () => {
    setLoading(true);
    setStatusMessage("Creating order...");
    setErrorMessage(null);
    setPaymentSuccess(false);

    try {
      // 1. Ensure amount >= 100 paise
      if (!amount || amount < 100) {
        throw new Error("Minimum amount must be at least 100 paise (₹1.00).");
      }

      // 2. Call backend order creation endpoint (POST /api/create-order)
      const orderRes = await fetch("/api/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: Math.round(amount),
          currency,
          receipt: receipt || `rcpt_${Date.now()}`,
          notes,
          fullName: prefill.name,
          whatsappNumber: prefill.contact,
          email: prefill.email,
        }),
      });

      const orderData = await orderRes.json();
      if (!orderRes.ok || !orderData.ok) {
        throw new Error(orderData.error || "Failed to create Razorpay order.");
      }

      const orderId = orderData.order_id || orderData.data?.orderId;
      const keyId =
        orderData.data?.keyId ||
        process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID ||
        "rzp_test_TswgSqBhrFcu4l";

      if (!orderId) {
        throw new Error("Backend did not return an order_id.");
      }

      setStatusMessage("Loading Razorpay SDK...");

      // 3. Load Razorpay Checkout SDK
      const sdkLoaded = await loadRazorpaySdk();
      if (!sdkLoaded || !window.Razorpay) {
        throw new Error("Failed to load Razorpay checkout SDK. Check internet connection.");
      }

      // 4. Initialize Razorpay Checkout Options
      const options = {
        key: keyId,
        amount: orderData.amount || amount,
        currency: orderData.currency || currency,
        name,
        description,
        order_id: orderId,
        prefill: {
          name: prefill.name || "",
          email: prefill.email || "",
          contact: prefill.contact || "",
        },
        notes: {
          ...notes,
          source: "standard_web_checkout",
        },
        theme: {
          color: "#ff3b1d",
        },
        modal: {
          ondismiss: () => {
            setLoading(false);
            setStatusMessage(null);
            setErrorMessage("Payment was cancelled or closed by user.");
            if (onDismiss) onDismiss();
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          setStatusMessage("Verifying signature with server...");
          try {
            // 5. Send order_id, payment_id, signature to /api/verify-payment
            const verifyRes = await fetch("/api/verify-payment", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: response.razorpay_order_id,
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_signature: response.razorpay_signature,
              }),
            });

            const verifyData = await verifyRes.json();
            if (!verifyRes.ok || !verifyData.ok || !verifyData.verified) {
              throw new Error(
                verifyData.error || "Payment signature verification failed on backend."
              );
            }

            setPaymentSuccess(true);
            setStatusMessage(
              `Payment verified! ID: ${response.razorpay_payment_id.slice(-8)}`
            );
            setLoading(false);

            if (onSuccess) {
              onSuccess({
                orderId: response.razorpay_order_id,
                paymentId: response.razorpay_payment_id,
                signature: response.razorpay_signature,
                verification: verifyData,
              });
            }
          } catch (verifyErr: any) {
            setLoading(false);
            setStatusMessage(null);
            setErrorMessage(verifyErr.message || "Cryptographic verification failed.");
            if (onFailure) onFailure(verifyErr);
          }
        },
      };

      const razorpayInstance = new window.Razorpay(options);

      // Handle payment.failed event
      razorpayInstance.on("payment.failed", (resp: any) => {
        setLoading(false);
        setStatusMessage(null);
        const errDesc =
          resp?.error?.description ||
          resp?.error?.reason ||
          "Payment processing failed in gateway.";
        setErrorMessage(errDesc);
        if (onFailure) onFailure(resp?.error);
      });

      setStatusMessage("Opening Razorpay Modal...");
      razorpayInstance.open();
    } catch (err: any) {
      setLoading(false);
      setStatusMessage(null);
      setErrorMessage(err.message || "Error initiating checkout.");
      if (onFailure) onFailure(err);
    }
  };

  return (
    <div style={{ display: "inline-flex", flexDirection: "column", gap: "6px" }}>
      <button
        type="button"
        onClick={handlePayment}
        disabled={loading}
        className={className || "pmu-btn-primary"}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "8px",
          opacity: loading ? 0.7 : 1,
          cursor: loading ? "wait" : "pointer",
          ...style,
        }}
      >
        {loading ? (
          <>
            <span
              style={{
                display: "inline-block",
                width: "14px",
                height: "14px",
                border: "2px solid #ffffff",
                borderTopColor: "transparent",
                borderRadius: "50%",
                animation: "spin 0.8s linear infinite",
              }}
            />
            <span>{statusMessage || "Processing..."}</span>
          </>
        ) : paymentSuccess ? (
          <>
            <span style={{ color: "#4ade80", fontWeight: "bold" }}>✓</span>
            <span>Paid Successfully</span>
          </>
        ) : (
          <span>{label}</span>
        )}
      </button>

      {/* Inline Feedback Notification */}
      {statusMessage && loading && (
        <span
          className="font-mono"
          style={{ fontSize: "11px", color: "#a19f95", textAlign: "center" }}
        >
          {statusMessage}
        </span>
      )}

      {errorMessage && (
        <span
          className="font-mono"
          style={{
            fontSize: "11px",
            color: "#f87171",
            backgroundColor: "rgba(239,68,68,0.1)",
            border: "1px solid rgba(239,68,68,0.25)",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          ✕ {errorMessage}
        </span>
      )}

      {paymentSuccess && (
        <span
          className="font-mono"
          style={{
            fontSize: "11px",
            color: "#4ade80",
            backgroundColor: "rgba(34,197,94,0.1)",
            border: "1px solid rgba(34,197,94,0.25)",
            padding: "4px 8px",
            borderRadius: "4px",
          }}
        >
          ✓ Payment verified &amp; confirmed!
        </span>
      )}
    </div>
  );
}
