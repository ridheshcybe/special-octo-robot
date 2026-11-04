import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  CYBER_COURSE_ID,
  CYBER_MENTORSHIP_PACK_VALIDITY_DAYS,
  CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
  CYBER_PASS_MENTORSHIP_VALIDITY_DAYS,
  CYBER_SEMESTER_MONTHS,
  getCyberOrderByRazorpayId,
  markCyberOrderPaid,
  markCyberOrderVerificationFailed,
} from "@/app/prepmeup/_lib/cyberStore";
import {
  getCyberRazorpayCredentials,
  verifyCyberRazorpaySignature,
} from "@/lib/prepmeup/cyberRazorpay";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { getCyberAccessSummary } from "@/lib/prepmeup/access";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to verify payment." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const body = await req.json().catch(() => ({}));
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature } = body;

    if (!razorpayOrderId || !razorpayPaymentId) {
      return NextResponse.json(
        { ok: false, error: "Missing razorpayOrderId or razorpayPaymentId." },
        { status: 400 }
      );
    }

    const order = getCyberOrderByRazorpayId(String(razorpayOrderId));
    if (!order) {
      return NextResponse.json(
        { ok: false, error: "CyberSecurity order not found." },
        { status: 404 }
      );
    }

    // Never let a student verify (and activate) another student's order.
    if (order.userId.trim().toLowerCase() !== studentId.trim().toLowerCase()) {
      return NextResponse.json(
        { ok: false, error: "This order does not belong to the signed-in student." },
        { status: 403 }
      );
    }

    if (order.status === "paid") {
      return NextResponse.json({
        ok: true,
        verified: true,
        alreadyProcessed: true,
        productType: order.productType,
        amountInPaise: order.amountInPaise,
        access: getCyberAccessSummary(order.userId),
        message: "This payment was already verified. Your access is active.",
      });
    }

    const { keySecret } = getCyberRazorpayCredentials();
    let isSignatureValid = false;

    if (keySecret && razorpaySignature) {
      isSignatureValid = verifyCyberRazorpaySignature({
        orderId: order.razorpayOrderId,
        paymentId: String(razorpayPaymentId),
        signature: String(razorpaySignature),
      });
    } else if (
      process.env.NODE_ENV !== "production" &&
      (String(razorpayPaymentId).startsWith("pay_mock_") ||
        order.razorpayOrderId.startsWith("order_cyber_sandbox_"))
    ) {
      // Local/test mode only. Production always requires the gateway secret + signature.
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      markCyberOrderVerificationFailed(
        order.razorpayOrderId,
        String(razorpayPaymentId),
        razorpaySignature ? String(razorpaySignature) : undefined
      );
      return NextResponse.json(
        {
          ok: false,
          error: "Payment verification failed: invalid cryptographic signature.",
        },
        { status: 400 }
      );
    }

    const { alreadyPaid } = markCyberOrderPaid({
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: String(razorpayPaymentId),
      razorpaySignature: razorpaySignature ? String(razorpaySignature) : undefined,
      amountInPaise: order.amountInPaise,
      source: "checkout_verify",
    });

    // Best-effort durable mirror of payment, order, enrollment, and pack records.
    const serviceClient = createPmuServiceClient();
    if (serviceClient && UUID_RE.test(studentId)) {
      try {
        await serviceClient
          .from("pmu_cyber_orders")
          .update({ status: "paid", updated_at: new Date().toISOString() })
          .eq("razorpay_order_id", order.razorpayOrderId);

        const { data: dbOrder } = await serviceClient
          .from("pmu_cyber_orders")
          .select("id")
          .eq("razorpay_order_id", order.razorpayOrderId)
          .maybeSingle();

        if (dbOrder?.id) {
          const { error: paymentError } = await serviceClient
            .from("pmu_cyber_payments")
            .insert({
              order_id: dbOrder.id,
              user_id: studentId,
              razorpay_payment_id: String(razorpayPaymentId),
              razorpay_signature: razorpaySignature ? String(razorpaySignature) : null,
              amount_in_paise: order.amountInPaise,
              currency: "INR",
              status: "captured",
              verification_status: "verified",
              webhook_status: "pending",
            });

          if (paymentError) {
            await serviceClient
              .from("pmu_cyber_payments")
              .update({ status: "captured", verification_status: "verified" })
              .eq("razorpay_payment_id", String(razorpayPaymentId));
          }
        }

        if (order.productType === "semester_pass") {
          await serviceClient.from("pmu_course_enrollments").insert({
            user_id: studentId,
            course_id: CYBER_COURSE_ID,
            access_type: "semester_pass",
            status: "active",
            starts_at: new Date().toISOString(),
            expires_at: new Date(
              Date.now() + CYBER_SEMESTER_MONTHS * 30 * 24 * 60 * 60 * 1000
            ).toISOString(),
          });

          if (CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS > 0) {
            await serviceClient.from("pmu_cyber_mentorship_packs").insert({
              user_id: studentId,
              course_id: CYBER_COURSE_ID,
              pack_type: "semester_pass_included",
              total_sessions: CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
              used_sessions: 0,
              status: "active",
              expires_at: new Date(
                Date.now() + CYBER_PASS_MENTORSHIP_VALIDITY_DAYS * 24 * 60 * 60 * 1000
              ).toISOString(),
            });
          }
        } else {
          await serviceClient.from("pmu_cyber_mentorship_packs").insert({
            user_id: studentId,
            course_id: CYBER_COURSE_ID,
            pack_type: "single_session",
            total_sessions: 1,
            used_sessions: 0,
            status: "active",
            expires_at: new Date(
              Date.now() + CYBER_MENTORSHIP_PACK_VALIDITY_DAYS * 24 * 60 * 60 * 1000
            ).toISOString(),
          });
        }
      } catch {
        // Best-effort mirror only; the file-backed store is authoritative here.
      }
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      alreadyProcessed: alreadyPaid,
      productType: order.productType,
      amountInPaise: order.amountInPaise,
      access: getCyberAccessSummary(order.userId),
      message:
        order.productType === "semester_pass"
          ? "CyberSecurity Semester Pass activated for 6 months."
          : "CyberSecurity 1-on-1 Mentorship Pack added (valid 90 days).",
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to complete payment verification." },
      { status: 500 }
    );
  }
}
