"use client";

import React, { useState } from "react";
import Link from "next/link";
import { RazorpayCheckoutButton } from "@/components/RazorpayCheckoutButton";

export default function CheckoutPage() {
  const [selectedAmount, setSelectedAmount] = useState<number>(100); // 100 paise = ₹1.00
  const [customAmountRupees, setCustomAmountRupees] = useState<string>("1");
  const [customerName, setCustomerName] = useState<string>("Engineering Student");
  const [customerPhone, setCustomerPhone] = useState<string>("9820743178");
  const [customerEmail, setCustomerEmail] = useState<string>("student@prepmeup.ai");
  const [lastPayment, setLastPayment] = useState<any>(null);

  const handleCustomChange = (val: string) => {
    setCustomAmountRupees(val);
    const num = parseFloat(val);
    if (!isNaN(num) && num > 0) {
      setSelectedAmount(Math.round(num * 100));
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        fontFamily: "var(--font-inter), sans-serif",
        padding: "32px 16px",
      }}
    >
      <div style={{ maxWidth: "680px", margin: "0 auto" }}>
        {/* Navigation back */}
        <div style={{ marginBottom: "24px" }}>
          <Link
            href="/prepmeup"
            className="font-mono"
            style={{ fontSize: "12px", color: "#a19f95", textDecoration: "none" }}
          >
            ← Back to PrepMeUp AI Home
          </Link>
        </div>

        {/* Card Header */}
        <div
          className="pmu-card"
          style={{
            padding: "32px",
            border: "1px solid #26262c",
            backgroundColor: "#111114",
            borderRadius: "16px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "8px" }}>
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                fontWeight: 700,
                color: "#ff3b1d",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              Razorpay Standard Web Checkout
            </span>
            <span
              className="font-mono"
              style={{
                fontSize: "11px",
                color: "#4ade80",
                backgroundColor: "rgba(34,197,94,0.12)",
                padding: "2px 8px",
                borderRadius: "4px",
              }}
            >
              Test Mode Active
            </span>
          </div>

          <h1
            className="font-display"
            style={{ fontSize: "32px", textTransform: "uppercase", color: "#ffffff", margin: "8px 0" }}
          >
            Secure Payment Gateway
          </h1>
          <p style={{ fontSize: "14px", color: "#a19f95", lineHeight: 1.6 }}>
            Powered by Razorpay Standard Checkout SDK. Transactions create verified backend orders and cryptographically validate HMAC-SHA256 signatures upon completion.
          </p>

          <hr style={{ borderColor: "#26262c", margin: "24px 0" }} />

          {/* Amount Presets */}
          <div style={{ marginBottom: "24px" }}>
            <label className="font-mono" style={{ fontSize: "12px", color: "#a19f95", display: "block", marginBottom: "8px" }}>
              Select Payment Amount:
            </label>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "12px" }}>
              {[
                { label: "₹1.00 (Test Min)", paise: 100 },
                { label: "₹99.00 (Tier 1)", paise: 9900 },
                { label: "₹199.00 (Tier 2)", paise: 19900 },
              ].map((p) => (
                <button
                  key={p.paise}
                  type="button"
                  onClick={() => {
                    setSelectedAmount(p.paise);
                    setCustomAmountRupees((p.paise / 100).toString());
                  }}
                  style={{
                    padding: "12px 8px",
                    borderRadius: "8px",
                    border: selectedAmount === p.paise ? "2px solid #ff3b1d" : "1px solid #26262c",
                    backgroundColor: selectedAmount === p.paise ? "rgba(255, 59, 29, 0.12)" : "#17171b",
                    color: selectedAmount === p.paise ? "#ff3b1d" : "#f3f1ea",
                    fontWeight: 700,
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  {p.label}
                </button>
              ))}
            </div>

            {/* Custom Amount Field */}
            <div style={{ marginTop: "12px" }}>
              <label className="font-mono" style={{ fontSize: "11px", color: "#807f78" }}>
                Or enter custom amount in Rupees (₹):
              </label>
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "4px" }}>
                <span className="font-mono" style={{ fontSize: "16px", color: "#ff3b1d" }}>₹</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={customAmountRupees}
                  onChange={(e) => handleCustomChange(e.target.value)}
                  style={{
                    backgroundColor: "#17171b",
                    border: "1px solid #26262c",
                    borderRadius: "6px",
                    padding: "8px 12px",
                    color: "#ffffff",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    width: "120px",
                  }}
                />
                <span className="font-mono" style={{ fontSize: "12px", color: "#807f78" }}>
                  = {selectedAmount} paise
                </span>
              </div>
            </div>
          </div>

          {/* Customer Details Form */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "28px" }}>
            <div>
              <label className="font-mono" style={{ fontSize: "11px", color: "#a19f95", display: "block", marginBottom: "4px" }}>
                Full Name
              </label>
              <input
                type="text"
                value={customerName}
                onChange={(e) => setCustomerName(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#17171b",
                  border: "1px solid #26262c",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  color: "#ffffff",
                  fontSize: "13px",
                }}
              />
            </div>

            <div>
              <label className="font-mono" style={{ fontSize: "11px", color: "#a19f95", display: "block", marginBottom: "4px" }}>
                WhatsApp Mobile (+91)
              </label>
              <input
                type="text"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#17171b",
                  border: "1px solid #26262c",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  color: "#ffffff",
                  fontSize: "13px",
                }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label className="font-mono" style={{ fontSize: "11px", color: "#a19f95", display: "block", marginBottom: "4px" }}>
                Email Address
              </label>
              <input
                type="email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                style={{
                  width: "100%",
                  backgroundColor: "#17171b",
                  border: "1px solid #26262c",
                  borderRadius: "6px",
                  padding: "10px 12px",
                  color: "#ffffff",
                  fontSize: "13px",
                }}
              />
            </div>
          </div>

          {/* Checkout Action Component */}
          <div style={{ paddingTop: "12px", borderTop: "1px solid #26262c" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px" }}>
              <span className="font-mono" style={{ fontSize: "13px", color: "#a19f95" }}>
                Total Payable:
              </span>
              <span className="font-display" style={{ fontSize: "28px", color: "#4ade80" }}>
                ₹{(selectedAmount / 100).toFixed(2)}
              </span>
            </div>

            <RazorpayCheckoutButton
              amount={selectedAmount}
              currency="INR"
              name="PrepMeUp Engineering"
              description={`Payment of ₹${(selectedAmount / 100).toFixed(2)}`}
              prefill={{
                name: customerName,
                email: customerEmail,
                contact: customerPhone,
              }}
              buttonText={`Proceed to Pay ₹${(selectedAmount / 100).toFixed(2)} →`}
              style={{ width: "100%", padding: "14px 24px", fontSize: "15px" }}
              onSuccess={(result) => {
                setLastPayment(result);
              }}
            />
          </div>

          {/* Verified Receipt Output Box */}
          {lastPayment && (
            <div
              style={{
                marginTop: "24px",
                padding: "20px",
                borderRadius: "12px",
                backgroundColor: "rgba(34,197,94,0.08)",
                border: "1px solid rgba(34,197,94,0.3)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "8px" }}>
                <span style={{ color: "#4ade80", fontSize: "18px" }}>✓</span>
                <span className="font-mono" style={{ fontSize: "13px", fontWeight: 700, color: "#4ade80" }}>
                  HMAC-SHA256 Signature Verified!
                </span>
              </div>
              <div className="font-mono" style={{ fontSize: "12px", color: "#d4d2c8", lineHeight: 1.8 }}>
                <div><strong>Razorpay Order ID:</strong> {lastPayment.orderId}</div>
                <div><strong>Payment ID:</strong> {lastPayment.paymentId}</div>
                <div><strong>Signature:</strong> {lastPayment.signature.slice(0, 32)}...</div>
                <div><strong>Status:</strong> Success (Confirmed on Server)</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
