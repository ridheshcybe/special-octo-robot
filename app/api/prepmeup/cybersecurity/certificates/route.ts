import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  CYBER_COURSE_SLUG,
  getCyberCertificateEligibility,
  getCyberCertificateForUser,
  issueCyberCertificate,
} from "@/app/prepmeup/_lib/cyberStore";
import { canClaimCyberCertificate } from "@/lib/prepmeup/access";
import { generateCyberCertificatePdf } from "@/lib/prepmeup/certificatePdf";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export const dynamic = "force-dynamic";

function bucketName(): string {
  return process.env.CERTIFICATE_STORAGE_BUCKET || "pmu-certificates";
}

function storagePathFor(userId: string, code: string): string {
  const safeUser = userId.replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 64);
  return `cyber-certificates/${safeUser}/${code}.pdf`;
}

async function uploadCertificatePdf(params: {
  userId: string;
  certificateCode: string;
  studentName: string;
  issueDate: string;
  verificationUrl: string;
}): Promise<{ pdfPath?: string; signedUrl?: string; pdf?: Buffer }> {
  const pdf = generateCyberCertificatePdf({
    studentName: params.studentName,
    courseTitle: "CyberSecurity Foundations",
    instructorName: "Meera Raghavan, CISSP",
    issueDate: params.issueDate,
    certificateCode: params.certificateCode,
    verificationUrl: params.verificationUrl,
  });

  const serviceClient = createPmuServiceClient();
  if (!serviceClient) return { pdf };

  const pdfPath = storagePathFor(params.userId, params.certificateCode);
  try {
    const { error } = await serviceClient.storage
      .from(bucketName())
      .upload(pdfPath, pdf, { contentType: "application/pdf", upsert: true });

    if (error) return { pdf };

    const { data: signed } = await serviceClient.storage
      .from(bucketName())
      .createSignedUrl(pdfPath, 300);

    return { pdfPath, signedUrl: signed?.signedUrl, pdf };
  } catch {
    return { pdf };
  }
}

export async function GET() {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const certificate = getCyberCertificateForUser(studentId);

    return NextResponse.json({
      ok: true,
      eligibility: getCyberCertificateEligibility(studentId, CYBER_COURSE_SLUG),
      certificate: certificate
        ? {
            code: certificate.code,
            studentName: certificate.studentName,
            courseTitle: certificate.courseTitle,
            instructorName: certificate.instructorName,
            issueDate: certificate.issueDate,
            status: certificate.status,
            verificationUrl: certificate.verificationUrl,
          }
        : null,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load certificate status." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to claim a certificate." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;

    if (!canClaimCyberCertificate(studentId, CYBER_COURSE_SLUG)) {
      const eligibility = getCyberCertificateEligibility(studentId, CYBER_COURSE_SLUG);
      return NextResponse.json(
        {
          ok: false,
          eligibility,
          error: `Certificate eligibility not met: ${eligibility.blockers.join("; ")}.`,
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const studentName = String(body.studentName || identity.fullName || "").trim();
    if (studentName.length < 2 || studentName.length > 120) {
      return NextResponse.json(
        { ok: false, error: "Enter the full legal name to print on the certificate." },
        { status: 400 }
      );
    }

    const issued = issueCyberCertificate({ userId: studentId, studentName });
    if (!issued.success || !issued.certificate) {
      return NextResponse.json(
        { ok: false, error: issued.error || "Failed to issue certificate." },
        { status: 400 }
      );
    }

    const uploaded = await uploadCertificatePdf({
      userId: studentId,
      certificateCode: issued.certificate.code,
      studentName,
      issueDate: issued.certificate.issueDate,
      verificationUrl: issued.certificate.verificationUrl,
    });

    const updated = uploaded.pdfPath
      ? issueCyberCertificate({ userId: studentId, studentName, pdfPath: uploaded.pdfPath })
      : issued;

    const certificate = updated.certificate || issued.certificate;

    return NextResponse.json({
      ok: true,
      certificate: {
        code: certificate.code,
        studentName: certificate.studentName,
        courseTitle: certificate.courseTitle,
        instructorName: certificate.instructorName,
        issueDate: certificate.issueDate,
        status: certificate.status,
        verificationUrl: certificate.verificationUrl,
      },
      downloadUrl: `/api/prepmeup/cybersecurity/certificates/${certificate.code}/pdf`,
      signedUrlAvailable: Boolean(uploaded.signedUrl),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to issue certificate." },
      { status: 500 }
    );
  }
}
