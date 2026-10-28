/**
 * Accepts any common YouTube URL shape (watch, youtu.be, shorts, embed,
 * live, /v/) or a bare video id, and returns the 11-character id — or null.
 * Used by the admin editor so you can paste a full unlisted share URL.
 */
export function extractYouTubeId(input: string): string | null {
  const value = input.trim();
  if (!value) return null;

  // Bare id (11 chars, YouTube's alphabet).
  if (/^[A-Za-z0-9_-]{11}$/.test(value)) return value;

  try {
    const url = new URL(value);
    const host = url.hostname.replace(/^www\./, "");
    const path = url.pathname;

    if (host === "youtu.be") {
      const id = path.slice(1).split("/")[0];
      return /^[A-Za-z0-9_-]{11}$/.test(id) ? id : null;
    }

    if (host.endsWith("youtube.com") || host.endsWith("youtube-nocookie.com")) {
      // /watch?v=ID
      const v = url.searchParams.get("v");
      if (v && /^[A-Za-z0-9_-]{11}$/.test(v)) return v;

      // /shorts/ID, /embed/ID, /live/ID, /v/ID
      const m = path.match(/^\/(?:shorts|embed|live|v)\/([A-Za-z0-9_-]{11})(?:[/?#]|$)/);
      if (m) return m[1];
    }
  } catch {
    // Not a URL — fall through to null.
  }
  return null;
}
