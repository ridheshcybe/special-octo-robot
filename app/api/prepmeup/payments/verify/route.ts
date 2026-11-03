import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { verifyRazorpaySignature } from "@/lib/prepmeup/razorpay";
import { logger } from "@/lib/logger";
import { sendAccessConfirmationEmail } from "@/app/prepmeup/_lib/emailOtp";
import {
  canonicalizeStudentKey,
  resolveSessionIdentity,
  recordUserPresence,
  resolvePersistentDataDir,
} from "@/app/prepmeup/_lib/studentStore";
import {
  generateSquadInviteCodesForOrder,
  trackReferralAction,
} from "@/lib/prepmeup/growthEngine";

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
    let resolvedEmail = email?.trim().toLowerCase() || "";
    let resolvedName = fullName?.trim() || "Engineering Student";
    let resolvedPhone = cleanedPhone ? `+91${cleanedPhone}` : "+919820743178";

    const identity = resolveSessionIdentity(cookieStore);
    if (identity) {
      if (identity.email && !resolvedEmail) resolvedEmail = identity.email;
      if (identity.fullName && !fullName?.trim()) resolvedName = identity.fullName;
      if (identity.phone && !cleanedPhone) resolvedPhone = identity.phone;
    }

    const studentId = canonicalizeStudentKey(
      resolvedEmail || identity?.canonicalId || (cleanedPhone ? `wa-${cleanedPhone}` : "paid-student-id")
    );

    const targetSemesterId = semesterId || "a1111111-1111-4111-8111-111111111111";
    const serviceClient = createPmuServiceClient();

    // 2. Reconcile Payment and Provision Access in Supabase when configured
    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
      try {
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
      } catch (supaErr) {
        console.warn("[PAYMENT_VERIFY] Supabase update skipped/failed, falling back to local persistence:", supaErr);
      }
    }

    // Persist paid tier to durable student store
    try {
      recordUserPresence({
        userId: studentId,
        name: resolvedName,
        target: resolvedEmail || resolvedPhone || `${studentId}@student.dypiu.ac.in`,
        type: resolvedEmail ? "email" : "phone",
        tier:
          tier === "tier3"
            ? "Tier 3 VIP Unlimited (₹499)"
            : tier === "tier2"
            ? "Tier 2 Pro (₹199)"
            : "Tier 1 Pass (₹99)",
        branch: "B.Tech CSE AI/ML",
        activity: `Verified ${tier.toUpperCase()} Payment (${razorpay_order_id})`,
        page: "/prepmeup/pricing",
      });
    } catch (storeErr) {
      console.warn("[PAYMENT_VERIFY] Could not persist user presence:", storeErr);
    }

    // Automatically record initial booked 1:1 mentorship session into admin state if provided (Idempotent by orderId/paymentId)
    let isDuplicateVerification = false;
    if (mentorSlot || tier === "tier3" || tier === "tier2") {
      try {
        const dataDir = resolvePersistentDataDir();
        const stateFile = path.join(dataDir, "admin_state.json");
        let stateObj: any = {};
        if (fs.existsSync(stateFile)) {
          stateObj = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
        }
        if (!Array.isArray(stateObj.sessions)) stateObj.sessions = [];
        if (!Array.isArray(stateObj.verifiedPayments)) stateObj.verifiedPayments = [];

        const alreadyVerified =
          stateObj.verifiedPayments.some(
            (p: any) =>
              p.orderId === razorpay_order_id || p.paymentId === razorpay_payment_id
          ) ||
          stateObj.sessions.some(
            (s: any) =>
              s.orderId === razorpay_order_id ||
              s.paymentId === razorpay_payment_id ||
              (typeof s.notes === "string" && s.notes.includes(razorpay_order_id))
          );

        if (alreadyVerified) {
          isDuplicateVerification = true;
        } else {
          stateObj.verifiedPayments.unshift({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            studentId,
            tier,
            verifiedAt: new Date().toISOString(),
          });

          const newSessionRecord = {
            id: `sess-${razorpay_order_id.replace(/[^a-zA-Z0-9]/g, "")}`,
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            studentId,
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
        }
      } catch (sessErr) {
        console.warn("[Session Auto-Schedule] Could not save session record:", sessErr);
      }
    } else {
      // Even for tier1 without mentorSlot, track idempotency in admin_state.json
      try {
        const dataDir = resolvePersistentDataDir();
        const stateFile = path.join(dataDir, "admin_state.json");
        let stateObj: any = {};
        if (fs.existsSync(stateFile)) {
          stateObj = JSON.parse(fs.readFileSync(stateFile, "utf-8"));
        }
        if (!Array.isArray(stateObj.verifiedPayments)) stateObj.verifiedPayments = [];
        const alreadyVerified = stateObj.verifiedPayments.some(
          (p: any) => p.orderId === razorpay_order_id || p.paymentId === razorpay_payment_id
        );
        if (alreadyVerified) {
          isDuplicateVerification = true;
        } else {
          stateObj.verifiedPayments.unshift({
            orderId: razorpay_order_id,
            paymentId: razorpay_payment_id,
            studentId,
            tier,
            verifiedAt: new Date().toISOString(),
          });
          fs.mkdirSync(path.dirname(stateFile), { recursive: true });
          fs.writeFileSync(stateFile, JSON.stringify(stateObj, null, 2), "utf-8");
        }
      } catch {}
    }

    // 3. Send Access Confirmation & Receipt Email to Student (Non-blocking, skip on duplicate replay)
    if (resolvedEmail && !isDuplicateVerification) {
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

    const priceMap: Record<string, number> = { tier1: 99, tier2: 199, tier2_squad: 449, tier3: 499 };
    const amountRupees = priceMap[tier] || 199;
    const effectiveSessionTier = tier === "tier2_squad" ? "tier2" : tier;

    // If a referral code was used, record referral conversion
    if (typeof body.promoCode === "string" && body.promoCode.trim().toUpperCase().startsWith("REF-") && !isDuplicateVerification) {
      try {
        trackReferralAction(body.promoCode.trim(), "conversion", resolvedName);
      } catch {}
    }

    // If this is the 3-Friend Study Squad Bundle, generate 2 redeemable friend codes (idempotent by orderId)
    let squadInviteCodes: string[] = [];
    if (tier === "tier2_squad") {
      try {
        const createdInvites = generateSquadInviteCodesForOrder({
          orderId: razorpay_order_id,
          buyerId: studentId,
          buyerName: resolvedName,
        });
        squadInviteCodes = createdInvites.map((inv) => inv.code);
      } catch (sqErr) {
        console.warn("[PAYMENT_VERIFY] Could not generate squad codes:", sqErr);
      }
    }

    const tierSuccessMessage =
      tier === "tier3"
        ? "Razorpay payment verified! Tier 3 (₹499): Premium 1:1 VIP Unlimited Live Mentorship Sessions + Pro AI is now active."
        : tier === "tier2_squad"
        ? `Razorpay payment verified! Your Tier 2 Pro Pass is active + 2 Study Squad Invite Codes (${squadInviteCodes.join(", ")}) are ready for your friends!`
        : tier === "tier2"
        ? "Razorpay payment verified! Tier 2 (₹199): Premium AI + 1:1 Human Support + Internship & Career Support is now active."
        : "Razorpay payment verified! Tier 1 (₹99): Semester 1 Basic Access is now active.";

    const response = NextResponse.json({
      ok: true,
      verified: true,
      duplicate: isDuplicateVerification,
      message: tierSuccessMessage,
      data: {
        accessGranted: true,
        duplicate: isDuplicateVerification,
        studentId,
        tier: effectiveSessionTier,
        purchasedBundle: tier,
        squadInviteCodes,
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
        tier: effectiveSessionTier,
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
