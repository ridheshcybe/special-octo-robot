import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { verifyRazorpayWebhookSignature } from "@/lib/prepmeup/razorpay";
import { canonicalizeStudentKey, recordUserPresence, resolvePersistentDataDir } from "@/app/prepmeup/_lib/studentStore";

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
    const notes = payload.payload?.payment?.entity?.notes || payload.payload?.order?.entity?.notes || {};
    if (notes.platform !== "prepmeup") {
      // Ignore if meant for portfolio /courses
      return NextResponse.json({ ok: true, ignored: true, reason: "Not a PrepMeUp event" });
    }

    const paymentEntity = payload.payload?.payment?.entity || {};
    const orderId = paymentEntity?.order_id || payload.payload?.order?.entity?.id || "";
    const paymentId = paymentEntity?.id || "";
    const rawStudentId = notes.studentId || paymentEntity?.email || paymentEntity?.contact || "";
    const studentId = rawStudentId ? canonicalizeStudentKey(rawStudentId) : "";
    const tier = (notes.tier === "tier3" ? "tier3" : notes.tier === "tier1" ? "tier1" : "tier2") as
      | "tier1"
      | "tier2"
      | "tier3";
    const semesterId = notes.semesterId || "a1111111-1111-4111-8111-111111111111";

    // Handle failed or cancelled payment events explicitly without granting access
    if (event === "payment.failed" || event === "order.cancelled") {
      return NextResponse.json({
        ok: true,
        status: "payment_not_captured",
        event,
        accessGranted: false,
        orderId,
        paymentId,
      });
    }

    const serviceClient = createPmuServiceClient();

    if (event === "payment.captured" || event === "order.paid") {
      // Idempotency check in local admin_state.json
      let isDuplicateWebhook = false;
      try {
        const dataDir = resolvePersistentDataDir();
        const stateFile = path.join(dataDir, "admin_state.json");
        let stateObj: any = {};
        if (fs.existsSync(stateFile)) {
          stateObj = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
        }
        if (!Array.isArray(stateObj.webhookEvents)) stateObj.webhookEvents = [];

        const alreadyHandled = stateObj.webhookEvents.some(
          (w: any) => (orderId && w.orderId === orderId) || (paymentId && w.paymentId === paymentId)
        );
        if (alreadyHandled) {
          isDuplicateWebhook = true;
        } else {
          stateObj.webhookEvents.unshift({
            event,
            orderId,
            paymentId,
            studentId,
            tier,
            receivedAt: new Date().toISOString(),
          });
          fs.mkdirSync(path.dirname(stateFile), { recursive: true });
          fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2), "utf-8");
        }
      } catch {}

      if (studentId && !isDuplicateWebhook) {
        try {
          recordUserPresence({
            userId: studentId,
            name: notes.studentName || "Engineering Student",
            target: paymentEntity?.email || notes.studentPhone || paymentEntity?.contact || "+919820743178",
            type: paymentEntity?.email ? "email" : "phone",
            tier:
              tier === "tier3"
                ? "Tier 3 VIP Unlimited (₹499)"
                : tier === "tier2"
                ? "Tier 2 Pro (₹199)"
                : "Tier 1 Pass (₹99)",
            branch: "B.Tech CSE AI/ML",
            activity: `Webhook ${event} (${orderId || paymentId})`,
            page: "/api/prepmeup/payments/webhook",
          });
        } catch {}
      }

      if (serviceClient && orderId) {
        try {
          await serviceClient
            .from("pmu_payments")
            .update({
              razorpay_payment_id: paymentId,
              status: "paid",
              updated_at: new Date().toISOString(),
            })
            .eq("razorpay_order_id", orderId);

          if (studentId && /^[0-9a-f-]{36}$/i.test(studentId)) {
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
        } catch {}
      }

      return NextResponse.json({
        ok: true,
        status: "reconciled",
        duplicate: isDuplicateWebhook,
        accessGranted: true,
        orderId,
        paymentId,
      });
    }

    return NextResponse.json({ ok: true, status: "ignored_event", event, accessGranted: false });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Webhook handling failed." }, { status: 500 });
  }
}
