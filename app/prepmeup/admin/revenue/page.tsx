"use client";

import React, { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";

interface ProductOption {
  id: string;
  slug: string;
  name: string;
  productType: string;
  priceInPaise: number;
  durationDays: number;
}

interface RevenueOrder {
  id: string;
  userId: string;
  productSlug: string;
  razorpayOrderId: string;
  amountInPaise: number;
  status: string;
  createdAt: string;
}

interface RevenuePayment {
  id: string;
  orderId: string;
  userId: string;
  razorpayPaymentId: string;
  amountInPaise: number;
  status: string;
  verificationStatus: string;
  webhookStatus: string;
  createdAt: string;
}

interface Entitlement {
  id: string;
  userId: string;
  productSlug: string;
  kind: "course_access" | "mentorship";
  includedCourseSlugs: string[];
  status: string;
  startsAt: string;
  expiresAt: string;
  sessionsTotal?: number;
  sessionsUsed?: number;
  source?: string;
}

interface MentorshipUsage {
  entitlementId: string;
  userId: string;
  productSlug: string;
  includedCourseSlugs: string[];
  sessionsTotal: number;
  sessionsUsed: number;
  status: string;
  expiresAt: string;
  bookings: number;
}

interface RevenueResponse {
  ok: boolean;
  error?: string;
  summary: {
    totalRevenueRupees: number;
    refundedRupees: number;
    netRevenueRupees: number;
    totalOrders: number;
    paidOrders: number;
    failedOrders: number;
    refundedOrders: number;
    capturedPayments: number;
    refundedPayments: number;
    earlyAdopterRedemptions: number;
    earlyAdopterLimit: number;
    activeEntitlements: number;
    expiredEntitlements: number;
    activeMentorshipEntitlements: number;
  };
  revenueByProduct: { productSlug: string; productName: string; orders: number; revenueRupees: number }[];
  revenueByTrack: { trackSlug: string; revenueRupees: number }[];
  monthlyRevenue: { month: string; orders: number; revenueRupees: number }[];
  orders: RevenueOrder[];
  payments: RevenuePayment[];
  entitlements: Entitlement[];
  mentorshipUsage: MentorshipUsage[];
  products: ProductOption[];
  earlyAdopter: {
    limit: number;
    claimedCount: number;
    remainingSeats: number;
    redemptions: {
      id: string;
      userId: string;
      productSlug: string;
      redemptionNumber: number;
      status: string;
      createdAt: string;
    }[];
  };
}

const ACCENT = "#ff3b1d";
const ACCENT_2 = "#ff6a3d";
const MUTED = "#807f78";

function rupees(amount: number): string {
  return `₹${amount.toLocaleString("en-IN")}`;
}

function shortDate(iso?: string): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginTop: "24px",
        backgroundColor: "#111114",
        border: "1px solid rgba(243, 241, 234, 0.1)",
        borderRadius: "0.75rem",
        padding: "20px 20px 16px",
        overflowX: "auto",
      }}
    >
      <div style={{ marginBottom: "12px" }}>
        <h2 className="font-display" style={{ fontSize: "20px", textTransform: "uppercase" }}>
          {title}
        </h2>
        {subtitle && <p style={{ fontSize: "12px", color: MUTED, marginTop: "2px" }}>{subtitle}</p>}
      </div>
      {children}
    </section>
  );
}

function Metric({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div
      style={{
        backgroundColor: "#111114",
        border: `1px solid ${accent ? ACCENT : "rgba(243, 241, 234, 0.1)"}`,
        borderRadius: "0.75rem",
        padding: "16px 18px",
      }}
    >
      <div style={{ fontSize: "10.5px", color: MUTED, textTransform: "uppercase", letterSpacing: "0.08em" }}>
        {label}
      </div>
      <div
        className="font-display"
        style={{ fontSize: "26px", marginTop: "6px", color: accent ? ACCENT_2 : "#f3f1ea" }}
      >
        {value}
      </div>
    </div>
  );
}

const TH: React.CSSProperties = {
  textAlign: "left",
  padding: "8px 10px",
  fontSize: "10.5px",
  color: MUTED,
  textTransform: "uppercase",
  letterSpacing: "0.06em",
  whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "8px 10px",
  fontSize: "12px",
  borderTop: "1px solid rgba(243, 241, 234, 0.07)",
  whiteSpace: "nowrap",
};

