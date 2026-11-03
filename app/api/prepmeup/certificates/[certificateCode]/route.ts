import { NextResponse, type NextRequest } from "next/server";
import { getCertificateByCode } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ certificateCode: string }> }
) {
  try {
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
