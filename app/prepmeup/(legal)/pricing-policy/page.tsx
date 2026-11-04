import React from "react";
import type { Metadata } from "next";
import { LegalShell, LegalSection } from "../LegalShell";

export const metadata: Metadata = {
  title: "Pricing & Delivery Policy — PrepMeUp AI",
  description: "Exact pricing schedules, currency details, and instantaneous digital delivery policy for PrepMeUp AI.",
};

export default function PricingPolicyPage() {
  return (
    <LegalShell
      title="Pricing &amp; Delivery Policy"
      subtitle="Complete breakdown of pass pricing, included entitlements, and immediate digital delivery terms."
    >
      <LegalSection title="1. Transparent Pricing Structure">
        <p>All prices are listed in Indian National Rupees (INR ₹) inclusive of all applicable platform and gateway fees:</p>
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <strong>Tier 1 (₹99 flat):</strong> 180-day Semester 1 pass for all six currently listed academic subjects: Applied Computational Mathematics (CSE1001), Basic Electrical and Electronics Engineering (CSE1002), Computer Organization and Architecture (CSE1003), Fundamentals of Web Technologies (CSE1004), Python Programming (CSE1005), and Indian Science, Engineering and Technology (CSE1006). Includes available LaTeX notes, paper resources when source-backed materials are available, topic quizzes, and interactive simulations.
          </li>
          <li>
            <strong>Tier 2 (₹199 flat):</strong> Everything in Tier 1 plus 24/7 Priority AI Doubt Copilot, Python Coding Lab + AI Line-by-Line Debugger, 1 Included 1:1 Human Video Mentorship session on Google Meet, and personalized Internship &amp; Career Roadmap guidance (Resume &amp; GitHub portfolio review).
          </li>
          <li>
            <strong>Tier 3 (₹499 flat):</strong> Premium 1:1 VIP Pass. Includes everything in Tier 1 and Tier 2 plus <strong>Unlimited 1:1 Live Video Mentorship Sessions</strong> on Google Meet, priority real-time calendar slot scheduling and rescheduling, and direct access to senior subject mentors (Maths proofs, BEE simulations, Python labs, and COA architecture).
          </li>
        </ul>
        <p style={{ marginTop: "10px" }}>
          There are <strong>zero hidden fees, convenience charges, or surprise auto-renewals</strong> at checkout.
        </p>
      </LegalSection>

      <LegalSection title="2. Instant Digital Delivery">
        <p>
          PrepMeUp AI is an entirely <strong>online digital academic platform</strong>. No physical goods or printed textbooks are shipped.
        </p>
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li>
            <strong>Access Activation:</strong> Immediate upon successful Razorpay payment verification (usually within 1–3 seconds).
          </li>
          <li>
            <strong>Delivery Mode:</strong> Your account is instantly credited, and you are redirected to the student portal with complete unlock of all study chapters and tools.
          </li>
          <li>
            <strong>Receipt:</strong> A verified digital receipt displaying your Order ID and Razorpay Payment ID is rendered on-screen and saved to your profile.
          </li>
        </ul>
      </LegalSection>

      <LegalSection title="3. Accepted Payment Methods">
        <ul style={{ paddingLeft: "20px", display: "flex", flexDirection: "column", gap: "8px" }}>
          <li><strong>UPI (Zero-Fee):</strong> Google Pay, PhonePe, Paytm, BHIM, Cred, and all bank VPAs.</li>
          <li><strong>Cards:</strong> RuPay, Visa, Mastercard, Maestro, and American Express.</li>
          <li><strong>Netbanking:</strong> Over 50+ supported Indian banking institutions.</li>
        </ul>
      </LegalSection>
    </LegalShell>
  );
}
