import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { noteUpsertSchema } from "@/app/prepmeup/_lib/validation";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const topicId = searchParams.get("topicId");

    const serviceClient = createPmuServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ ok: true, notes: [] });
    }

    let query = serviceClient.from("pmu_notes").select("*, topic:pmu_topics(title, module_id)");
    if (topicId) query = query.eq("topic_id", topicId);

    const { data: notes, error } = await query.order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ ok: true, notes: [], warning: error.message });
    }

    return NextResponse.json({ ok: true, notes: notes ?? [] });
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
    const serviceClient = createPmuServiceClient();

    if (serviceClient) {
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

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: "Note saved successfully.", note: data });
    }

    return NextResponse.json({ ok: true, message: "Note saved successfully (dev mode)." });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
