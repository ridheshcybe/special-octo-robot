"use client";
import Link from "next/link";
import { formatIst } from "../lib/ist";
import type { Lesson } from "../lib/types";

const TYPE_ICON = { pdf: "📄", video: "🎬", live: "🔴", exercise: "⌨️" } as const;

export default function LessonRow({
  lesson,
  unlocked,
  loggedIn,
}: {
  lesson: Lesson;
  unlocked: boolean;
  loggedIn: boolean;
}) {
  const href = unlocked
    ? `/courses/lessons/${lesson.id}`
    : loggedIn
      ? "/courses/pricing"
      : "/courses/login";

  return (
    <li className="flex items-center gap-3 px-4 py-3">
      <span aria-hidden className="text-lg">
        {TYPE_ICON[lesson.type]}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">{lesson.title}</p>
        <p className="text-xs text-zinc-500">
          {lesson.type === "pdf"
            ? "PDF notes"
            : lesson.type === "video"
              ? "Recorded video"
              : lesson.type === "exercise"
                ? "Coding exercise"
                : lesson.live_starts_at
                  ? `Live · ${formatIst(lesson.live_starts_at)}`
                  : "Live session (time TBA)"}
          {lesson.duration_label ? ` · ${lesson.duration_label}` : ""}
          {lesson.is_free_preview ? " · free preview" : ""}
        </p>
      </div>
      <Link href={href} className="btn-outline px-3 py-1 text-xs">
        {unlocked ? "Open" : "🔒 Locked"}
      </Link>
    </li>
  );
}
