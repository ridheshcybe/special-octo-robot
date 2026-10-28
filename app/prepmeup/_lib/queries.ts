import { createClient } from "@supabase/supabase-js";
import {
  FALLBACK_SUBJECTS,
  FALLBACK_SUBJECT_DETAILS,
  type PmuSubject,
  type PmuModule,
  type PmuNote,
  type PmuPastPaper,
} from "./data";

function getSupabaseClient() {
  const url = process.env.NEXT_PUBLIC_PMU_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false },
  });
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
    return fallback ?? null;
  }

  try {
    const { data: subData, error: subError } = await supabase
      .from("pmu_subjects")
      .select("*")
      .eq("slug", slug)
      .eq("is_published", true)
      .maybeSingle();

    if (subError || !subData) {
      return fallback ?? null;
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

    return {
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
  } catch {
    return fallback ?? null;
  }
}
