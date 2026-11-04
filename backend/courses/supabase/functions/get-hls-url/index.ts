// ============================================================================
// get-hls-url — edge function (Deno). Phase 4.
// Returns short-lived presigned URLs for an R2-hosted HLS lesson, ONLY after
// the same access check every other gated function uses (free preview OR
// profiles.access_expires_at > now()).
//
// How the signing works (no AWS SDK, no Cloudflare dependency):
//   R2 speaks the S3 protocol, so any object can be fetched with a URL signed
//   by AWS SigV4 query auth. This function HMACs the request with the R2
//   access key held in edge secrets and returns:
//     • master_playlist — a rewritten master m3u8 whose variant-playlist
//       lines are already presigned, served to hls.js straight from memory;
//     • segments — a map of segment file name → presigned GET URL. A tiny
//       custom hls.js loader swaps each segment request's URL for the signed
//       one, so the browser can never construct an unsigned, shareable link.
//   Signatures are valid 6 h — enough for a long study session; the player
//   silently re-calls this function to refresh the map before they expire.
//   Presigning is pure local HMAC — it costs no R2 ops and no function time.
// Secrets required (supabase secrets set):
//   R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET
// ============================================================================
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, content-type",
};

function json(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...CORS },
  });
}

// Naive in-memory, per-instance limiter — same as the other gated functions.
// The list/presign work makes this one the most expensive, so it gets half
// the budget.
const RATE_LIMIT = { max: 15, windowMs: 5 * 60_000 };
const hits = new Map<string, number[]>();

function rateLimited(userId: string): boolean {
  const now = Date.now();
  const arr = (hits.get(userId) ?? []).filter((t) => now - t < RATE_LIMIT.windowMs);
  if (arr.length >= RATE_LIMIT.max) return true;
  arr.push(now);
  hits.set(userId, arr);
  return false;
}

const ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID") ?? "";
const ACCESS_KEY_ID = Deno.env.get("R2_ACCESS_KEY_ID") ?? "";
const SECRET_ACCESS_KEY = Deno.env.get("R2_SECRET_ACCESS_KEY") ?? "";
const BUCKET = Deno.env.get("R2_BUCKET") ?? "hls-videos";

/** How long a signed URL stays valid (matches the player's refresh timer). */
const PRESIGN_TTL = 6 * 60 * 60; // 6 hours (R2 allows up to 7 days)

/** Must match scripts/make-hls.sh — same ladder, same names. */
const LADDER: Record<string, { bandwidth: number; res: string }> = {
  "360p": { bandwidth: 800_000, res: "640x360" },
  "480p": { bandwidth: 1_400_000, res: "854x480" },
  "720p": { bandwidth: 2_800_000, res: "1280x720" },
};

