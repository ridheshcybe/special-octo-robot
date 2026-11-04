import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  CYBER_COURSE_SLUG,
  CYBER_CTF_CHALLENGES,
  CYBER_FINAL_ASSESSMENT,
  CYBER_LABS,
  CYBER_LESSONS,
  CYBER_QUIZZES,
  getCyberCertificateEligibility,
  getCyberProgress,
  markCyberProgress,
} from "@/app/prepmeup/_lib/cyberStore";
import {
  canAccessCyberCtf,
  canAccessCyberFinalAssessment,
  canAccessCyberLab,
  canAccessCyberLesson,
  canAccessCyberQuiz,
  getCyberAccessSummary,
} from "@/lib/prepmeup/access";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
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
    const body = await req.json().catch(() => ({}));
    const type = body.type;
    const id = typeof body.id === "string" ? body.id : "";

    if (!["lesson", "lab", "ctf", "quiz", "final_assessment"].includes(type) || !id) {
      return NextResponse.json(
        { ok: false, error: "Invalid progress update payload." },
        { status: 400 }
      );
    }

    let allowed = false;

    if (type === "lesson") {
      const lesson = CYBER_LESSONS.find((l) => l.id === id) || null;
      if (!lesson) {
        return NextResponse.json({ ok: false, error: "Lesson not found." }, { status: 404 });
      }
      allowed = canAccessCyberLesson(studentId, lesson, CYBER_COURSE_SLUG);
    } else if (type === "lab") {
      const lab = CYBER_LABS.find((l) => l.id === id) || null;
      if (!lab) {
        return NextResponse.json({ ok: false, error: "Lab not found." }, { status: 404 });
      }
      allowed = canAccessCyberLab(studentId, lab, CYBER_COURSE_SLUG);
    } else if (type === "ctf") {
      const challenge = CYBER_CTF_CHALLENGES.find((c) => c.id === id) || null;
      if (!challenge) {
        return NextResponse.json({ ok: false, error: "Challenge not found." }, { status: 404 });
      }
      allowed = canAccessCyberCtf(studentId, challenge, CYBER_COURSE_SLUG);
    } else if (type === "quiz") {
      const quiz = CYBER_QUIZZES.find((q) => q.id === id) || null;
      if (!quiz) {
        return NextResponse.json({ ok: false, error: "Quiz not found." }, { status: 404 });
      }
      allowed = canAccessCyberQuiz(studentId, quiz, CYBER_COURSE_SLUG);
    } else {
      if (id !== CYBER_FINAL_ASSESSMENT.id) {
        return NextResponse.json(
          { ok: false, error: "Final assessment not found." },
          { status: 404 }
        );
      }
      allowed = canAccessCyberFinalAssessment(studentId, CYBER_COURSE_SLUG);
    }

    if (!allowed) {
      return NextResponse.json(
        {
          ok: false,
          upgradeRequired: true,
          error: "An active CyberSecurity Semester Pass is required for this content.",
        },
        { status: 403 }
      );
    }

    const progress = markCyberProgress(studentId, {
      type,
      id,
      passed: Boolean(body.passed),
    });

    return NextResponse.json({
      ok: true,
      progress,
      eligibility: getCyberCertificateEligibility(studentId, CYBER_COURSE_SLUG),
      access: getCyberAccessSummary(studentId, CYBER_COURSE_SLUG),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to update CyberSecurity progress." },
      { status: 500 }
    );
  }
}
