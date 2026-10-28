"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { supabase, envReady } from "../lib/supabase";
import { formatIst } from "../lib/ist";

type Upcoming = {
  id: number;
  title: string;
  live_starts_at: string;
  live_duration_minutes: number;
  course_slug: string | null;
  course_title: string | null;
};

/**
 * Upcoming live sessions for the dashboard, rendered in IST (the audience is
 * India). Only sessions that have not ended are listed, soonest first.
 * Schedule metadata is public — the Meet link itself stays server-gated.
 */
export default function UpcomingSessions() {
  const [sessions, setSessions] = useState<Upcoming[] | null>(null);

  useEffect(() => {
    if (!envReady) {
      setSessions([]);
      return;
    }
    const nowIso = new Date().toISOString();
    supabase()
      .from("lessons")
      .select(
        "id, title, type, live_starts_at, live_duration_minutes, courses!inner(slug, title, published)",
      )
      .eq("type", "live")
      .eq("courses.published", true)
      .gte("live_starts_at", nowIso)
      .order("live_starts_at", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        setSessions(
          ((data ?? []) as unknown as {
            id: number;
            title: string;
            live_starts_at: string;
            live_duration_minutes: number;
            courses: { slug: string; title: string };
          }[]).map((row) => ({
            id: row.id,
            title: row.title,
            live_starts_at: row.live_starts_at,
            live_duration_minutes: row.live_duration_minutes,
            course_slug: row.courses?.slug ?? null,
            course_title: row.courses?.title ?? null,
          })),
        );
      });
  }, []);

  if (sessions === null) return null;
  if (sessions.length === 0) return null;

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-semibold">Upcoming live sessions</h2>
      <div className="grid gap-2 sm:grid-cols-2">
        {sessions.map((s) => (
          <Link
            key={s.id}
            href={s.course_slug ? `/courses/${s.course_slug}` : "/courses"}
            className="card flex items-center gap-3 transition hover:border-indigo-300"
          >
            <span aria-hidden className="text-xl">🔴</span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{s.title}</p>
              <p className="text-xs text-zinc-500">
                {s.course_title ? `${s.course_title} · ` : ""}
                {formatIst(s.live_starts_at)} · {s.live_duration_minutes} min
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
