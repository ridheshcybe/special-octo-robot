import { callEdgeFunction } from "./supabase";

type CheckoutResponse = {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
};

interface RazorpayOptions {
  key: string;
  order_id: string;
  amount: number;
  currency: string;
  name: string;
  description: string;
  prefill?: { method?: string };
  theme?: { color?: string };
  callback_url?: string;
  redirect?: boolean;
  handler: (response: CheckoutResponse) => void;
  modal: { ondismiss: () => void };
}

interface RazorpayCtor {
  new (options: RazorpayOptions): { open: () => void };
}

declare global {
  interface Window {
    Razorpay?: RazorpayCtor;
  }
}

function loadScript(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve();
    script.onerror = () => reject(new Error("Could not load Razorpay. Check your connection."));
    document.body.appendChild(script);
  });
}

/**
 * Starts a purchase: the edge function creates the order (server-side price),
 * then Razorpay Checkout opens with UPI first. On success we redirect to
 * /payment-success?order_id=... which re-reads the status from the DATABASE —
 * the popup's success is never trusted for granting access.
 */
export async function startCheckout(opts: {
  planId: number;
  keyId: string;
  siteUrl: string;
  createOrderUrl: string;
}): Promise<void> {
  const res = await callEdgeFunction(opts.createOrderUrl, { plan_id: opts.planId });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? "Could not start checkout.");
  }
  const order = (await res.json()) as {
    order_id: string;
    amount: number;
    currency: string;
  };

  await loadScript();
  if (!window.Razorpay) throw new Error("Razorpay failed to load.");

  const rzp = new window.Razorpay({
    key: opts.keyId,
    order_id: order.order_id,
    amount: order.amount,
    currency: order.currency,
    name: "College Courses",
    description: "Access pass",
    prefill: { method: "upi" }, // UPI first for Indian students
    theme: { color: "#4f46e5" },
    callback_url: `${opts.siteUrl}/courses/payment-success?order_id=${encodeURIComponent(order.order_id)}`,
    redirect: true,
    handler: (response) => {
      // Fast path for same-window checkout; redirect flows land via callback_url.
      window.location.href = `/courses/payment-success?order_id=${encodeURIComponent(
        response.razorpay_order_id,
      )}`;
    },
    modal: {
      ondismiss: () => {
        // User closed the popup — nothing to do; the order stays 'created'.
      },
    },
  });
  rzp.open();
}
