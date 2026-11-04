import { NextResponse, type NextRequest } from "next/server";
import { verifyCyberRazorpayWebhookSignature } from "@/lib/prepmeup/cyberRazorpay";
import {
  getCyberOrderByRazorpayId,
  updateCyberOrderStatus,
  createOrExtendCyberEnrollment,
  createCyberMentorshipPack,
  recordWebhookEventAtomic,
  updateWebhookEventStatus,
} from "@/app/prepmeup/_lib/trackStore";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  let eventId = "";
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // 1. Signature verification using timing-safe comparison
    const webhookSecret =
      process.env.CYBER_RAZORPAY_WEBHOOK_SECRET ||
      process.env.CYBER_RAZORPAY_KEY_SECRET ||
      process.env.RAZORPAY_WEBHOOK_SECRET ||
      process.env.RAZORPAY_KEY_SECRET;

    if (webhookSecret) {
      const isValid = verifyCyberRazorpayWebhookSignature(rawBody, signature);
      if (!isValid) {
        return NextResponse.json(
          { ok: false, error: "Invalid CyberSecurity webhook signature." },
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

    eventId = payload.event_id || payload.id || `evt_cyb_${Date.now()}`;
    const eventType = payload.event || "unknown";

    // 2. Persistent Idempotency Check in Supabase if available
    const serviceClient = createPmuServiceClient();
    if (serviceClient) {
      try {
        const { error: insertError } = await serviceClient
          .from("pmu_webhook_events")
          .insert({
            provider: "razorpay_cyber",
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
      } catch {}
    }

    // Durable fallback in CMS / TrackStore state
    const atomicRecord = recordWebhookEventAtomic({
      provider: "razorpay_cyber",
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
      updateWebhookEventStatus(eventId, "ignored");
      return NextResponse.json({ ok: true, received: true });
    }

    const order = getCyberOrderByRazorpayId(orderId);

    // 3. Handle Lifecycle Events
    if (eventType === "payment.captured") {
      if (order && order.status !== "paid") {
        updateCyberOrderStatus(orderId, "paid", {
          razorpayPaymentId: paymentId,
          amountInPaise,
          verificationStatus: "verified",
        });

        // Grant access if not already granted by frontend verify
        if (order.productType === "semester_pass") {
          createOrExtendCyberEnrollment({
            userId: order.userId,
            courseId: order.courseId,
            accessType: "semester_pass",
            months: 6,
            notes: `Webhook Captured ${paymentId}`,
          });
          createCyberMentorshipPack({
            userId: order.userId,
            courseId: order.courseId,
            packType: "semester_pass_included",
            totalSessions: 1,
            durationDays: 180,
          });
        } else if (order.productType === "mentorship_pack") {
          createCyberMentorshipPack({
            userId: order.userId,
            courseId: order.courseId,
            packType: "single_session",
            totalSessions: 1,
            durationDays: 90,
          });
        }
      }

      // Update Supabase if connected
      if (serviceClient) {
        try {
          await serviceClient
            .from("pmu_cyber_payments")
            .update({ webhook_status: "processed", status: "captured" })
            .eq("razorpay_payment_id", paymentId);

          await serviceClient
            .from("pmu_webhook_events")
            .update({ status: "processed", processed_at: new Date().toISOString() })
            .eq("provider", "razorpay_cyber")
            .eq("event_id", eventId);
        } catch {}
      }
      updateWebhookEventStatus(eventId, "processed");
    } else if (eventType === "payment.failed") {
      if (order && order.status !== "paid") {
        updateCyberOrderStatus(orderId, "failed", {
          razorpayPaymentId: paymentId,
          verificationStatus: "failed",
        });
      }
      updateWebhookEventStatus(eventId, "processed");
    } else if (eventType === "refund.processed") {
      if (order) {
        updateCyberOrderStatus(orderId, "refunded", {
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
      { ok: false, error: err?.message || "CyberSecurity webhook processing error." },
      { status: 500 }
    );
  }
}
