import { createClient } from "@supabase/supabase-js";
import fs from "fs";
import path from "path";
import {
  FALLBACK_SUBJECTS,
  FALLBACK_SUBJECT_DETAILS,
  type PmuSubject,
  type PmuModule,
  type PmuNote,
  type PmuPastPaper,
} from "./data";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_PMU_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
}

function getAdminStateCustomContent(slug: string, subjectCode: string) {
  try {
    const p = path.join(process.cwd(), "deploy", "cms", "admin_state.json");
    if (fs.existsSync(p)) {
      const state = JSON.parse(fs.readFileSync(p, "utf-8"));
      const isMatch = (c: string) => {
        if (!c) return false;
        const normalized = c.toUpperCase().replace(/[^A-Z0-9]/g, "");
        const codeNormalized = (subjectCode || "").toUpperCase().replace(/[^A-Z0-9]/g, "");
        return (
          normalized.includes(codeNormalized) ||
          codeNormalized.includes(normalized) ||
          (slug.includes("web") && (normalized.includes("FWT") || normalized.includes("CSE1004") || normalized.includes("WEB")))
        );
      };

      const customNotes = (state.publishedContent || []).filter(
        (x: any) => x.contentType === "note" && isMatch(x.subjectCode)
      );
      const customModules = (state.publishedContent || []).filter(
        (x: any) => x.contentType === "module" && isMatch(x.subjectCode)
      );
      const syllabusCommitted = state.committedSyllabi?.[slug] || state.committedSyllabi?.[subjectCode];

      return { customNotes, customModules, syllabusCommitted };
    }
  } catch {}
  return { customNotes: [], customModules: [], syllabusCommitted: null };
}

/**
 * Returns all published Semester 1 subjects.
 * Queries Supabase `pmu_subjects` with fallback to `FALLBACK_SUBJECTS`.
 */
export async function getPmuSubjects(): Promise<PmuSubject[]> {
  const supabase = getSupabaseClient();
  if (!supabase) return FALLBACK_SUBJECTS;

  try {
    const { data, error } = await supabase
      .from("pmu_subjects")
      .select("*, pmu_modules(count)")
      .eq("is_published", true)
      .order("code", { ascending: true });

    if (error || !data || data.length === 0) {
      return FALLBACK_SUBJECTS;
    }

    return data.map((sub) => ({
      id: sub.id,
      code: sub.code,
      title: sub.title,
      slug: sub.slug,
      description: sub.description,
      credit_units: sub.credit_units,
      icon: sub.icon,
      is_published: sub.is_published,
      module_count: (sub.pmu_modules as unknown as [{ count: number }])?.[0]?.count ?? 4,
    }));
  } catch {
    return FALLBACK_SUBJECTS;
  }
}

function applyCustomContentOverlay(
  detail: {
    subject: PmuSubject;
    modules: PmuModule[];
    sampleNote: PmuNote | null;
    pastPapers: PmuPastPaper[];
  },
  slug: string
) {
  const { customNotes, customModules, syllabusCommitted } = getAdminStateCustomContent(slug, detail.subject.code);

  let updatedSampleNote = detail.sampleNote;
  if (customNotes.length > 0) {
    const latest = customNotes[0];
    updatedSampleNote = {
      id: latest.id,
      topic_id: `t-${latest.id}`,
      title: latest.title,
      reading_time_min: latest.readingTimeMin || 15,
      status: "published" as const,
      is_sample: latest.isSample,
      pdf_url: null,
      content: latest.contentMarkdown,
    };
  }

  let updatedModules = [...detail.modules];
  if (syllabusCommitted?.modules?.length > 0) {
    updatedModules = syllabusCommitted.modules.map((m: any, idx: number) => ({
      id: `comm-mod-${idx + 1}`,
      subject_id: detail.subject.id,
      module_number: m.moduleNumber || idx + 1,
      title: m.title,
      description: m.description || "",
      is_published: true,
      topics: (m.topics || []).map((t: any, tIdx: number) => ({
        id: `comm-top-${idx + 1}-${tIdx + 1}`,
        module_id: `comm-mod-${idx + 1}`,
        topic_number: t.topicNumber || tIdx + 1,
        title: t.title,
        slug: t.slug,
        description: "",
        estimated_reading_minutes: t.estimatedReadingMinutes || 20,
        is_sample: Boolean(t.isSample),
        is_published: true,
      })),
    }));
  }

  return {
    ...detail,
    modules: updatedModules,
    sampleNote: updatedSampleNote,
    subject: {
      ...detail.subject,
      module_count: updatedModules.length,
    },
  };
}

/**
 * Returns subject details, modules, sample notes, and past papers.
 */
export async function getPmuSubjectDetail(slug: string): Promise<{
  subject: PmuSubject;
  modules: PmuModule[];
  sampleNote: PmuNote | null;
  pastPapers: PmuPastPaper[];
} | null> {
  const fallback = FALLBACK_SUBJECT_DETAILS[slug];

  const supabase = getSupabaseClient();
  if (!supabase) {
    return fallback ? applyCustomContentOverlay(fallback, slug) : null;
  }

  try {
    const { data: subData, error: subError } = await supabase
      .from("pmu_subjects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (subError || !subData) {
      return fallback ? applyCustomContentOverlay(fallback, slug) : null;
    }

    const [modulesRes, papersRes] = await Promise.all([
      supabase
        .from("pmu_modules")
        .select("*, pmu_topics(*)")
        .eq("subject_id", subData.id)
        .eq("is_published", true)
        .order("module_number", { ascending: true }),
      supabase
        .from("pmu_past_papers")
        .select("*")
        .eq("subject_id", subData.id)
        .eq("is_published", true)
        .order("exam_year", { ascending: false }),
    ]);

    const modules: PmuModule[] = modulesRes.data
      ? modulesRes.data.map((m) => ({
          id: m.id,
          subject_id: m.subject_id,
          module_number: m.module_number,
          title: m.title,
          description: m.description,
          is_published: m.is_published,
          topics: m.pmu_topics ?? [],
        }))
      : fallback?.modules ?? [];

    const pastPapers: PmuPastPaper[] = papersRes.data && papersRes.data.length > 0
      ? papersRes.data
      : fallback?.pastPapers ?? [];

    const baseResult = {
      subject: {
        id: subData.id,
        code: subData.code,
        title: subData.title,
        slug: subData.slug,
        description: subData.description,
        credit_units: subData.credit_units,
        icon: subData.icon,
        is_published: subData.is_published,
        module_count: modules.length,
      },
      modules,
      sampleNote: fallback?.sampleNote ?? null,
      pastPapers,
    };

    return applyCustomContentOverlay(baseResult, slug);
  } catch {
    return fallback ? applyCustomContentOverlay(fallback, slug) : null;
  }
}
