import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { retrieveSyllabusGrounding, solveAcademicDoubt } from "@/lib/prepmeup/ai-tutor";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ doubtId: string }> }
) {
  try {
    const { doubtId } = await params;
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { messageText, history = [] } = body;

    if (!messageText?.trim()) {
      return NextResponse.json({ ok: false, error: "Message cannot be empty." }, { status: 400 });
    }

    // 1. RAG Context
    const { contextText, isGrounded } = await retrieveSyllabusGrounding({ query: messageText });

    // 2. Solve with conversation memory
    const solution = await solveAcademicDoubt({
      queryText: messageText,
      conversationHistory: history,
      groundingContext: contextText,
      isGrounded,
    });

    const serviceClient = createPmuServiceClient();
    if (serviceClient && doubtId && !doubtId.startsWith("doubt-")) {
      await serviceClient.from("pmu_doubt_messages").insert({
        doubt_id: doubtId,
        sender_type: "student",
        message_text: messageText,
      });

      await serviceClient.from("pmu_doubt_messages").insert({
        doubt_id: doubtId,
        sender_type: "ai",
        message_text: solution.responseText,
        is_grounded_in_syllabus: solution.isGrounded,
      });
    }

    return NextResponse.json({
      ok: true,
      data: {
        reply: solution.responseText,
        isGrounded: solution.isGrounded,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to append reply." }, { status: 500 });
  }
}
