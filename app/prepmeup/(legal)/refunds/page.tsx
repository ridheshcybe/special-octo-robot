import React from "react";
import type { Metadata } from "next";
import { LegalShell, LegalSection } from "../LegalShell";

export const metadata: Metadata = {
  title: "Refund & Cancellation Policy — PrepMeUp AI",
  description: "Transparent, student-friendly 48-hour refund policy and cancellation terms for PrepMeUp AI.",
};

export default function RefundsPage() {
  return (
    <LegalShell
      title="Refund &amp; Cancellation Policy"
      subtitle="Fair and transparent terms for refunds, payment reversals, and pass cancellations."
    >
      <LegalSection title="1. 48-Hour Satisfaction Guarantee">
        <p>
          We want you to feel 100% confident in PrepMeUp AI. If you purchase Tier 1 (₹99) or Tier 2 (₹199) and find the study notes or tools are not a good fit for your semester preparation, you may request a <strong>full 100% refund within 48 hours of payment</strong>.
        </p>
      </LegalSection>

      <LegalSection title="2. Automatic Full Refund Eligibility">
        <p>A full refund is guaranteed under any of the following technical conditions:</p>
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>You were debited more than once for the same order due to a bank network retry.</li>
          <li>Your payment was successfully deducted by your bank but your account was not activated within 30 minutes.</li>
          <li>A scheduled 1:1 human mentorship session could not be delivered and was not rescheduled.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. How to Request a Refund">
        <p>
          Send an email to{" "}
          <strong style={{ color: "#ff6a3d", fontFamily: "monospace" }}>walavalkarridhesh@gmail.com</strong>{" "}
          or WhatsApp message with:
        </p>
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>Your full name &amp; registered WhatsApp number.</li>
          <li>Your Razorpay Payment ID (`pay_...`) or Order ID (`order_...`).</li>
          <li>A brief note explaining why you'd like a refund (helps us improve).</li>
        </ul>
        <p style={{ marginTop: "10px" }}>
          We review and approve requests within <strong>12 hours</strong>.
        </p>
      </LegalSection>

      <LegalSection title="4. Processing Time &amp; Method">
        <p>
          Refunds are routed through Razorpay directly to your original source of payment (your UPI account, debit card, or credit card). Banks typically reflect the credited balance within <strong>5 to 7 business days</strong>.
        </p>
      </LegalSection>

      <LegalSection title="5. Non-Subscription Cancellation">
        <p>
          PrepMeUp AI passes are <strong>one-time payments</strong> with zero recurring charges. There are no recurring auto-debits, so there is nothing you need to remember to cancel. When your 180-day access expires, your account simply pauses.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
