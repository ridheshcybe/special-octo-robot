import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { verifyRazorpaySignature } from "@/lib/prepmeup/razorpay";
import { logger } from "@/lib/logger";
import { sendAccessConfirmationEmail } from "@/app/prepmeup/_lib/emailOtp";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");

    const body = await req.json().catch(() => ({}));
    const razorpay_order_id =
      body.razorpay_order_id || body.order_id || body.orderId || "";
    const razorpay_payment_id =
      body.razorpay_payment_id || body.payment_id || body.paymentId || "";
    const razorpay_signature =
      body.razorpay_signature || body.signature || "";

    const {
      semesterId,
      tier = "tier2",
      fullName = "Engineering Student",
      whatsappNumber = "",
      email = "",
      mentorTopic = "",
      mentorSlot = "",
    } = body;

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      logger.warn("PAYMENT_VERIFY", "Missing required fields in verification request", {
        hasOrderId: Boolean(razorpay_order_id),
        hasPaymentId: Boolean(razorpay_payment_id),
        hasSignature: Boolean(razorpay_signature),
      });
      return NextResponse.json(
        {
          ok: false,
          verified: false,
          error: "Missing required fields: order_id, payment_id, and signature are required.",
        },
        { status: 400 }
      );
    }

    // 1. Verify HMAC-SHA256(order_id + "|" + payment_id, KEY_SECRET)
    const isValid = verifyRazorpaySignature({
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      signature: razorpay_signature,
    });

    if (!isValid) {
      logger.warn("PAYMENT_VERIFY", "Cryptographic signature mismatch", {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
      });
      return NextResponse.json(
        {
          ok: false,
          verified: false,
          error: "Signature mismatch: Invalid Razorpay cryptographic signature.",
        },
        { status: 400 }
      );
    }

    logger.audit("PAYMENT_SUCCESSFUL", {
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      tier,
      whatsappNumber: whatsappNumber ? `${whatsappNumber.slice(0, 3)}***${whatsappNumber.slice(-3)}` : null,
    });

    const cleanedPhone = String(whatsappNumber).replace(/\D/g, "").slice(-10);
    let studentId = email
      ? `em-${email.trim().toLowerCase().replace(/[^a-zA-Z0-9]/g, "_").slice(0, 28)}`
      : cleanedPhone
      ? `wa-${cleanedPhone}`
      : "paid-student-id";
    let resolvedName = fullName?.trim() || "Engineering Student";
    let resolvedPhone = cleanedPhone ? `+91${cleanedPhone}` : "+919820743178";
    let resolvedEmail = email?.trim().toLowerCase() || "";

    if (studentSession?.value) {
      try {
        const parsed = JSON.parse(studentSession.value);
        if (parsed.userId) studentId = parsed.userId;
        if (parsed.fullName && !fullName?.trim()) resolvedName = parsed.fullName;
        if (parsed.phone && !cleanedPhone) resolvedPhone = parsed.phone;
        if (parsed.email && !resolvedEmail) resolvedEmail = parsed.email;
      } catch {}
    }

    const targetSemesterId = semesterId || "a1111111-1111-4111-8111-111111111111";
    const serviceClient = createPmuServiceClient();

    // 2. Reconcile Payment and Provision Access in Supabase when configured
    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
      await serviceClient
        .from("pmu_payments")
        .update({
          razorpay_payment_id,
          status: "paid",
          updated_at: new Date().toISOString(),
        })
        .eq("razorpay_order_id", razorpay_order_id);

      const accessType =
        tier === "tier3"
          ? "paid_tier3_unlimited"
          : tier === "tier2"
          ? "paid_tier2_pro"
          : "paid_tier1_basic";

      await serviceClient.from("pmu_subscriptions").upsert(
        {
          user_id: studentId,
          student_id: studentId,
          semester_id: targetSemesterId,
          status: "active",
          access_type: accessType,
          starts_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        },
        { onConflict: "user_id,semester_id" }
      );
    }

    // Automatically record initial booked 1:1 mentorship session into admin state if provided
    if (mentorSlot || tier === "tier3" || tier === "tier2") {
      try {
        const stateFile = path.join(process.cwd(), "deploy", "cms", "admin_state.json");
        let stateObj: any = {};
        if (fs.existsSync(stateFile)) {
          stateObj = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
        }
        if (!stateObj.sessions) stateObj.sessions = [];

        const newSessionRecord = {
          id: `sess-${Date.now()}`,
          studentName: resolvedName,
          whatsapp: resolvedPhone,
          tier: tier as "tier1" | "tier2" | "tier3",
          topic: mentorTopic || "1:1 Live Mentorship & Academic / Career Onboarding",
          slot: mentorSlot || "Scheduled upon booking confirmation",
          date: new Date().toISOString().slice(0, 10),
          time: "Flexible / Student Calendar",
          status: "scheduled",
          meetUrl: "https://meet.google.com/pmu-vip-room",
          notes: `Auto-created upon ${tier.toUpperCase()} checkout verification (Order: ${razorpay_order_id}).`,
          updatedAt: new Date().toISOString(),
        };

        stateObj.sessions.unshift(newSessionRecord);
        fs.mkdirSync(path.dirname(stateFile), { recursive: true });
        fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2), "utf-8");
      } catch (sessErr) {
        console.warn("[Session Auto-Schedule] Could not save session record:", sessErr);
      }
    }

    // 3. Send Access Confirmation & Receipt Email to Student (Non-blocking)
    if (resolvedEmail) {
      sendAccessConfirmationEmail({
        email: resolvedEmail,
        fullName: resolvedName,
        tier: tier === "tier3" ? ("tier3" as any) : tier === "tier2" ? "tier2" : "tier1",
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        mentorTopic: tier !== "tier1" ? mentorTopic : undefined,
        mentorSlot: tier !== "tier1" ? mentorSlot : undefined,
      }).catch((err) => {
        console.warn("[Email Notification] Could not deliver receipt email:", err?.message || err);
      });
    }

    const priceMap: Record<string, number> = { tier1: 99, tier2: 199, tier3: 499 };
    const amountRupees = priceMap[tier] || 199;

    const tierSuccessMessage =
      tier === "tier3"
        ? "Razorpay payment verified! Tier 3 (₹499): Premium 1:1 VIP Unlimited Live Mentorship Sessions + Pro AI is now active."
        : tier === "tier2"
        ? "Razorpay payment verified! Tier 2 (₹199): Premium AI + 1:1 Human Support + Internship & Career Support is now active."
        : "Razorpay payment verified! Tier 1 (₹99): Semester 1 Basic Access is now active.";

    const response = NextResponse.json({
      ok: true,
      verified: true,
      message: tierSuccessMessage,
      data: {
        accessGranted: true,
        tier,
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        amountRupees,
        expiresInDays: 180,
        mentorTopic,
        mentorSlot,
      },
    });

    // Provision / update session cookie so the student has immediate access
    response.cookies.set(
      "pmu-session",
      JSON.stringify({
        userId: studentId,
        phone: resolvedPhone,
        email: resolvedEmail || "",
        role: "student",
        isProfileComplete: true,
        fullName: resolvedName,
        branch: "B.Tech CSE AI/ML",
        currentSemester: 1,
        tier,
        paidOrderId: razorpay_order_id,
        paidPaymentId: razorpay_payment_id,
      }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 180,
      }
    );

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, verified: false, error: err.message || "Payment verification failed." },
      { status: 500 }
    );
  }
}