export default function AdminRevenuePage() {
  const [data, setData] = useState<RevenueResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [filters, setFilters] = useState({
    product: "",
    user: "",
    status: "",
    paymentId: "",
    from: "",
    to: "",
  });

  const [grant, setGrant] = useState({
    userId: "",
    productSlug: "prepmeup-all-access-pass",
    durationDays: "180",
    sessions: "1",
  });

  const loadReport = useCallback(async (nextFilters = filters) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      Object.entries(nextFilters).forEach(([key, value]) => {
        if (value) params.set(key, value);
      });
      const res = await fetch(`/api/prepmeup/admin/revenue?${params.toString()}`, {
        cache: "no-store",
      });
      const json = await res.json();
      if (!res.ok || !json?.ok) {
        throw new Error(json?.error || "Could not load revenue data.");
      }
      setData(json);
    } catch (err: any) {
      setError(err?.message || "Could not load revenue data.");
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadReport(filters);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const postAdminAction = useCallback(
    async (payload: Record<string, unknown>) => {
      setNotice(null);
      setError(null);
      try {
        const res = await fetch("/api/prepmeup/admin/revenue", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const json = await res.json();
        if (!res.ok || !json?.ok) {
          throw new Error(json?.error || "Admin action failed.");
        }
        setNotice(json.message || "Done.");
        await loadReport();
      } catch (err: any) {
        setError(err?.message || "Admin action failed.");
      }
    },
    [loadReport]
  );

  const products = data?.products || [];
  const summary = data?.summary;
  const orders = useMemo(() => (data?.orders || []).slice(0, 50), [data]);
  const payments = useMemo(() => (data?.payments || []).slice(0, 50), [data]);

  if (loading && !data) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#08080a", color: "#f3f1ea", padding: "80px 20px" }}>
        <p style={{ textAlign: "center", color: MUTED }}>Loading unified revenue…</p>
      </main>
    );
  }

  if (error && !data) {
    return (
      <main style={{ minHeight: "100vh", backgroundColor: "#08080a", color: "#f3f1ea", padding: "80px 20px" }}>
        <div style={{ maxWidth: "520px", margin: "0 auto", textAlign: "center" }}>
          <h1 className="font-display" style={{ fontSize: "28px", textTransform: "uppercase" }}>
            Revenue dashboard
          </h1>
          <p style={{ color: "#f87171", marginTop: "12px" }}>{error}</p>
          <Link href="/prepmeup/admin/login" className="pmu-btn-primary" style={{ marginTop: "20px", textDecoration: "none" }}>
            Admin sign in →
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main
      style={{
        minHeight: "100vh",
        backgroundColor: "#08080a",
        color: "#f3f1ea",
        padding: "40px 20px 80px",
        fontFamily: "var(--font-onest), sans-serif",
      }}
    >
      <div style={{ maxWidth: "1240px", margin: "0 auto" }}>
        <div style={{ marginBottom: "10px", display: "flex", gap: "8px", fontSize: "12px", color: MUTED, fontFamily: "monospace" }}>
          <Link href="/prepmeup/admin" style={{ color: MUTED, textDecoration: "none" }}>
            PrepMeUp Admin
          </Link>
          <span>/</span>
          <span style={{ color: ACCENT_2 }}>Unified Revenue</span>
        </div>

        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "12px", flexWrap: "wrap" }}>
          <div>
            <h1 className="font-display" style={{ fontSize: "clamp(28px, 4vw, 40px)", textTransform: "uppercase" }}>
              Unified revenue &amp; entitlements
            </h1>
            <p style={{ fontSize: "13px", color: MUTED, marginTop: "4px" }}>
              Orders, payments, early-adopter seats, access grants and mentorship credits in one view.
            </p>
          </div>
          <button
            type="button"
            className="pmu-btn-secondary"
            onClick={() => loadReport()}
            disabled={loading}
            style={{ padding: "10px 16px", fontSize: "12px" }}
          >
            {loading ? "Refreshing…" : "Refresh"}
          </button>
        </div>

        {error && <p style={{ color: "#f87171", marginTop: "12px", fontSize: "13px" }}>{error}</p>}
        {notice && <p style={{ color: "#4ade80", marginTop: "12px", fontSize: "13px" }}>{notice}</p>}

        {summary && (
          <div style={{ marginTop: "20px", display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "12px" }}>
            <Metric label="Net revenue" value={rupees(summary.netRevenueRupees)} accent />
            <Metric label="Captured" value={rupees(summary.totalRevenueRupees)} />
            <Metric label="Refunded" value={rupees(summary.refundedRupees)} />
            <Metric label="Paid orders" value={String(summary.paidOrders)} />
            <Metric label="Failed orders" value={String(summary.failedOrders)} />
            <Metric
              label="Early adopter seats"
              value={`${summary.earlyAdopterRedemptions}/${summary.earlyAdopterLimit}`}
            />
            <Metric label="Active entitlements" value={String(summary.activeEntitlements)} />
            <Metric label="Expired / revoked" value={String(summary.expiredEntitlements)} />
          </div>
        )}

        <Section title="Filters" subtitle="Filter orders and payments by product, user, status, date or payment id.">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: "10px" }}>
            <select
              className="pmu-input"
              value={filters.product}
              onChange={(e) => setFilters((f) => ({ ...f, product: e.target.value }))}
            >
              <option value="">All products</option>
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            <select
              className="pmu-input"
              value={filters.status}
              onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            >
              <option value="">Any payment status</option>
              <option value="captured">captured</option>
              <option value="created">created</option>
              <option value="failed">failed</option>
              <option value="refunded">refunded</option>
            </select>
            <input
              className="pmu-input"
              placeholder="User id / email"
              value={filters.user}
              onChange={(e) => setFilters((f) => ({ ...f, user: e.target.value }))}
            />
            <input
              className="pmu-input"
              placeholder="Razorpay payment id"
              value={filters.paymentId}
              onChange={(e) => setFilters((f) => ({ ...f, paymentId: e.target.value }))}
            />
            <input
              className="pmu-input"
              type="date"
              value={filters.from}
              onChange={(e) => setFilters((f) => ({ ...f, from: e.target.value }))}
            />
            <input
              className="pmu-input"
              type="date"
              value={filters.to}
              onChange={(e) => setFilters((f) => ({ ...f, to: e.target.value }))}
            />
            <button
              type="button"
              className="pmu-btn-primary"
              onClick={() => loadReport()}
              style={{ padding: "10px 14px", fontSize: "12px" }}
            >
              Apply filters
            </button>
            <button
              type="button"
              className="pmu-btn-secondary"
              onClick={() => {
                const cleared = { product: "", user: "", status: "", paymentId: "", from: "", to: "" };
                setFilters(cleared);
                loadReport(cleared);
              }}
              style={{ padding: "10px 14px", fontSize: "12px" }}
            >
              Clear
            </button>
          </div>
        </Section>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "16px" }}>
          <Section title="Revenue by product">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Product</th>
                  <th style={TH}>Paid</th>
                  <th style={{ ...TH, textAlign: "right" }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.revenueByProduct || []).map((row) => (
                  <tr key={row.productSlug}>
                    <td style={TD}>{row.productName}</td>
                    <td style={TD}>{row.orders}</td>
                    <td style={{ ...TD, textAlign: "right" }}>{rupees(row.revenueRupees)}</td>
                  </tr>
                ))}
                {(data?.revenueByProduct || []).length === 0 && (
                  <tr>
                    <td style={{ ...TD, color: MUTED }} colSpan={3}>
                      No captured payments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          <Section title="Revenue by track" subtitle="Multi-track passes allocate revenue evenly across included tracks.">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Track</th>
                  <th style={{ ...TH, textAlign: "right" }}>Attributed revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.revenueByTrack || []).map((row) => (
                  <tr key={row.trackSlug}>
                    <td style={TD}>{row.trackSlug}</td>
                    <td style={{ ...TD, textAlign: "right" }}>{rupees(row.revenueRupees)}</td>
                  </tr>
                ))}
                {(data?.revenueByTrack || []).length === 0 && (
                  <tr>
                    <td style={{ ...TD, color: MUTED }} colSpan={2}>
                      No data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>

          <Section title="Monthly revenue">
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={TH}>Month</th>
                  <th style={TH}>Payments</th>
                  <th style={{ ...TH, textAlign: "right" }}>Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(data?.monthlyRevenue || []).map((row) => (
                  <tr key={row.month}>
                    <td style={TD}>{row.month}</td>
                    <td style={TD}>{row.orders}</td>
                    <td style={{ ...TD, textAlign: "right" }}>{rupees(row.revenueRupees)}</td>
                  </tr>
                ))}
                {(data?.monthlyRevenue || []).length === 0 && (
                  <tr>
                    <td style={{ ...TD, color: MUTED }} colSpan={3}>
                      No data yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Section>
        </div>

        <Section
          title="Early-adopter redemptions"
          subtitle={`${data?.earlyAdopter.claimedCount || 0} claimed of ${
            data?.earlyAdopter.limit || 0
          } seats.`}
        >
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Seat</th>
                <th style={TH}>Student</th>
                <th style={TH}>Product</th>
                <th style={TH}>Status</th>
                <th style={TH}>Claimed</th>
              </tr>
            </thead>
            <tbody>
              {(data?.earlyAdopter.redemptions || []).map((row) => (
                <tr key={row.id}>
                  <td style={TD}>#{row.redemptionNumber}</td>
                  <td style={TD}>{row.userId}</td>
                  <td style={TD}>{row.productSlug}</td>
                  <td style={TD}>{row.status}</td>
                  <td style={TD}>{shortDate(row.createdAt)}</td>
                </tr>
              ))}
              {(data?.earlyAdopter.redemptions || []).length === 0 && (
                <tr>
                  <td style={{ ...TD, color: MUTED }} colSpan={5}>
                    No early-adopter seats claimed.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>

        <Section title="Unified orders" subtitle={`${data?.summary.totalOrders || 0} orders match the current filters.`}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Created</th>
                <th style={TH}>Student</th>
                <th style={TH}>Product</th>
                <th style={TH}>Razorpay order</th>
                <th style={{ ...TH, textAlign: "right" }}>Amount</th>
                <th style={TH}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id}>
                  <td style={TD}>{shortDate(order.createdAt)}</td>
                  <td style={TD}>{order.userId}</td>
                  <td style={TD}>{order.productSlug}</td>
                  <td style={{ ...TD, fontFamily: "monospace", fontSize: "11px" }}>
                    {order.razorpayOrderId}
                  </td>
                  <td style={{ ...TD, textAlign: "right" }}>{rupees(Math.round(order.amountInPaise / 100))}</td>
                  <td style={TD}>{order.status}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td style={{ ...TD, color: MUTED }} colSpan={6}>
                    No orders match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>

        <Section title="Payments" subtitle="Verification and webhook status per Razorpay payment.">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Created</th>
                <th style={TH}>Student</th>
                <th style={TH}>Payment id</th>
                <th style={{ ...TH, textAlign: "right" }}>Amount</th>
                <th style={TH}>Status</th>
                <th style={TH}>Verified</th>
                <th style={TH}>Webhook</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((payment) => (
                <tr key={payment.id}>
                  <td style={TD}>{shortDate(payment.createdAt)}</td>
                  <td style={TD}>{payment.userId}</td>
                  <td style={{ ...TD, fontFamily: "monospace", fontSize: "11px" }}>
                    {payment.razorpayPaymentId}
                  </td>
                  <td style={{ ...TD, textAlign: "right" }}>
                    {rupees(Math.round(payment.amountInPaise / 100))}
                  </td>
                  <td style={TD}>{payment.status}</td>
                  <td style={TD}>{payment.verificationStatus}</td>
                  <td style={TD}>{payment.webhookStatus}</td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td style={{ ...TD, color: MUTED }} colSpan={7}>
                    No payments match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>

        <Section
          title="Grant or revoke access"
          subtitle="Admin-granted access is stored as a normal entitlement record, so it expires and revokes like a purchase."
        >
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(170px, 1fr))", gap: "10px" }}>
            <input
              className="pmu-input"
              placeholder="Student email / phone / id"
              value={grant.userId}
              onChange={(e) => setGrant((g) => ({ ...g, userId: e.target.value }))}
            />
            <select
              className="pmu-input"
              value={grant.productSlug}
              onChange={(e) => setGrant((g) => ({ ...g, productSlug: e.target.value }))}
            >
              {products.map((product) => (
                <option key={product.slug} value={product.slug}>
                  {product.name}
                </option>
              ))}
            </select>
            <input
              className="pmu-input"
              placeholder="Duration (days)"
              value={grant.durationDays}
              onChange={(e) => setGrant((g) => ({ ...g, durationDays: e.target.value }))}
            />
            <input
              className="pmu-input"
              placeholder="Mentorship sessions"
              value={grant.sessions}
              onChange={(e) => setGrant((g) => ({ ...g, sessions: e.target.value }))}
            />
            <button
              type="button"
              className="pmu-btn-primary"
              style={{ padding: "10px 14px", fontSize: "12px" }}
              onClick={() =>
                postAdminAction({
                  action: "grant_access",
                  userId: grant.userId,
                  productSlug: grant.productSlug,
                  durationDays: Number(grant.durationDays) || undefined,
                })
              }
            >
              Grant access
            </button>
            <button
              type="button"
              className="pmu-btn-secondary"
              style={{ padding: "10px 14px", fontSize: "12px" }}
              onClick={() =>
                postAdminAction({
                  action: "grant_mentorship",
                  userId: grant.userId,
                  productSlug: grant.productSlug,
                  sessions: Number(grant.sessions) || 1,
                })
              }
            >
              Grant mentorship credit
            </button>
          </div>
        </Section>

        <Section title="Entitlements" subtitle="Active, expired and revoked access records.">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Student</th>
                <th style={TH}>Product</th>
                <th style={TH}>Kind</th>
                <th style={TH}>Courses</th>
                <th style={TH}>Sessions</th>
                <th style={TH}>Status</th>
                <th style={TH}>Expires</th>
                <th style={TH}>Source</th>
                <th style={TH}> </th>
              </tr>
            </thead>
            <tbody>
              {(data?.entitlements || []).slice(0, 60).map((entitlement) => (
                <tr key={entitlement.id}>
                  <td style={TD}>{entitlement.userId}</td>
                  <td style={TD}>{entitlement.productSlug}</td>
                  <td style={TD}>{entitlement.kind}</td>
                  <td style={{ ...TD, maxWidth: "240px", whiteSpace: "normal" }}>
                    {entitlement.includedCourseSlugs.join(", ")}
                  </td>
                  <td style={TD}>
                    {entitlement.kind === "mentorship"
                      ? `${entitlement.sessionsUsed || 0}/${entitlement.sessionsTotal || 0}`
                      : "—"}
                  </td>
                  <td style={TD}>{entitlement.status}</td>
                  <td style={TD}>{shortDate(entitlement.expiresAt)}</td>
                  <td style={TD}>{entitlement.source || "purchase"}</td>
                  <td style={TD}>
                    {entitlement.status === "active" && (
                      <button
                        type="button"
                        onClick={() =>
                          postAdminAction({ action: "revoke_access", entitlementId: entitlement.id })
                        }
                        style={{
                          background: "transparent",
                          border: "1px solid rgba(248, 113, 113, 0.5)",
                          color: "#f87171",
                          borderRadius: "4px",
                          padding: "4px 8px",
                          fontSize: "11px",
                          cursor: "pointer",
                        }}
                      >
                        Revoke
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {(data?.entitlements || []).length === 0 && (
                <tr>
                  <td style={{ ...TD, color: MUTED }} colSpan={9}>
                    No entitlements match the current filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>

        <Section title="Mentorship packs & usage" subtitle="Every unified mentorship credit and the bookings it funded.">
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={TH}>Student</th>
                <th style={TH}>Product</th>
                <th style={TH}>Courses</th>
                <th style={TH}>Used</th>
                <th style={TH}>Bookings</th>
                <th style={TH}>Status</th>
                <th style={TH}>Expires</th>
              </tr>
            </thead>
            <tbody>
              {(data?.mentorshipUsage || []).map((row) => (
                <tr key={row.entitlementId}>
                  <td style={TD}>{row.userId}</td>
                  <td style={TD}>{row.productSlug}</td>
                  <td style={{ ...TD, maxWidth: "240px", whiteSpace: "normal" }}>
                    {row.includedCourseSlugs.join(", ")}
                  </td>
                  <td style={TD}>
                    {row.sessionsUsed}/{row.sessionsTotal}
                  </td>
                  <td style={TD}>{row.bookings}</td>
                  <td style={TD}>{row.status}</td>
                  <td style={TD}>{shortDate(row.expiresAt)}</td>
                </tr>
              ))}
              {(data?.mentorshipUsage || []).length === 0 && (
                <tr>
                  <td style={{ ...TD, color: MUTED }} colSpan={7}>
                    No mentorship credits sold yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </Section>

        <p style={{ marginTop: "22px", fontSize: "11.5px", color: MUTED }}>
          Razorpay key secrets and webhook secrets are never exposed to this dashboard. CSV export is
          intentionally not implemented in Phase C3.
        </p>
      </div>
    </main>
  );
}
