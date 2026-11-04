import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { verifyCyberRazorpaySignature } from "@/lib/prepmeup/cyberRazorpay";
import {
  getCyberOrderByRazorpayId,
  updateCyberOrderStatus,
  recordCyberPayment,
  createOrExtendCyberEnrollment,
  createCyberMentorshipPack,
} from "@/app/prepmeup/_lib/trackStore";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please log in to verify payment." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const body = await req.json().catch(() => ({}));
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { ok: false, error: "Missing orderId or paymentId." },
        { status: 400 }
      );
    }

    // 1. Fetch Order
    const order = getCyberOrderByRazorpayId(razorpayOrderId);
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "CyberSecurity order not found." },
        { status: 404 }
      );
    }

    // 2. Signature Verification
    // Accept test signatures in dev/test fallback mode or when verified by HMAC
    const isSignatureValid =
      verifyCyberRazorpaySignature({
        orderId: razorpayOrderId,
        paymentId: razorpayPaymentId,
        signature: razorpaySignature || "",
      }) ||
      (process.env.NODE_ENV !== "production" &&
        razorpayPaymentId.startsWith("pay_test_")) ||
      Boolean(order.metadata?.testMode);

    if (!isSignatureValid) {
      updateCyberOrderStatus(order.id, "failed");
      recordCyberPayment({
        orderId: order.id,
        userId: studentId,
        razorpayPaymentId,
        razorpaySignature,
        amountInPaise: order.amountInPaise,
        status: "failed",
        verificationStatus: "failed",
      });

      return NextResponse.json(
        { ok: false, error: "Payment verification failed: invalid signature." },
        { status: 400 }
      );
    }

    // 3. Mark Order as Paid
    updateCyberOrderStatus(order.id, "paid");
    recordCyberPayment({
      orderId: order.id,
      userId: studentId,
      razorpayPaymentId,
      razorpaySignature,
      amountInPaise: order.amountInPaise,
      status: "captured",
      verificationStatus: "verified",
    });

    // 4. Activate Entitlements
    let enrollment = null;
    let mentorshipPack = null;

    if (order.productType === "semester_pass") {
      enrollment = createOrExtendCyberEnrollment({
        userId: studentId,
        courseId: order.courseId,
        accessType: "semester_pass",
        months: 6,
        notes: `Razorpay Payment ${razorpayPaymentId}`,
      });

      // 1 complimentary mentorship session included with semester pass
      mentorshipPack = createCyberMentorshipPack({
        userId: studentId,
        courseId: order.courseId,
        packType: "semester_pass_included",
        totalSessions: 1,
        durationDays: 180,
      });
    } else if (order.productType === "mentorship_pack") {
      mentorshipPack = createCyberMentorshipPack({
        userId: studentId,
        courseId: order.courseId,
        packType: "single_session",
        totalSessions: 1,
        durationDays: 90,
      });
    }

    // 5. Sync to Supabase if configured
    const serviceClient = createPmuServiceClient();
    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
      try {
        await serviceClient
          .from("pmu_cyber_orders")
          .update({ status: "paid", updated_at: new Date().toISOString() })
          .eq("razorpay_order_id", razorpayOrderId);

        await serviceClient.from("pmu_cyber_payments").insert({
          order_id: order.id,
          user_id: studentId,
          razorpay_payment_id: razorpayPaymentId,
          razorpay_signature: razorpaySignature,
          amount_in_paise: order.amountInPaise,
          currency: "INR",
          status: "captured",
          verification_status: "verified",
        });

        if (order.productType === "semester_pass") {
          await serviceClient.from("pmu_course_enrollments").upsert({
            user_id: studentId,
            course_id: "c0000000-0000-0000-0000-000000000003",
            access_type: "semester_pass",
            status: "active",
            starts_at: new Date().toISOString(),
            expires_at: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
          });
        }
      } catch (dbErr: any) {
        console.warn("[Cyber Verify] Supabase mirror sync note:", dbErr?.message);
      }
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      accessGranted: true,
      productType: order.productType,
      enrollment,
      mentorshipPack,
      message:
        order.productType === "semester_pass"
          ? "Payment verified! Your CyberSecurity Semester Pass is now active for 6 months."
          : "Payment verified! Your 1-on-1 Mentorship session is ready to book.",
    });
  } catch (err: any) {
    console.error("[Cyber Checkout Verify] Error:", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to verify payment." },
      { status: 500 }
    );
  }
}
