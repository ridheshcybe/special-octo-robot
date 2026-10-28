import React from "react";
import type { Metadata } from "next";
import { LegalShell, LegalSection } from "../LegalShell";

export const metadata: Metadata = {
  title: "Merchant Contact & Support — PrepMeUp AI",
  description: "Direct contact channels for academic inquiries, technical issues, billing support, and student mentorship.",
};

export default function ContactPage() {
  return (
    <LegalShell
      title="Merchant Contact &amp; Support"
      subtitle="Direct access to the creator and engineering team behind PrepMeUp AI."
    >
      <LegalSection title="1. Direct Support Channels">
        <p>
          PrepMeUp AI is operated directly by <strong>Ridhesh Walavalkar</strong>. There are no automated ticketing layers or third-party call centers — you deal directly with the developer and educator.
        </p>

        <div
          style={{
            marginTop: "16px",
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))",
            gap: "16px",
          }}
        >
          <div
            style={{
              padding: "18px 20px",
              backgroundColor: "#17171b",
              borderRadius: "8px",
              border: "1px solid #26262c",
            }}
          >
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#807f78", textTransform: "uppercase" }}>
              Primary Email
            </span>
            <div style={{ marginTop: "4px", fontSize: "15px", fontWeight: 700, color: "#f3f1ea" }}>
              <span style={{ color: "#ff6a3d", fontFamily: "monospace", userSelect: "all" }}>
                walavalkarridhesh@gmail.com
              </span>
            </div>
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#a19f95" }}>
              Average response time: &lt; 4 hours (daily 9:00 AM – 11:00 PM IST).
            </p>
          </div>

          <div
            style={{
              padding: "18px 20px",
              backgroundColor: "#17171b",
              borderRadius: "8px",
              border: "1px solid #26262c",
            }}
          >
            <span style={{ fontSize: "11px", fontFamily: "monospace", color: "#807f78", textTransform: "uppercase" }}>
              WhatsApp Student Helpline
            </span>
            <div style={{ marginTop: "4px", fontSize: "15px", fontWeight: 700, color: "#4ade80", fontFamily: "monospace" }}>
              +91 98207 43178
            </div>
            <p style={{ marginTop: "6px", fontSize: "12px", color: "#a19f95" }}>
              Fast-track for urgent exam doubts and 1:1 scheduling.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection title="2. When to Contact Us">
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <strong>Payment Inquiries &amp; Receipts:</strong> Include your Razorpay Payment ID (`pay_...`) for instant reconciliation.
          </li>
          <li>
            <strong>1:1 Mentorship Scheduling:</strong> Select your preferred weekday/weekend Google Meet time slot.
          </li>
          <li>
            <strong>Academic Feedback &amp; Suggestions:</strong> Propose additional past papers or specific problem derivations.
          </li>
          <li>
            <strong>Data Requests:</strong> Request account updates or complete data export under DPDP Act provisions.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Merchant &amp; Operator Details">
        <p>
          <strong>Merchant Name:</strong> Ridhesh Walavalkar (PrepMeUp AI)<br />
          <strong>Operating Jurisdiction:</strong> Maharashtra, India<br />
          <strong>Platform Architecture:</strong> Brutalist Next.js 16 + Alpine Standalone Docker + Directus CMS
        </p>
      </LegalSection>
    </LegalShell>
  );
}
