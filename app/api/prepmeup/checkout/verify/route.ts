import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  getUnifiedAccessSummary,
  getUnifiedEntitlementsForUser,
  getUnifiedOrderByRazorpayId,
  getUnifiedProductById,
  markUnifiedOrderPaid,
  markUnifiedOrderVerificationFailed,
} from "@/app/prepmeup/_lib/unifiedStore";
import {
  getUnifiedRazorpayCredentials,
  verifyUnifiedRazorpaySignature,
} from "@/lib/prepmeup/unifiedRazorpay";
import {
  mirrorUnifiedEntitlement,
  mirrorUnifiedOrderStatus,
  mirrorUnifiedPayment,
} from "@/lib/prepmeup/unifiedDbMirror";

export const dynamic = "force-dynamic";

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

    const order = getUnifiedOrderByRazorpayId(String(razorpayOrderId));
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found." }, { status: 404 });
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
        productSlug: order.productSlug,
        amountInPaise: order.amountInPaise,
        access: getUnifiedAccessSummary(order.userId),
        message: "This payment was already verified. Your access is active.",
      });
    }

    const { keySecret } = getUnifiedRazorpayCredentials();
    let isSignatureValid = false;

    if (keySecret && razorpaySignature) {
      isSignatureValid = verifyUnifiedRazorpaySignature({
        orderId: order.razorpayOrderId,
        paymentId: String(razorpayPaymentId),
        signature: String(razorpaySignature),
      });
    } else if (
      process.env.NODE_ENV !== "production" &&
      (String(razorpayPaymentId).startsWith("pay_mock_") ||
        order.razorpayOrderId.startsWith("order_unified_sandbox_") ||
        order.razorpayOrderId.startsWith("order_unified_free_"))
    ) {
      // Local/test mode only. Production always requires the gateway secret + signature.
      isSignatureValid = true;
    }

    if (!isSignatureValid) {
      markUnifiedOrderVerificationFailed(
        order.razorpayOrderId,
        String(razorpayPaymentId),
        razorpaySignature ? String(razorpaySignature) : undefined
      );
      return NextResponse.json(
        { ok: false, error: "Payment verification failed: invalid cryptographic signature." },
        { status: 400 }
      );
    }

    const { alreadyPaid } = markUnifiedOrderPaid({
      razorpayOrderId: order.razorpayOrderId,
      razorpayPaymentId: String(razorpayPaymentId),
      razorpaySignature: razorpaySignature ? String(razorpaySignature) : undefined,
      amountInPaise: order.amountInPaise,
      source: "checkout_verify",
    });

    const product = getUnifiedProductById(order.productId);
    const access = getUnifiedAccessSummary(order.userId);

    // Best-effort durable mirror (idempotent on the DB side).
    await mirrorUnifiedOrderStatus(order.razorpayOrderId, "paid");
    await mirrorUnifiedPayment({
      order,
      razorpayPaymentId: String(razorpayPaymentId),
      razorpaySignature: razorpaySignature ? String(razorpaySignature) : undefined,
      amountInPaise: order.amountInPaise,
      status: "captured",
      verificationStatus: "verified",
      webhookStatus: "pending",
    });
    const entitlements = getUnifiedEntitlementsForUser(order.userId).filter(
      (entitlement) => entitlement.sourceOrderId?.startsWith(order.id)
    );
    for (const entitlement of entitlements) {
      await mirrorUnifiedEntitlement(entitlement);
    }

    return NextResponse.json({
      ok: true,
      verified: true,
      alreadyProcessed: alreadyPaid,
      productSlug: order.productSlug,
      productName: product?.name,
      productType: product?.productType,
      amountInPaise: order.amountInPaise,
      access,
      message:
        product?.productType === "mentorship_pack"
          ? "Mentorship Pack added. One 45-minute session credit is valid for 90 days."
          : `${product?.name || "Pass"} activated for ${product?.durationDays || 180} days.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to complete payment verification." },
      { status: 500 }
    );
  }
}
