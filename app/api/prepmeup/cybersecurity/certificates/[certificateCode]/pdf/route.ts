import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { getCyberCertificateRecordByCode } from "@/app/prepmeup/_lib/cyberStore";
import { generateCyberCertificatePdf } from "@/lib/prepmeup/certificatePdf";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

function bucketName(): string {
  return process.env.CERTIFICATE_STORAGE_BUCKET || "pmu-certificates";
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateCode: string }> }
) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to download a certificate." },
        { status: 401 }
      );
    }

    const { certificateCode } = await params;
    const studentId = identity.canonicalId;

    // Owner-only. A missing record and someone else's record are indistinguishable.
    const certificate = getCyberCertificateRecordByCode(certificateCode, studentId);
    if (!certificate) {
      return NextResponse.json(
        { ok: false, error: "Certificate not found." },
        { status: 404 }
      );
    }

    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";
    const rate = await checkDurableRateLimit({
      bucketKey: "cyber_certificate_pdf",
      identifier: `${studentId}_${ip}`,
      limit: 10,
      windowSeconds: 60 * 60,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Certificate download limit reached. Try again in ${rate.retryAfterSec}s.`,
        },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec || 60) } }
      );
    }

    // Preferred path: short-lived signed URL to the private storage object.
    if (certificate.pdfPath) {
      const serviceClient = createPmuServiceClient();
      if (serviceClient) {
        const { data } = await serviceClient.storage
          .from(bucketName())
          .createSignedUrl(certificate.pdfPath, 300);
        if (data?.signedUrl) {
          return NextResponse.redirect(data.signedUrl, {
            status: 302,
            headers: { "Cache-Control": "private, no-store" },
          });
        }
      }
    }

    // Fallback: generate the PDF server-side and stream it to the owner.
    const pdf = generateCyberCertificatePdf({
      studentName: certificate.studentName,
      courseTitle: certificate.courseTitle,
      instructorName: certificate.instructorName,
      issueDate: certificate.issueDate,
      certificateCode: certificate.code,
      verificationUrl: certificate.verificationUrl,
    });

    return new Response(new Uint8Array(pdf), {
      status: 200,
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="PrepMeUp-CyberSecurity-${certificate.code}.pdf"`,
        "Cache-Control": "private, no-store",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to generate certificate PDF." },
      { status: 500 }
    );
  }
}
