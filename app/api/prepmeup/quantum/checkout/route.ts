import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { createRazorpayClient, getRazorpayCredentials } from "@/lib/prepmeup/razorpay";
import {
  createQuantumOrder,
  claimEarlyAdopterSeat,
  getEarlyAdopterCount,
} from "@/app/prepmeup/_lib/trackStore";
import { hasQuantumSemesterPass } from "@/lib/prepmeup/access";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please sign in to proceed with Quantum checkout." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const body = await req.json().catch(() => ({}));
    const productType = body.productType === "mentorship_pack" ? "mentorship_pack" : "semester_pass";
    const courseSlug = body.courseSlug || "quantum-computing-foundations";
    const claimEarlyAdopter = Boolean(body.claimEarlyAdopter);

    // Rate limit check:
    // If claiming early adopter: 5 per user/IP per 1 hour
    if (claimEarlyAdopter) {
      const eaCheck = await checkDurableRateLimit({
        bucketKey: "quantum_early_adopter_claim",
        identifier: `${studentId}_${ip}`,
        limit: 5,
        windowSeconds: 60 * 60,
      });

      if (!eaCheck.allowed) {
        return NextResponse.json(
          { ok: false, error: `Too many early-adopter claim attempts. Try again in ${eaCheck.retryAfterSec}s.` },
          { status: 429, headers: { "Retry-After": String(eaCheck.retryAfterSec || 60) } }
        );
      }
    }

    // General Quantum checkout rate limit: 10 per user/IP per 1 hour
    const checkoutCheck = await checkDurableRateLimit({
      bucketKey: "quantum_checkout",
      identifier: `${studentId}_${ip}`,
      limit: 10,
      windowSeconds: 60 * 60,
    });

    if (!checkoutCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `Too many checkout attempts. Please try again in ${checkoutCheck.retryAfterSec}s.` },
        { status: 429, headers: { "Retry-After": String(checkoutCheck.retryAfterSec || 60) } }
      );
    }

    // 1. Check existing access
    if (productType === "semester_pass") {
      const alreadyHasPass = hasQuantumSemesterPass(studentId, courseSlug);
      if (alreadyHasPass) {
        return NextResponse.json(
          {
            ok: false,
            error: "You already have active Quantum Semester Pass access.",
            alreadyPurchased: true,
          },
          { status: 400 }
        );
      }
    }

    // 2. Early Adopter Offer (100% off for first 10 students)
    const earlyLimit = Number(process.env.QUANTUM_EARLY_ADOPTER_LIMIT) || 10;
    if (claimEarlyAdopter && productType === "semester_pass") {
      const currentEarlyCount = getEarlyAdopterCount(courseSlug);
      if (currentEarlyCount < earlyLimit) {
        const claimResult = claimEarlyAdopterSeat(studentId, courseSlug, earlyLimit);
        if (claimResult.success) {
          // Persist in Supabase if configured
          const serviceClient = createPmuServiceClient();
          if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
            try {
              await serviceClient.from("pmu_quantum_early_adopter_redemptions").insert({
                user_id: studentId,
                course_id: "c1111111-1111-4111-8111-111111111111",
                redemption_number: claimResult.redemptionNumber,
                status: "claimed",
              });
              await serviceClient.from("pmu_course_enrollments").insert({
                user_id: studentId,
                course_id: "c1111111-1111-4111-8111-111111111111",
                access_type: "semester_pass",
                status: "active",
                expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
              });
            } catch {}
          }

          return NextResponse.json({
            ok: true,
            earlyAdopterClaimed: true,
            redemptionNumber: claimResult.redemptionNumber,
            amount: 0,
            message: `Congratulations! Early Adopter seat #${claimResult.redemptionNumber} claimed successfully. You have 100% free Semester Pass access for 6 months.`,
          });
        } else {
          return NextResponse.json(
            { ok: false, error: claimResult.error || "Early Adopter offer unavailable." },
            { status: 400 }
          );
        }
      }
    }

    // 3. Compute Price
    const semesterPassPrice =
      Number(process.env.QUANTUM_SEMESTER_PASS_PRICE_IN_PAISE) || 99900;
    const mentorshipPackPrice =
      Number(process.env.QUANTUM_MENTORSHIP_PACK_PRICE_IN_PAISE) || 49900;

    const amountInPaise = productType === "semester_pass" ? semesterPassPrice : mentorshipPackPrice;

    // 4. Create Razorpay Order
    const { keyId } = getRazorpayCredentials();
    let razorpayOrderId = `order_q_${Date.now()}_${Math.random().toString(16).substring(2, 6)}`;

    const rzpClient = createRazorpayClient();
    if (rzpClient) {
      try {
        const rzpOrder = await rzpClient.orders.create({
          amount: amountInPaise,
          currency: "INR",
          receipt: `rcpt_q_${Date.now()}`,
          notes: {
            studentId,
            productType,
            courseSlug,
          },
        });
        if (rzpOrder && rzpOrder.id) {
          razorpayOrderId = rzpOrder.id;
        }
      } catch (rzpErr: any) {
        console.warn("[Razorpay Quantum] Order creation API fallback to test order:", rzpErr?.message);
      }
    }

    // 5. Record order in store
    const order = createQuantumOrder({
      userId: studentId,
      courseId: courseSlug,
      productType,
      razorpayOrderId,
      amountInPaise,
      metadata: {
        studentPhone: identity.phone,
        studentName: identity.fullName,
      },
    });

    // Also persist in Supabase if service client available
    const serviceClient = createPmuServiceClient();
    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
      try {
        await serviceClient.from("pmu_quantum_orders").insert({
          user_id: studentId,
          course_id: "c1111111-1111-4111-8111-111111111111",
          product_type: productType,
          razorpay_order_id: razorpayOrderId,
          amount_in_paise: amountInPaise,
          currency: "INR",
          status: "created",
        });
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      orderId: razorpayOrderId,
      amount: amountInPaise,
      currency: "INR",
      productType,
      keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || keyId || "rzp_test_placeholder",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to initialize checkout." },
      { status: 500 }
    );
  }
}
