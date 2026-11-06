import React from "react";
import Link from "next/link";
import { notFound } from "next/navigation";

interface LessonViewerProps {
  params: { courseSlug: string; lessonId: string };
}

export default function CybersecurityLessonViewer({ params }: LessonViewerProps) {
  const { courseSlug, lessonId } = params;

  return (
    <div>
      <h1>Lesson {lessonId}</h1>
      <Link href="/prepmeup/courses">Back to courses</Link>
    </div>
  );
}