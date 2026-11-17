import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  CYBER_COURSE_SLUG,
  getCyberCertificateEligibility,
  getCyberCertificateForUser,
  getCyberMentorshipBookings,
  getCyberMentorshipSlots,
  getCyberProgress,
} from "@/app/prepmeup/_lib/cyberStore";
import { getCyberAccessSummary } from "@/lib/prepmeup/access";

export const dynamic = "force-dynamic";

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
    const summary = getCyberAccessSummary(studentId, CYBER_COURSE_SLUG);
    const eligibility = getCyberCertificateEligibility(studentId, CYBER_COURSE_SLUG);
    const progress = getCyberProgress(studentId);
    const certificate = getCyberCertificateForUser(studentId);

    return NextResponse.json({
      ok: true,
      summary,
      eligibility,
      progress,
      certificate: certificate
        ? {
            code: certificate.code,
            status: certificate.status,
            issueDate: certificate.issueDate,
            verificationUrl: certificate.verificationUrl,
          }
        : null,
      bookings: getCyberMentorshipBookings(studentId),
      slots: summary.canBookMentorship ? getCyberMentorshipSlots() : [],
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load CyberSecurity access summary." },
      { status: 500 }
    );
  }
}
