import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  getStudentQuantumProgress,
  issueQuantumCertificate,
  getCertificateByCode,
} from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required to check certificate status." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const progress = getStudentQuantumProgress(studentId);

    let certificate = null;
    if (progress.certificateCode) {
      certificate = getCertificateByCode(progress.certificateCode);
    }

    return NextResponse.json({
      ok: true,
      progress: {
        lessonsCompleted: progress.completedLessons.length,
        totalLessons: 20,
        simulationsCompleted: progress.completedSimulations.length,
        totalSimulations: 5,
        quizzesPassed: progress.passedQuizzes.length,
        totalQuizzes: 5,
        completionPercentage: progress.completionPercentage,
        status: progress.certificateStatus,
        isEligible: progress.completedLessons.length >= 20 && progress.passedQuizzes.length >= 5,
      },
      certificate,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load certificate data." },
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
        { ok: false, error: "Please log in to claim your certificate." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const body = await req.json().catch(() => ({}));
    const studentName = body.studentName || identity.fullName || identity.phone || "Certified Quantum Scholar";

    const result = issueQuantumCertificate(studentId, studentName);
    if (!result.success || !result.certificate) {
      return NextResponse.json(
        { ok: false, error: result.error || "Eligibility criteria not met." },
        { status: 400 }
      );
    }

    return NextResponse.json({
      ok: true,
      certificate: result.certificate,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to issue certificate." },
      { status: 500 }
    );
  }
}
