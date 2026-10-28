"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, envReady, isAccessActive, daysLeft } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import AccessBadge from "../components/AccessBadge";
import UpcomingSessions from "../components/UpcomingSessions";
import { formatInr, formatDate, formatDateTime } from "../lib/format";
import type { Payment } from "../lib/types";

export default function DashboardPage() {
  const { userId, email, profile } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);

  useEffect(() => {
    if (!envReady || !userId) return;
    supabase()
      .from("payments")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .then(({ data }) => setPayments(data ?? []));
  }, [userId]);

  const active = isAccessActive(profile);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">
          Hi{profile?.full_name ? `, ${profile.full_name}` : ""} 👋
        </h1>
        <p className="text-sm text-zinc-600">{email}</p>
      </div>

      <UpcomingSessions />

      <section className="card flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="font-semibold">Your access</h2>
          <p className="mt-1 text-sm text-zinc-600">
            {active
              ? `Active till ${formatDate(profile?.access_expires_at ?? null)}`
              : profile?.access_expires_at
                ? `Expired on ${formatDate(profile.access_expires_at)}`
                : "No pass yet"}
          </p>
        </div>
        <div className="flex items-center gap-3">
          {profile ? (
            <AccessBadge
              active={active}
              daysLeft={daysLeft(profile.access_expires_at)}
              expiresAt={profile.access_expires_at}
            />
          ) : null}
          {!active ? (
            <Link href="/courses/pricing" className="btn-primary">
              Get access
            </Link>
          ) : null}
        </div>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Payment history</h2>
        {payments.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            No payments yet.
          </p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-zinc-200">
            <table className="w-full text-sm">
              <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
                <tr>
                  <th className="px-4 py-2">Date</th>
                  <th className="px-4 py-2">Amount</th>
                  <th className="px-4 py-2">Status</th>
                  <th className="px-4 py-2">Order</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-200">
                {payments.map((p) => (
                  <tr key={p.id}>
                    <td className="px-4 py-2">{formatDateTime(p.created_at)}</td>
                    <td className="px-4 py-2">{formatInr(p.amount)}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`badge ${
                          p.status === "paid"
                            ? "bg-emerald-50 text-emerald-700"
                            : p.status === "failed"
                              ? "bg-red-50 text-red-700"
                              : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {p.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 font-mono text-xs text-zinc-500">
                      {p.razorpay_order_id}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
