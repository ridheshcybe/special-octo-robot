import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { noteUpsertSchema } from "@/app/prepmeup/_lib/validation";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { getAllPersistentNotes, saveOrUpdateNote } from "@/lib/prepmeup/storage";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    // 1. Load notes from persistent storage (never empty / never lost)
    const persistentNotes = getAllPersistentNotes();

    const formattedPersistentNotes = persistentNotes.map((n) => ({
      id: n.id,
      title: n.title,
      topic_id: topicId || "f1111111-1111-4111-8111-111111111111",
      reading_time_min: n.reading_time_min,
      is_sample: n.is_sample,
      is_published: n.is_published,
      status: "published",
      content_markdown: n.content,
      topic: { title: `${n.subject_code} Unit 0${n.module_number}` },
    }));

    // 2. If Supabase is connected, query and merge
    const serviceClient = createPmuServiceClient();
    if (serviceClient) {
      try {
        let query = serviceClient.from("pmu_notes").select("*, topic:pmu_topics(title, module_id)");
        if (topicId) query = query.eq("topic_id", topicId);
        const { data: supaNotes } = await query.order("created_at", { ascending: false });
        if (supaNotes && supaNotes.length > 0) {
          const ids = new Set(supaNotes.map((x) => x.id));
          const merged = [...supaNotes, ...formattedPersistentNotes.filter((x) => !ids.has(x.id))];
          return NextResponse.json({ ok: true, notes: merged });
        }
      } catch {}
    }

    return NextResponse.json({ ok: true, notes: formattedPersistentNotes });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = noteUpsertSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid note input" },
        { status: 400 }
      );
    }

    const noteData = parseResult.data;

    // 1. Immediately save to persistent storage so it NEVER starts from zero
    const savedNote = saveOrUpdateNote({
      subjectCode: body.subjectCode || "CSE1001",
      moduleNumber: Number(body.moduleNumber) || 1,
      title: noteData.title,
      readingTimeMin: noteData.readingTimeMin,
      isSample: noteData.isSample,
      content: noteData.contentMarkdown,
      isPublished: noteData.isPublished,
    });

    // 2. Also sync to Supabase if connected
    const serviceClient = createPmuServiceClient();
    let supaRecord = null;
    if (serviceClient) {
      try {
        const { data, error } = await serviceClient
          .from("pmu_notes")
          .upsert(
            {
              topic_id: noteData.topicId,
              title: noteData.title,
              content_markdown: noteData.contentMarkdown,
              reading_time_min: noteData.readingTimeMin,
              is_sample: noteData.isSample,
              status: noteData.status,
              is_published: noteData.isPublished,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "topic_id" }
          )
          .select()
          .single();
        if (!error && data) supaRecord = data;
      } catch (e) {
        console.warn("[Supabase Sync Warning]:", e);
      }
    }

    return NextResponse.json({
      ok: true,
      message: "Note saved and persisted permanently.",
      note: supaRecord || savedNote,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
