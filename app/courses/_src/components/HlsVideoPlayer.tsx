"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import Hls from "hls.js";
import { supabase, callEdgeFunction } from "../lib/supabase";
import { GET_HLS_URL } from "../config";
import { mmss } from "../lib/ist";

type Props = {
  lessonId: number;
  userId: string;
  /** Watermark text (the signed-in student's email). */
  watermark: string;
};

type HlsPayload = { master_playlist: string; segments: Record<string, string>; expires_in: number };

async function saveProgress(userId: string, lessonId: number, seconds: number) {
  if (seconds <= 0) return;
  await supabase()
    .from("lesson_progress")
    .upsert(
      {
        user_id: userId,
        lesson_id: lessonId,
        position_sec: seconds,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "user_id,lesson_id" },
    );
}

/** "…/hls/lesson-7/360p_0001.ts?X-Amz-…" → "360p_0001.ts" */
function fileNameOf(url: string): string {
  return url.split("?")[0].split("/").pop() ?? "";
}

/**
 * Self-hosted HLS player (Phase 4 — R2 + hls.js).
 *  - Asks get-hls-url for a presigned master playlist + a segment map. No raw
 *    R2 URL ever exists in the page — only per-object, expiring signed ones.
 *  - hls.js's xhrSetup opens each request against the signed URL from the map
 *    (calling xhr.open() inside xhrSetup is the documented way to redirect a
 *    request), so a student who copies a segment link only gets a URL that
 *    expires, and can never point the player at a playlist of their own.
 *  - Same UX as the YouTube player: resume from last position (2 s rewind),
 *    0.75–2× speed, moving email watermark, progress saved on a 10 s tick and
 *    on pause/ended through the RLS-scoped lesson_progress upsert.
 */
export default function HlsVideoPlayer({ lessonId, userId, watermark }: Props) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rate, setRate] = useState(1);
  const [remaining, setRemaining] = useState<string | null>(null);
  const [qualityLabel, setQualityLabel] = useState("Auto");

  // --- One-time setup: fetch signed URLs, then attach hls.js -----------------
  useEffect(() => {
    let destroyed = false;
    let cleanup: (() => void) | undefined;

    (async () => {
      // 1. Signed URLs — the edge function checks access first.
      const res = await callEdgeFunction(GET_HLS_URL, { lesson_id: lessonId });
      const body = (await res.json().catch(() => ({}))) as Partial<HlsPayload> & { error?: string };
      if (destroyed) return;
      if (!res.ok || !body.master_playlist || !body.segments) {
        setError(body.error ?? "Could not load the video.");
        return;
      }
      const segments = body.segments;
      const video = videoRef.current;
      if (!video) return;

      // 2. Serve the master from a blob URL; every other request is remapped
      //    to its presigned URL inside xhrSetup.
      const hls = new Hls({
        enableWorker: true,
        xhrSetup: (xhr, url) => {
          const signed = segments[fileNameOf(url)];
          if (signed) xhr.open("GET", signed, true); // readyState ≠ 0 → hls.js won't re-open
        },
      });
      hlsRef.current = hls;

      const masterUrl = URL.createObjectURL(
        new Blob([body.master_playlist], { type: "application/vnd.apple.mpegurl" }),
      );

      if (Hls.isSupported()) {
        hls.loadSource(masterUrl);
        hls.attachMedia(video);
      } else {
        // Native HLS (old iOS Safari): the master already contains absolute
        // presigned variant URLs, so the built-in player can follow them.
        video.src = masterUrl;
      }

      // 3. Resume: fetch the saved position for THIS user + lesson.
      const { data: rows } = await supabase()
        .from("lesson_progress")
        .select("position_sec")
        .eq("lesson_id", lessonId)
        .eq("user_id", userId)
        .limit(1);
      const saved = rows?.[0]?.position_sec ?? 0;
      if (saved > 5) {
        const startAt = () => {
          video.currentTime = Math.max(0, saved - 2); // slight rewind on resume
        };
        video.addEventListener("loadedmetadata", startAt, { once: true });
      }

      // 4. Progress tick while playing + immediate save on pause/ended.
      const tick = window.setInterval(() => {
        if (!video.paused && video.currentTime > 0) {
          void saveProgress(userId, lessonId, video.currentTime);
          if (video.duration > 0) {
            const left = Math.max(0, video.duration - video.currentTime);
            setRemaining(`${mmss(left * 1000)} left`);
          }
        }
      }, 10_000);
      const flush = () => void saveProgress(userId, lessonId, video.currentTime);
      video.addEventListener("pause", flush);
      video.addEventListener("ended", flush);

      // 5. Quality label + fatal-error surface.
      hls.on(Hls.Events.LEVEL_SWITCHED, (_e, data) => {
        const lvl = hls.levels?.[data.level];
        setQualityLabel(lvl?.height ? `${lvl.height}p` : "Auto");
      });
      hls.on(Hls.Events.ERROR, (_e, data) => {
        if (data.fatal) setError("Video stream broke — reload the page to get fresh links.");
      });

      cleanup = () => {
        window.clearInterval(tick);
        flush();
        video.removeEventListener("pause", flush);
        video.removeEventListener("ended", flush);
        hls.destroy();
        URL.revokeObjectURL(masterUrl);
      };
    })().catch((e: unknown) => {
      if (!destroyed) setError(e instanceof Error ? e.message : "Could not load the video.");
    });

    return () => {
      destroyed = true;
      cleanup?.();
      hlsRef.current = null;
    };
  }, [lessonId, userId]);

  // Watermark drifts on a slow loop so cropping one corner doesn't remove it.
  const [pos, setPos] = useState({ x: 8, y: 12 });
  useEffect(() => {
    const timer = window.setInterval(() => {
      setPos((p) => ({
        x: 8 + ((p.x * 7 + 31) % 60),
        y: 10 + ((p.y * 5 + 17) % 65),
      }));
    }, 7000);
    return () => window.clearInterval(timer);
  }, []);

  const changeSpeed = useCallback((next: number) => {
    setRate(next);
    if (videoRef.current) videoRef.current.playbackRate = next;
  }, []);

  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-black">
        <video ref={videoRef} controls playsInline className="h-full w-full" />
        <span
          aria-hidden
          className="pointer-events-none absolute select-none text-xs font-medium text-white/40 drop-shadow"
          style={{ left: `${pos.x}%`, top: `${pos.y}%`, transition: "all 1.6s ease-in-out" }}
        >
          {watermark}
        </span>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-zinc-500">Speed</span>
        {[0.75, 1, 1.25, 1.5, 2].map((s) => (
          <button
            key={s}
            onClick={() => changeSpeed(s)}
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              rate === s ? "bg-indigo-600 text-white" : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {s}×
          </button>
        ))}
        <span className="ml-auto text-xs text-zinc-500">Quality: {qualityLabel}</span>
        {remaining ? <span className="text-xs text-zinc-500">{remaining}</span> : null}
      </div>
    </div>
  );
}
