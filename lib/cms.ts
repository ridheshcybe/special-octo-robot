import { SEED } from "./seed";
import type { Project, SiteContent } from "./types";

interface CmsFetchOptions extends RequestInit {
  tags?: string[];
  revalidate?: number | false;
}

/**
 * Robust Directus REST API fetcher with graceful fallbacks.
 * Ensures the website never crashes if the local self-hosted PC is asleep or offline.
 */
export async function fetchFromCms<T>(
  endpoint: string,
  options: CmsFetchOptions = {}
): Promise<T | null> {
  const cmsUrl = (process.env.CMS_API_URL || "https://cms.yourdomain.com").replace(/\/$/, "");
  const cmsToken = process.env.CMS_API_TOKEN;

  const url = `${cmsUrl}/items/${endpoint.replace(/^\//, "")}`;

  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (cmsToken) {
      headers["Authorization"] = `Bearer ${cmsToken}`;
    }

    const res = await fetch(url, {
      ...options,
      headers,
      next: {
        tags: options.tags || ["cms"],
        revalidate: options.revalidate !== undefined ? options.revalidate : 300,
      },
      // Timeout after 3.5 seconds so SSR doesn't hang if the local PC tunnel is down
      signal: AbortSignal.timeout(3500),
    });

    if (!res.ok) {
      console.warn(`[CMS] Failed to fetch ${endpoint} (HTTP ${res.status}): ${res.statusText}`);
      return null;
    }

    const json = await res.json();
    return json.data as T;
  } catch (err) {
    console.warn(`[CMS] Offline or unreachable at ${url}. Falling back to cached/seed data.`, (err as Error).message);
    return null;
  }
}

/**
 * Fetch portfolio projects from self-hosted Directus with fallback to SEED
 */
export async function getCmsProjects(): Promise<SiteContent["projects"]["items"]> {
  try {
    const data = await fetchFromCms<Array<Record<string, unknown>>>("projects?filter[status][_eq]=published&sort=sort", {
      tags: ["cms", "cms_projects"],
    });

    if (!data || !Array.isArray(data) || data.length === 0) {
      return SEED.projects.items;
    }

    const cmsUrl = (process.env.CMS_API_URL || "https://cms.yourdomain.com").replace(/\/$/, "");

    return data.map((item, idx) => ({
      id: String(item.id || `cms-${idx}`),
      name: String(item.name || item.title || "Untitled Project"),
      category: String(item.category || "Development"),
      yearLabel: String(item.year_label || item.year || new Date().getFullYear().toString()),
      outcome: String(item.outcome || "Production"),
      blurb: String(item.blurb || item.description || ""),
      imageUrl: item.image ? `${cmsUrl}/assets/${item.image}` : null,
      href: item.href ? String(item.href) : null,
    }));
  } catch {
    return SEED.projects.items;
  }
}