const enc = new TextEncoder();
const toHex = (buf: ArrayBuffer) =>
  [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");

async function hmac(key: Uint8Array | ArrayBuffer, data: string): Promise<ArrayBuffer> {
  const k = await crypto.subtle.importKey(
    "raw",
    key instanceof Uint8Array ? key : new Uint8Array(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  return crypto.subtle.sign("HMAC", k, enc.encode(data));
}

async function sha256Hex(data: string): Promise<string> {
  return toHex(await crypto.subtle.digest("SHA-256", enc.encode(data)));
}

async function signingKey(dateStamp: string): Promise<ArrayBuffer> {
  const kDate = await hmac(enc.encode(`AWS4${SECRET_ACCESS_KEY}`), dateStamp);
  const kRegion = await hmac(kDate, "auto"); // R2's fixed region literal
  const kService = await hmac(kRegion, "s3");
  return hmac(kService, "aws4_request");
}

/** URI-encode the way AWS SigV4 expects (only unreserved chars stay bare). */
function uriEnc(s: string): string {
  return encodeURIComponent(s).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

/** Build one presigned GET url for an object (or a list request when key=""). */
async function presign(key: string, extraQuery: Record<string, string> = {}): Promise<string> {
  const host = `${ACCOUNT_ID}.r2.cloudflarestorage.com`;
  const amzDate = new Date().toISOString().replace(/[:-]|\.\d{3}/g, "");
  const dateStamp = amzDate.slice(0, 8);
  const scope = `${dateStamp}/auto/s3/aws4_request`;

  const canonicalUri = `/${BUCKET}/${key.split("/").map(uriEnc).join("/")}`;
  const query: Record<string, string> = {
    "X-Amz-Algorithm": "AWS4-HMAC-SHA256",
    "X-Amz-Credential": `${ACCESS_KEY_ID}/${scope}`,
    "X-Amz-Date": amzDate,
    "X-Amz-Expires": String(PRESIGN_TTL),
    "X-Amz-SignedHeaders": "host",
    ...extraQuery,
  };
  const canonicalQuery = Object.keys(query)
    .sort()
    .map((k) => `${uriEnc(k)}=${uriEnc(query[k])}`)
    .join("&");
  const canonicalRequest = [
    "GET",
    canonicalUri,
    canonicalQuery,
    `host:${host}`,
    "",
    "host",
    "UNSIGNED-PAYLOAD",
  ].join("\n");

  const stringToSign = `AWS4-HMAC-SHA256\n${amzDate}\n${scope}\n${await sha256Hex(canonicalRequest)}`;
  const signature = toHex(await hmac(await signingKey(dateStamp), stringToSign));
  return `https://${host}${canonicalUri}?${canonicalQuery}&X-Amz-Signature=${signature}`;
}

/** List every key under a prefix (handles the 1000-per-page continuation). */
async function listKeys(prefix: string): Promise<string[]> {
  const keys: string[] = [];
  let token: string | null = null;
  do {
    const q: Record<string, string> = { "list-type": "2", prefix };
    if (token) q["continuation-token"] = token;
    const res = await fetch(await presign("", q));
    if (!res.ok) throw new Error(`R2 list failed (${res.status}).`);
    const xml = await res.text();
    for (const m of xml.matchAll(/<Key>([^<]*)<\/Key>/g)) keys.push(m[1]);
    token = xml.match(/<NextContinuationToken>([^<]*)<\/NextContinuationToken>/)?.[1] ?? null;
  } while (token);
  return keys;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  if (req.method !== "POST") return json({ error: "Method not allowed." }, 405);

  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY) {
    return json({ error: "R2 secrets are not configured on the server." }, 500);
  }

  const authHeader = req.headers.get("Authorization") ?? "";
  if (!authHeader.startsWith("Bearer ")) return json({ error: "Sign in first." }, 401);

  const admin = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    // 1. Who is calling?
    const { data: userData, error: userError } = await admin.auth.getUser(
      authHeader.replace("Bearer ", ""),
    );
    if (userError || !userData.user) return json({ error: "Sign in first." }, 401);
    const userId = userData.user.id;
    if (rateLimited(userId)) return json({ error: "Too many requests — slow down." }, 429);

    // 2. Validate input.
    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return json({ error: "Invalid JSON body." }, 400);
    }
    const lessonId = Number((body as { lesson_id?: unknown })?.lesson_id);
    if (!Number.isInteger(lessonId) || lessonId <= 0) {
      return json({ error: "Invalid lesson." }, 400);
    }

    // 3. Lesson must be a video of the HLS kind.
    const { data: lesson } = await admin
      .from("lessons")
      .select("id, type, is_free_preview, video_source")
      .eq("id", lessonId)
      .maybeSingle();
    if (!lesson) return json({ error: "Lesson not found." }, 404);
    if (lesson.type !== "video" || lesson.video_source !== "hls") {
      return json({ error: "This lesson has no self-hosted video." }, 400);
    }

    // 4. Access check: free preview OR active pass.
    let allowed = lesson.is_free_preview;
    if (!allowed) {
      const { data: profile } = await admin
        .from("profiles")
        .select("access_expires_at")
        .eq("id", userId)
        .maybeSingle();
      allowed = Boolean(
        profile?.access_expires_at && new Date(profile.access_expires_at) > new Date(),
      );
    }
    if (!allowed) return json({ error: "Your pass is not active." }, 403);

    // 5. Where do the files live? (folder part of the gated hls_path)
    const { data: secret } = await admin
      .from("lesson_secrets")
      .select("hls_path")
      .eq("lesson_id", lessonId)
      .maybeSingle();
    if (!secret?.hls_path) return json({ error: "Video not available yet." }, 404);
    const folder =
      secret.hls_path.lastIndexOf("/") > 0
        ? secret.hls_path.slice(0, secret.hls_path.lastIndexOf("/"))
        : secret.hls_path;

    // 6. List the bucket folder and split playlists from segments.
    const keys = await listKeys(`${folder}/`);
    const variantKeys = keys.filter(
      (k) => k.endsWith(".m3u8") && !k.endsWith("master.m3u8"),
    );
    const segmentKeys = keys.filter((k) => k.endsWith(".ts") || k.endsWith(".m4s"));
    if (variantKeys.length === 0) {
      return json({ error: "No HLS files found at that path." }, 404);
    }

    // 7. Master playlist with presigned variant URLs, best quality last.
    const order = (k: string) => {
      const name = k.slice(k.lastIndexOf("/") + 1).replace(".m3u8", "");
      return LADDER[name]?.bandwidth ?? 1_500_000;
    };
    const masterLines = ["#EXTM3U", "#EXT-X-VERSION:3", "#EXT-X-INDEPENDENT-SEGMENTS"];
    for (const key of [...variantKeys].sort((a, b) => order(a) - order(b))) {
      const name = key.slice(key.lastIndexOf("/") + 1).replace(".m3u8", "");
      const ladder = LADDER[name];
      masterLines.push(
        `#EXT-X-STREAM-INF:BANDWIDTH=${order(key)}${ladder ? `,RESOLUTION=${ladder.res}` : ""}`,
      );
      masterLines.push(await presign(key));
    }

    // 8. Segment map keyed by file name — the player's loader uses it.
    //    make-hls.sh prefixes names per variant (360p_0001.ts …) so the
    //    names are unique across the whole folder.
    const names = segmentKeys.map((k) => k.slice(k.lastIndexOf("/") + 1));
    if (new Set(names).size !== names.length) {
      return json(
        { error: "Duplicate segment names — re-run scripts/make-hls.sh for this lesson." },
        500,
      );
    }
    const segmentEntries = await Promise.all(
      segmentKeys.map(async (k) => [k.slice(k.lastIndexOf("/") + 1), await presign(k)] as const),
    );

    return json({
      master_playlist: masterLines.join("\n") + "\n",
      segments: Object.fromEntries(segmentEntries),
      expires_in: PRESIGN_TTL,
    });
  } catch (err) {
    return json(
      { error: err instanceof Error ? err.message : "Could not sign the video." },
      500,
    );
  }
});
