"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase, envReady, isAccessActive, daysLeft } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import AccessBadge from "../components/AccessBadge";
import { formatInr } from "../lib/format";
import type { Payment } from "../lib/types";

/**
 * The checkout popup saying "success" proves nothing — this page re-reads the
 * payment row from the DATABASE (scoped to the signed-in user via RLS) and
 * only a 'paid' row, written exclusively by the webhook, shows success.
 */
export default function PaymentSuccessPage() {
  const { userId, profile } = useAuth();
  const searchParams = useSearchParams();
  const orderId = searchParams.get("order_id");

  const [payment, setPayment] = useState<Payment | null>(null);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!envReady || !userId) return;
    let cancelled = false;

    async function check() {
      let query = supabase().from("payments").select("*").limit(1);
      if (orderId) query = query.eq("razorpay_order_id", orderId);
      query = query.eq("user_id", userId!);
      const { data } = await query.maybeSingle();
      if (!cancelled) {
        setPayment((data as Payment) ?? null);
        setChecked(true);
      }
    }

    void check();
    // The webhook may land a few seconds after the redirect; poll briefly.
    const timer = setInterval(() => {
      if (!cancelled) void check();
    }, 4000);
    const stop = setTimeout(() => clearInterval(timer), 60_000);

    return () => {
      cancelled = true;
      clearInterval(timer);
      clearTimeout(stop);
    };
  }, [userId, orderId]);

  const paid = payment?.status === "paid";
  const pending = checked && Boolean(payment) && !paid;
  const active = isAccessActive(profile);

  return (
    <div className="mx-auto max-w-md space-y-6 py-10 text-center">
      <p className="text-5xl">{paid ? "🎉" : pending ? "⏳" : "🧐"}</p>
      <h1 className="text-2xl font-bold">
        {paid
          ? "Payment successful!"
          : pending
            ? "Payment processing…"
            : checked
              ? "We couldn't find that payment"
              : "Checking…"}
      </h1>

      {payment ? (
        <p className="text-sm text-zinc-600">
          Order <span className="font-mono text-xs">{payment.razorpay_order_id}</span> ·{" "}
          {formatInr(payment.amount)}
        </p>
      ) : null}

      {profile ? (
        <AccessBadge
          active={active}
          daysLeft={daysLeft(profile.access_expires_at)}
          expiresAt={profile.access_expires_at}
        />
      ) : null}

      {pending ? (
        <p className="text-sm text-zinc-600">
          Your payment is confirmed with the bank but access is being granted. Refresh in a
          few seconds — usually it takes less than a minute.
        </p>
      ) : null}

      <div className="flex flex-col gap-2 sm:flex-row sm:justify-center">
        <Link href="/courses/dashboard" className="btn-primary">
          Go to my courses
        </Link>
        <Link href="/courses" className="btn-outline">
          Browse courses
        </Link>
      </div>
    </div>
  );
}
