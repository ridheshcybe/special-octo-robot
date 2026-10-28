"use client";
import { useEffect, useState } from "react";
import { supabase, envReady, isAccessActive, daysLeft } from "../lib/supabase";
import { useAuth } from "../auth/AuthContext";
import CourseCard from "../components/CourseCard";
import AccessBadge from "../components/AccessBadge";
import type { Course } from "../lib/types";

export default function HomePage() {
  const { profile } = useAuth();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!envReady) {
      setError("Supabase is not configured yet — fill in .env (see .env.example).");
      setCourses([]);
      return;
    }
    supabase()
      .from("courses")
      .select("*")
      .eq("published", true)
      .order("created_at", { ascending: false })
      .then(({ data, error: e }) => {
        if (e) setError(e.message);
        setCourses(data ?? []);
      });
  }, []);

  return (
    <div className="space-y-8">
      <section className="flex flex-col gap-4 rounded-2xl bg-zinc-50 p-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold sm:text-3xl">Learn by building</h1>
          <p className="mt-2 max-w-xl text-zinc-600">
            Project-first courses for college students — notes, videos and live doubt
            sessions. One pass unlocks everything, from ₹99.
          </p>
        </div>
        {profile ? (
          <AccessBadge
            active={isAccessActive(profile)}
            daysLeft={daysLeft(profile.access_expires_at)}
          />
        ) : null}
      </section>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}

      <section className="space-y-4">
        <h2 className="text-lg font-semibold">All courses</h2>
        {courses === null ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-8 text-center text-zinc-500">
            No courses published yet.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
