"use client";
import Link from "next/link";
import type { Course } from "../lib/types";

export default function CourseCard({ course }: { course: Course }) {
  return (
    <Link
      href={`/courses/${course.slug}`}
      className="card flex flex-col gap-3 transition hover:border-indigo-300 hover:shadow-md"
    >
      <div className="h-36 w-full overflow-hidden rounded-lg bg-zinc-100">
        {course.thumbnail_url ? (
          <img
            src={course.thumbnail_url}
            alt={course.title}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-3xl">📚</div>
        )}
      </div>
      <div>
        <h3 className="font-semibold">{course.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-zinc-600">
          {course.description || "No description yet."}
        </p>
      </div>
      <span className="mt-auto text-sm font-medium text-indigo-600">View course →</span>
    </Link>
  );
}
