import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const draftType = searchParams.get("draftType");

    const serviceClient = createPmuServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ ok: true, drafts: [] });
    }

    let query = serviceClient
      .from("pmu_ai_content_drafts")
      .select("*, subject:pmu_subjects(title, code), topic:pmu_topics(title)");

    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    if (draftType && draftType !== "all") {
      query = query.eq("draft_type", draftType);
    }

    const { data: drafts, error } = await query.order("created_at", { ascending: false });
    if (error) {
      return NextResponse.json({ ok: true, drafts: [], warning: error.message });
    }

    return NextResponse.json({ ok: true, drafts: drafts ?? [] });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
