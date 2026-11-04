import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { pastPaperUpsertSchema } from "@/app/prepmeup/_lib/validation";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const subjectId = searchParams.get("subjectId");

    const serviceClient = createPmuServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ ok: true, papers: [] });
    }

    let query = serviceClient.from("pmu_past_papers").select("*, subject:pmu_subjects(title, code)");
    if (subjectId) query = query.eq("subject_id", subjectId);

    const { data: papers, error } = await query.order("exam_year", { ascending: false });
    if (error) {
      return NextResponse.json({ ok: true, papers: [], warning: error.message });
    }

    return NextResponse.json({ ok: true, papers: papers ?? [] });
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
    const parseResult = pastPaperUpsertSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid past paper input" },
        { status: 400 }
      );
    }

    const paper = parseResult.data;
    const serviceClient = createPmuServiceClient();

    if (serviceClient) {
      const { data, error } = await serviceClient
        .from("pmu_past_papers")
        .insert({
          subject_id: paper.subjectId,
          exam_year: paper.examYear,
          exam_type: paper.examType,
          title: paper.title,
          question_paper_url: paper.filePath,
          file_path: paper.filePath,
          solution_path: paper.solutionPath || null,
          is_published: paper.isPublished,
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
      }

      return NextResponse.json({ ok: true, message: "Past paper added successfully.", paper: data });
    }

    return NextResponse.json({ ok: true, message: "Past paper added successfully (dev mode)." });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
