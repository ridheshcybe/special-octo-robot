import { NextResponse, type NextRequest } from "next/server";
import {
  getAllUnifiedOrders,
  getAllUnifiedPayments,
  getUnifiedOrderByRazorpayId,
  markUnifiedOrderFailed,
  markUnifiedOrderPaid,
  recordUnifiedWebhookEvent,
  refundUnifiedOrder,
  updateUnifiedWebhookEventStatus,
} from "@/app/prepmeup/_lib/unifiedStore";
import {
  getUnifiedRazorpayCredentials,
  verifyUnifiedRazorpayWebhookSignature,
} from "@/lib/prepmeup/unifiedRazorpay";
import {
  mirrorUnifiedOrderStatus,
  mirrorUnifiedPaymentWebhookStatus,
  mirrorWebhookEvent,
  updateMirroredWebhookEvent,
} from "@/lib/prepmeup/unifiedDbMirror";

export const dynamic = "force-dynamic";

const PROVIDER = "razorpay_unified";

export async function POST(req: NextRequest) {
  let eventId = "";
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";
    const { webhookSecret } = getUnifiedRazorpayCredentials();

    if (!webhookSecret) {
      return NextResponse.json(
        { ok: false, error: "Unified webhook secret is not configured." },
        { status: 503 }
      );
    }

    if (!verifyUnifiedRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 400 });
    }

    let payload: any;
    try {
      payload = JSON.parse(rawBody);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid JSON payload." }, { status: 400 });
    }

    eventId =
      payload.event_id || req.headers.get("x-razorpay-event-id") || payload.id || "";
    if (!eventId) {
      return NextResponse.json({ ok: false, error: "Missing webhook event id." }, { status: 400 });
    }

    const eventType = payload.event || "unknown";

    // Durable idempotency: unique (provider, event_id) in pmu_webhook_events.
    const duplicateInDb = await mirrorWebhookEvent({
      provider: PROVIDER,
      eventId,
      eventType,
      payload,
      status: "processing",
    });
    if (duplicateInDb) {
      return NextResponse.json(
        {
          ok: true,
          received: true,
          idempotent: true,
          message: "Duplicate webhook event already processed.",
        },
        { status: 200 }
      );
    }

    const atomicRecord = recordUnifiedWebhookEvent({
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
          message: "Webhook event already processed.",
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
        updateUnifiedWebhookEventStatus(eventId, "ignored", PROVIDER);
        await updateMirroredWebhookEvent(PROVIDER, eventId, "ignored");
        return NextResponse.json({ ok: true, received: true, ignored: true });
      }

      const order = getUnifiedOrderByRazorpayId(orderId);

      // Amount integrity: never activate on a mismatched amount.
      if (order && typeof amountInPaise === "number" && amountInPaise !== order.amountInPaise) {
        updateUnifiedWebhookEventStatus(eventId, "failed", PROVIDER);
        await updateMirroredWebhookEvent(PROVIDER, eventId, "failed");
        return NextResponse.json(
          { ok: false, received: true, error: "Amount mismatch; access not granted." },
          { status: 200 }
        );
      }

      if (order) {
        markUnifiedOrderPaid({
          razorpayOrderId: orderId,
          razorpayPaymentId: paymentId || `pay_unknown_${orderId}`,
          amountInPaise,
          source: "webhook",
        });
      }

      if (paymentId) await mirrorUnifiedPaymentWebhookStatus(paymentId, "captured");
      await mirrorUnifiedOrderStatus(orderId, "paid");
      updateUnifiedWebhookEventStatus(eventId, "processed", PROVIDER);
      await updateMirroredWebhookEvent(PROVIDER, eventId, "processed");

      return NextResponse.json({
        ok: true,
        event: eventType,
        processed: true,
        orderFound: Boolean(order),
      });
    }

    if (eventType === "payment.failed") {
      if (orderId) {
        markUnifiedOrderFailed(orderId, paymentId);
        if (paymentId) await mirrorUnifiedPaymentWebhookStatus(paymentId, "failed");
        await mirrorUnifiedOrderStatus(orderId, "failed");
      }
      updateUnifiedWebhookEventStatus(eventId, "processed", PROVIDER);
      await updateMirroredWebhookEvent(PROVIDER, eventId, "processed");
      return NextResponse.json({ ok: true, event: eventType, processed: true });
    }

    if (eventType === "refund.processed") {
      const refundEntity = payload.payload?.refund?.entity;
      const refundedPaymentId: string | undefined = refundEntity?.payment_id || paymentId;

      if (refundedPaymentId) {
        const payment = getAllUnifiedPayments().find(
          (p) => p.razorpayPaymentId === refundedPaymentId
        );
        if (payment) {
          const order = getAllUnifiedOrders().find((o) => o.id === payment.orderId);
          if (order) {
            refundUnifiedOrder(order.razorpayOrderId, refundedPaymentId);
            await mirrorUnifiedOrderStatus(order.razorpayOrderId, "refunded");
          }
        }
        await mirrorUnifiedPaymentWebhookStatus(refundedPaymentId, "refunded");
      }

      updateUnifiedWebhookEventStatus(eventId, "processed", PROVIDER);
      await updateMirroredWebhookEvent(PROVIDER, eventId, "processed");
      return NextResponse.json({ ok: true, event: eventType, processed: true });
    }

    updateUnifiedWebhookEventStatus(eventId, "processed", PROVIDER);
    await updateMirroredWebhookEvent(PROVIDER, eventId, "processed");
    return NextResponse.json({ ok: true, event: eventType, ignored: true });
  } catch (err: any) {
    if (eventId) {
      updateUnifiedWebhookEventStatus(eventId, "failed", PROVIDER);
      await updateMirroredWebhookEvent(PROVIDER, eventId, "failed");
    }
    return NextResponse.json(
      { ok: false, error: err?.message || "Webhook processing error." },
      { status: 500 }
    );
  }
}
