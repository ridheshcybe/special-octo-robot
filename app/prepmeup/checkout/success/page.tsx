import React from "react";
import Link from "next/link";
import { getUnifiedProductBySlug, getUnifiedOrderById } from "@/app/prepmeup/_lib/trackStore";

interface Props {
  searchParams: Promise<{
    status?: string;
    product?: string;
    seat?: string;
    orderId?: string;
  }>;
}

export default async function UnifiedPaymentSuccessPage({ searchParams }: Props) {
  const resolved = await searchParams;
  const isEarlyAdopter = resolved.status === "claimed";
  const productSlug = resolved.product || "all-access-pass";
  const seatNumber = resolved.seat || "";
  const orderId = resolved.orderId || "";

  const product = getUnifiedProductBySlug(productSlug);
  const order = orderId ? getUnifiedOrderById(orderId) : null;

  const isAllAccess = productSlug === "all-access-pass";
  const isMentorshipPack = productSlug.includes("mentorship");

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "48px 16px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div
        className="pmu-card"
        style={{
          maxWidth: "680px",
          width: "100%",
          padding: "40px 32px",
          textAlign: "center",
          border: isEarlyAdopter
            ? "1px solid rgba(255, 106, 61, 0.4)"
            : "1px solid rgba(74, 222, 128, 0.4)",
          backgroundColor: "#111114",
          boxShadow: "0 24px 48px rgba(0,0,0,0.8)",
        }}
      >
        <div
          style={{
            width: "64px",
            height: "64px",
            borderRadius: "50%",
            backgroundColor: isEarlyAdopter
              ? "rgba(255, 59, 29, 0.15)"
              : "rgba(74, 222, 128, 0.15)",
            color: isEarlyAdopter ? "#ff6a3d" : "#4ade80",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "28px",
            margin: "0 auto 20px",
          }}
        >
          ✓
        </div>

        <span
          className="pmu-badge"
          style={{
            backgroundColor: isEarlyAdopter
              ? "rgba(255, 59, 29, 0.2)"
              : "rgba(74, 222, 128, 0.2)",
            color: isEarlyAdopter ? "#ff6a3d" : "#4ade80",
          }}
        >
          {isEarlyAdopter
            ? `🎉 Early Adopter Claim Confirmed • Seat #${seatNumber || "Active"}`
            : "💳 Payment Verified & Entitlement Provisioned"}
        </span>

        <h1
          className="font-display"
          style={{
            marginTop: "16px",
            fontSize: "clamp(26px, 4vw, 36px)",
            lineHeight: 1.1,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          {product ? product.name : "Enrollment Activated!"}
        </h1>

        <p
          style={{
            marginTop: "12px",
            fontSize: "14.5px",
            lineHeight: 1.6,
            color: "#a19f95",
            maxWidth: "540px",
            margin: "12px auto 0",
          }}
        >
          {isEarlyAdopter ? (
            <>
              Congratulations! You claimed <strong>Early Adopter Seat #{seatNumber}</strong> with a 100% scholarship. Your PrepMeUp All-Access Pass is immediately active for 180 days.
            </>
          ) : isAllAccess ? (
            <>
              Your order has been cryptographically verified. All curriculum tracks (B.Tech CSE AI/ML, Quantum Computing Foundations, and CyberSecurity Foundations) plus 2 complimentary 1-on-1 faculty mentorship sessions are unlocked.
            </>
          ) : isMentorshipPack ? (
            <>
              Your 1-on-1 Mentorship Pack is active. You can now schedule your private 45-minute live faculty session directly on the mentorship portal.
            </>
          ) : (
            <>
              Your enrollment has been successfully provisioned. All curriculum modules, syllabus-grounded AI tutors, interactive labs, and assessments are immediately accessible.
            </>
          )}
        </p>

        {/* Product Access Breakdown */}
        <div
          style={{
            marginTop: "28px",
            padding: "20px",
            backgroundColor: "#17171b",
            borderRadius: "10px",
            border: "1px solid #26262c",
            textAlign: "left",
          }}
        >
          <div
            style={{
              fontSize: "12px",
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.08em",
              color: "#807f78",
              marginBottom: "12px",
            }}
          >
            Included Entitlements &amp; Access Details
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {isAllAccess && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>B.Tech CSE AI/ML Semester 1:</strong> All 6 Foundation Subjects (CSE1001-1006)</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>Quantum Computing Foundations:</strong> 20 lessons + 5 hardware simulations + Certificate</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>CyberSecurity Foundations:</strong> 20 lessons + 5 safe browser labs + CTFs + Certificate</span>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                  <span style={{ color: "#4ade80" }}>✓</span>
                  <span><strong>2 Faculty Mentorship Sessions:</strong> 45-minute live 1-on-1 calls (Valid 180 days)</span>
                </div>
              </>
            )}

            {!isAllAccess && !isMentorshipPack && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                <span style={{ color: "#4ade80" }}>✓</span>
                <span><strong>Track Access:</strong> Full 180-day curriculum access &amp; syllabus AI tutor</span>
              </div>
            )}

            {isMentorshipPack && (
              <div style={{ display: "flex", alignItems: "center", gap: "10px", fontSize: "14px" }}>
                <span style={{ color: "#4ade80" }}>✓</span>
                <span><strong>1:1 Mentorship Session:</strong> 45-minute video call with faculty (Valid 90 days)</span>
              </div>
            )}

            {order && (
              <div
                style={{
                  marginTop: "8px",
                  paddingTop: "8px",
                  borderTop: "1px dashed #2a2a32",
                  fontSize: "12px",
                  color: "#807f78",
                  display: "flex",
                  justifyContent: "space-between",
                }}
              >
                <span>Order Ref: <code>{order.id}</code></span>
                <span>Paid: <strong>₹{(order.amountInPaise / 100).toFixed(0)}</strong></span>
              </div>
            )}
          </div>
        </div>

        {/* Action CTAs */}
        <div
          style={{
            marginTop: "32px",
            display: "flex",
            flexDirection: "column",
            gap: "12px",
          }}
        >
          {isAllAccess ? (
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
              <Link
                href="/prepmeup/tracks/quantum"
                className="pmu-btn-primary"
                style={{ textDecoration: "none", textAlign: "center" }}
              >
                Explore Quantum Track →
              </Link>
              <Link
                href="/prepmeup/tracks/cybersecurity"
                className="pmu-btn-primary"
                style={{
                  textDecoration: "none",
                  textAlign: "center",
                  backgroundColor: "#26262c",
                  borderColor: "#3a3a44",
                }}
              >
                Explore CyberSecurity Track →
              </Link>
            </div>
          ) : (
            <Link
              href="/prepmeup/dashboard"
              className="pmu-btn-primary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Go to Student Dashboard →
            </Link>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
            <Link
              href="/prepmeup/mentorship"
              className="pmu-btn-secondary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              Book 1:1 Mentorship
            </Link>
            <Link
              href="/prepmeup/pricing"
              className="pmu-btn-secondary"
              style={{ textDecoration: "none", textAlign: "center" }}
            >
              View Pricing Catalog
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
