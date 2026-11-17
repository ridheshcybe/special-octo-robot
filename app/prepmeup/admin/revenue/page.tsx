"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { InteractiveWaitLoader } from "@/app/prepmeup/_components/InteractiveWaitLoader";

interface RevenueSummary {
  totalRevenueRupees: number;
  totalOrders: number;
  paidOrders: number;
  capturedPayments: number;
  refundedCount: number;
  earlyAdopterClaims: number;
  activeAllAccessEntitlements: number;
  expiredEntitlements: number;
  revenueByProduct: Record<string, number>;
  revenueByTrack: Record<string, number>;
}

export default function AdminUnifiedRevenuePage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "entitlements" | "earlyAdopters" | "products">("orders");
  const [searchQuery, setSearchQuery] = useState("");
  
  // Modals
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantDays, setGrantDays] = useState(180);

  const [showMentorshipModal, setShowMentorshipModal] = useState(false);
  const [mentorshipUserId, setMentorshipUserId] = useState("");
  const [mentorshipSessions, setMentorshipSessions] = useState(2);
  const [mentorshipDays, setMentorshipDays] = useState(180);

  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/prepmeup/admin/revenue");
      const d = await res.json();
      if (res.ok && d.ok) {
        setData(d);
      } else {
        setErrorMsg(d.error || "Failed to load revenue and order data.");
      }
    } catch (err: any) {
      setErrorMsg(err.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleGrantAllAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserId.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_all_access",
          userId: grantUserId.trim(),
          durationDays: grantDays,
        }),
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setShowGrantModal(false);
        setGrantUserId("");
        fetchData();
      } else {
        alert(d.error || "Failed to grant All-Access pass.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleGrantMentorship = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!mentorshipUserId.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_mentorship",
          userId: mentorshipUserId.trim(),
          totalSessions: mentorshipSessions,
          durationDays: mentorshipDays,
        }),
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setShowMentorshipModal(false);
        setMentorshipUserId("");
        fetchData();
      } else {
        alert(d.error || "Failed to grant mentorship pack.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevokeEntitlement = async (entitlementId: string) => {
    if (!confirm("Are you sure you want to revoke this All-Access Pass?")) return;
    try {
      const res = await fetch("/api/prepmeup/admin/revenue", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_all_access", entitlementId }),
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        fetchData();
      } else {
        alert(d.error || "Failed to revoke entitlement.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#08080a", color: "#f3f1ea", padding: "40px" }}>
        <InteractiveWaitLoader title="Aggregating PrepMeUp Unified Revenue & Entitlements..." />
      </main>
    );
  }

  if (errorMsg) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#08080a", color: "#f3f1ea", padding: "40px" }}>
        <div className="pmu-card" style={{ maxWidth: "600px", margin: "40px auto", borderColor: "#ef4444" }}>
          <h2 style={{ color: "#ef4444", marginBottom: "12px" }}>Access Error</h2>
          <p style={{ color: "#807f78", marginBottom: "20px" }}>{errorMsg}</p>
          <Link href="/prepmeup/admin" className="pmu-btn-primary" style={{ textDecoration: "none" }}>
            Return to Admin Dashboard
          </Link>
        </div>
      </main>
    );
  }

  const summary: RevenueSummary = data.summary;
  const orders = data.orders || [];
  const payments = data.payments || [];
  const entitlements = data.entitlements || [];
  const redemptions = data.redemptions || [];
  const products = data.products || [];

  const filteredOrders = orders.filter((o: any) => {
    const q = searchQuery.toLowerCase();
    return (
      o.id?.toLowerCase().includes(q) ||
      o.userId?.toLowerCase().includes(q) ||
      o.productSlug?.toLowerCase().includes(q) ||
      o.razorpayOrderId?.toLowerCase().includes(q)
    );
  });

  const filteredEntitlements = entitlements.filter((e: any) => {
    const q = searchQuery.toLowerCase();
    return e.userId?.toLowerCase().includes(q) || e.id?.toLowerCase().includes(q);
  });

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        padding: "32px 24px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
        {/* Top Navigation */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "16px",
            marginBottom: "28px",
            borderBottom: "1px solid #1f1f23",
            paddingBottom: "18px",
          }}
        >
          <div>
            <div style={{ fontSize: "12px", color: "#807f78", marginBottom: "4px", display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
              <Link href="/prepmeup/admin" style={{ color: "#807f78", textDecoration: "none" }}>
                Admin Portal
              </Link>
              <span>/</span>
              <span style={{ color: "#f3f1ea" }}>Unified Revenue</span>
              <span>•</span>
              <Link href="/prepmeup/admin/quantum-payments" style={{ color: "#60a5fa", textDecoration: "none" }}>
                Quantum Ledger
              </Link>
              <span>•</span>
              <Link href="/prepmeup/admin/cyber-payments" style={{ color: "#34d399", textDecoration: "none" }}>
                Cyber Ledger
              </Link>
            </div>
            <h1
              className="font-display"
              style={{
                fontSize: "clamp(24px, 3.5vw, 32px)",
                letterSpacing: "0.02em",
                textTransform: "uppercase",
                margin: 0,
              }}
            >
              Unified Revenue &amp; All-Access Admin
            </h1>
          </div>

          <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
            <button
              onClick={() => setShowGrantModal(true)}
              className="pmu-btn-primary"
              style={{ fontSize: "13px", padding: "8px 14px", backgroundColor: "#ff3b1d" }}
            >
              + Grant All-Access Pass
            </button>
            <button
              onClick={() => setShowMentorshipModal(true)}
              className="pmu-btn-secondary"
              style={{ fontSize: "13px", padding: "8px 14px" }}
            >
              + Grant Mentorship Pack
            </button>
            <Link
              href="/prepmeup/pricing"
              className="pmu-btn-secondary"
              style={{ fontSize: "13px", padding: "8px 14px", textDecoration: "none" }}
              target="_blank"
            >
              View Public Pricing ↗
            </Link>
          </div>
        </div>

        {/* Financial KPI Metric Cards */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(210px, 1fr))",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div className="pmu-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "12px", color: "#807f78", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Gross Revenue
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#4ade80", marginTop: "6px" }}>
              ₹{summary.totalRevenueRupees.toLocaleString("en-IN")}
            </div>
            <div style={{ fontSize: "12px", color: "#807f78", marginTop: "4px" }}>
              {summary.capturedPayments} captured payments
            </div>
          </div>

          <div className="pmu-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "12px", color: "#807f78", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Unified Orders
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#f3f1ea", marginTop: "6px" }}>
              {summary.totalOrders}
            </div>
            <div style={{ fontSize: "12px", color: "#807f78", marginTop: "4px" }}>
              {summary.paidOrders} successfully paid ({summary.totalOrders > 0 ? Math.round((summary.paidOrders / summary.totalOrders) * 100) : 0}% conv.)
            </div>
          </div>

          <div className="pmu-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "12px", color: "#807f78", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Active All-Access Passes
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#ff6a3d", marginTop: "6px" }}>
              {summary.activeAllAccessEntitlements}
            </div>
            <div style={{ fontSize: "12px", color: "#807f78", marginTop: "4px" }}>
              {summary.expiredEntitlements} expired / revoked
            </div>
          </div>

          <div className="pmu-card" style={{ padding: "18px" }}>
            <div style={{ fontSize: "12px", color: "#807f78", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Early Adopter Claims
            </div>
            <div style={{ fontSize: "32px", fontWeight: 800, color: "#fbbf24", marginTop: "6px" }}>
              {summary.earlyAdopterClaims} <span style={{ fontSize: "18px", color: "#807f78" }}>/ 10</span>
            </div>
            <div style={{ fontSize: "12px", color: "#807f78", marginTop: "4px" }}>
              {Math.max(0, 10 - summary.earlyAdopterClaims)} scholarship seats remaining
            </div>
          </div>
        </div>

        {/* Revenue Breakdown by Track */}
        <div
          className="pmu-card"
          style={{
            padding: "20px",
            marginBottom: "32px",
            backgroundColor: "#111114",
          }}
        >
          <div style={{ fontSize: "13px", fontWeight: 700, color: "#807f78", textTransform: "uppercase", marginBottom: "14px", letterSpacing: "0.05em" }}>
            Revenue Breakdown by Curriculum Track
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "14px",
            }}
          >
            <div style={{ padding: "14px", backgroundColor: "#17171b", borderRadius: "8px", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "12px", color: "#807f78" }}>🌟 PrepMeUp All-Access</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#ff6a3d", marginTop: "4px" }}>
                ₹{(summary.revenueByTrack?.all_access || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div style={{ padding: "14px", backgroundColor: "#17171b", borderRadius: "8px", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "12px", color: "#807f78" }}>⚛️ Quantum Track</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#60a5fa", marginTop: "4px" }}>
                ₹{(summary.revenueByTrack?.quantum || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div style={{ padding: "14px", backgroundColor: "#17171b", borderRadius: "8px", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "12px", color: "#807f78" }}>🛡️ CyberSecurity Track</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#34d399", marginTop: "4px" }}>
                ₹{(summary.revenueByTrack?.cybersecurity || 0).toLocaleString("en-IN")}
              </div>
            </div>
            <div style={{ padding: "14px", backgroundColor: "#17171b", borderRadius: "8px", border: "1px solid #26262c" }}>
              <div style={{ fontSize: "12px", color: "#807f78" }}>⚡ B.Tech CSE AI/ML</div>
              <div style={{ fontSize: "22px", fontWeight: 700, color: "#f3f1ea", marginTop: "4px" }}>
                ₹{(summary.revenueByTrack?.btech || 0).toLocaleString("en-IN")}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div style={{ display: "flex", gap: "8px", borderBottom: "1px solid #26262c", marginBottom: "20px" }}>
          {[
            { key: "orders", label: `Orders & Payments (${orders.length})` },
            { key: "entitlements", label: `All-Access Entitlements (${entitlements.length})` },
            { key: "earlyAdopters", label: `Early Adopter Redemptions (${redemptions.length})` },
            { key: "products", label: `Unified Products (${products.length})` },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              style={{
                padding: "10px 18px",
                backgroundColor: "transparent",
                border: "none",
                borderBottom: activeTab === tab.key ? "2px solid #ff3b1d" : "2px solid transparent",
                color: activeTab === tab.key ? "#f3f1ea" : "#807f78",
                fontWeight: activeTab === tab.key ? 700 : 500,
                fontSize: "14px",
                cursor: "pointer",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search Bar for tabular views */}
        <div style={{ marginBottom: "18px" }}>
          <input
            type="text"
            placeholder="Search by User ID, Order ID, or Product..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: "100%",
              maxWidth: "400px",
              padding: "10px 14px",
              backgroundColor: "#111114",
              border: "1px solid #26262c",
              borderRadius: "6px",
              color: "#f3f1ea",
              fontSize: "13.5px",
            }}
          />
        </div>

        {/* Tab 1: Orders & Payments */}
        {activeTab === "orders" && (
          <div className="pmu-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#17171b", borderBottom: "1px solid #26262c", color: "#807f78" }}>
                    <th style={{ padding: "12px 16px" }}>Order ID</th>
                    <th style={{ padding: "12px 16px" }}>User Target</th>
                    <th style={{ padding: "12px 16px" }}>Product</th>
                    <th style={{ padding: "12px 16px" }}>Amount</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Created</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} style={{ padding: "32px", textAlign: "center", color: "#807f78" }}>
                        No orders recorded yet.
                      </td>
                    </tr>
                  ) : (
                    filteredOrders.map((o: any) => (
                      <tr key={o.id} style={{ borderBottom: "1px solid #1f1f23" }}>
                        <td style={{ padding: "12px 16px", fontFamily: "monospace", color: "#ff6a3d" }}>
                          {o.id}
                        </td>
                        <td style={{ padding: "12px 16px" }}>{o.userId}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span className="pmu-badge" style={{ backgroundColor: "#1f1f26", color: "#f3f1ea" }}>
                            {o.productSlug}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontWeight: 700 }}>
                          ₹{(o.amount / 100).toFixed(0)}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            className="pmu-badge"
                            style={{
                              backgroundColor:
                                o.status === "paid"
                                  ? "rgba(74, 222, 128, 0.15)"
                                  : o.status === "failed"
                                  ? "rgba(239, 68, 68, 0.15)"
                                  : "rgba(251, 191, 36, 0.15)",
                              color:
                                o.status === "paid"
                                  ? "#4ade80"
                                  : o.status === "failed"
                                  ? "#ef4444"
                                  : "#fbbf24",
                            }}
                          >
                            {o.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", color: "#807f78", fontSize: "12px" }}>
                          {new Date(o.createdAt).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 2: All-Access Entitlements */}
        {activeTab === "entitlements" && (
          <div className="pmu-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#17171b", borderBottom: "1px solid #26262c", color: "#807f78" }}>
                    <th style={{ padding: "12px 16px" }}>User ID</th>
                    <th style={{ padding: "12px 16px" }}>Product</th>
                    <th style={{ padding: "12px 16px" }}>Included Courses</th>
                    <th style={{ padding: "12px 16px" }}>Granted</th>
                    <th style={{ padding: "12px 16px" }}>Expires</th>
                    <th style={{ padding: "12px 16px" }}>Status</th>
                    <th style={{ padding: "12px 16px" }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredEntitlements.length === 0 ? (
                    <tr>
                      <td colSpan={7} style={{ padding: "32px", textAlign: "center", color: "#807f78" }}>
                        No All-Access entitlements found.
                      </td>
                    </tr>
                  ) : (
                    filteredEntitlements.map((e: any) => (
                      <tr key={e.id} style={{ borderBottom: "1px solid #1f1f23" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{e.userId}</td>
                        <td style={{ padding: "12px 16px", color: "#807f78" }}>{e.productSlug}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <div style={{ display: "flex", gap: "4px", flexWrap: "wrap" }}>
                            {e.includedCourseIds?.map((cid: string) => (
                              <span
                                key={cid}
                                className="pmu-badge"
                                style={{ fontSize: "11px", backgroundColor: "#1f1f26" }}
                              >
                                {cid.replace("-foundations", "").replace("-ethical-hacking-soc-ctf", "")}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#807f78" }}>
                          {new Date(e.startsAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#807f78" }}>
                          {new Date(e.expiresAt).toLocaleDateString()}
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          <span
                            className="pmu-badge"
                            style={{
                              backgroundColor:
                                e.status === "active"
                                  ? "rgba(74, 222, 128, 0.15)"
                                  : "rgba(239, 68, 68, 0.15)",
                              color: e.status === "active" ? "#4ade80" : "#ef4444",
                            }}
                          >
                            {e.status}
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px" }}>
                          {e.status === "active" ? (
                            <button
                              onClick={() => handleRevokeEntitlement(e.id)}
                              style={{
                                padding: "4px 8px",
                                fontSize: "11px",
                                backgroundColor: "rgba(239, 68, 68, 0.15)",
                                color: "#ef4444",
                                border: "1px solid rgba(239, 68, 68, 0.3)",
                                borderRadius: "4px",
                                cursor: "pointer",
                              }}
                            >
                              Revoke
                            </button>
                          ) : (
                            <span style={{ fontSize: "12px", color: "#807f78" }}>—</span>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Early Adopter Redemptions */}
        {activeTab === "earlyAdopters" && (
          <div className="pmu-card" style={{ padding: 0, overflow: "hidden" }}>
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left" }}>
                <thead>
                  <tr style={{ backgroundColor: "#17171b", borderBottom: "1px solid #26262c", color: "#807f78" }}>
                    <th style={{ padding: "12px 16px" }}>Seat #</th>
                    <th style={{ padding: "12px 16px" }}>User ID</th>
                    <th style={{ padding: "12px 16px" }}>Product</th>
                    <th style={{ padding: "12px 16px" }}>Claimed At</th>
                  </tr>
                </thead>
                <tbody>
                  {redemptions.length === 0 ? (
                    <tr>
                      <td colSpan={4} style={{ padding: "32px", textAlign: "center", color: "#807f78" }}>
                        No early adopter claims recorded.
                      </td>
                    </tr>
                  ) : (
                    redemptions.map((r: any) => (
                      <tr key={r.id} style={{ borderBottom: "1px solid #1f1f23" }}>
                        <td style={{ padding: "12px 16px", fontWeight: 700, color: "#fbbf24" }}>
                          Seat #{r.seatNumber}
                        </td>
                        <td style={{ padding: "12px 16px" }}>{r.userId}</td>
                        <td style={{ padding: "12px 16px", color: "#807f78" }}>{r.productSlug}</td>
                        <td style={{ padding: "12px 16px", fontSize: "12px", color: "#807f78" }}>
                          {new Date(r.claimedAt).toLocaleString("en-IN")}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: Unified Products */}
        {activeTab === "products" && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px" }}>
            {products.map((p: any) => (
              <div key={p.slug} className="pmu-card" style={{ padding: "20px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: 700, margin: 0 }}>{p.name}</h3>
                  <span className="pmu-badge" style={{ backgroundColor: "rgba(74, 222, 128, 0.15)", color: "#4ade80" }}>
                    ₹{(p.priceInPaise / 100).toFixed(0)}
                  </span>
                </div>
                <p style={{ fontSize: "13px", color: "#807f78", margin: "10px 0" }}>{p.description}</p>
                <div style={{ fontSize: "12px", color: "#a19f95", marginTop: "12px" }}>
                  <div><strong>Validity:</strong> {p.durationDays} days</div>
                  <div><strong>Type:</strong> {p.productType}</div>
                  <div><strong>Slug:</strong> <code>{p.slug}</code></div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal: Grant All-Access Pass */}
      {showGrantModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div className="pmu-card" style={{ maxWidth: "480px", width: "100%", padding: "28px", backgroundColor: "#111114" }}>
            <h2 className="font-display" style={{ fontSize: "20px", marginBottom: "16px" }}>
              Grant Manual All-Access Pass
            </h2>
            <form onSubmit={handleGrantAllAccess}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12.5px", color: "#807f78", marginBottom: "6px" }}>
                  Student Phone / Email / User Target:
                </label>
                <input
                  type="text"
                  required
                  placeholder="+919876543210 or student@college.edu"
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#17171b",
                    border: "1px solid #26262c",
                    borderRadius: "6px",
                    color: "#f3f1ea",
                  }}
                />
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12.5px", color: "#807f78", marginBottom: "6px" }}>
                  Pass Duration:
                </label>
                <select
                  value={grantDays}
                  onChange={(e) => setGrantDays(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#17171b",
                    border: "1px solid #26262c",
                    borderRadius: "6px",
                    color: "#f3f1ea",
                  }}
                >
                  <option value={180}>6 Months (180 days - Standard Semester)</option>
                  <option value={365}>1 Full Year (365 days)</option>
                  <option value={30}>1 Month Trial (30 days)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="pmu-btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="pmu-btn-primary"
                  style={{ padding: "8px 14px", fontSize: "13px" }}
                >
                  {actionLoading ? "Provisioning..." : "Provision All-Access Pass"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Grant Mentorship Pack */}
      {showMentorshipModal && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "20px",
            zIndex: 1000,
          }}
        >
          <div className="pmu-card" style={{ maxWidth: "480px", width: "100%", padding: "28px", backgroundColor: "#111114" }}>
            <h2 className="font-display" style={{ fontSize: "20px", marginBottom: "16px" }}>
              Grant All-Access Mentorship Pack
            </h2>
            <form onSubmit={handleGrantMentorship}>
              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12.5px", color: "#807f78", marginBottom: "6px" }}>
                  Student Phone / Email / User Target:
                </label>
                <input
                  type="text"
                  required
                  placeholder="+919876543210 or student@college.edu"
                  value={mentorshipUserId}
                  onChange={(e) => setMentorshipUserId(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#17171b",
                    border: "1px solid #26262c",
                    borderRadius: "6px",
                    color: "#f3f1ea",
                  }}
                />
              </div>

              <div style={{ marginBottom: "14px" }}>
                <label style={{ display: "block", fontSize: "12.5px", color: "#807f78", marginBottom: "6px" }}>
                  Total Sessions (45 min each):
                </label>
                <select
                  value={mentorshipSessions}
                  onChange={(e) => setMentorshipSessions(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#17171b",
                    border: "1px solid #26262c",
                    borderRadius: "6px",
                    color: "#f3f1ea",
                  }}
                >
                  <option value={1}>1 Mentorship Session</option>
                  <option value={2}>2 Mentorship Sessions (Complimentary bundle)</option>
                  <option value={5}>5 Mentorship Sessions</option>
                </select>
              </div>

              <div style={{ marginBottom: "20px" }}>
                <label style={{ display: "block", fontSize: "12.5px", color: "#807f78", marginBottom: "6px" }}>
                  Pack Validity:
                </label>
                <select
                  value={mentorshipDays}
                  onChange={(e) => setMentorshipDays(Number(e.target.value))}
                  style={{
                    width: "100%",
                    padding: "10px",
                    backgroundColor: "#17171b",
                    border: "1px solid #26262c",
                    borderRadius: "6px",
                    color: "#f3f1ea",
                  }}
                >
                  <option value={90}>90 Days (3 Months)</option>
                  <option value={180}>180 Days (6 Months)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => setShowMentorshipModal(false)}
                  className="pmu-btn-secondary"
                  style={{ padding: "8px 14px", fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="pmu-btn-primary"
                  style={{ padding: "8px 14px", fontSize: "13px" }}
                >
                  {actionLoading ? "Granting..." : "Grant Mentorship Pack"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
