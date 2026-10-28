import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { structuredSyllabusSchema } from "@/app/prepmeup/_lib/validation";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { z } from "zod";

const commitPayloadSchema = z.object({
  subjectId: z.string().uuid("Invalid subject ID"),
  structure: structuredSyllabusSchema,
});

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");
    if (!adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Unauthorized admin access." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = commitPayloadSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid curriculum payload" },
        { status: 400 }
      );
    }

    const { subjectId, structure } = parseResult.data;
    const serviceClient = createPmuServiceClient();

    if (serviceClient) {
      for (const mod of structure.modules) {
        // Upsert Module
        const { data: moduleRow, error: modErr } = await serviceClient
          .from("pmu_modules")
          .upsert(
            {
              subject_id: subjectId,
              module_number: mod.moduleNumber,
              title: mod.title,
              description: mod.description || "",
              is_published: true,
            },
            { onConflict: "subject_id,module_number" }
          )
          .select("id")
          .single();

        if (modErr || !moduleRow) continue;

        // Upsert Topics for this Module
        for (const top of mod.topics) {
          await serviceClient.from("pmu_topics").upsert(
            {
              module_id: moduleRow.id,
              topic_number: top.topicNumber,
              title: top.title,
              slug: top.slug,
              estimated_reading_minutes: top.estimatedReadingMinutes,
              is_sample: top.isSample,
              is_published: true,
            },
            { onConflict: "module_id,slug" }
          );
        }
      }
    }

    return NextResponse.json({
      ok: true,
      message: `Curriculum successfully committed: ${structure.modules.length} modules updated.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to commit curriculum." }, { status: 500 });
  }
}
