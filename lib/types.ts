/**
 * The single content shape the public page renders from.
 *
 * Every component receives slices of this object — no component talks to
 * Supabase directly. `lib/content.ts` maps the database rows into it and
 * `lib/seed.ts` provides the same shape as a fallback.
 */

export type Principle = {
  /** stable key for React lists */
  id: string;
  /** display index, e.g. "01" */
  index: string;
  title: string;
  body: string;
};

export type Project = {
  id: string;
  name: string;
  category: string;
  /** "2026", "Ongoing" */
  yearLabel: string;
  /** "Live", "Prototype" */
  outcome: string;
  blurb: string;
  /** resolved image URL (Storage, or the public/ fallback) — null shows the placeholder */
  imageUrl: string | null;
  /** resolved link — null renders the card as a non-link */
  href: string | null;
};

export type Paper = {
  id: string;
  /** "IAEME Publication — 2026" */
  meta: string;
  title: string;
  url: string;
};

export type SocialLink = {
  id: string;
  label: string;
  url: string;
};

export type SiteContent = {
  heroRoles: string[];
  heroDescription: string;
  heroPortraitUrl: string | null;
  heroVideoUrl: string | null;
  /** the poster still for the hero video (falls back to the portrait) */
  heroPosterUrl: string | null;

  marqueeWords: string[];

  story: {
    heading: string;
    body: string;
    principles: Principle[];
  };

  projects: {
    heading: string;
    /** derived, e.g. "04 / Projects" */
    countLabel: string;
    items: Project[];
  };

  research: {
    heading: string;
    items: Paper[];
  };

  numbers: {
    heading: string;
    githubUsername: string;
    papersCount: number;
  };

  contact: {
    heading: string;
    body: string;
    email: string;
  };

  social: SocialLink[];
};

/** Live GitHub figures for the Numbers section. `null` renders as an em dash. */
export type GithubStats = {
  repos: number | null;
  stars: number | null;
  followers: number | null;
};
