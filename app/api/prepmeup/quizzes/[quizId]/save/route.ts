import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ quizId: string }> }
) {
  try {
    const { quizId } = await params;
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized session." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { attemptId, answers, timeSpentSeconds } = body;

    if (!attemptId) {
      return NextResponse.json({ ok: false, error: "Attempt ID required." }, { status: 400 });
    }

    const serviceClient = createPmuServiceClient();

    if (serviceClient && attemptId && !attemptId.startsWith("attempt-")) {
      // Auto-save time spent in attempt
      await serviceClient
        .from("pmu_quiz_attempts")
        .update({
          time_spent_seconds: timeSpentSeconds || 0,
        })
        .eq("id", attemptId);

      // Auto-save answer entries
      if (answers && typeof answers === "object") {
        for (const [qId, val] of Object.entries(answers)) {
          await serviceClient.from("pmu_quiz_answers").upsert(
            {
              attempt_id: attemptId,
              question_id: qId,
              selected_option: typeof val === "string" ? val : null,
              text_answer: typeof val === "number" ? String(val) : null,
              answer: { val },
            },
            { onConflict: "attempt_id,question_id" }
          );
        }
      }
    }

    return NextResponse.json({ ok: true, message: "Progress auto-saved successfully." });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to auto-save." }, { status: 500 });
  }
}
