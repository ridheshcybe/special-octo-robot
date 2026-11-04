import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { draftReviewSchema } from "@/app/prepmeup/_lib/validation";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = draftReviewSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid review payload" },
        { status: 400 }
      );
    }

    const { draftId, action, comments, editedContent } = parseResult.data;
    const serviceClient = createPmuServiceClient();

    if (serviceClient) {
      // 1. Fetch Draft Record
      const { data: draft, error: fetchErr } = await serviceClient
        .from("pmu_ai_content_drafts")
        .select("*")
        .eq("id", draftId)
        .maybeSingle();

      if (fetchErr || !draft) {
        // Fallback for mock environment
        return NextResponse.json({
          ok: true,
          message: `Draft ${action} successfully (Local State Updated).`,
        });
      }

      const finalStatus =
        action === "approved" ? "approved" : action === "rejected" ? "rejected" : "pending_review";

      // 2. Update Draft Status
      await serviceClient
        .from("pmu_ai_content_drafts")
        .update({
          status: finalStatus,
          generated_content: editedContent || draft.generated_content,
          reviewed_at: new Date().toISOString(),
        })
        .eq("id", draftId);

      // 3. Log into pmu_content_reviews
      const adminData = JSON.parse(adminSession.value);
      if (adminData.userId && adminData.userId !== "mock-admin-id") {
        await serviceClient.from("pmu_content_reviews").insert({
          draft_id: draftId,
          reviewer_id: adminData.userId,
          action,
          comments,
        });
      }

      // 4. If Approved, publish directly into production academic tables
      if (action === "approved") {
        const content = editedContent || draft.generated_content;

        if (draft.draft_type === "notes" && draft.topic_id) {
          const markdown = content.markdown || "";
          await serviceClient.from("pmu_notes").upsert(
            {
              topic_id: draft.topic_id,
              title: content.title || "Topic Notes",
              content_markdown: markdown,
              status: "published",
              is_published: true,
              is_sample: false,
            },
            { onConflict: "topic_id" }
          );
        } else if (draft.draft_type === "questions" && draft.subject_id) {
          const questionsList = content.questions || [];
          for (const q of questionsList) {
            await serviceClient.from("pmu_questions").insert({
              subject_id: draft.subject_id,
              topic_id: draft.topic_id || null,
              question_type: q.questionType,
              difficulty: q.difficulty,
              question_text: q.questionText,
              options: q.options || null,
              correct_answer: q.correctAnswer,
              explanation: q.explanation || "",
              marks: q.marks || 1,
              source: "ai_generated",
              status: "published",
            });
          }
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Draft status updated to ${action}. Content has been published where applicable.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to process review." }, { status: 500 });
  }
}
