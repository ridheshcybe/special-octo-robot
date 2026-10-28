"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { supabase, envReady, isAccessActive } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import LessonRow from "../components/LessonRow";
import type { Course, Lesson } from "../lib/types";

export default function CoursePage() {
  const slug = useParams<{ slug: string }>().slug;
  const { userId, profile } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [error, setError] = useState<string | null>(null);

  const hasAccess = isAccessActive(profile);

  useEffect(() => {
    if (!envReady || !slug) return;
    (async () => {
      const { data: c, error: e1 } = await supabase()
        .from("courses")
        .select("*")
        .eq("slug", slug)
        .eq("published", true)
        .maybeSingle();
      if (e1) {
        setError(e1.message);
        return;
      }
      if (!c) {
        setError("Course not found.");
        return;
      }
      setCourse(c);
      const { data: ls } = await supabase()
        .from("lessons")
        .select("*")
        .eq("course_id", c.id)
        .order("position", { ascending: true });
      setLessons(ls ?? []);
    })();
  }, [slug]);

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
  if (!course) return <p className="py-16 text-center text-sm text-zinc-500">Loading…</p>;

  return (
    <div className="space-y-8">
      <div>
        <Link href="/courses" className="text-sm text-zinc-500 hover:text-zinc-800">
          ← All courses
        </Link>
        <h1 className="mt-2 text-2xl font-bold">{course.title}</h1>
        <p className="mt-2 max-w-2xl text-zinc-600">{course.description}</p>
      </div>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Lessons</h2>
        {lessons.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            Lessons coming soon.
          </p>
        ) : (
          <ul className="divide-y divide-zinc-200 rounded-xl border border-zinc-200">
            {lessons.map((lesson) => (
              <LessonRow
                key={lesson.id}
                lesson={lesson}
                unlocked={hasAccess || lesson.is_free_preview}
                loggedIn={Boolean(userId)}
              />
            ))}
          </ul>
        )}
      </section>

      {!hasAccess ? (
        <section className="card flex flex-col items-center gap-3 bg-zinc-50 text-center sm:flex-row sm:justify-between sm:text-left">
          <div>
            <h3 className="font-semibold">🔒 Locked</h3>
            <p className="text-sm text-zinc-600">
              Get a pass to unlock all lessons — from ₹99 for 30 days.
            </p>
          </div>
          <Link href="/courses/pricing" className="btn-primary shrink-0">
            Get access
          </Link>
        </section>
      ) : null}
    </div>
  );
}
