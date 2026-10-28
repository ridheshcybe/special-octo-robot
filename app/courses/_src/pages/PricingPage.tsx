"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase, envReady } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import { formatInrRupees } from "../lib/format";
import { startCheckout } from "../lib/razorpay";
import { RAZORPAY_KEY_ID, siteUrl, CREATE_ORDER_URL } from "../config";
import type { Plan } from "../lib/types";

export default function PricingPage() {
  const { userId } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<number | null>(null);

  useEffect(() => {
    if (!envReady) {
      setError("Supabase is not configured yet.");
      setPlans([]);
      return;
    }
    supabase()
      .from("plans")
      .select("*")
      .eq("active", true)
      .order("price_inr", { ascending: true })
      .then(({ data }) => setPlans(data ?? []));
  }, []);

  async function buy(planId: number) {
    if (!userId) {
      router.push("/courses/login?next=/courses/pricing");
      return;
    }
    if (!RAZORPAY_KEY_ID) {
      setError("Payments are not configured yet (missing NEXT_PUBLIC_COURSES_RAZORPAY_KEY_ID).");
      return;
    }
    setError(null);
    setBusy(planId);
    try {
      await startCheckout({
        planId,
        keyId: RAZORPAY_KEY_ID,
        siteUrl: siteUrl(),
        createOrderUrl: CREATE_ORDER_URL!,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Checkout failed.");
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-3xl space-y-8 py-4">
      <div className="text-center">
        <h1 className="text-2xl font-bold sm:text-3xl">Simple pricing</h1>
        <p className="mt-2 text-zinc-600">
          One pass unlocks every course. Prepaid — no auto-debit, no surprises.
          Buying again while active simply extends your expiry.
        </p>
      </div>

      {error ? <p className="text-center text-sm text-red-600">{error}</p> : null}

      {plans === null ? (
        <p className="text-center text-sm text-zinc-500">Loading…</p>
      ) : plans.length === 0 ? (
        <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
          Plans are being set up. Check back soon.
        </p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`card flex flex-col gap-4 ${
                plan.duration_days >= 90 ? "border-indigo-300 ring-1 ring-indigo-100" : ""
              }`}
            >
              <div>
                <h2 className="text-lg font-semibold">{plan.name}</h2>
                <p className="mt-1 text-3xl font-bold">{formatInrRupees(plan.price_inr)}</p>
                <p className="text-sm text-zinc-500">for {plan.duration_days} days of access</p>
              </div>
              <ul className="space-y-1 text-sm text-zinc-600">
                <li>✅ All notes &amp; PDFs</li>
                <li>✅ All recorded videos</li>
                <li>✅ All live sessions</li>
                <li>✅ Extends your current expiry on renewal</li>
              </ul>
              <button
                onClick={() => void buy(plan.id)}
                disabled={busy === plan.id}
                className="btn-primary mt-auto w-full"
              >
                {busy === plan.id ? "Opening checkout…" : "Buy this pass"}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
