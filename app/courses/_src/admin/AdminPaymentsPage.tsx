"use client";
import { useEffect, useState } from "react";
import { supabase } from "../lib/supabase";
import { formatInr, formatDateTime } from "../lib/format";
import type { Payment } from "../lib/types";

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    supabase()
      .from("payments")
      .select("*")
      .order("created_at", { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        setPayments((data ?? []) as Payment[]);
      });
  }, []);

  const totalPaid = (payments ?? [])
    .filter((p) => p.status === "paid")
    .reduce((sum, p) => sum + p.amount, 0);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">All payments</h2>
        <p className="text-sm text-zinc-600">
          Total revenue:{" "}
          <span className="font-bold text-emerald-700">{formatInr(totalPaid)}</span>
        </p>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {payments === null ? (
        <p className="text-sm text-zinc-500">Loading…</p>
      ) : payments.length === 0 ? (
        <p className="card text-sm text-zinc-500">No payments yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-zinc-200">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 text-left text-xs uppercase tracking-wide text-zinc-500">
              <tr>
                <th className="px-4 py-2">Date</th>
                <th className="px-4 py-2">Amount</th>
                <th className="px-4 py-2">Status</th>
                <th className="px-4 py-2">Order / Payment id</th>
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
                    {p.razorpay_payment_id ? ` / ${p.razorpay_payment_id}` : ""}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      <p className="text-xs text-zinc-500">
        Tip: per-user email joins live on the Users tab; this table intentionally stays
        small for the free-tier database.
      </p>
    </div>
  );
}
