import { NextResponse, type NextRequest } from "next/server";
import { getCertificateByCode } from "@/app/prepmeup/_lib/trackStore";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateCode: string }> }
) {
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    // Rate limit: 30 public verification checks per IP per 1 minute
    const rateCheck = await checkDurableRateLimit({
      bucketKey: "certificate_public_verify",
      identifier: ip,
      limit: 30,
      windowSeconds: 60,
    });

    if (!rateCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: `Certificate verification request limit exceeded. Try again in ${rateCheck.retryAfterSec}s.` },
        { status: 429, headers: { "Retry-After": String(rateCheck.retryAfterSec || 30) } }
      );
    }

    const { certificateCode } = await params;
    const cert = getCertificateByCode(certificateCode);

    if (!cert) {
      return NextResponse.json(
        { ok: false, error: "Invalid or unrecognized certificate verification code." },
        { status: 404 }
      );
    }

    // Zero PII disclosure guarantee
    return NextResponse.json({
      ok: true,
      certificate: {
        code: cert.code,
        studentName: cert.studentName,
        courseTitle: cert.courseTitle,
        instructorName: cert.instructorName,
        issueDate: cert.issueDate,
        status: cert.status,
        verificationUrl: cert.verificationUrl,
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to verify certificate." },
      { status: 500 }
    );
  }
}
