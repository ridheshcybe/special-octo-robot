"use client";
import { useState } from "react";
import { supabase } from "../lib/supabase";
import { courseInputSchema } from "../lib/validation";
import { useAdminTable } from "./useAdminData";
import type { Course } from "../lib/types";

const EMPTY = { id: "", title: "", slug: "", description: "", thumbnail_url: "", published: false };

export default function AdminCoursesPage() {
  const { rows: courses, error, refetch } = useAdminTable<Course>("courses", {
    column: "created_at",
    ascending: false,
  });
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setOk(null);

    const parsed = courseInputSchema.safeParse({
      title: form.title,
      slug: form.slug,
      description: form.description,
      thumbnail_url: form.thumbnail_url || null,
      published: form.published,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }

    setBusy(true);
    const { error: err } = form.id
      ? await supabase().from("courses").update(parsed.data).eq("id", Number(form.id))
      : await supabase().from("courses").insert(parsed.data);
    setBusy(false);

    if (err) {
      setFormError(err.message);
      return;
    }
    setOk(form.id ? "Course updated." : "Course created.");
    setForm(EMPTY);
    refetch();
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this course and all its lessons?")) return;
    const { error: err } = await supabase().from("courses").delete().eq("id", id);
    if (err) setFormError(err.message);
    refetch();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[380px_1fr]">
      <form onSubmit={save} className="card space-y-3 self-start">
        <h2 className="font-semibold">{form.id ? "Edit course" : "New course"}</h2>
        {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
        {ok ? <p className="text-sm text-emerald-600">{ok}</p> : null}

        <div>
          <label className="label" htmlFor="c-title">Title</label>
          <input
            id="c-title"
            className="input"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-slug">Slug</label>
          <input
            id="c-slug"
            className="input"
            required
            placeholder="engineering-maths-101"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-desc">Description</label>
          <textarea
            id="c-desc"
            className="input min-h-20"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
        </div>
        <div>
          <label className="label" htmlFor="c-thumb">Thumbnail URL</label>
          <input
            id="c-thumb"
            className="input"
            type="url"
            placeholder="https://…"
            value={form.thumbnail_url}
            onChange={(e) => setForm({ ...form, thumbnail_url: e.target.value })}
          />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => setForm({ ...form, published: e.target.checked })}
          />
          Published
        </label>

        <div className="flex gap-2">
          <button className="btn-primary" disabled={busy}>
            {busy ? "Saving…" : form.id ? "Save changes" : "Create course"}
          </button>
          {form.id ? (
            <button type="button" className="btn-outline" onClick={() => setForm(EMPTY)}>
              Cancel
            </button>
          ) : null}
        </div>
      </form>

      <div className="space-y-2">
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        {courses === null ? (
          <p className="text-sm text-zinc-500">Loading…</p>
        ) : courses.length === 0 ? (
          <p className="card text-sm text-zinc-500">No courses yet — create your first one.</p>
        ) : (
          courses.map((course) => (
            <div key={course.id} className="card flex items-center gap-3">
              <div className="min-w-0 flex-1">
                <p className="font-medium">
                  {course.title}{" "}
                  {course.published ? (
                    <span className="badge bg-emerald-50 text-emerald-700">live</span>
                  ) : (
                    <span className="badge bg-zinc-100 text-zinc-600">draft</span>
                  )}
                </p>
                <p className="text-xs text-zinc-500">/courses/{course.slug}</p>
              </div>
              <button
                className="btn-outline text-xs"
                onClick={() =>
                  setForm({
                    id: String(course.id),
                    title: course.title,
                    slug: course.slug,
                    description: course.description,
                    thumbnail_url: course.thumbnail_url ?? "",
                    published: course.published,
                  })
                }
              >
                Edit
              </button>
              <button className="btn-danger text-xs" onClick={() => void remove(course.id)}>
                Delete
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
