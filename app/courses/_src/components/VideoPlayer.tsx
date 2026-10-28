"use client";
import { useEffect, useRef, useState } from "react";
import { supabase } from "../lib/supabase";

declare global {
  interface Window {
    YT?: {
      Player: new (
        el: HTMLElement,
        options: {
          videoId: string;
          playerVars: Record<string, string | number>;
          events: {
            onReady?: (e: { target: YTPlayer }) => void;
            onStateChange?: (e: { data: number; target: YTPlayer }) => void;
          };
        },
      ) => YTPlayer;
    };
    onYouTubeIframeAPIReady?: () => void;
  }
}

// Minimal typings for the parts of the YouTube IFrame API we use.
interface YTPlayer {
  playVideo(): void;
  pauseVideo(): void;
  seekTo(seconds: number, allowSeekAhead: boolean): void;
  getCurrentTime(): number;
  getDuration(): number;
  setPlaybackRate(rate: number): void;
  destroy(): void;
}

const API_SRC = "https://www.youtube-nocookie.com/iframe_api";

function loadIframeApi(): Promise<void> {
  return new Promise((resolve) => {
    if (window.YT?.Player) {
      resolve();
      return;
    }
    const prev = window.onYouTubeIframeAPIReady;
    window.onYouTubeIframeAPIReady = () => {
      prev?.();
      resolve();
    };
    const script = document.createElement("script");
    script.src = API_SRC;
    document.head.appendChild(script);
  });
}

const SPEEDS = [0.75, 1, 1.25, 1.5, 2];

type Props = {
  videoId: string;
  lessonId: number;
  userId: string;
  /** Watermark text (the signed-in student's email). */
  watermark: string;
};

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

/**
 * Privacy-enhanced YouTube player:
 *  - youtube-nocookie.com + rel=0 (related videos minimized to same channel)
 *  - custom speed control
 *  - resumes from the last position (per user per lesson, saved in Postgres
 *    through an RLS-scoped upsert — students can only ever write their own row)
 *  - a subtle moving watermark with the student's email
 */
export default function VideoPlayer({ videoId, lessonId, userId, watermark }: Props) {
  const holderRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<YTPlayer | null>(null);
  const [ready, setReady] = useState(false);
  const [rate, setRate] = useState(1);
  const [remaining, setRemaining] = useState<string | null>(null);

  // Load the player once per video.
  useEffect(() => {
    let destroyed = false;
    let tickTimer: number | undefined;

    (async () => {
      await loadIframeApi();
      if (destroyed || !holderRef.current) return;

      // 1. Fetch the saved position for THIS user + lesson.
      const { data: rows } = await supabase()
        .from("lesson_progress")
        .select("position_sec")
        .eq("lesson_id", lessonId)
        .eq("user_id", userId)
        .limit(1);
      const saved = rows?.[0]?.position_sec ?? 0;

      // 2. Create the player.
      playerRef.current = new window.YT!.Player(holderRef.current, {
        videoId,
        playerVars: {
          rel: 0,
          modestbranding: 1,
          playsinline: 1,
          start: Math.floor(saved > 5 ? saved - 2 : 0), // slight rewind on resume
        },
        events: {
          onReady: (e) => {
            if (destroyed) return;
            setReady(true);
            if (saved > 5) e.target.seekTo(saved, true);
          },
          onStateChange: (e) => {
            if (destroyed) return;
            const p = e.target;
            // Playing: tick every 10s to persist progress + update the label.
            if (e.data === 1 && tickTimer == null) {
              tickTimer = window.setInterval(() => {
                const t = p.getCurrentTime();
                const d = p.getDuration();
                void saveProgress(userId, lessonId, t);
                if (d > 0) {
                  const left = Math.max(0, d - t);
                  setRemaining(
                    `${String(Math.floor(left / 60)).padStart(2, "0")}:${String(
                      Math.floor(left % 60),
                    ).padStart(2, "0")} left`,
                  );
                }
              }, 10_000);
            }
            // Paused or ended: flush one immediate save.
            if (e.data === 2 || e.data === 0) {
              if (tickTimer != null) {
                window.clearInterval(tickTimer);
                tickTimer = undefined;
              }
              void saveProgress(userId, lessonId, p.getCurrentTime());
            }
          },
        },
      });
    })();

    return () => {
      destroyed = true;
      if (tickTimer != null) window.clearInterval(tickTimer);
      playerRef.current?.destroy();
      playerRef.current = null;
    };
  }, [videoId, lessonId, userId]);

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

  function changeSpeed(next: number) {
    setRate(next);
    playerRef.current?.setPlaybackRate(next);
  }

  return (
    <div className="space-y-3">
      <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-zinc-200 bg-black">
        <div ref={holderRef} className="h-full w-full" />
        {ready ? (
          <span
            aria-hidden
            className="pointer-events-none absolute select-none text-xs font-medium text-white/40 drop-shadow"
            style={{ left: `${pos.x}%`, top: `${pos.y}%`, transition: "all 1.6s ease-in-out" }}
          >
            {watermark}
          </span>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="text-xs text-zinc-500">Speed</span>
        {SPEEDS.map((s) => (
          <button
            key={s}
            onClick={() => changeSpeed(s)}
            className={`rounded-md px-2 py-0.5 text-xs font-medium ${
              rate === s
                ? "bg-indigo-600 text-white"
                : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200"
            }`}
          >
            {s}×
          </button>
        ))}
        {remaining ? <span className="ml-auto text-xs text-zinc-500">{remaining}</span> : null}
      </div>
    </div>
  );
}
