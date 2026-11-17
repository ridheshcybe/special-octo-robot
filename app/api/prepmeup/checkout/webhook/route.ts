import { NextResponse, type NextRequest } from "next/server";
import {
  getUnifiedOrderByRazorpayId,
  updateUnifiedOrderStatus,
  recordWebhookEventAtomic,
  updateWebhookEventStatus,
} from "@/app/prepmeup/_lib/trackStore";
import { verifyUnifiedRazorpayWebhookSignature } from "@/lib/prepmeup/unifiedRazorpay";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature");

    if (!signature) {
      return NextResponse.json(
        { ok: false, error: "Missing required X-Razorpay-Signature header." },
        { status: 400 }
      );
    }

    // Verify webhook signature with timing-safe comparison
    const isValid = verifyUnifiedRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json(
        { ok: false, error: "Invalid webhook HMAC signature." },
        { status: 400 }
      );
    }

    let event: any;
    try {
      event = JSON.parse(rawBody);
    } catch {
      return NextResponse.json(
        { ok: false, error: "Invalid JSON payload in webhook body." },
        { status: 400 }
      );
    }

    const eventId = event.id || req.headers.get("x-razorpay-event-id") || `evt_${Date.now()}`;
    const eventType = event.event || "unknown";

    // Durable database-backed idempotency check
    const idempotency = recordWebhookEventAtomic({
      eventId,
      provider: "razorpay_unified",
      eventType,
      payload: event,
    });

    if (idempotency.isDuplicate) {
      // Return 200 immediately to prevent re-delivery loops
      return NextResponse.json({
        ok: true,
        message: "Duplicate webhook event ignored via durable database idempotency.",
        eventId,
      });
    }

    const paymentEntity = event?.payload?.payment?.entity;
    const razorpayOrderId = paymentEntity?.order_id;
    const paymentId = paymentEntity?.id;

    if (razorpayOrderId) {
      const order = getUnifiedOrderByRazorpayId(razorpayOrderId);
      if (order) {
        if (eventType === "payment.captured") {
          // If already paid, prevent duplicate entitlement re-provisioning
          if (order.status !== "paid") {
            updateUnifiedOrderStatus(razorpayOrderId, "paid", {
              razorpayPaymentId: paymentId,
              amountInPaise: paymentEntity.amount,
              webhookReceivedAt: new Date().toISOString(),
            });
          }
        } else if (eventType === "payment.failed") {
          if (order.status !== "paid") {
            updateUnifiedOrderStatus(razorpayOrderId, "failed", {
              razorpayPaymentId: paymentId,
              errorDescription: paymentEntity.error_description,
              webhookReceivedAt: new Date().toISOString(),
            });
          }
        } else if (eventType === "refund.processed") {
          updateUnifiedOrderStatus(razorpayOrderId, "refunded", {
            refundId: event?.payload?.refund?.entity?.id,
            refundAmount: event?.payload?.refund?.entity?.amount,
            webhookReceivedAt: new Date().toISOString(),
          });
        }
      }
    }

    updateWebhookEventStatus(eventId, "processed");

    return NextResponse.json({
      ok: true,
      message: "Unified webhook processed successfully.",
      eventId,
      eventType,
    });
  } catch (err: any) {
    console.error("[Unified Razorpay Webhook] Processing error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Webhook processing error." },
      { status: 500 }
    );
  }
}
