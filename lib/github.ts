import type { GithubStats } from "./types";

/**
 * Server-side GitHub stats for the Numbers section.
 *
 * Fetched here (not in the browser) so the unauthenticated 60/hour limit is
 * shared, and cached for an hour. `GITHUB_TOKEN` is optional and server-only.
 */
export async function getGithubStats(username: string): Promise<GithubStats> {
  const stats: GithubStats = { repos: null, stars: null, followers: null };
  if (!username) return stats;

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "ridhesh-walavalkar-portfolio",
  };
  const token = process.env.GITHUB_TOKEN;
  if (token) headers.Authorization = `Bearer ${token}`;

  const user = encodeURIComponent(username);

  try {
    const res = await fetch(`https://api.github.com/users/${user}`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const json = (await res.json()) as { public_repos?: number; followers?: number };
      stats.repos = typeof json.public_repos === "number" ? json.public_repos : null;
      stats.followers = typeof json.followers === "number" ? json.followers : null;
    }
  } catch {
    // Offline or rate-limited: the figure renders as an em dash.
  }

  try {
    const res = await fetch(`https://api.github.com/users/${user}/repos?per_page=100`, {
      headers,
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const list = (await res.json()) as Array<{ fork?: boolean; stargazers_count?: number }>;
      if (Array.isArray(list)) {
        stats.stars = list.reduce((sum, repo) => {
          if (!repo || repo.fork) return sum; // ignore forks
          return sum + (Number(repo.stargazers_count) || 0);
        }, 0);
      }
    }
  } catch {
    // Leave stars as null.
  }

  return stats;
}
