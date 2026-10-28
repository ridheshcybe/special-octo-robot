import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { debugPythonCode } from "@/lib/prepmeup/ai-tutor";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Please log in to use Coding Helper." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { code, errorOutput, requestType = "explain" } = body;

    if (!code?.trim()) {
      return NextResponse.json({ ok: false, error: "Code cannot be empty." }, { status: 400 });
    }

    // Call Python Coding Debugger
    const feedbackResult = await debugPythonCode({
      code,
      errorOutput,
      requestType,
    });

    return NextResponse.json({
      ok: true,
      data: feedbackResult,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to analyze code." }, { status: 500 });
  }
}
