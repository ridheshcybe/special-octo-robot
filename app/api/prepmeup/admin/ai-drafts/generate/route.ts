import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import {
  generateNotesDraftSchema,
  generateQuestionsBatchSchema,
} from "@/app/prepmeup/_lib/validation";
import { generateTopicNotesDraft, generateQuestionsBatch } from "@/lib/prepmeup/ai";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const draftType = body.draftType;

    const serviceClient = createPmuServiceClient();

    if (draftType === "notes") {
      const parseResult = generateNotesDraftSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid notes request" },
          { status: 400 }
        );
      }

      const { subjectId, subjectTitle, moduleTitle, topicTitle, topicId, syllabusContext } =
        parseResult.data;

      // 1. Generate Markdown Notes
      const notesMarkdown = await generateTopicNotesDraft({
        subject: subjectTitle,
        module: moduleTitle,
        topic: topicTitle,
        syllabusContext,
      });

      // 2. Persist into pmu_ai_content_drafts with status 'pending_review'
      let draftId = "mock-draft-" + Date.now();
      if (serviceClient) {
        const { data: draftRow, error } = await serviceClient
          .from("pmu_ai_content_drafts")
          .insert({
            subject_id: subjectId,
            topic_id: topicId || null,
            draft_type: "notes",
            prompt_summary: `Topic: ${topicTitle} (${subjectTitle})`,
            model_used: "gemini-2.5-flash",
            generated_content: { markdown: notesMarkdown, title: topicTitle },
            status: "pending_review",
          })
          .select("id")
          .single();

        if (draftRow) draftId = draftRow.id;
      }

      return NextResponse.json({
        ok: true,
        message: "AI Notes draft generated successfully and queued for review.",
        data: {
          draftId,
          draftType: "notes",
          title: topicTitle,
          status: "pending_review",
          content: { markdown: notesMarkdown },
        },
      });
    }

    if (draftType === "questions") {
      const parseResult = generateQuestionsBatchSchema.safeParse(body);
      if (!parseResult.success) {
        return NextResponse.json(
          { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid questions request" },
          { status: 400 }
        );
      }

      const { subjectId, subjectTitle, topicTitle, topicId, count, difficulty, types } =
        parseResult.data;

      const questionsBatch = await generateQuestionsBatch({
        subject: subjectTitle,
        topic: topicTitle,
        count,
        difficulty,
        types,
      });

      let draftId = "mock-draft-" + Date.now();
      if (serviceClient) {
        const { data: draftRow } = await serviceClient
          .from("pmu_ai_content_drafts")
          .insert({
            subject_id: subjectId,
            topic_id: topicId || null,
            draft_type: "questions",
            prompt_summary: `${count} ${difficulty} questions for ${topicTitle}`,
            model_used: "gemini-2.5-flash",
            generated_content: questionsBatch,
            status: "pending_review",
          })
          .select("id")
          .single();

        if (draftRow) draftId = draftRow.id;
      }

      return NextResponse.json({
        ok: true,
        message: "AI Questions draft generated successfully and queued for review.",
        data: {
          draftId,
          draftType: "questions",
          title: topicTitle,
          status: "pending_review",
          content: questionsBatch,
        },
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid draftType. Must be 'notes' or 'questions'." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to generate AI draft." }, { status: 500 });
  }
}
