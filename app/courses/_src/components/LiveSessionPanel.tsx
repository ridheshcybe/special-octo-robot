"use client";
import { useCallback, useEffect, useState } from "react";
import { callEdgeFunction } from "../lib/supabase";
import { GET_LIVE_LINK_URL } from "../config";
import { formatIst, countdownTo } from "../lib/ist";
import VideoPlayer from "./VideoPlayer";

type Props = { lessonId: number; userId: string; email: string };

type LiveState =
  | { kind: "loading" }
  | { kind: "upcoming"; startsAt: string }
  | { kind: "open"; meetingUrl: string; startsAt: string; endsAt: string }
  | { kind: "recording"; youtubeId: string }
  | { kind: "ended" }
  | { kind: "error"; message: string };

/**
 * The client never decides when the Meet link is visible — it polls
 * get-live-link, which answers with `state` based on the SERVER clock:
 * upcoming (423) → open (meeting_url) → recording / ended. The countdown and
 * the join button are pure UI on top of that.
 */
export default function LiveSessionPanel({ lessonId, userId, email }: Props) {
  const [state, setState] = useState<LiveState>({ kind: "loading" });
  const [, forceTick] = useState(0);

  const check = useCallback(async () => {
    try {
      const res = await callEdgeFunction(GET_LIVE_LINK_URL, { lesson_id: lessonId });
      const body = (await res.json().catch(() => ({}))) as {
        state?: string;
        meeting_url?: string;
        starts_at?: string;
        ends_at?: string;
        recording_youtube_id?: string;
        error?: string;
      };
      if (res.ok && body.state === "live" && body.meeting_url) {
        setState({
          kind: "open",
          meetingUrl: body.meeting_url,
          startsAt: body.starts_at ?? "",
          endsAt: body.ends_at ?? "",
        });
      } else if (res.ok && body.state === "recording" && body.recording_youtube_id) {
        setState({ kind: "recording", youtubeId: body.recording_youtube_id });
      } else if (body.state === "upcoming" && body.starts_at) {
        setState({ kind: "upcoming", startsAt: body.starts_at });
      } else if (res.status === 410) {
        setState({ kind: "ended" });
      } else {
        setState({ kind: "error", message: body.error ?? "Could not load the session." });
      }
    } catch (err) {
      setState({
        kind: "error",
        message: err instanceof Error ? err.message : "Could not load the session.",
      });
    }
  }, [lessonId]);

  useEffect(() => {
    void check();
    // Poll: cheap function call, keeps the state honest if the tab is open
    // across the join window boundary.
    const timer = window.setInterval(() => void check(), 60_000);
    return () => window.clearInterval(timer);
  }, [check]);

  // 1-second re-render for the countdown display.
  useEffect(() => {
    const timer = window.setInterval(() => forceTick((t) => t + 1), 1000);
    return () => window.clearInterval(timer);
  }, []);

  if (state.kind === "loading") {
    return <p className="text-sm text-zinc-500">Checking session status…</p>;
  }

  if (state.kind === "recording") {
    return (
      <div className="space-y-3">
        <p className="badge bg-emerald-50 text-emerald-700">Recording available</p>
        <VideoPlayer
          videoId={state.youtubeId}
          lessonId={lessonId}
          userId={userId}
          watermark={email}
        />
      </div>
    );
  }

  if (state.kind === "open") {
    return (
      <div className="card space-y-3">
        <p className="badge bg-red-50 text-red-700">🔴 Live room is open</p>
        <p className="text-sm text-zinc-600">
          {formatIst(state.startsAt)} · ends around {formatIst(state.endsAt)}
        </p>
        <a href={state.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
          Join live session
        </a>
        <p className="text-xs text-zinc-500">
          Keep this page open — if the room closes, the recording appears here.
        </p>
      </div>
    );
  }

  if (state.kind === "upcoming") {
    const c = countdownTo(state.startsAt);
    return (
      <div className="card space-y-2">
        <p className="badge bg-amber-50 text-amber-700">⏳ Scheduled</p>
        <p className="text-sm font-medium">{formatIst(state.startsAt)}</p>
        {!c.over ? (
          <p className="font-mono text-2xl font-bold tabular-nums">
            {c.days > 0 ? `${c.days}d ` : ""}
            {String(c.hours).padStart(2, "0")}:{String(c.minutes).padStart(2, "0")}:
            {String(c.seconds).padStart(2, "0")}
          </p>
        ) : null}
        <p className="text-xs text-zinc-500">
          The join button appears here 10 minutes before the session starts.
        </p>
      </div>
    );
  }

  if (state.kind === "ended") {
    return (
      <div className="card">
        <p className="badge bg-zinc-100 text-zinc-600">Session ended</p>
        <p className="mt-2 text-sm text-zinc-600">
          The recording will appear here once your teacher uploads it.
        </p>
      </div>
    );
  }

  return <p className="text-sm text-red-600">{state.message}</p>;
}
