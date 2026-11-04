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
  activeEnrollments: number;
  expiredEnrollments: number;
}

export default function AdminCyberPaymentsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"orders" | "enrollments" | "packs">("orders");
  const [searchQuery, setSearchQuery] = useState("");
  const [showGrantModal, setShowGrantModal] = useState(false);
  const [grantUserId, setGrantUserId] = useState("");
  const [grantMonths, setGrantMonths] = useState(6);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/prepmeup/admin/cyber-payments");
      const d = await res.json();
      if (res.ok && d.ok) {
        setData(d);
      } else {
        setErrorMsg(d.error || "Failed to load payment records.");
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

  const handleGrantAccess = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!grantUserId.trim()) return;

    setActionLoading(true);
    try {
      const res = await fetch("/api/prepmeup/admin/cyber-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "grant_access",
          userId: grantUserId.trim(),
          months: grantMonths,
        }),
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        setShowGrantModal(false);
        setGrantUserId("");
        fetchData();
      } else {
        alert(d.error || "Failed to grant access.");
      }
    } catch (err: any) {
      alert(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRevoke = async (enrollmentId: string) => {
    if (!confirm("Are you sure you want to revoke this CyberSecurity enrollment?")) return;
    try {
      const res = await fetch("/api/prepmeup/admin/cyber-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "revoke_access", enrollmentId }),
      });
      const d = await res.json();
      if (res.ok && d.ok) {
        fetchData();
      } else {
        alert(d.error || "Failed to revoke enrollment.");
      }
    } catch (err: any) {
      alert(err.message);
    }
  };

  if (loading) {
    return (
      <InteractiveWaitLoader
        title="Loading CyberSecurity Financial Records…"
        subtitle="Gathering Razorpay transaction logs, enrollments, and entitlement quotas."
      />
    );
  }

  const summary: RevenueSummary = data?.revenueSummary || {
    totalRevenueRupees: 0,
    totalOrders: 0,
    paidOrders: 0,
    capturedPayments: 0,
    refundedCount: 0,
    earlyAdopterClaims: 0,
    activeEnrollments: 0,
    expiredEnrollments: 0,
  };

  const orders = (data?.orders || []).filter((o: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (o.id && o.id.toLowerCase().includes(q)) ||
      (o.userId && o.userId.toLowerCase().includes(q)) ||
      (o.razorpayOrderId && o.razorpayOrderId.toLowerCase().includes(q)) ||
      (o.productType && o.productType.toLowerCase().includes(q)) ||
      (o.status && o.status.toLowerCase().includes(q))
    );
  });

  const enrollments = (data?.enrollments || []).filter((e: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (e.id && e.id.toLowerCase().includes(q)) ||
      (e.userId && e.userId.toLowerCase().includes(q)) ||
      (e.accessType && e.accessType.toLowerCase().includes(q)) ||
      (e.status && e.status.toLowerCase().includes(q))
    );
  });

  const packs = (data?.mentorshipPacks || []).filter((p: any) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      (p.id && p.id.toLowerCase().includes(q)) ||
      (p.userId && p.userId.toLowerCase().includes(q)) ||
      (p.status && p.status.toLowerCase().includes(q))
    );
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
      {/* Top Banner */}
      <div className="pmu-card" style={{ padding: "26px 28px" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            flexWrap: "wrap",
            gap: "12px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span className="pmu-badge">🛡️ CyberSecurity Commercial Tooling</span>
            <span className="font-mono" style={{ fontSize: "11px", color: "#4ade80" }}>
              ✓ Razorpay Cyber Gateway Active
            </span>
          </div>

          <div style={{ display: "flex", gap: "10px" }}>
            <Link href="/prepmeup/admin" className="pmu-btn-secondary" style={{ fontSize: "12px" }}>
              ← Admin Dashboard
            </Link>
            <button
              type="button"
              onClick={() => setShowGrantModal(true)}
              className="pmu-btn-primary"
              style={{ fontSize: "12px", padding: "8px 14px" }}
            >
              + Grant Manual Access
            </button>
          </div>
        </div>

        <h1
          className="font-display"
          style={{
            marginTop: "14px",
            fontSize: "clamp(26px, 4vw, 38px)",
            lineHeight: 1,
            textTransform: "uppercase",
            color: "#f3f1ea",
          }}
        >
          CyberSecurity Revenue, Orders &amp; Entitlements
        </h1>
        <p
          style={{
            marginTop: "6px",
            maxWidth: "680px",
            fontSize: "13.5px",
            lineHeight: 1.6,
            color: "#a19f95",
          }}
        >
          Monitor Razorpay transaction volume, review order status, inspect active defensive lab enrollments, and manage early-adopter quotas.
        </p>
      </div>

      {errorMsg && (
        <div
          role="alert"
          style={{
            padding: "14px",
            borderRadius: "8px",
            backgroundColor: "rgba(239, 68, 68, 0.15)",
            border: "1px solid rgba(239, 68, 68, 0.4)",
            color: "#fca5a5",
            fontSize: "13px",
          }}
        >
          ⚠️ {errorMsg}
        </div>
      )}

      {/* KPI Cards */}
      <div className="pmu-grid-4">
        <div className="pmu-card" style={{ padding: "20px" }}>
          <span
            className="font-mono"
            style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}
          >
            Total Revenue
          </span>
          <div
            className="font-display"
            style={{ fontSize: "36px", lineHeight: 1, color: "#4ade80", marginTop: "8px" }}
          >
            ₹{summary.totalRevenueRupees}
          </div>
          <span
            className="font-mono"
            style={{ fontSize: "11px", color: "#a19f95", marginTop: "6px", display: "block" }}
          >
            {summary.capturedPayments} Captured Payment{summary.capturedPayments === 1 ? "" : "s"}
          </span>
        </div>

        <div className="pmu-card" style={{ padding: "20px" }}>
          <span
            className="font-mono"
            style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}
          >
            Paid Orders
          </span>
          <div
            className="font-display"
            style={{ fontSize: "36px", lineHeight: 1, color: "#ff6a3d", marginTop: "8px" }}
          >
            {summary.paidOrders} / {summary.totalOrders}
          </div>
          <span
            className="font-mono"
            style={{ fontSize: "11px", color: "#a19f95", marginTop: "6px", display: "block" }}
          >
            {summary.refundedCount} Refunded
          </span>
        </div>

        <div className="pmu-card" style={{ padding: "20px" }}>
          <span
            className="font-mono"
            style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}
          >
            Active Enrollments
          </span>
          <div
            className="font-display"
            style={{ fontSize: "36px", lineHeight: 1, color: "#f3f1ea", marginTop: "8px" }}
          >
            {summary.activeEnrollments}
          </div>
          <span
            className="font-mono"
            style={{ fontSize: "11px", color: "#a19f95", marginTop: "6px", display: "block" }}
          >
            {summary.expiredEnrollments} Expired / Revoked
          </span>
        </div>

        <div className="pmu-card" style={{ padding: "20px" }}>
          <span
            className="font-mono"
            style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}
          >
            Early Adopter Seats
          </span>
          <div
            className="font-display"
            style={{ fontSize: "36px", lineHeight: 1, color: "#60a5fa", marginTop: "8px" }}
          >
            {summary.earlyAdopterClaims} / 10
          </div>
          <span
            className="font-mono"
            style={{ fontSize: "11px", color: "#a19f95", marginTop: "6px", display: "block" }}
          >
            {Math.max(0, 10 - summary.earlyAdopterClaims)} Seats Remaining
          </span>
        </div>
      </div>

      {/* Tabs & Search */}
      <div
        className="pmu-card"
        style={{
          padding: "16px 20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          flexWrap: "wrap",
          gap: "12px",
        }}
      >
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            type="button"
            onClick={() => setActiveTab("orders")}
            className="font-mono"
            style={{
              padding: "6px 12px",
              fontSize: "11.5px",
              fontWeight: 700,
              borderRadius: "4px",
              border: activeTab === "orders" ? "1px solid #ff3b1d" : "1px solid #26262c",
              backgroundColor: activeTab === "orders" ? "rgba(255, 59, 29, 0.15)" : "#08080a",
              color: activeTab === "orders" ? "#ff6a3d" : "#807f78",
              cursor: "pointer",
            }}
          >
            Orders &amp; Payments ({orders.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("enrollments")}
            className="font-mono"
            style={{
              padding: "6px 12px",
              fontSize: "11.5px",
              fontWeight: 700,
              borderRadius: "4px",
              border: activeTab === "enrollments" ? "1px solid #ff3b1d" : "1px solid #26262c",
              backgroundColor: activeTab === "enrollments" ? "rgba(255, 59, 29, 0.15)" : "#08080a",
              color: activeTab === "enrollments" ? "#ff6a3d" : "#807f78",
              cursor: "pointer",
            }}
          >
            Course Enrollments ({enrollments.length})
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("packs")}
            className="font-mono"
            style={{
              padding: "6px 12px",
              fontSize: "11.5px",
              fontWeight: 700,
              borderRadius: "4px",
              border: activeTab === "packs" ? "1px solid #ff3b1d" : "1px solid #26262c",
              backgroundColor: activeTab === "packs" ? "rgba(255, 59, 29, 0.15)" : "#08080a",
              color: activeTab === "packs" ? "#ff6a3d" : "#807f78",
              cursor: "pointer",
            }}
          >
            Mentorship Packs ({packs.length})
          </button>
        </div>

        <input
          type="text"
          placeholder="Filter by user, order ID, or status…"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pmu-input"
          style={{ width: "280px", padding: "6px 12px", fontSize: "12px" }}
        />
      </div>

      {/* Tab Content */}
      <div className="pmu-card" style={{ padding: "20px 24px", overflowX: "auto" }}>
        {activeTab === "orders" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #26262c",
                  textAlign: "left",
                  color: "#807f78",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
              >
                <th style={{ padding: "10px" }}>Order ID</th>
                <th style={{ padding: "10px" }}>User</th>
                <th style={{ padding: "10px" }}>Product</th>
                <th style={{ padding: "10px" }}>Amount</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#807f78" }}>
                    No orders match your filter.
                  </td>
                </tr>
              ) : (
                orders.map((o: any) => (
                  <tr key={o.id} style={{ borderBottom: "1px solid #1a1a20" }}>
                    <td style={{ padding: "12px 10px", fontFamily: "monospace", color: "#f3f1ea" }}>
                      {o.razorpayOrderId}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#a19f95" }}>{o.userId}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span className="pmu-badge" style={{ fontSize: "10px" }}>
                        {o.productType?.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px", fontWeight: 700, color: "#ff6a3d" }}>
                      ₹{Math.round((o.amountInPaise || 0) / 100)}
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color:
                            o.status === "paid"
                              ? "#4ade80"
                              : o.status === "failed"
                              ? "#f87171"
                              : "#807f78",
                        }}
                      >
                        {o.status?.toUpperCase()}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 10px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "#807f78",
                      }}
                    >
                      {new Date(o.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === "enrollments" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #26262c",
                  textAlign: "left",
                  color: "#807f78",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
              >
                <th style={{ padding: "10px" }}>Enrollment ID</th>
                <th style={{ padding: "10px" }}>User</th>
                <th style={{ padding: "10px" }}>Access Type</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Expires At</th>
                <th style={{ padding: "10px", textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {enrollments.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#807f78" }}>
                    No enrollments found.
                  </td>
                </tr>
              ) : (
                enrollments.map((e: any) => (
                  <tr key={e.id} style={{ borderBottom: "1px solid #1a1a20" }}>
                    <td style={{ padding: "12px 10px", fontFamily: "monospace", color: "#f3f1ea" }}>
                      {e.id}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#a19f95" }}>{e.userId}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span className="pmu-badge" style={{ fontSize: "10px" }}>
                        {e.accessType?.replace("_", " ")}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px" }}>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: e.status === "active" ? "#4ade80" : "#f87171",
                        }}
                      >
                        {e.status?.toUpperCase()}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 10px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "#807f78",
                      }}
                    >
                      {e.expiresAt ? new Date(e.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}>
                      {e.status === "active" && (
                        <button
                          type="button"
                          onClick={() => handleRevoke(e.id)}
                          style={{
                            padding: "4px 8px",
                            fontSize: "11px",
                            backgroundColor: "rgba(239, 68, 68, 0.15)",
                            border: "1px solid rgba(239, 68, 68, 0.4)",
                            color: "#f87171",
                            borderRadius: "4px",
                            cursor: "pointer",
                          }}
                        >
                          Revoke
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}

        {activeTab === "packs" && (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr
                style={{
                  borderBottom: "1px solid #26262c",
                  textAlign: "left",
                  color: "#807f78",
                  fontFamily: "monospace",
                  fontSize: "11px",
                }}
              >
                <th style={{ padding: "10px" }}>Pack ID</th>
                <th style={{ padding: "10px" }}>User</th>
                <th style={{ padding: "10px" }}>Remaining Sessions</th>
                <th style={{ padding: "10px" }}>Total Sessions</th>
                <th style={{ padding: "10px" }}>Status</th>
                <th style={{ padding: "10px" }}>Expires At</th>
              </tr>
            </thead>
            <tbody>
              {packs.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: "24px", textAlign: "center", color: "#807f78" }}>
                    No mentorship packs found.
                  </td>
                </tr>
              ) : (
                packs.map((p: any) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #1a1a20" }}>
                    <td style={{ padding: "12px 10px", fontFamily: "monospace", color: "#f3f1ea" }}>
                      {p.id}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#a19f95" }}>{p.userId}</td>
                    <td
                      style={{
                        padding: "12px 10px",
                        fontWeight: 700,
                        color: (p.totalSessions - p.usedSessions) > 0 ? "#4ade80" : "#807f78",
                      }}
                    >
                      {Math.max(0, p.totalSessions - p.usedSessions)}
                    </td>
                    <td style={{ padding: "12px 10px", color: "#a19f95" }}>{p.totalSessions}</td>
                    <td style={{ padding: "12px 10px" }}>
                      <span
                        className="font-mono"
                        style={{
                          fontSize: "11px",
                          fontWeight: 700,
                          color: p.status === "active" ? "#4ade80" : "#f87171",
                        }}
                      >
                        {p.status?.toUpperCase()}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: "12px 10px",
                        fontFamily: "monospace",
                        fontSize: "11px",
                        color: "#807f78",
                      }}
                    >
                      {p.expiresAt ? new Date(p.expiresAt).toLocaleDateString() : "Never"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Grant Access Modal */}
      {showGrantModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.75)",
            backdropFilter: "blur(4px)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
            padding: "20px",
          }}
        >
          <div
            className="pmu-card"
            style={{
              maxWidth: "480px",
              width: "100%",
              padding: "28px",
              backgroundColor: "#111114",
              border: "1px solid #26262c",
            }}
          >
            <h2
              className="font-display"
              style={{ fontSize: "20px", textTransform: "uppercase", color: "#f3f1ea" }}
            >
              Grant CyberSecurity Course Access
            </h2>
            <p style={{ fontSize: "13px", color: "#a19f95", marginTop: "6px" }}>
              Manually authorize a student for the CyberSecurity Foundations course with complimentary access.
            </p>

            <form onSubmit={handleGrantAccess} style={{ marginTop: "20px", display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
                  Student User ID / WhatsApp Phone
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +919876543210 or user-uuid"
                  value={grantUserId}
                  onChange={(e) => setGrantUserId(e.target.value)}
                  className="pmu-input"
                  style={{ width: "100%", marginTop: "6px", padding: "8px 12px", fontSize: "13px" }}
                />
              </div>

              <div>
                <label className="font-mono" style={{ fontSize: "11px", textTransform: "uppercase", color: "#807f78" }}>
                  Validity Duration (Months)
                </label>
                <select
                  value={grantMonths}
                  onChange={(e) => setGrantMonths(Number(e.target.value))}
                  className="pmu-input"
                  style={{ width: "100%", marginTop: "6px", padding: "8px 12px", fontSize: "13px" }}
                >
                  <option value={1}>1 Month</option>
                  <option value={3}>3 Months</option>
                  <option value={6}>6 Months (Semester Standard)</option>
                  <option value={12}>12 Months (Full Year)</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "12px" }}>
                <button
                  type="button"
                  onClick={() => setShowGrantModal(false)}
                  className="pmu-btn-secondary"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="pmu-btn-primary"
                  style={{ padding: "8px 16px", fontSize: "13px" }}
                >
                  {actionLoading ? "Granting…" : "Confirm & Grant"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
