import { NextResponse, type NextRequest } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/prepmeup/razorpay";
import {
  getQuantumOrderByRazorpayId,
  updateQuantumOrderStatus,
} from "@/app/prepmeup/_lib/trackStore";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export const dynamic = "force-dynamic";

// In-memory idempotency cache for processed webhook event IDs
const processedWebhookEvents = new Set<string>();

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // 1. Signature verification using timing-safe comparison
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET || process.env.RAZORPAY_KEY_SECRET;

    if (webhookSecret) {
      const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json(
          { ok: false, error: "Invalid webhook signature." },
          { status: 400 }
        );
      }
    }

    let payload: any = {};
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    const eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event;

    // 2. Idempotency check: prevent duplicate event execution
    if (processedWebhookEvents.has(eventId)) {
      return NextResponse.json({ ok: true, message: "Event already processed (idempotent)." });
    }
    processedWebhookEvents.add(eventId);

    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;
    const amountInPaise = paymentEntity?.amount;

    if (!orderId) {
      // Respond 200 to acknowledge webhook even if event is not order-linked
      return NextResponse.json({ ok: true, received: true });
    }

    const order = getQuantumOrderByRazorpayId(orderId);

    // 3. Handle Lifecycle Events
    if (eventType === "payment.captured") {
      if (order && order.status !== "paid") {
        updateQuantumOrderStatus(orderId, "paid", {
          razorpayPaymentId: paymentId,
          amountInPaise,
          verificationStatus: "verified",
        });
      }

      // Update Supabase if connected
      const serviceClient = createPmuServiceClient();
      if (serviceClient) {
        try {
          await serviceClient
            .from("pmu_quantum_payments")
            .update({ webhook_status: "processed", status: "captured" })
            .eq("razorpay_payment_id", paymentId);
        } catch {}
      }
    } else if (eventType === "payment.failed") {
      if (order && order.status !== "paid") {
        updateQuantumOrderStatus(orderId, "failed", {
          razorpayPaymentId: paymentId,
          verificationStatus: "failed",
        });
      }
    } else if (eventType === "refund.processed") {
      if (order) {
        updateQuantumOrderStatus(orderId, "refunded", {
          razorpayPaymentId: paymentId,
        });
      }
    }

    return NextResponse.json({ ok: true, event: eventType, processed: true });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Webhook processing error." },
      { status: 500 }
    );
  }
}
