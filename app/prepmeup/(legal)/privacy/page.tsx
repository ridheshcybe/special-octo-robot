import React from "react";
import type { Metadata } from "next";
import { LegalShell, LegalSection } from "../LegalShell";

export const metadata: Metadata = {
  title: "Privacy Policy — PrepMeUp AI",
  description: "How PrepMeUp AI collects, protects, and respects student data in compliance with India's DPDP Act.",
};

export default function PrivacyPage() {
  return (
    <LegalShell
      title="Privacy Policy"
      subtitle="How PrepMeUp AI protects and manages your student data under the Digital Personal Data Protection Act, 2023 (DPDP Act)."
    >
      <LegalSection title="1. Information We Collect">
        <p>
          We only collect data strictly necessary to deliver the academic service:
        </p>
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <strong>Contact &amp; Profile:</strong> Student full name, WhatsApp phone number, and optional email address used for OTP verification and mentorship notifications.
          </li>
          <li>
            <strong>Academic Progress:</strong> Completed quiz scores, submitted doubts, simulation interaction history, and target Semester 1 subjects.
          </li>
          <li>
            <strong>Transaction Records:</strong> Razorpay order ID, payment ID, and timestamp. <em>We never store credit card numbers, CVVs, or UPI PINs on our servers.</em>
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="2. Purpose of Data Processing">
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>To verify identity and grant instant semester access upon payment confirmation.</li>
          <li>To personalize AI doubt resolution grounded in your specific university curriculum.</li>
          <li>To schedule 1:1 human video mentorship slots and send meeting links.</li>
          <li>We <strong>never</strong> sell, rent, or trade your personal information to third-party advertisers.</li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Trusted Infrastructure Partners">
        <p>Data processing is conducted using enterprise-grade providers:</p>
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li><strong>Razorpay:</strong> RBI-licensed payment gateway for end-to-end encrypted UPI and card processing.</li>
          <li><strong>Cloudflare:</strong> Global CDN edge protection and SSL/TLS encryption.</li>
          <li><strong>Groq:</strong> Sub-second LLM inference engine (queries are processed statelessly without model retraining).</li>
        </ul>
      </LegalSection>

      <LegalSection title="4. Student Rights &amp; Data Deletion">
        <p>
          You have the right to inspect, correct, or request deletion of your account and personal records at any time. Simply email{" "}
          <strong style={{ color: "#ff6a3d", fontFamily: "monospace" }}>walavalkarridhesh@gmail.com</strong>{" "}
          from your registered contact. Requests are processed within 48 hours.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
