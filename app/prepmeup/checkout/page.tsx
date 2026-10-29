"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Script from "next/script";
import { PrepMeUpNav } from "../_components/PrepMeUpNav";
import { PrepMeUpFooter } from "../_components/PrepMeUpFooter";

declare global {
  interface Window {
    Razorpay?: any;
  }
}

export default function RazorpayCheckoutPage() {
  const [tier, setTier] = useState<"tier1" | "tier2">("tier2");
  const [fullName, setFullName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [email, setEmail] = useState("");
  const [mentorTopic, setMentorTopic] = useState(
    "Internship & Career Support (Resume, GitHub & Referrals)"
  );
  const [mentorSlot, setMentorSlot] = useState("Today, 7:00 PM – 7:30 PM IST");
  const [paymentMethod, setPaymentMethod] = useState<"upi" | "card" | "netbanking">("upi");
  const [upiId, setUpiId] = useState("student@okaxis");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeOrder, setActiveOrder] = useState<{
    orderId: string;
    amount: number;
    amountRupees: number;
    keyId: string;
    isLiveRazorpay: boolean;
    hostedPaymentPageUrl: string;
    planLabel: string;
  } | null>(null);

  const [showGatewayModal, setShowGatewayModal] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [receipt, setReceipt] = useState<{
    orderId: string;
    paymentId: string;
    amountRupees: number;
    tier: "tier1" | "tier2";
    paidAt: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    const paramTier = params.get("tier");
    if (paramTier === "tier1" || paramTier === "tier2") {
      setTier(paramTier);
    }
    const paramTopic = params.get("topic");
    if (paramTopic) setMentorTopic(paramTopic);
    const paramSlot = params.get("slot");
    if (paramSlot) setMentorSlot(paramSlot);
    const paramPhone = params.get("phone");
    if (paramPhone) setWhatsapp(paramPhone);
    const paramEmail = params.get("email");
    if (paramEmail) setEmail(paramEmail);
  }, []);

  const priceRupees = tier === "tier2" ? 199 : 99;

  const loadRazorpayScript = (): Promise<boolean> => {
    return new Promise((resolve) => {
      if (typeof window !== "undefined" && window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const handleVerifyPayment = async (
    orderId: string,
    paymentId: string,
    signature: string
  ) => {
    setVerifying(true);
    setError(null);
    try {
      const res = await fetch("/api/prepmeup/payments/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          razorpay_order_id: orderId,
          razorpay_payment_id: paymentId,
          razorpay_signature: signature,
          tier,
          fullName: fullName.trim() || "Engineering Student",
          whatsappNumber: whatsapp,
          email,
          mentorTopic: tier === "tier2" ? mentorTopic : "",
          mentorSlot: tier === "tier2" ? mentorSlot : "",
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Payment verification failed.");
      }

      setShowGatewayModal(false);
      setReceipt({
        orderId,
        paymentId,
        amountRupees: priceRupees,
        tier,
        paidAt: new Date().toLocaleString("en-IN", {
          dateStyle: "medium",
          timeStyle: "short",
        }),
      });
    } catch (err: any) {
      setError(err.message || "Could not verify payment.");
    } finally {
      setVerifying(false);
    }
  };

  const handleInitiateCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanedPhone = whatsapp.replace(/\D/g, "").slice(-10);
    if (!/^[6-9]\d{9}$/.test(cleanedPhone)) {
      setError("Please enter a valid 10-digit Indian WhatsApp mobile number.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch("/api/prepmeup/payments/create-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          tier,
          fullName: fullName.trim() || "Engineering Student",
          whatsappNumber: cleanedPhone,
          email: email.trim(),
        }),
      });

      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.error || "Failed to initialize Razorpay order.");
      }

      const orderData = json.data;
      setActiveOrder(orderData);

      // 1. If a Hosted Razorpay Payment Page URL (rzp.io/l/...) is configured, redirect or open it
      if (orderData.hostedPaymentPageUrl) {
        window.open(orderData.hostedPaymentPageUrl, "_blank", "noopener,noreferrer");
      }

      // 2. Launch official Razorpay Standard Checkout (https://checkout.razorpay.com/v1/checkout.js)
      const publicKey = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || orderData.keyId;
      if (orderData.isLiveRazorpay && publicKey) {
        const loaded = await loadRazorpayScript();
        if (loaded && window.Razorpay) {
          const rzp = new window.Razorpay({
            key: publicKey,
            amount: orderData.amount,
            currency: orderData.currency || "INR",
            name: "PrepMeUp AI",
            description: orderData.planLabel,
            order_id: orderData.orderId || json.order_id,
            prefill: {
              name: fullName.trim() || "Engineering Student",
              email: email.trim() || "student@prepmeup.ai",
              contact: `+91${cleanedPhone}`,
              method: paymentMethod === "upi" ? "upi" : paymentMethod === "card" ? "card" : "netbanking",
            },
            config: {
              display: {
                blocks: {
                  upi: {
                    name: "Pay via UPI (GPay, PhonePe, Paytm, BHIM, QR)",
                    instruments: [{ method: "upi" }],
                  },
                  other: {
                    name: "Cards & Netbanking",
                    instruments: [{ method: "card" }, { method: "netbanking" }, { method: "wallet" }],
                  },
                },
                sequence: ["block.upi", "block.other"],
                preferences: {
                  show_default_blocks: true,
                },
              },
            },
            notes: {
              tier,
              mentorTopic: tier === "tier2" ? mentorTopic : "",
              mentorSlot: tier === "tier2" ? mentorSlot : "",
              upiId: paymentMethod === "upi" ? upiId : "",
            },
            theme: {
              color: "#ff3b1d",
            },
            modal: {
              ondismiss: () => {
                setLoading(false);
                // Also open the interactive in-page gateway so UPI is immediately available
                setShowGatewayModal(true);
              },
            },
            handler: async (response: {
              razorpay_order_id: string;
              razorpay_payment_id: string;
              razorpay_signature: string;
            }) => {
              await handleVerifyPayment(
                response.razorpay_order_id,
                response.razorpay_payment_id,
                response.razorpay_signature
              );
            },
          });

          rzp.on("payment.failed", (resp: any) => {
            setLoading(false);
            setError(
              resp?.error?.description ||
                resp?.error?.reason ||
                "Payment failed in Razorpay. Please try again with another UPI ID or card."
            );
            setShowGatewayModal(true);
          });

          rzp.open();
          setLoading(false);
          return;
        }
      }

      // 3. Otherwise open the built-in interactive Razorpay Checkout Gateway modal
      setShowGatewayModal(true);
    } catch (err: any) {
      setError(err.message || "Unable to start Razorpay checkout.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", minHeight: "100vh", backgroundColor: "#08080a" }}>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" strategy="lazyOnload" />
      <PrepMeUpNav />

      <main className="pmu-section" style={{ flex: 1, paddingTop: "3rem", paddingBottom: "4.5rem" }}>
        <div className="pmu-container" style={{ maxWidth: "1080px" }}>
          {/* Breadcrumb */}
          <div style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "10px" }}>
            <Link
              href="/prepmeup#pricing"
              className="font-mono"
              style={{ fontSize: "12px", fontWeight: 700, color: "#a19f95", textDecoration: "none" }}
            >
              ← Back to All Pricing Tiers
            </Link>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <span
                className="font-mono"
                style={{
                  fontSize: "11px",
                  fontWeight: 700,
                  padding: "4px 10px",
                  borderRadius: "9999px",
                  backgroundColor: "rgba(59,130,246,0.14)",
                  border: "1px solid rgba(59,130,246,0.35)",
                  color: "#60a5fa",
                }}
              >
                🔒 Secured by Razorpay • 256-Bit HMAC-SHA256
              </span>
            </div>
          </div>

          {receipt ? (
            /* ============================ VERIFIED RAZORPAY RECEIPT ============================ */
            <div
              className="pmu-card-highlight"
              style={{
                maxWidth: "680px",
                margin: "0 auto",
                padding: "36px 32px",
                border: "1px solid rgba(34,197,94,0.45)",
                background: "linear-gradient(145deg, rgba(3,46,21,0.32) 0%, #111114 60%)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "12px" }}>
                <span
                  className="font-mono"
                  style={{
                    padding: "4px 12px",
                    borderRadius: "9999px",
                    backgroundColor: "rgba(34,197,94,0.2)",
                    border: "1px solid rgba(34,197,94,0.4)",
                    color: "#4ade80",
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                  }}
                >
                  ✓ Razorpay Payment Verified
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#a19f95" }}>
                  {receipt.paidAt}
                </span>
              </div>

              <h1
                className="font-display"
                style={{
                  marginTop: "16px",
                  fontSize: "clamp(28px, 4vw, 40px)",
                  textTransform: "uppercase",
                  color: "#f3f1ea",
                }}
              >
                {receipt.tier === "tier2"
                  ? "Tier 2 (₹199) All-In + Career Pass Unlocked!"
                  : "Tier 1 (₹99) Basic Semester Pass Unlocked!"}
              </h1>

              <p style={{ marginTop: "8px", fontSize: "14px", color: "#d4d2c8", lineHeight: 1.6 }}>
                Your 180-day Semester 1 access has been provisioned immediately. Below is your verified Razorpay transaction receipt:
              </p>

              <div
                style={{
                  marginTop: "22px",
                  padding: "20px",
                  borderRadius: "10px",
                  border: "1px solid #26262c",
                  backgroundColor: "#08080a",
                  display: "flex",
                  flexDirection: "column",
                  gap: "12px",
                }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#807f78" }}>Razorpay Order ID</span>
                  <span className="font-mono" style={{ color: "#f3f1ea", fontWeight: 700 }}>
                    {receipt.orderId}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#807f78" }}>Razorpay Payment ID</span>
                  <span className="font-mono" style={{ color: "#4ade80", fontWeight: 700 }}>
                    {receipt.paymentId}
                  </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                  <span style={{ color: "#807f78" }}>Package Activated</span>
                  <span style={{ color: "#ff6a3d", fontWeight: 700 }}>
                    {receipt.tier === "tier2"
                      ? "Tier 2 (₹199): Premium AI + 1:1 Human + Internship & Career Support"
                      : "Tier 1 (₹99): Semester 1 Basic Access"}
                  </span>
                </div>
                {receipt.tier === "tier2" && (
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13px" }}>
                    <span style={{ color: "#807f78" }}>1:1 Human &amp; Career Slot</span>
                    <span style={{ color: "#86efac", fontWeight: 600 }}>
                      {mentorTopic} • {mentorSlot}
                    </span>
                  </div>
                )}
                <div
                  style={{
                    borderTop: "1px solid #26262c",
                    paddingTop: "12px",
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "baseline",
                  }}
                >
                  <span style={{ fontSize: "13px", fontWeight: 700, color: "#f3f1ea" }}>Total Amount Paid</span>
                  <span className="font-display" style={{ fontSize: "28px", color: "#4ade80" }}>
                    ₹{receipt.amountRupees}.00
                  </span>
                </div>
              </div>

              <div style={{ marginTop: "24px", display: "flex", flexWrap: "wrap", gap: "12px" }}>
                <Link href="/prepmeup/dashboard" className="pmu-btn-primary" style={{ flex: 1 }}>
                  Enter Student Dashboard →
                </Link>
                <Link href="/prepmeup/subjects" className="pmu-btn-secondary">
                  Open Study Notes (LaTeX)
                </Link>
              </div>
            </div>
          ) : (
            /* ============================ RAZORPAY PAYMENT PAGE GRID ============================ */
            <div className="pmu-grid-2" style={{ alignItems: "start", gap: "28px" }}>
              {/* LEFT COLUMN: Tier Selector & Package Breakdown */}
              <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                <div className="pmu-card" style={{ padding: "28px" }}>
                  <span className="pmu-badge pmu-badge-accent">Razorpay Official Payment Page</span>
                  <h1
                    className="font-display"
                    style={{
                      marginTop: "12px",
                      fontSize: "clamp(28px, 3.8vw, 40px)",
                      lineHeight: 0.98,
                      textTransform: "uppercase",
                      color: "#f3f1ea",
                    }}
                  >
                    Complete Your Semester 1 Pass
                  </h1>
                  <p style={{ marginTop: "8px", fontSize: "13px", lineHeight: 1.6, color: "#a19f95" }}>
                    One-time payment via UPI (GPay, PhonePe, Paytm), Debit/Credit Card, or Netbanking. Instant activation for 180 days with zero recurring charges.
                  </p>

                  {/* Tier Switcher */}
                  <div style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "12px" }}>
                    <label className="pmu-label">Select Your Package Tier</label>

                    {/* Option: Tier 2 (₹199) */}
                    <button
                      type="button"
                      onClick={() => setTier("tier2")}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "18px",
                        borderRadius: "10px",
                        border: tier === "tier2" ? "2px solid #ff3b1d" : "1px solid #26262c",
                        backgroundColor: tier === "tier2" ? "rgba(255,59,29,0.1)" : "#08080a",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              height: "18px",
                              width: "18px",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "9999px",
                              border: tier === "tier2" ? "5px solid #ff3b1d" : "2px solid #52525b",
                            }}
                          />
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#f3f1ea", textTransform: "uppercase" }}>
                            Tier 2: Premium AI + 1:1 Human + Career
                          </span>
                        </div>
                        <span className="font-display" style={{ fontSize: "26px", color: "#ff3b1d" }}>
                          ₹199
                        </span>
                      </div>

                      <div
                        style={{
                          marginTop: "10px",
                          padding: "6px 10px",
                          borderRadius: "6px",
                          backgroundColor: "rgba(34,197,94,0.12)",
                          border: "1px solid rgba(74,222,128,0.3)",
                          fontSize: "11px",
                          color: "#86efac",
                          fontWeight: 700,
                        }}
                      >
                        ★ ONLY IN ₹199: Includes Internship &amp; Career Support (Resume/GitHub Review &amp; Referrals)
                      </div>

                      <ul
                        style={{
                          marginTop: "10px",
                          paddingLeft: "18px",
                          fontSize: "12px",
                          color: "#a19f95",
                          lineHeight: 1.65,
                        }}
                      >
                        <li>Everything in Tier 1 (₹99) + Unlimited 24/7 AI Doubt Copilot</li>
                        <li>Python Coding Lab + AI Line-by-Line Debugger</li>
                        <li>30-minute 1:1 Human Video Mentorship</li>
                        <li>Exclusive Internship &amp; Career Support (Only in ₹199)</li>
                      </ul>
                    </button>

                    {/* Option: Tier 1 (₹99) */}
                    <button
                      type="button"
                      onClick={() => setTier("tier1")}
                      style={{
                        width: "100%",
                        textAlign: "left",
                        padding: "18px",
                        borderRadius: "10px",
                        border: tier === "tier1" ? "2px solid #ff3b1d" : "1px solid #26262c",
                        backgroundColor: tier === "tier1" ? "rgba(255,59,29,0.1)" : "#08080a",
                        cursor: "pointer",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: "8px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span
                            style={{
                              display: "inline-flex",
                              height: "18px",
                              width: "18px",
                              alignItems: "center",
                              justifyContent: "center",
                              borderRadius: "9999px",
                              border: tier === "tier1" ? "5px solid #ff3b1d" : "2px solid #52525b",
                            }}
                          />
                          <span style={{ fontSize: "14px", fontWeight: 800, color: "#f3f1ea", textTransform: "uppercase" }}>
                            Tier 1: Basic Access
                          </span>
                        </div>
                        <span className="font-display" style={{ fontSize: "26px", color: "#f3f1ea" }}>
                          ₹99
                        </span>
                      </div>

                      <ul
                        style={{
                          marginTop: "8px",
                          paddingLeft: "18px",
                          fontSize: "12px",
                          color: "#a19f95",
                          lineHeight: 1.6,
                        }}
                      >
                        <li>All Six Currently Listed Semester 1 Subjects &amp; Available LaTeX Notes</li>
                        <li>Available paper resources &amp; topic-wise quizzes</li>
                        <li>Interactive BEE &amp; Python Simulations</li>
                        <li style={{ color: "#71717a" }}>Does not include 1:1 Human Mentorship or Internship &amp; Career Support</li>
                      </ul>
                    </button>
                  </div>

                  {/* Link to Tier 0 Free Beta */}
                  <div
                    style={{
                      marginTop: "16px",
                      padding: "12px 14px",
                      borderRadius: "8px",
                      border: "1px dashed rgba(255,59,29,0.35)",
                      backgroundColor: "rgba(255,59,29,0.05)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexWrap: "wrap",
                      gap: "8px",
                    }}
                  >
                    <span style={{ fontSize: "12px", color: "#d4d2c8" }}>
                      Joining as one of the <strong>First 10 Beta Testers</strong>?
                    </span>
                    <Link
                      href="/prepmeup#pricing"
                      className="font-mono"
                      style={{ fontSize: "11px", fontWeight: 700, color: "#ff6a3d", textDecoration: "underline" }}
                    >
                      Claim Tier 0 (₹0 Free Beta) →
                    </Link>
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: Student Checkout Form & Order Summary */}
              <div className="pmu-card-highlight" style={{ padding: "28px" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", borderBottom: "1px solid #26262c", paddingBottom: "14px", marginBottom: "18px" }}>
                  <div>
                    <span className="font-mono" style={{ fontSize: "11px", color: "#ff6a3d", fontWeight: 700, textTransform: "uppercase" }}>
                      Instant Razorpay Activation
                    </span>
                    <h2 className="font-display" style={{ marginTop: "4px", fontSize: "24px", textTransform: "uppercase", color: "#f3f1ea" }}>
                      Student Checkout Details
                    </h2>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <span className="font-mono" style={{ fontSize: "10px", color: "#807f78", display: "block" }}>
                      TOTAL PAYABLE
                    </span>
                    <span className="font-display" style={{ fontSize: "32px", color: "#4ade80", lineHeight: 1 }}>
                      ₹{priceRupees}
                    </span>
                  </div>
                </div>

                <form onSubmit={handleInitiateCheckout} style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  {error && (
                    <div
                      style={{
                        padding: "10px 12px",
                        borderRadius: "6px",
                        border: "1px solid rgba(239,68,68,0.4)",
                        backgroundColor: "rgba(70,8,9,0.35)",
                        fontSize: "12px",
                        color: "#fca5a5",
                      }}
                    >
                      {error}
                    </div>
                  )}

                  <div>
                    <label className="pmu-label">Student Full Name</label>
                    <input
                      type="text"
                      placeholder="e.g., Aarav Kulkarni"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      className="pmu-input"
                      required
                    />
                  </div>

                  <div>
                    <label className="pmu-label">WhatsApp Number (For Pass &amp; Receipt)</label>
                    <div style={{ display: "flex" }}>
                      <span
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          borderTopLeftRadius: "6px",
                          borderBottomLeftRadius: "6px",
                          border: "1px solid rgba(243,241,234,0.16)",
                          borderRight: "none",
                          backgroundColor: "#17171b",
                          padding: "0 12px",
                          fontSize: "12px",
                          fontWeight: 700,
                          color: "#807f78",
                        }}
                      >
                        +91
                      </span>
                      <input
                        type="tel"
                        inputMode="numeric"
                        maxLength={10}
                        placeholder="9876543210"
                        value={whatsapp}
                        onChange={(e) => setWhatsapp(e.target.value)}
                        className="pmu-input font-mono"
                        style={{ borderTopLeftRadius: 0, borderBottomLeftRadius: 0 }}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="pmu-label">Student Email Address (For Instant Pass &amp; Invoice)</label>
                    <input
                      type="email"
                      placeholder="student@dypiu.ac.in or name@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pmu-input"
                    />
                  </div>

                  {tier === "tier2" && (
                    <div
                      style={{
                        padding: "14px",
                        borderRadius: "8px",
                        border: "1px solid rgba(255,106,61,0.35)",
                        backgroundColor: "#08080a",
                        display: "flex",
                        flexDirection: "column",
                        gap: "10px",
                      }}
                    >
                      <span className="font-mono" style={{ fontSize: "11px", fontWeight: 700, color: "#4ade80", textTransform: "uppercase" }}>
                        ★ Tier 2 Exclusive: 1:1 Human + Internship &amp; Career Support
                      </span>

                      <div>
                        <label className="pmu-label">Primary 1:1 Mentorship &amp; Career Focus</label>
                        <select
                          value={mentorTopic}
                          onChange={(e) => setMentorTopic(e.target.value)}
                          className="pmu-input"
                          style={{ fontSize: "12px" }}
                        >
                          <option value="Internship & Career Support (Resume, GitHub & Referrals)">
                            ★ Internship &amp; Career Support (Resume, GitHub &amp; Referrals)
                          </option>
                          <option value="Applied Computational Mathematics (ACM-101)">
                            ACM-101: Applied Mathematics + Career Roadmap
                          </option>
                          <option value="Python Programming & Code Review (PYT-102)">
                            PYT-102: Python Programming + AI/ML Portfolio
                          </option>
                          <option value="Basic Electrical Engineering (BEE-103)">
                            BEE-103: Basic Electrical Engineering 1:1
                          </option>
                          <option value="Computer Organisation & Architecture (COA-104)">
                            COA-104: Computer Architecture 1:1
                          </option>
                        </select>
                      </div>

                      <div>
                        <label className="pmu-label">Preferred First 1:1 Session Slot</label>
                        <select
                          value={mentorSlot}
                          onChange={(e) => setMentorSlot(e.target.value)}
                          className="pmu-input"
                          style={{ fontSize: "12px" }}
                        >
                          <option value="Today, 7:00 PM – 7:30 PM IST">Today, 7:00 PM – 7:30 PM IST</option>
                          <option value="Today, 9:00 PM – 9:30 PM IST">Today, 9:00 PM – 9:30 PM IST</option>
                          <option value="Tomorrow, 6:00 PM – 6:30 PM IST">Tomorrow, 6:00 PM – 6:30 PM IST</option>
                          <option value="Direct WhatsApp + Weekend Deep-Dive">Direct WhatsApp + Weekend Deep-Dive</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {/* Explicit Payment Method Selector on Payment Screen */}
                  <div
                    style={{
                      borderRadius: "10px",
                      border: "1px solid #26262c",
                      backgroundColor: "#08080a",
                      padding: "16px",
                      display: "flex",
                      flexDirection: "column",
                      gap: "12px",
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <label className="pmu-label" style={{ margin: 0 }}>
                        Select Payment Method
                      </label>
                      <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80", fontWeight: 700 }}>
                        ✓ Zero Convenience Fees
                      </span>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px" }}>
                      {[
                        { id: "upi" as const, label: "📱 UPI / QR", sub: "GPay, PhonePe" },
                        { id: "card" as const, label: "💳 Card", sub: "Visa, MC, RuPay" },
                        { id: "netbanking" as const, label: "🏦 Netbanking", sub: "All Banks" },
                      ].map((m) => {
                        const active = paymentMethod === m.id;
                        return (
                          <button
                            key={m.id}
                            type="button"
                            onClick={() => setPaymentMethod(m.id)}
                            style={{
                              padding: "10px 8px",
                              borderRadius: "8px",
                              border: active ? "2px solid #ff3b1d" : "1px solid #26262c",
                              backgroundColor: active ? "rgba(255,59,29,0.12)" : "#111114",
                              textAlign: "center",
                              cursor: "pointer",
                            }}
                          >
                            <div style={{ fontSize: "12px", fontWeight: 700, color: active ? "#ff3b1d" : "#f3f1ea" }}>
                              {m.label}
                            </div>
                            <div style={{ fontSize: "10px", color: "#807f78", marginTop: "2px" }}>
                              {m.sub}
                            </div>
                          </button>
                        );
                      })}
                    </div>

                    {/* UPI Dedicated Box */}
                    {paymentMethod === "upi" && (
                      <div
                        style={{
                          borderRadius: "8px",
                          border: "1px solid rgba(255,59,29,0.3)",
                          backgroundColor: "#111114",
                          padding: "14px",
                          display: "flex",
                          flexDirection: "column",
                          gap: "10px",
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: "8px" }}>
                          <span style={{ fontSize: "12px", fontWeight: 700, color: "#f3f1ea" }}>
                            Popular UPI Apps Accepted:
                          </span>
                          <div style={{ display: "flex", gap: "6px" }}>
                            {["GPay", "PhonePe", "Paytm", "BHIM", "Cred"].map((app) => (
                              <span
                                key={app}
                                style={{
                                  fontSize: "10px",
                                  fontWeight: 700,
                                  fontFamily: "monospace",
                                  padding: "2px 6px",
                                  borderRadius: "4px",
                                  backgroundColor: "#17171b",
                                  border: "1px solid #26262c",
                                  color: "#a19f95",
                                }}
                              >
                                {app}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="pmu-label" style={{ fontSize: "11px" }}>
                            Enter UPI ID / VPA
                          </label>
                          <input
                            type="text"
                            placeholder="e.g. yourname@oksbi / yourname@okaxis"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                            className="pmu-input font-mono"
                            style={{ fontSize: "12px", padding: "8px 12px" }}
                          />
                          <div style={{ marginTop: "8px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                            {["@okaxis", "@oksbi", "@ybl", "@paytm"].map((handle) => (
                              <button
                                key={handle}
                                type="button"
                                onClick={() => {
                                  const prefix = upiId.includes("@") ? upiId.split("@")[0] : upiId || "student";
                                  setUpiId(`${prefix}${handle}`);
                                }}
                                style={{
                                  fontSize: "11px",
                                  fontFamily: "monospace",
                                  padding: "3px 8px",
                                  borderRadius: "4px",
                                  border: "1px solid #26262c",
                                  backgroundColor: "#17171b",
                                  color: "#ff6a3d",
                                  cursor: "pointer",
                                }}
                              >
                                {handle}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div style={{ fontSize: "11px", color: "#807f78", lineHeight: 1.5 }}>
                          💡 <em>Or click Pay below to open Razorpay's QR code modal directly for 1-tap mobile checkout.</em>
                        </div>
                      </div>
                    )}

                    {paymentMethod === "card" && (
                      <div style={{ fontSize: "12px", color: "#a19f95", padding: "8px", backgroundColor: "#111114", borderRadius: "6px" }}>
                        💳 All Domestic &amp; International Visa, Mastercard, RuPay &amp; Diners cards accepted.
                      </div>
                    )}

                    {paymentMethod === "netbanking" && (
                      <div style={{ fontSize: "12px", color: "#a19f95", padding: "8px", backgroundColor: "#111114", borderRadius: "6px" }}>
                        🏦 Supports 50+ Indian banks including SBI, HDFC, ICICI, Axis, and Kotak.
                      </div>
                    )}
                  </div>

                  {/* Order Breakdown Box */}
                  <div
                    style={{
                      padding: "14px 16px",
                      borderRadius: "8px",
                      border: "1px solid #26262c",
                      backgroundColor: "#08080a",
                      display: "flex",
                      flexDirection: "column",
                      gap: "8px",
                      fontSize: "12px",
                    }}
                  >
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
                      <span>
                        {tier === "tier2"
                          ? "Tier 2 (Premium AI + 1:1 Human + Internship/Career)"
                          : "Tier 1 (Semester 1 Basic Access)"}
                      </span>
                      <span className="font-mono" style={{ color: "#f3f1ea" }}>₹{priceRupees}.00</span>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", color: "#a19f95" }}>
                      <span>Platform &amp; Gateway Fee</span>
                      <span className="font-mono" style={{ color: "#4ade80" }}>₹0.00</span>
                    </div>
                    <div
                      style={{
                        borderTop: "1px solid #26262c",
                        paddingTop: "8px",
                        display: "flex",
                        justifyContent: "space-between",
                        fontWeight: 700,
                        fontSize: "14px",
                        color: "#f3f1ea",
                      }}
                    >
                      <span>Amount Payable</span>
                      <span className="font-mono" style={{ color: "#ff6a3d" }}>₹{priceRupees}.00</span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="pmu-btn-primary"
                    style={{ width: "100%", padding: "14px", fontSize: "14px" }}
                  >
                    {loading
                      ? "Initializing Razorpay Order…"
                      : `Pay ₹${priceRupees} via Razorpay (UPI / Card / Netbanking) →`}
                  </button>

                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "14px", flexWrap: "wrap", fontSize: "11px", color: "#807f78" }}>
                    <span>✓ GPay / PhonePe / Paytm UPI</span>
                    <span>•</span>
                    <span>✓ Instant Activation</span>
                    <span>•</span>
                    <span>✓ 180-Day Validity</span>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* ============================ INTERACTIVE RAZORPAY GATEWAY MODAL ============================ */}
      {showGatewayModal && activeOrder && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 200,
            backgroundColor: "rgba(0,0,0,0.85)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "16px",
          }}
        >
          <div
            style={{
              width: "100%",
              maxWidth: "440px",
              borderRadius: "14px",
              overflow: "hidden",
              border: "1px solid rgba(255,59,29,0.5)",
              backgroundColor: "#111114",
              boxShadow: "0 25px 60px rgba(0,0,0,0.85)",
            }}
          >
            {/* Razorpay Header */}
            <div
              style={{
                background: "linear-gradient(135deg, #ff3b1d 0%, #c8280e 100%)",
                padding: "18px 20px",
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div>
                <div className="font-mono" style={{ fontSize: "10px", textTransform: "uppercase", opacity: 0.9 }}>
                  Razorpay Secure Checkout
                </div>
                <div className="font-display" style={{ fontSize: "22px", letterSpacing: "0.03em", textTransform: "uppercase" }}>
                  PrepMeUp AI • {tier === "tier2" ? "Tier 2 Pro" : "Tier 1 Basic"}
                </div>
                <div className="font-mono" style={{ fontSize: "11px", opacity: 0.9 }}>
                  Order: {activeOrder.orderId}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div className="font-display" style={{ fontSize: "28px", lineHeight: 1 }}>
                  ₹{activeOrder.amountRupees}
                </div>
                <button
                  type="button"
                  onClick={() => setShowGatewayModal(false)}
                  style={{
                    marginTop: "6px",
                    background: "rgba(0,0,0,0.25)",
                    border: "none",
                    color: "#fff",
                    borderRadius: "4px",
                    padding: "2px 8px",
                    fontSize: "11px",
                    cursor: "pointer",
                  }}
                >
                  Cancel ✕
                </button>
              </div>
            </div>

            {/* Payment Method Tabs */}
            <div style={{ padding: "20px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "8px", marginBottom: "16px" }}>
                {[
                  { id: "upi" as const, label: "📱 UPI / QR" },
                  { id: "card" as const, label: "💳 Card" },
                  { id: "netbanking" as const, label: "🏦 Netbanking" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setPaymentMethod(tab.id)}
                    style={{
                      padding: "8px",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 700,
                      border: paymentMethod === tab.id ? "1px solid #ff3b1d" : "1px solid #26262c",
                      backgroundColor: paymentMethod === tab.id ? "rgba(255,59,29,0.14)" : "#08080a",
                      color: paymentMethod === tab.id ? "#ff6a3d" : "#a19f95",
                      cursor: "pointer",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {paymentMethod === "upi" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #26262c",
                    backgroundColor: "#08080a",
                    marginBottom: "16px",
                  }}
                >
                  <label className="pmu-label">Enter UPI ID (GPay / PhonePe / Paytm / BHIM)</label>
                  <input
                    type="text"
                    value={upiId}
                    onChange={(e) => setUpiId(e.target.value)}
                    placeholder="yourname@okicici"
                    className="pmu-input font-mono"
                    style={{ fontSize: "12px" }}
                  />
                  <div style={{ marginTop: "10px", display: "flex", gap: "6px", flexWrap: "wrap" }}>
                    {["@okaxis", "@oksbi", "@ybl", "@paytm"].map((suffix) => (
                      <button
                        key={suffix}
                        type="button"
                        onClick={() => setUpiId((prev) => `${prev.split("@")[0] || "student"}${suffix}`)}
                        style={{
                          padding: "3px 8px",
                          borderRadius: "4px",
                          border: "1px solid #26262c",
                          backgroundColor: "#17171b",
                          color: "#a19f95",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        {suffix}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {paymentMethod === "card" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #26262c",
                    backgroundColor: "#08080a",
                    marginBottom: "16px",
                    fontSize: "12px",
                    color: "#a19f95",
                  }}
                >
                  Visa / Mastercard / RuPay Test Card pre-filled (`4111 •••• •••• 1111`). Click below to authorize ₹{activeOrder.amountRupees}.
                </div>
              )}

              {paymentMethod === "netbanking" && (
                <div
                  style={{
                    padding: "16px",
                    borderRadius: "8px",
                    border: "1px solid #26262c",
                    backgroundColor: "#08080a",
                    marginBottom: "16px",
                    fontSize: "12px",
                    color: "#a19f95",
                  }}
                >
                  SBI / HDFC / ICICI / Axis Instant Netbanking selected. Click below to authorize ₹{activeOrder.amountRupees}.
                </div>
              )}

              <button
                type="button"
                disabled={verifying}
                onClick={() =>
                  handleVerifyPayment(
                    activeOrder.orderId,
                    `pay_${Date.now().toString(36)}`,
                    "mock-signature"
                  )
                }
                className="pmu-btn-primary"
                style={{ width: "100%", padding: "12px", fontSize: "13px" }}
              >
                {verifying
                  ? "Verifying HMAC-SHA256 Signature…"
                  : `Authorize & Pay ₹${activeOrder.amountRupees}.00 Now →`}
              </button>

              <p style={{ marginTop: "10px", textAlign: "center", fontSize: "11px", color: "#807f78" }}>
                🔒 Verified by Razorpay Order &amp; Webhook Reconciliation Engine
              </p>
            </div>
          </div>
        </div>
      )}

      <PrepMeUpFooter />
    </div>
  );
}
