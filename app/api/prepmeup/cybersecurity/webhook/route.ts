import { NextResponse, type NextRequest } from "next/server";
import {
  getAllCyberOrders,
  getAllCyberPayments,
  getCyberOrderByRazorpayId,
  markCyberOrderFailed,
  markCyberOrderPaid,
  recordCyberWebhookEvent,
  refundCyberOrder,
  updateCyberWebhookEventStatus,
} from "@/app/prepmeup/_lib/cyberStore";
import {
  getCyberRazorpayCredentials,
  verifyCyberRazorpayWebhookSignature,
} from "@/lib/prepmeup/cyberRazorpay";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export const dynamic = "force-dynamic";

const PROVIDER = "razorpay_cyber";

async function mirrorPaymentWebhookStatus(
  razorpayPaymentId: string,
  status: "captured" | "failed" | "refunded"
) {
  const serviceClient = createPmuServiceClient();
  if (!serviceClient || !razorpayPaymentId) return;

  try {
    await serviceClient
      .from("pmu_cyber_payments")
      .update({ webhook_status: "processed", status, updated_at: new Date().toISOString() })
      .eq("razorpay_payment_id", razorpayPaymentId);
  } catch {
    // Ignore mirroring failures — webhook processing is idempotent and retriable.
  }
}

export async function POST(req: NextRequest) {
  let eventId = "";
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const { webhookSecret } = getCyberRazorpayCredentials();

    if (!webhookSecret) {
      return NextResponse.json(
        { ok: false, error: "CyberSecurity webhook secret is not configured." },
        { status: 503 }
      );
    }

    const isValid = verifyCyberRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid webhook signature." },
        { status: 400 }
      );
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    eventId =
      payload.event_id ||
      req.headers.get("x-razorpay-event-id") ||
      payload.id ||
      "";

    if (!eventId) {
      return NextResponse.json({ ok: false, error: "Missing webhook event id." }, { status: 400 });
    }

    const eventType = payload.event || "unknown";

    // ------------------------------------------------------------------
    // Durable idempotency: unique (provider, event_id) in pmu_webhook_events
    // ------------------------------------------------------------------
    const serviceClient = createPmuServiceClient();
    if (serviceClient) {
      try {
        const { error: insertError } = await serviceClient
          .from("pmu_webhook_events")
          .insert({
            provider: PROVIDER,
            event_id: eventId,
            event_type: eventType,
            payload,
            status: "processing",
            attempts: 1,
            received_at: new Date().toISOString(),
          });

        if (insertError) {
          if (insertError.code === "23505" || insertError.message?.includes("duplicate")) {
            return NextResponse.json(
              {
                ok: true,
                received: true,
                idempotent: true,
                message: "Duplicate CyberSecurity webhook event already processed.",
              },
              { status: 200 }
            );
          }
        }
      } catch {
        // Fall through to the durable file-backed idempotency store.
      }
    }

    const atomicRecord = recordCyberWebhookEvent({
      provider: PROVIDER,
      eventId,
      eventType,
      payload,
    });

    if (atomicRecord.isDuplicate) {
      return NextResponse.json(
        {
          ok: true,
          received: true,
          idempotent: true,
          message: "CyberSecurity webhook event already processed.",
        },
        { status: 200 }
      );
    }

    const paymentEntity = payload.payload?.payment?.entity;
    const orderId: string | undefined = paymentEntity?.order_id;
    const paymentId: string | undefined = paymentEntity?.id;
    const amountInPaise: number | undefined = paymentEntity?.amount;

    if (eventType === "payment.captured") {
      if (!orderId) {
        updateCyberWebhookEventStatus(eventId, "ignored", PROVIDER);
        return NextResponse.json({ ok: true, received: true, ignored: true });
      }

      // Upsert captured payment first, then provision (idempotent) if this was
      // the first event to observe the payment.
      let order = getCyberOrderByRazorpayId(orderId);
      if (order) {
        markCyberOrderPaid({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId || `pay_unknown_${orderId}`,
          amountInPaise,
          source: "webhook",
          webhookStatus: "processed",
        });
        order = getCyberOrderByRazorpayId(orderId);
      }

      if (paymentId) await mirrorPaymentWebhookStatus(paymentId, "captured");

      if (serviceClient) {
        try {
          await serviceClient
            .from("pmu_cyber_orders")
            .update({ status: "paid", updated_at: new Date().toISOString() })
            .eq("razorpay_order_id", orderId);
          await serviceClient
            .from("pmu_webhook_events")
            .update({ status: "processed", processed_at: new Date().toISOString() })
            .eq("provider", PROVIDER)
            .eq("event_id", eventId);
        } catch {
          // Ignore mirror failure.
        }
      }

      updateCyberWebhookEventStatus(eventId, "processed", PROVIDER);
      return NextResponse.json({ ok: true, event: eventType, processed: true });
    }

    if (eventType === "payment.failed") {
      if (orderId) {
        markCyberOrderFailed(orderId, paymentId);
        if (paymentId) await mirrorPaymentWebhookStatus(paymentId, "failed");
      }
      updateCyberWebhookEventStatus(eventId, "processed", PROVIDER);
      return NextResponse.json({ ok: true, event: eventType, processed: true });
    }

    if (eventType === "refund.processed") {
      const refundEntity = payload.payload?.refund?.entity;
      const refundedPaymentId: string | undefined = refundEntity?.payment_id || paymentId;

      if (refundedPaymentId) {
        const payment = getAllCyberPayments().find(
          (p) => p.razorpayPaymentId === refundedPaymentId
        );
        const order = payment
          ? getAllCyberOrders().find((o) => o.id === payment.orderId)
          : null;

        if (order) {
          refundCyberOrder(order.razorpayOrderId, refundedPaymentId);
        }
        await mirrorPaymentWebhookStatus(refundedPaymentId, "refunded");
      }

      updateCyberWebhookEventStatus(eventId, "processed", PROVIDER);
      return NextResponse.json({ ok: true, event: eventType, processed: true });
    }

    updateCyberWebhookEventStatus(eventId, "processed", PROVIDER);
    return NextResponse.json({ ok: true, event: eventType, ignored: true });
  } catch (err: any) {
    if (eventId) {
      updateCyberWebhookEventStatus(eventId, "failed", PROVIDER);
    }
    return NextResponse.json(
      { ok: false, error: err?.message || "Webhook processing error." },
      { status: 500 }
    );
  }
}
