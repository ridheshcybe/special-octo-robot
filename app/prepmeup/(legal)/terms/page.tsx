import React from "react";
import type { Metadata } from "next";
import { LegalShell, LegalSection } from "../LegalShell";

export const metadata: Metadata = {
  title: "Terms of Service — PrepMeUp AI",
  description: "Terms and conditions for B.Tech Semester 1 access, study notes, AI copilot, and 1:1 human mentorship.",
};

export default function TermsPage() {
  return (
    <LegalShell
      title="Terms of Service"
      subtitle="Plain-language terms for using PrepMeUp AI study notes, calculators, AI doubt engines, and mentorship sessions."
    >
      <LegalSection title="1. What You Are Buying">
        <p>
          PrepMeUp AI provides <strong>time-limited digital access</strong> (180-day Semester 1 pass) to curated B.Tech academic notes, solved past university question papers (PYQs), interactive Python/BEE circuit simulators, Groq-powered AI doubt resolution, and (for Tier 2) scheduled 1:1 human video mentorship sessions.
        </p>
        <p>
          Purchasing a pass grants an individual license to view and study the materials. It does <strong>not</strong> grant copyright ownership or distribution rights.
        </p>
      </LegalSection>

      <LegalSection title="2. Pricing & Tier Entitlements">
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <strong>Tier 0 (₹0 Free Beta Pass):</strong> Limited to the first 10 verified beta testers who commit to providing structured academic feedback.
          </li>
          <li>
            <strong>Tier 1 (₹99 Semester Pass):</strong> Access to the six currently listed Semester 1 subjects and their available notes, formula sheets, past papers, topic quizzes, and interactive simulations for 180 days.
          </li>
          <li>
            <strong>Tier 2 (₹199 Premium AI + Mentorship):</strong> Everything in Tier 1 plus 24/7 Priority AI Doubt Copilot, a scheduled 30-minute 1:1 Google Meet human video mentorship session, and exclusive Internship &amp; Career Roadmap review (Resume &amp; GitHub).
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Account Security & Fair Use">
        <p>
          Each account is strictly for individual student use. Sign up with your authentic WhatsApp number and email. Sharing credentials, bulk scraping, downloading notes for commercial resale, or redistributing materials on Telegram, Discord, or WhatsApp groups without permission is strictly prohibited and results in immediate account revocation without refund.
        </p>
      </LegalSection>

      <LegalSection title="4. 1:1 Mentorship Sessions (Tier 2)">
        <p>
          1:1 human sessions are conducted via Google Meet with Ridhesh Walavalkar. Sessions must be scheduled at least 24 hours in advance through the student portal or WhatsApp. If you need to reschedule, notify us at least 6 hours before the booked slot.
        </p>
      </LegalSection>

      <LegalSection title="5. Service Availability & Maintenance">
        <p>
          We strive for 99.9% uptime on our low-latency standalone infrastructure. Occasional brief maintenance windows may occur to update syllabus content or AI models.
        </p>
      </LegalSection>

      <LegalSection title="6. Governing Law & Contact">
        <p>
          These terms are governed by the laws of India. For any inquiries, support, or billing queries, email{" "}
          <strong style={{ color: "#ff6a3d", fontFamily: "monospace" }}>walavalkarridhesh@gmail.com</strong>{" "}
          or reach out directly on WhatsApp.
        </p>
      </LegalSection>
    </LegalShell>
  );
}
