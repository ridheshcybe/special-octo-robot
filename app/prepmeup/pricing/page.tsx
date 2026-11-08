"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

interface PricingProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  productType: "semester_pass" | "mentorship_pack" | "all_access_pass";
  priceInPaise: number;
  priceRupees: number;
  earlyAdopterPriceInPaise?: number;
  currency: string;
  durationDays: number;
  durationLabel: string;
  includedTrackSlugs: string[];
  includedCourseSlugs: string[];
  isEarlyAdopterEligible: boolean;
  mentorshipSessionsIncluded: number;
  features: string[];
  ctaLabel: string;
  owned: boolean;
}

interface EarlyAdopterInfo {
  limit: number;
  claimedCount: number;
  remainingSeats: number;
  isAvailable: boolean;
  alreadyClaimed: boolean;
  redemptionNumber?: number;
}

interface PricingResponse {
  ok: boolean;
  products: PricingProduct[];
  earlyAdopter: EarlyAdopterInfo;
  signedIn: boolean;
  ownedProductSlugs: string[];
}

const ACCENT = "#ff3b1d";
const ACCENT_2 = "#ff6a3d";
const MUTED = "#807f78";

function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function LegalFooter() {
  return (
    <div
      style={{
        marginTop: "48px",
        paddingTop: "24px",
        borderTop: "1px solid #1e1e24",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexWrap: "wrap",
        gap: "12px",
        fontSize: "12px",
        color: MUTED,
      }}
    >
      <div>
        🔒 Secure payments via <strong>Razorpay</strong>. Prices are in INR and include applicable taxes.
      </div>
      <div style={{ display: "flex", gap: "16px", flexWrap: "wrap" }}>
        <Link href="/prepmeup/terms" style={{ color: MUTED, textDecoration: "none" }}>
          Terms of Service
        </Link>
        <Link href="/prepmeup/privacy" style={{ color: MUTED, textDecoration: "none" }}>
          Privacy Policy
        </Link>
        <Link href="/prepmeup/refunds" style={{ color: MUTED, textDecoration: "none" }}>
          Refund Policy
        </Link>
        <Link href="/prepmeup/pricing-policy" style={{ color: MUTED, textDecoration: "none" }}>
          Pricing Policy
        </Link>
      </div>
    </div>
  );
}

function CheckCell({ included }: { included: boolean | string }) {
  if (typeof included === "string") {
    return <span style={{ color: "#f3f1ea", fontSize: "12.5px" }}>{included}</span>;
  }
  return (
    <span style={{ color: included ? "#4ade80" : "#4b4b52", fontWeight: 700 }}>
      {included ? "✓" : "—"}
    </span>
  );
}

