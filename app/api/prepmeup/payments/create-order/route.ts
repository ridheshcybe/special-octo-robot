import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { createRazorpayClient, getRazorpayCredentials } from "@/lib/prepmeup/razorpay";
import { logger } from "@/lib/logger";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const body = await req.json().catch(() => ({}));

    const { keyId, keySecret } = getRazorpayCredentials();
    if (!keyId || !keySecret) {
      logger.warn("PAYMENT_ORDER", "Razorpay credentials missing in server environment");
      return NextResponse.json(
        { ok: false, error: "Razorpay credentials are not configured on the server." },
        { status: 401 }
      );
    }

    const rawWhatsapp =
      typeof body?.whatsappNumber === "string"
        ? body.whatsappNumber.replace(/\D/g, "").slice(-10)
        : "";

    let studentId = rawWhatsapp ? `wa-${rawWhatsapp}` : "guest-student-id";
    let studentName =
      typeof body?.fullName === "string" && body.fullName.trim()
        ? body.fullName.trim()
        : "Engineering Student";
    let studentPhone = rawWhatsapp ? `+91${rawWhatsapp}` : "";

    if (studentSession?.value) {
      try {
        const parsed = JSON.parse(studentSession.value);
        if (parsed.userId) studentId = parsed.userId;
        if (parsed.fullName) studentName = parsed.fullName;
        if (parsed.phone) studentPhone = parsed.phone;
      } catch {}
    }

    const semesterId = body.semesterId || "a1111111-1111-4111-8111-111111111111";
    const tier = body.tier === "tier1" ? "tier1" : "tier2";

    // Support explicit `amount` (in paise) or derive from `tier` (Tier 1 = 9900p, Tier 2 = 19900p)
    const amountInPaise =
      typeof body.amount === "number"
        ? Math.round(body.amount)
        : body.tier === "tier1"
        ? 9900
        : 19900;

    // Validate minimum amount >= 100 paise (₹1.00)
    if (!Number.isFinite(amountInPaise) || amountInPaise < 100) {
      return NextResponse.json(
        { ok: false, error: "Minimum order amount is 100 paise (₹1.00)." },
        { status: 400 }
      );
    }

    const currency = typeof body.currency === "string" && body.currency.trim() ? body.currency.trim() : "INR";
    const receipt =
      typeof body.receipt === "string" && body.receipt.trim()
        ? body.receipt.trim()
        : `rcpt_pmu_${tier}_${Date.now()}`;

    const planLabel =
      tier === "tier2"
        ? "Tier 2 (₹199): Premium AI Help + 1:1 Human Support + Internship & Career Support"
        : "Tier 1 (₹99): Semester 1 Basic Access";

    const razorpay = createRazorpayClient();
    if (!razorpay) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Invalid Razorpay configuration." },
        { status: 401 }
      );
    }

    let order: any;
    try {
      order = await razorpay.orders.create({
        amount: amountInPaise,
        currency,
        receipt,
        notes: {
          platform: "prepmeup",
          tier,
          planLabel,
          studentId,
          studentName,
          studentPhone,
          semesterId,
        },
      });
    } catch (rzpErr: any) {
      const statusCode = rzpErr?.statusCode === 401 ? 401 : 500;
      const rzpDesc = rzpErr?.error?.description || rzpErr?.message;
      let errMsg = rzpDesc || "Razorpay API failed to create order.";

      if (statusCode === 401 || rzpDesc === "Authentication failed") {
        errMsg = `Razorpay API authentication failed for Key ID (${keyId.slice(0, 14)}...). Please verify in your Razorpay Dashboard (Settings > API Keys > Test Mode) that this Key ID and its Secret are active and have not been regenerated or revoked.`;
      }

      logger.error("PAYMENT_ORDER", errMsg, rzpErr, {
        amountInPaise,
        currency,
        keyIdPrefix: keyId ? keyId.slice(0, 12) : null,
      });

      return NextResponse.json(
        {
          ok: false,
          error: errMsg,
          details: {
            statusCode,
            keyIdPrefix: keyId ? `${keyId.slice(0, 12)}...` : "not_set",
            reason: rzpDesc || "Authentication failed",
          },
        },
        { status: statusCode }
      );
    }

    logger.info("PAYMENT_ORDER", `Order created: ${order.id} (${order.amount} paise, ${order.currency})`, {
      orderId: order.id,
      amount: order.amount,
      studentId,
    });

    // Save record in pmu_payments if Supabase service client is configured
    const serviceClient = createPmuServiceClient();
    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
      await serviceClient.from("pmu_payments").insert({
        user_id: studentId,
        student_id: studentId,
        semester_id: semesterId,
        razorpay_order_id: order.id,
        amount_in_paise: order.amount,
        status: "created",
        platform: "prepmeup",
      });
    }

    return NextResponse.json({
      ok: true,
      order_id: order.id,
      amount: order.amount,
      currency: order.currency,
      data: {
        orderId: order.id,
        order_id: order.id,
        tier,
        planLabel,
        amount: order.amount,
        amountRupees: Number(order.amount) / 100,
        currency: order.currency,
        keyId: keyId || process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        isLiveRazorpay: true,
        hostedPaymentPageUrl:
          tier === "tier2"
            ? process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_TIER2 || ""
            : process.env.NEXT_PUBLIC_RAZORPAY_PAYMENT_PAGE_TIER1 || "",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to create payment order." },
      { status: 500 }
    );
  }
}
