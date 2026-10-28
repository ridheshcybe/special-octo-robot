import { NextResponse, type NextRequest } from "next/server";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { verifyRazorpayWebhookSignature } from "@/lib/prepmeup/razorpay";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") || "";

    // 1. Verify HMAC-SHA256 Webhook Signature
    const isValid = verifyRazorpayWebhookSignature(rawBody, signature);
    if (!isValid) {
      return NextResponse.json({ ok: false, error: "Invalid webhook signature." }, { status: 400 });
    }

    const payload = JSON.parse(rawBody);
    const event = payload.event;

    // Filter strictly for PrepMeUp platform events
    const notes = payload.payload?.payment?.entity?.notes || {};
    if (notes.platform !== "prepmeup" && !payload.payload?.order?.entity?.notes?.platform) {
      // Ignore if meant for portfolio /courses
      return NextResponse.json({ ok: true, ignored: true, reason: "Not a PrepMeUp event" });
    }

    const serviceClient = createPmuServiceClient();

    if (event === "payment.captured" || event === "order.paid") {
      const paymentEntity = payload.payload?.payment?.entity;
      const orderId = paymentEntity?.order_id;
      const paymentId = paymentEntity?.id;
      const studentId = notes.studentId || paymentEntity?.notes?.studentId;
      const semesterId = notes.semesterId || paymentEntity?.notes?.semesterId || "a1111111-1111-4111-8111-111111111111";

      if (serviceClient && orderId) {
        // Mark payment as paid
        await serviceClient
          .from("pmu_payments")
          .update({
            razorpay_payment_id: paymentId,
            status: "paid",
            updated_at: new Date().toISOString(),
          })
          .eq("razorpay_order_id", orderId);

        // Grant subscription
        if (studentId) {
          await serviceClient.from("pmu_subscriptions").upsert(
            {
              user_id: studentId,
              student_id: studentId,
              semester_id: semesterId,
              status: "active",
              access_type: "paid",
              starts_at: new Date().toISOString(),
              expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
            },
            { onConflict: "user_id,semester_id" }
          );
        }
      }
    }

    return NextResponse.json({ ok: true, status: "reconciled" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Webhook handling failed." }, { status: 500 });
  }
}