export default function PrepMeUpPricingPage() {
  const [data, setData] = useState<PricingResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/prepmeup/checkout", { cache: "no-store" })
      .then((res) => res.json())
      .then((json) => {
        if (!json?.ok) throw new Error(json?.error || "Could not load pricing.");
        setData(json);
      })
      .catch((err) => setError(err?.message || "Could not load pricing."))
      .finally(() => setLoading(false));
  }, []);

  const products = data?.products || [];
  const passes = products.filter((p) => p.productType !== "mentorship_pack");
  const mentorshipPacks = products.filter((p) => p.productType === "mentorship_pack");
  const early = data?.earlyAdopter;
  const allAccess = products.find((p) => p.slug === "prepmeup-all-access-pass");
  const earlyActive = Boolean(
    allAccess?.isEarlyAdopterEligible &&
      early &&
      (early.isAvailable || early.alreadyClaimed)
  );

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        padding: "48px 20px 80px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div style={{ maxWidth: "1180px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px" }}>
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "12.5px",
              color: MUTED,
              fontFamily: "monospace",
            }}
          >
            <Link href="/prepmeup" style={{ color: MUTED, textDecoration: "none" }}>
              PrepMeUp
            </Link>
            <span>/</span>
            <span style={{ color: ACCENT_2 }}>Pricing &amp; Access</span>
          </div>
        </div>

        <div style={{ textAlign: "center", marginBottom: "40px" }}>
          <span className="pmu-badge">🎓 Unified PrepMeUp AI Access</span>
          <h1
            className="font-display"
            style={{
              fontSize: "clamp(34px, 5vw, 54px)",
              lineHeight: 0.98,
              textTransform: "uppercase",
              marginTop: "16px",
            }}
          >
            One platform. Three tracks. Your plan.
          </h1>
          <p
            style={{
              fontSize: "16px",
              color: "#a19f95",
              maxWidth: "720px",
              margin: "14px auto 0",
              lineHeight: 1.6,
            }}
          >
            Buy a single track, or take the All-Access Semester Pass and unlock B.Tech CSE AI/ML
            Semester 1, Quantum Computing Foundations and CyberSecurity Foundations together.
          </p>
        </div>

        {earlyActive && early && (
          <div
            className="pmu-card-highlight"
            style={{
              padding: "24px 28px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "16px",
              border: `1px solid ${ACCENT_2}`,
              backgroundColor: "rgba(255, 59, 29, 0.08)",
            }}
          >
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
                <span className="pmu-badge" style={{ backgroundColor: ACCENT, color: "#08080a" }}>
                  EARLY ADOPTER OFFER
                </span>
                <span className="font-mono" style={{ fontSize: "12px", color: "#4ade80" }}>
                  {early.alreadyClaimed
                    ? `Seat #${early.redemptionNumber} claimed`
                    : `${early.remainingSeats} of ${early.limit} free seats left`}
                </span>
              </div>
              <h3
                className="font-display"
                style={{ fontSize: "22px", textTransform: "uppercase", marginTop: "8px" }}
              >
                First 10 All-Access buyers pay ₹0
              </h3>
              <p style={{ fontSize: "13.5px", color: "#a19f95", marginTop: "4px" }}>
                All three tracks, certificates and one 1-on-1 mentorship session. Claimed
                server-side, one per student.
              </p>
            </div>
            <Link
              href="/prepmeup/checkout/prepmeup-all-access-pass"
              className="pmu-btn-primary"
              style={{ padding: "12px 24px", textDecoration: "none", fontSize: "13px" }}
            >
              {early.alreadyClaimed ? "Open your All-Access pass →" : "Claim free All-Access seat →"}
            </Link>
          </div>
        )}

        {/* INSTANT FREE INTERACTIVE TRIAL PROMOTIONAL CARD */}
        <div
          style={{
            padding: "24px 28px",
            marginBottom: "36px",
            borderRadius: "12px",
            border: "1px solid rgba(74, 222, 128, 0.4)",
            backgroundColor: "rgba(74, 222, 128, 0.06)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
          }}
        >
          <div style={{ maxWidth: "680px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
              <span className="pmu-badge" style={{ backgroundColor: "#22c55e", color: "#08080a", fontWeight: 800 }}>
                ⚡ INSTANT FREE TRIAL
              </span>
              <span className="font-mono" style={{ fontSize: "12px", color: "#4ade80", fontWeight: 700 }}>
                ₹0 • No Credit Card Required
              </span>
            </div>
            <h3
              className="font-display"
              style={{ fontSize: "22px", textTransform: "uppercase", marginTop: "8px", color: "#f3f1ea" }}
            >
              Want to try before buying a pass?
            </h3>
            <p style={{ fontSize: "13.5px", color: "#a19f95", marginTop: "4px", lineHeight: 1.55 }}>
              Test-drive the platform instantly without entering any payment info. Includes 5 free AI doubts/day, interactive circuit &amp; Python loop simulators, and full access to our SGPA/CGPA and rank predictor tools.
            </p>
          </div>
          <Link
            href="/prepmeup#trial"
            className="pmu-btn-primary"
            style={{
              padding: "12px 24px",
              textDecoration: "none",
              fontSize: "13px",
              backgroundColor: "#22c55e",
              color: "#08080a",
              borderColor: "#22c55e",
            }}
          >
            Start Free Interactive Trial →
          </Link>
        </div>

        {loading && (
          <p style={{ color: MUTED, textAlign: "center" }}>Loading plans…</p>
        )}
        {error && (
          <p style={{ color: "#f87171", textAlign: "center", marginBottom: "24px" }}>{error}</p>
        )}

        {!loading && (
          <div
            style={{
              backgroundColor: "#111114",
              border: "1px solid rgba(243, 241, 234, 0.1)",
              borderRadius: "0.75rem",
              overflowX: "auto",
            }}
          >
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "13.5px",
                minWidth: "760px",
              }}
            >
              <thead>
                <tr style={{ color: MUTED, textTransform: "uppercase", fontSize: "11px", letterSpacing: "0.08em" }}>
                  <th style={{ textAlign: "left", padding: "16px 20px" }}>Plan</th>
                  <th style={{ textAlign: "left", padding: "16px 12px" }}>Price</th>
                  <th style={{ textAlign: "left", padding: "16px 12px" }}>Access</th>
                  <th style={{ textAlign: "left", padding: "16px 12px" }}>Duration</th>
                  <th style={{ textAlign: "right", padding: "16px 20px" }}> </th>
                </tr>
              </thead>
              <tbody>
                {passes.map((product) => {
                  const isHighlight = product.slug === "prepmeup-all-access-pass";
                  const showEarlyPrice =
                    product.isEarlyAdopterEligible && earlyActive && !product.owned;
                  return (
                    <tr
                      key={product.slug}
                      style={{
                        borderTop: "1px solid rgba(243, 241, 234, 0.08)",
                        backgroundColor: isHighlight ? "rgba(255, 59, 29, 0.06)" : "transparent",
                      }}
                    >
                      <td style={{ padding: "18px 20px", verticalAlign: "top" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                          <span style={{ fontWeight: 700, color: "#f3f1ea" }}>{product.name}</span>
                          {isHighlight && (
                            <span
                              className="pmu-badge"
                              style={{ backgroundColor: ACCENT, color: "#08080a", fontSize: "10px" }}
                            >
                              Best value
                            </span>
                          )}
                          {product.owned && (
                            <span
                              className="pmu-badge"
                              style={{ backgroundColor: "rgba(74, 222, 128, 0.12)", color: "#4ade80", fontSize: "10px" }}
                            >
                              Active
                            </span>
                          )}
                        </div>
                        <p style={{ fontSize: "12px", color: MUTED, marginTop: "4px", maxWidth: "300px" }}>
                          {product.description}
                        </p>
                      </td>
                      <td style={{ padding: "18px 12px", verticalAlign: "top", whiteSpace: "nowrap" }}>
                        {showEarlyPrice ? (
                          <>
                            <div className="font-display" style={{ fontSize: "26px", color: "#4ade80" }}>
                              ₹0
                            </div>
                            <div
                              className="font-mono"
                              style={{ fontSize: "11px", color: MUTED, textDecoration: "line-through" }}
                            >
                              {rupees(product.priceRupees)}
                            </div>
                            <div className="font-mono" style={{ fontSize: "10px", color: ACCENT_2 }}>
                              Early adopter
                            </div>
                          </>
                        ) : (
                          <span className="font-display" style={{ fontSize: "26px" }}>
                            {rupees(product.priceRupees)}
                          </span>
                        )}
                      </td>
                      <td style={{ padding: "18px 12px", verticalAlign: "top", color: "#c9c6bd", fontSize: "12.5px" }}>
                        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "4px" }}>
                          {product.features.slice(0, 4).map((feature) => (
                            <li key={feature}>• {feature}</li>
                          ))}
                        </ul>
                      </td>
                      <td style={{ padding: "18px 12px", verticalAlign: "top", color: "#c9c6bd", whiteSpace: "nowrap" }}>
                        {product.durationLabel}
                      </td>
                      <td style={{ padding: "18px 20px", verticalAlign: "top", textAlign: "right" }}>
                        {product.owned ? (
                          <Link
                            href="/prepmeup/dashboard"
                            className="pmu-btn-secondary"
                            style={{ textDecoration: "none", padding: "10px 16px", fontSize: "12px" }}
                          >
                            Go to dashboard
                          </Link>
                        ) : (
                          <Link
                            href={`/prepmeup/checkout/${product.slug}`}
                            className={isHighlight ? "pmu-btn-primary" : "pmu-btn-secondary"}
                            style={{
                              textDecoration: "none",
                              padding: "10px 16px",
                              fontSize: "12px",
                              whiteSpace: "nowrap",
                            }}
                          >
                            {product.ctaLabel} →
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {!loading && (
          <div style={{ marginTop: "36px" }}>
            <h2
              className="font-display"
              style={{ fontSize: "26px", textTransform: "uppercase", marginBottom: "14px" }}
            >
              What each plan includes
            </h2>
            <div
              style={{
                backgroundColor: "#111114",
                border: "1px solid rgba(243, 241, 234, 0.1)",
                borderRadius: "0.75rem",
                overflowX: "auto",
              }}
            >
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "13px",
                  minWidth: "680px",
                }}
              >
                <thead>
                  <tr style={{ color: MUTED, textTransform: "uppercase", fontSize: "11px" }}>
                    <th style={{ textAlign: "left", padding: "14px 20px" }}>Feature</th>
                    <th style={{ padding: "14px 12px" }}>B.Tech</th>
                    <th style={{ padding: "14px 12px" }}>Quantum</th>
                    <th style={{ padding: "14px 12px" }}>CyberSecurity</th>
                    <th style={{ padding: "14px 12px", color: ACCENT_2 }}>All-Access</th>
                  </tr>
                </thead>
                <tbody>
                  {[
                    ["B.Tech CSE AI/ML Semester 1", true, false, false, true],
                    ["Quantum Computing Foundations", false, true, false, true],
                    ["CyberSecurity Foundations", false, false, true, true],
                    ["1-on-1 mentorship session", false, "1 included", "1 included", "1 included"],
                    ["Certificate eligibility", "B.Tech", "Quantum", "CyberSecurity", "All three"],
                    ["Access duration", "Semester", "6 months", "6 months", "6 months"],
                  ].map((row) => (
                    <tr
                      key={String(row[0])}
                      style={{ borderTop: "1px solid rgba(243, 241, 234, 0.08)" }}
                    >
                      <td style={{ padding: "12px 20px", color: "#f3f1ea" }}>{row[0]}</td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <CheckCell included={row[1] as boolean | string} />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <CheckCell included={row[2] as boolean | string} />
                      </td>
                      <td style={{ padding: "12px", textAlign: "center" }}>
                        <CheckCell included={row[3] as boolean | string} />
                      </td>
                      <td
                        style={{
                          padding: "12px",
                          textAlign: "center",
                          backgroundColor: "rgba(255, 59, 29, 0.06)",
                        }}
                      >
                        <CheckCell included={row[4] as boolean | string} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p style={{ fontSize: "12px", color: MUTED, marginTop: "10px" }}>
              All-Access covers only the tracks listed on the product at the time of purchase.
              Future tracks are not included automatically.
            </p>
          </div>
        )}

        {!loading && mentorshipPacks.length > 0 && (
          <div style={{ marginTop: "40px" }}>
            <h2
              className="font-display"
              style={{ fontSize: "26px", textTransform: "uppercase", marginBottom: "6px" }}
            >
              Mentorship packs
            </h2>
            <p style={{ fontSize: "13px", color: MUTED, marginBottom: "18px" }}>
              One private 45-minute session with faculty. Credits are valid for 90 days and are
              refunded if you cancel before the session is completed.
            </p>
            <div className="pmu-grid-3">
              {mentorshipPacks.map((product) => (
                <div key={product.slug} className="pmu-card" style={{ padding: "26px 22px", gap: "18px" }}>
                  <div>
                    <span className="pmu-badge">1-on-1 Coaching</span>
                    <h3
                      className="font-display"
                      style={{ fontSize: "22px", textTransform: "uppercase", marginTop: "10px" }}
                    >
                      {product.name}
                    </h3>
                    <div style={{ display: "flex", alignItems: "baseline", gap: "6px", marginTop: "10px" }}>
                      <span className="font-display" style={{ fontSize: "32px" }}>
                        {rupees(product.priceRupees)}
                      </span>
                      <span className="font-mono" style={{ fontSize: "11px", color: MUTED }}>
                        / 90 days
                      </span>
                    </div>
                    <ul
                      style={{
                        marginTop: "14px",
                        listStyle: "none",
                        padding: 0,
                        display: "grid",
                        gap: "8px",
                        fontSize: "12.5px",
                        color: "#c9c6bd",
                      }}
                    >
                      {product.features.map((feature) => (
                        <li key={feature} style={{ display: "flex", gap: "8px" }}>
                          <span style={{ color: "#4ade80" }}>✓</span>
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href={`/prepmeup/checkout/${product.slug}`}
                    className="pmu-btn-secondary"
                    style={{ textAlign: "center", textDecoration: "none", fontSize: "12px" }}
                  >
                    {product.ctaLabel} →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "36px", fontSize: "12.5px", color: MUTED, textAlign: "center" }}>
          Questions about a plan?{" "}
          <Link href="/prepmeup/contact" style={{ color: ACCENT_2, textDecoration: "none" }}>
            Talk to the PrepMeUp team
          </Link>
          .
        </div>

        <LegalFooter />
      </div>
    </main>
  );
}
