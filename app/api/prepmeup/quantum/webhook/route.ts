import { NextResponse, type NextRequest } from "next/server";
import { verifyRazorpayWebhookSignature } from "@/lib/prepmeup/razorpay";
import {
  getQuantumOrderByRazorpayId,
  updateQuantumOrderStatus,
  recordWebhookEventAtomic,
  updateWebhookEventStatus,
} from "@/app/prepmeup/_lib/trackStore";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export const dynamic = "force-dynamic";

// Webhook idempotency cache reference (Phase C0 upgraded to durable database/store backed idempotency)
const processedWebhookEvents = {
  has: (id: string) => false, // legacy in-memory compatibility shim
};

export async function POST(req: NextRequest) {
  let eventId = "";
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

    eventId = payload.event_id || payload.id || `evt_${Date.now()}`;
    const eventType = payload.event || "unknown";

    // 2. Persistent Idempotency Check:
    // Atomic insert into Supabase pmu_webhook_events if configured
    const serviceClient = createPmuServiceClient();
    if (serviceClient) {
      try {
        const { error: insertError } = await serviceClient
          .from("pmu_webhook_events")
          .insert({
            provider: "razorpay",
            event_id: eventId,
            event_type: eventType,
            payload,
            status: "processing",
            attempts: 1,
            received_at: new Date().toISOString(),
          });

        if (insertError) {
          // 23505 is PostgreSQL unique constraint violation (ON CONFLICT DO NOTHING)
          if (insertError.code === "23505" || insertError.message?.includes("duplicate")) {
            return NextResponse.json(
              { ok: true, received: true, idempotent: true, message: "Duplicate webhook event already received/processed." },
              { status: 200 }
            );
          }
        }
      } catch {
        // Fall back gracefully to durable trackStore atomic recording
      }
    }

    // Durable fallback in CMS / TrackStore state
    const atomicRecord = recordWebhookEventAtomic({
      provider: "razorpay",
      eventId,
      eventType,
      payload,
    });

    if (atomicRecord.isDuplicate) {
      return NextResponse.json(
        { ok: true, received: true, idempotent: true, message: "Event already processed (idempotent)." },
        { status: 200 }
      );
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const orderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;
    const amountInPaise = paymentEntity?.amount;

    if (!orderId) {
      // Respond 200 to acknowledge webhook even if event is not order-linked
      updateWebhookEventStatus(eventId, "ignored");
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
      if (serviceClient) {
        try {
          await serviceClient
            .from("pmu_quantum_payments")
            .update({ webhook_status: "processed", status: "captured" })
            .eq("razorpay_payment_id", paymentId);
          
          await serviceClient
            .from("pmu_webhook_events")
            .update({ status: "processed", processed_at: new Date().toISOString() })
            .eq("provider", "razorpay")
            .eq("event_id", eventId);
        } catch {}
      }
      updateWebhookEventStatus(eventId, "processed");
    } else if (eventType === "payment.failed") {
      if (order && order.status !== "paid") {
        updateQuantumOrderStatus(orderId, "failed", {
          razorpayPaymentId: paymentId,
          verificationStatus: "failed",
        });
      }
      updateWebhookEventStatus(eventId, "processed");
    } else if (eventType === "refund.processed") {
      if (order) {
        updateQuantumOrderStatus(orderId, "refunded", {
          razorpayPaymentId: paymentId,
        });
      }
      updateWebhookEventStatus(eventId, "processed");
    } else {
      updateWebhookEventStatus(eventId, "processed");
    }

    return NextResponse.json({ ok: true, event: eventType, processed: true });
  } catch (err: any) {
    if (eventId) {
      updateWebhookEventStatus(eventId, "failed", err?.message);
    }
    return NextResponse.json(
      { ok: false, error: err?.message || "Webhook processing error." },
      { status: 500 }
    );
  }
}
