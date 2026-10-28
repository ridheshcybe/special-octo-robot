"use client";
import { lazy, Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase, envReady, callEdgeFunction, isAccessActive } from "../lib/supabase";
import { GET_PDF_URL_URL, GET_VIDEO_URL } from "../config";
import { useAuth } from "../auth/AuthContext";
import VideoPlayer from "../components/VideoPlayer";
import LiveSessionPanel from "../components/LiveSessionPanel";
import type { Lesson } from "../lib/types";

// hls.js is ~500 KB — load it only when an HLS lesson actually opens.
const HlsVideoPlayer = lazy(() => import("../components/HlsVideoPlayer"));
// Monaco + Pyodide/sql.js are heavier still — same treatment for exercises.
const ExercisePanel = lazy(() => import("../components/ExercisePanel"));

export default function LessonPage() {
  const lessonId = useParams<{ lessonId: string }>().lessonId;
  const { profile } = useAuth();
  const [lesson, setLesson] = useState<Lesson | null>(null);
  const [error, setError] = useState<string | null>(null);

  const id = Number(lessonId);
  const hasAccess = isAccessActive(profile);

  useEffect(() => {
    if (!envReady || !Number.isInteger(id) || id <= 0) return;
    supabase()
      .from("lessons")
      .select("*")
      .eq("id", id)
      .maybeSingle()
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        else if (!data) setError("Lesson not found.");
        else setLesson(data);
      });
  }, [id]);

  if (error) {
    return (
      <div className="py-16 text-center">
        <p className="text-sm text-zinc-600">{error}</p>
        <Link href="/courses" className="btn-outline mt-4">
          Back to courses
        </Link>
      </div>
    );
  }
  if (!lesson) return <p className="py-16 text-center text-sm text-zinc-500">Loading…</p>;

  const unlocked = hasAccess || lesson.is_free_preview;

  if (!unlocked) {
    return (
      <div className="card mx-auto max-w-md text-center">
        <p className="text-4xl">🔒</p>
        <h1 className="mt-3 text-lg font-semibold">{lesson.title}</h1>
        <p className="mt-1 text-sm text-zinc-600">
          This lesson is part of the paid pass. Get access to open it.
        </p>
        <Link href="/courses/pricing" className="btn-primary mt-4">
          Get access
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <h1 className="text-2xl font-bold">{lesson.title}</h1>
      {lesson.type === "pdf" ? (
        <PdfViewer lessonId={lesson.id} />
      ) : lesson.type === "video" ? (
        <VideoViewer lesson={lesson} />
      ) : lesson.type === "exercise" ? (
        <ExerciseView lessonId={lesson.id} />
      ) : (
        <LivePanel lessonId={lesson.id} />
      )}
    </div>
  );
}

/** Asks get-pdf-url for a 5-minute signed URL and embeds the PDF. */
function PdfViewer({ lessonId }: { lessonId: number }) {
  const [url, setUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await callEdgeFunction(GET_PDF_URL_URL, { lesson_id: lessonId });
        const body = (await res.json()) as { url?: string; error?: string };
        if (!res.ok || !body.url) throw new Error(body.error ?? "Could not load the PDF.");
        if (!cancelled) setUrl(body.url);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the PDF.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!url) return <p className="text-sm text-zinc-500">Loading PDF…</p>;

  return (
    <div className="space-y-2">
      <a href={url} target="_blank" rel="noopener noreferrer" className="btn-outline text-xs">
        Open PDF in new tab
      </a>
      <iframe
        src={url}
        title="PDF viewer"
        className="h-[70vh] w-full rounded-xl border border-zinc-200"
      />
    </div>
  );
}

/**
 * Video lessons, two flavors (Phase 4):
 *  - video_source = "youtube": asks get-video for the gated unlisted id, plays
 *    in the privacy-enhanced YouTube player.
 *  - video_source = "hls": HlsVideoPlayer asks get-hls-url for presigned R2
 *    URLs itself (access checked server-side there).
 */
function VideoViewer({ lesson }: { lesson: Pick<Lesson, "id" | "video_source"> }) {
  const { userId, email } = useAuth();
  const [youtubeId, setYoutubeId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isHls = lesson.video_source === "hls";

  useEffect(() => {
    if (isHls) return; // the HLS player fetches its own signed URLs
    let cancelled = false;
    (async () => {
      try {
        const res = await callEdgeFunction(GET_VIDEO_URL, { lesson_id: lesson.id });
        const body = (await res.json()) as { youtube_id?: string; error?: string };
        if (!res.ok || !body.youtube_id) {
          throw new Error(body.error ?? "Video not available yet.");
        }
        if (!cancelled) setYoutubeId(body.youtube_id);
      } catch (err) {
        if (!cancelled) setError(err instanceof Error ? err.message : "Could not load the video.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lesson.id, isHls]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!userId) return null;

  if (isHls) {
    return (
      <Suspense fallback={<p className="text-sm text-zinc-500">Loading player…</p>}>
        <HlsVideoPlayer
          lessonId={lesson.id}
          userId={userId}
          watermark={email ?? "student"}
        />
      </Suspense>
    );
  }

  if (!youtubeId) return <p className="text-sm text-zinc-500">Loading video…</p>;

  return (
    <VideoPlayer
      videoId={youtubeId}
      lessonId={lesson.id}
      userId={userId}
      watermark={email ?? "student"}
    />
  );
}

/** Coding playground (Phase 5): lazy Monaco + sandboxed executors. */
function ExerciseView({ lessonId }: { lessonId: number }) {
  const { userId, email } = useAuth();
  if (!userId) return null;
  return (
    <Suspense fallback={<p className="text-sm text-zinc-500">Loading editor…</p>}>
      <ExercisePanel lessonId={lessonId} userId={userId} email={email ?? "student"} />
    </Suspense>
  );
}

/** Server-gated live session: countdown → join window → recording. */
function LivePanel({ lessonId }: { lessonId: number }) {
  const { userId, email } = useAuth();
  if (!userId) return null;
  return (
    <LiveSessionPanel lessonId={lessonId} userId={userId} email={email ?? "student"} />
  );
}
