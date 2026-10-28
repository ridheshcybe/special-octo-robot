import type { SiteContent } from "./types";

/**
 * The complete Part 1 copy, mirrored verbatim.
 *
 * This is the fallback `lib/content.ts` returns whenever Supabase is
 * unreachable, the env vars are missing, or a table is empty — so the public
 * page always renders the real site and never throws.
 */

/** Local `public/` assets, used when Supabase Storage holds no URL. */
export const LOCAL_PORTRAIT = "/assets/hero/portrait.png";
export const LOCAL_HERO_VIDEO = "/assets/hero/hero.webm";
export const localProjectImage = (n: number) =>
  `/assets/projects/project-${String(n).padStart(2, "0")}.jpg`;

export const SEED: SiteContent = {
  heroRoles: ["Developer", "Researcher", "Founder"],
  heroDescription: "I start projects that shouldn't be public — and make them public.",
  heroPortraitUrl: LOCAL_PORTRAIT,
  heroVideoUrl: LOCAL_HERO_VIDEO,
  heroPosterUrl: LOCAL_PORTRAIT,

  marqueeWords: ["Ship Fast", "Build With Ridhesh", "Ship Fast", "Build With Ridhesh", "Ship Fast"],

  story: {
    heading: "Ship first. Refine in public.",
    body:
      "I'm an AI/ML developer and researcher, studying B.Tech AI/ML at D.Y. Patil International University. I build full-stack products solo — frontend, backend, and the AI that powers them — and I've published research on crop stress detection, with more on the way. The through-line: take the idea that isn't supposed to be out yet, and put it in front of people.",
    principles: [
      {
        id: "p1",
        index: "01",
        title: "Ship before it's polished",
        body: "A working prototype teaches more than a perfect plan. I build in the open and fix in public.",
      },
      {
        id: "p2",
        index: "02",
        title: "Own the whole stack",
        body: "Frontend, backend, and the AI in between. When I own every layer, nothing gets lost in a handoff.",
      },
      {
        id: "p3",
        index: "03",
        title: "Research has to run",
        body: "A paper only matters if the idea works. I turn research into tools people can actually use.",
      },
      {
        id: "p4",
        index: "04",
        title: "Always in motion",
        body: "Every project is a step toward the next one, and there's always another one coming.",
      },
    ],
  },

  projects: {
    heading: "Built fast. Shipped anyway.",
    countLabel: "04 / Projects",
    items: [
      {
        id: "c1",
        name: "CineMatch",
        category: "AI Recommendation Engine",
        yearLabel: "Ongoing",
        outcome: "Prototype",
        blurb:
          "A full-stack AI movie recommendation engine that learns what you like and finds what to watch next.",
        imageUrl: localProjectImage(1),
        href: "https://github.com/ridheshcybe",
      },
      {
        id: "c2",
        name: "HIA Lite",
        category: "AI Medical Report Explainer",
        yearLabel: "Ongoing",
        outcome: "Prototype",
        blurb:
          "An educational AI app that turns dense medical reports into plain language anyone can follow.",
        imageUrl: localProjectImage(2),
        href: "https://github.com/ridheshcybe",
      },
      {
        id: "c3",
        name: "Queue Cure '26",
        category: "Clinic Queue Management",
        yearLabel: "2026",
        outcome: "Live",
        blurb:
          "A Next.js queue management system that keeps clinic waiting rooms moving and patients informed.",
        imageUrl: localProjectImage(3),
        href: "https://github.com/ridheshcybe",
      },
      {
        id: "c4",
        name: "SecureOps Sync",
        category: "Incident Triage & Remediation",
        yearLabel: "2025",
        outcome: "Live",
        blurb: "An AI-powered system that triages security incidents and drives them to remediation.",
        imageUrl: localProjectImage(4),
        href: "https://github.com/ridheshcybe",
      },
    ],
  },

  research: {
    heading: "Published. More to come.",
    items: [
      {
        id: "r1",
        meta: "IAEME Publication — 2026",
        title:
          "A Unified Multi-Modal Framework for Crop Stress Detection: Combining Tabular Environmental Data and Leaf-Image Classification",
        url: "https://iaeme.com/Home/article_id/IJAIA_04_02_001",
      },
    ],
  },

  numbers: {
    heading: "Shipped, measured.",
    githubUsername: "ridheshcybe",
    papersCount: 1,
  },

  contact: {
    heading: "Got an idea that shouldn't be public yet?",
    body: "Internships, research, or a project that needs shipping — send it over. I read every message.",
    email: "walavalkarridhesh@gmail.com",
  },

  social: [
    { id: "s1", label: "GitHub", url: "https://github.com/ridheshcybe" },
    { id: "s2", label: "LinkedIn", url: "https://www.linkedin.com/in/ridheshcybe" },
    { id: "s3", label: "X / Twitter", url: "https://x.com/ridheshcybe" },
  ],
};
