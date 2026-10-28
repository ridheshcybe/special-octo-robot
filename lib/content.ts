import { createAnonClient } from "./supabase/server";
import { SEED, LOCAL_HERO_VIDEO, LOCAL_PORTRAIT, localProjectImage } from "./seed";
import type { SiteContent } from "./types";

/* ------------------------------------------------------------------ *
 * Raw row shapes (mirror supabase/schema.sql)
 * ------------------------------------------------------------------ */

type SettingsRow = {
  hero_roles: string[] | null;
  hero_description: string | null;
  marquee_words: string[] | null;
  story_heading: string | null;
  story_body: string | null;
  projects_heading: string | null;
  research_heading: string | null;
  numbers_heading: string | null;
  contact_heading: string | null;
  contact_body: string | null;
  contact_email: string | null;
  hero_portrait_url: string | null;
  hero_video_url: string | null;
  github_username: string | null;
  papers_count: number | null;
};

type PrincipleRow = { id: number | string; sort_order: number; title: string; body: string };
type ProjectRow = {
  id: number | string;
  sort_order: number;
  published: boolean;
  name: string;
  category: string;
  year_label: string;
  outcome: string;
  blurb: string;
  image_url: string | null;
  href: string | null;
};
type ResearchRow = {
  id: number | string;
  sort_order: number;
  published: boolean;
  meta: string;
  title: string;
  url: string;
};
type SocialRow = { id: number | string; sort_order: number; label: string; url: string };

/* ------------------------------------------------------------------ *
 * Helpers
 * ------------------------------------------------------------------ */

const text = (value: string | null | undefined): string | undefined => {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const list = (value: string[] | null | undefined): string[] | undefined => {
  if (!Array.isArray(value)) return undefined;
  const cleaned = value.map((v) => String(v ?? "").trim()).filter(Boolean);
  return cleaned.length ? cleaned : undefined;
};

const localProjectImageOrNull = (i: number): string | null =>
  i < 4 ? localProjectImage(i + 1) : null;

/* ------------------------------------------------------------------ *
 * The one data layer
 * ------------------------------------------------------------------ */

/**
 * Reads everything the public page needs and returns a single SiteContent.
 *
 * Every query is wrapped so the page never throws: a missing env var, an
 * unreachable database or an empty table falls back to the matching slice of
 * `lib/seed.ts`. Components never query Supabase directly.
 */
export async function getSiteContent(): Promise<SiteContent> {
  const supabase = createAnonClient();
  if (!supabase) return SEED;

  try {
    const [settingsRes, principlesRes, projectsRes, researchRes, socialRes] = await Promise.all([
      supabase.from("site_settings").select("*").eq("id", 1).maybeSingle<SettingsRow>(),
      supabase.from("story_principles").select("*").order("sort_order", { ascending: true }),
      supabase
        .from("projects")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase
        .from("research")
        .select("*")
        .eq("published", true)
        .order("sort_order", { ascending: true }),
      supabase.from("social_links").select("*").order("sort_order", { ascending: true }),
    ]);

    const s = settingsRes.data ?? null;
    const principleRows = (principlesRes.data ?? []) as PrincipleRow[];
    const projectRows = (projectsRes.data ?? []) as ProjectRow[];
    const researchRows = (researchRes.data ?? []) as ResearchRow[];
    const socialRows = (socialRes.data ?? []) as SocialRow[];

    /* --- projects ------------------------------------------------- */
    const projects: SiteContent["projects"]["items"] = projectRows
      .filter((p) => p && text(p.name))
      .map((p, i) => ({
        id: String(p.id),
        name: text(p.name)!,
        category: text(p.category) ?? "",
        yearLabel: text(p.year_label) ?? "",
        outcome: text(p.outcome) ?? "",
        blurb: text(p.blurb) ?? "",
        imageUrl: text(p.image_url) ?? localProjectImageOrNull(i),
        href: text(p.href) ?? null,
      }));
    const projectItems = projects.length ? projects : SEED.projects.items;

    /* --- story principles ----------------------------------------- */
    const principles: SiteContent["story"]["principles"] = principleRows
      .filter((p) => p && text(p.title))
      .map((p, i) => ({
        id: String(p.id),
        index: String(i + 1).padStart(2, "0"),
        title: text(p.title)!,
        body: text(p.body) ?? "",
      }));

    /* --- research ------------------------------------------------- */
    const papers = researchRows
      .filter((r) => r && text(r.title))
      .map((r) => ({
        id: String(r.id),
        meta: text(r.meta) ?? "",
        title: text(r.title)!,
        url: text(r.url) ?? "",
      }));

    /* --- social --------------------------------------------------- */
    const social = socialRows
      .filter((r) => r && text(r.label))
      .map((r) => ({ id: String(r.id), label: text(r.label)!, url: text(r.url) ?? "" }));

    const heroPortraitUrl = text(s?.hero_portrait_url) ?? null;
    const heroVideoUrl = text(s?.hero_video_url) ?? null;

    return {
      heroRoles: list(s?.hero_roles) ?? SEED.heroRoles,
      heroDescription: text(s?.hero_description) ?? SEED.heroDescription,
      heroPortraitUrl: heroPortraitUrl ?? SEED.heroPortraitUrl ?? LOCAL_PORTRAIT,
      heroVideoUrl: heroVideoUrl ?? SEED.heroVideoUrl ?? LOCAL_HERO_VIDEO,
      heroPosterUrl: heroPortraitUrl ?? LOCAL_PORTRAIT,

      marqueeWords: list(s?.marquee_words) ?? SEED.marqueeWords,

      story: {
        heading: text(s?.story_heading) ?? SEED.story.heading,
        body: text(s?.story_body) ?? SEED.story.body,
        principles: principles.length ? principles : SEED.story.principles,
      },

      projects: {
        heading: text(s?.projects_heading) ?? SEED.projects.heading,
        countLabel: `${String(projectItems.length).padStart(2, "0")} / Projects`,
        items: projectItems,
      },

      research: {
        heading: text(s?.research_heading) ?? SEED.research.heading,
        items: papers.length ? papers : SEED.research.items,
      },

      numbers: {
        heading: text(s?.numbers_heading) ?? SEED.numbers.heading,
        githubUsername: text(s?.github_username) ?? SEED.numbers.githubUsername,
        papersCount:
          typeof s?.papers_count === "number" && Number.isFinite(s.papers_count)
            ? s.papers_count
            : SEED.numbers.papersCount,
      },

      contact: {
        heading: text(s?.contact_heading) ?? SEED.contact.heading,
        body: text(s?.contact_body) ?? SEED.contact.body,
        email: text(s?.contact_email) ?? SEED.contact.email,
      },

      social: social.length ? social : SEED.social,
    };
  } catch (err) {
    // Supabase unreachable / misconfigured: the site still renders the real copy.
    console.warn("getSiteContent fell back to the seed:", err);
    return SEED;
  }
}
