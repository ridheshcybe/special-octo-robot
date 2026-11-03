import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { debugPythonCode } from "@/lib/prepmeup/ai-tutor";
import {
  recordCodingSubmission,
  resolveSessionIdentity,
  StorageUnavailableError,
} from "@/app/prepmeup/_lib/studentStore";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Please log in to use Coding Helper." },
        { status: 401, headers: { "Cache-Control": "no-store" } }
      );
    }

    const studentId = identity.canonicalId;

    const body = await req.json().catch(() => ({}));
    const { code, errorOutput, requestType = "explain" } = body;

    if (!code?.trim()) {
      return NextResponse.json({ ok: false, error: "Code cannot be empty." }, { status: 400 });
    }

    const submissionId = body.submissionId || `code-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    const submittedAt = new Date().toISOString();

    // Only record a formal coding submission in Progress when requestType === "submit"
    // or when explicitly requested, so AI hint/explain clicks don't duplicate submissions
    if (requestType === "submit" || body.recordSubmission !== false) {
      recordCodingSubmission(studentId, {
        id: submissionId,
        problemId: body.problemId || "python-lab",
        problemTitle: body.problemTitle || "Python Coding Exercise",
        code,
        language: "python",
        status: errorOutput ? "runtime_error" : "accepted",
        submittedAt,
      });
    }

    // Call Python Coding Debugger
    const feedbackResult = await debugPythonCode({
      code,
      errorOutput,
      requestType: requestType === "submit" ? "explain" : requestType,
    });

    return NextResponse.json(
      {
        ok: true,
        data: {
          ...feedbackResult,
          submissionId,
          studentId,
          submittedAt,
        },
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    const status = err instanceof StorageUnavailableError ? 503 : 500;
    return NextResponse.json(
      {
        ok: false,
        code: err instanceof StorageUnavailableError ? err.code : "CODING_SUBMIT_ERROR",
        error: err.message || "Failed to analyze or record code submission.",
      },
      { status, headers: { "Cache-Control": "no-store" } }
    );
  }
}
