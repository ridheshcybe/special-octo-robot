"use client";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "../lib/supabase";
import { lessonInputSchema, exerciseInputSchema, PDF_MAX_BYTES } from "../lib/validation";
import { extractYouTubeId } from "../lib/youtube";
import { formatBytes } from "../lib/format";
import { renderMarkdown } from "../lib/markdown";
import { useAdminTable } from "./useAdminData";
import type { Course, Lesson } from "../lib/types";

const EMPTY = {
  id: "",
  course_id: "",
  title: "",
  type: "pdf" as Lesson["type"],
  video_source: "youtube" as Lesson["video_source"],
  position: "0",
  storage_path: "",
  duration_label: "",
  youtube_id: "",
  meeting_url: "",
  starts_at: "",
  live_duration_minutes: "90",
  recording_youtube_id: "",
  hls_path: "",
  is_free_preview: false,
};

const EMPTY_EXERCISE = {
  language: "javascript",
  instructions_md: "## Title\n\nWhat the student must do.",
  starter_code: "",
  tests: "",
  hints: "",
  sample_db_sql: "",
};

const STORAGE_QUOTA = 1024 * 1024 * 1024; // 1 GB free-tier bucket

export default function AdminLessonsPage() {
  const courses = useAdminTable<Course>("courses", { column: "created_at", ascending: false });
  const lessons = useAdminTable<Lesson>("lessons", { column: "course_id", ascending: true });
  const [form, setForm] = useState(EMPTY);
  const [formError, setFormError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [filter, setFilter] = useState<number | "">("");
  const [exForm, setExForm] = useState(EMPTY_EXERCISE);
  const [exBusy, setExBusy] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Storage meter: total size of objects in the private PDFs bucket.
  const [usedBytes, setUsedBytes] = useState<number | null>(null);
  useEffect(() => {
    (async () => {
      const { data } = await supabase().storage.from("course-files").list("", {
        limit: 1000,
        search: "",
      });
      // list() returns files at the root; we upload under pdfs/, so sum that folder.
      const { data: folder } = await supabase().storage.from("course-files").list("pdfs", {
        limit: 1000,
      });
      const total = (folder ?? []).reduce((sum, f) => sum + (f.metadata?.size ?? 0), 0);
      setUsedBytes(total);
      void data;
    })();
  }, [lessons.rows]);

  const visible = useMemo(() => {
    const all = lessons.rows ?? [];
    return filter === "" ? all : all.filter((l) => l.course_id === filter);
  }, [lessons.rows, filter]);

  async function save(e: React.FormEvent) {
    e.preventDefault();
    setFormError(null);
    setOk(null);

    const parsed = lessonInputSchema.safeParse({
      course_id: form.course_id,
      title: form.title,
      type: form.type,
      position: form.position,
      storage_path: form.storage_path || null,
      duration_label: form.duration_label || null,
      youtube_id: form.youtube_id || null,
      meeting_url: form.meeting_url || null,
      starts_at: form.starts_at || null,
      live_duration_minutes: form.live_duration_minutes,
      recording_youtube_id: form.recording_youtube_id || null,
      hls_path: form.type === "video" && form.video_source === "hls" ? form.hls_path || null : null,
      is_free_preview: form.is_free_preview,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid input");
      return;
    }
    const {
      youtube_id,
      meeting_url,
      starts_at,
      live_duration_minutes,
      recording_youtube_id,
      hls_path,
      ...lessonValues
    } = parsed.data;

    setBusy(true);
    // Upsert the public lesson row (schedule is public; links are not).
    const { data: saved, error: e1 } = form.id
      ? await supabase()
          .from("lessons")
          .update({ ...lessonValues, live_duration_minutes })
          .eq("id", Number(form.id))
          .select()
          .single()
      : await supabase()
          .from("lessons")
          .insert({ ...lessonValues, live_duration_minutes })
          .select()
          .single();
    if (e1) {
      setBusy(false);
      setFormError(e1.message);
      return;
    }

    // Keep lesson_secrets in sync (admin-only write via RLS).
    if (youtube_id || meeting_url || recording_youtube_id || hls_path) {
      const { error: e2 } = await supabase().from("lesson_secrets").upsert({
        lesson_id: saved.id,
        youtube_id,
        meeting_url,
        recording_youtube_id,
        hls_path,
        updated_at: new Date().toISOString(),
      });
      if (e2) {
        setBusy(false);
        setFormError(e2.message);
        return;
      }
    }

    setBusy(false);
    setOk(form.id ? "Lesson updated." : "Lesson created.");
    setForm(EMPTY);
    lessons.refetch();
  }

  async function loadSecretIntoForm(lesson: Lesson) {
    const { data: secret } = await supabase()
      .from("lesson_secrets")
      .select("youtube_id, meeting_url, recording_youtube_id, hls_path")
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    setForm({
      id: String(lesson.id),
      course_id: String(lesson.course_id),
      title: lesson.title,
      type: lesson.type,
      position: String(lesson.position),
      storage_path: lesson.storage_path ?? "",
      duration_label: lesson.duration_label ?? "",
      youtube_id: secret?.youtube_id ?? "",
      meeting_url: secret?.meeting_url ?? "",
      starts_at: lesson.live_starts_at ? lesson.live_starts_at.slice(0, 16) : "",
      live_duration_minutes: String(lesson.live_duration_minutes ?? 90),
      recording_youtube_id: secret?.recording_youtube_id ?? "",
      hls_path: secret?.hls_path ?? "",
      video_source: lesson.video_source,
      is_free_preview: lesson.is_free_preview,
    });
    if (lesson.type === "exercise") {
      await loadExerciseIntoForm(lesson);
    }
  }

  async function remove(id: number) {
    if (!window.confirm("Delete this lesson?")) return;
    const { error: err } = await supabase().from("lessons").delete().eq("id", id);
    if (err) setFormError(err.message);
    lessons.refetch();
  }

  // ---- Phase 5: exercise content -----------------------------------------
  async function loadExerciseIntoForm(lesson: Lesson) {
    const { data: ex } = await supabase()
      .from("exercises")
      .select("*")
      .eq("lesson_id", lesson.id)
      .maybeSingle();
    setExForm(
      ex
        ? {
            language: ex.language,
            instructions_md: ex.instructions_md ?? "",
            starter_code: ex.starter_code ?? "",
            tests: (ex.tests ?? []).map((t: { name: string; fn: string; expect: unknown }) => `${t.name} | ${t.fn} | ${String(t.expect)}`).join("\n"),
            hints: (ex.hints ?? []).join("\n"),
            sample_db_sql: ex.sample_db_sql ?? "",
          }
        : { ...EMPTY_EXERCISE, starter_code: "" },
    );
    setShowPreview(true);
  }

  /** One test per line: name | expression | expected */
  function parseTests(raw: string) {
    return raw
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => {
        const [name, fn, expect] = line.split("|").map((s) => s.trim());
        const num = Number(expect);
        return {
          name: name ?? "",
          fn: fn ?? "",
          expect: expect === undefined ? "" : Number.isFinite(num) && expect !== "" ? num : expect,
        };
      });
  }

  async function saveExercise() {
    setFormError(null);
    setOk(null);
    if (!form.id) {
      setFormError("Save the lesson first (type: Exercise), then add its content.");
      return;
    }
    const parsed = exerciseInputSchema.safeParse({
      lesson_id: Number(form.id),
      language: exForm.language,
      instructions_md: exForm.instructions_md,
      starter_code: exForm.starter_code,
      tests: parseTests(exForm.tests),
      hints: exForm.hints.split("\n").map((h) => h.trim()).filter(Boolean),
      sample_db_sql: exForm.sample_db_sql,
    });
    if (!parsed.success) {
      setFormError(parsed.error.issues[0]?.message ?? "Invalid exercise");
      return;
    }
    setExBusy(true);
    const { error: e2 } = await supabase().from("exercises").upsert({
      lesson_id: Number(form.id),
      language: parsed.data.language,
      instructions_md: parsed.data.instructions_md,
      starter_code: parsed.data.starter_code,
      tests: parsed.data.tests,
      hints: parsed.data.hints,
      sample_db_sql: parsed.data.sample_db_sql,
      updated_at: new Date().toISOString(),
    });
    setExBusy(false);
    if (e2) {
      setFormError(e2.message);
      return;
    }
    setOk("Exercise content saved.");
  }

  async function uploadPdf(file: File) {
    setFormError(null);
    setOk(null);

    if (file.type !== "application/pdf") {
      setFormError("Only PDF files are allowed.");
      return;
    }
    if (file.size > PDF_MAX_BYTES) {
      setFormError(`PDF must be under ${formatBytes(PDF_MAX_BYTES)} (free-tier cap).`);
      return;
    }
    const targetLessonId = form.id;
    if (!targetLessonId) {
      setFormError("Save the lesson first, then upload its PDF.");
      return;
    }

    setBusy(true);
    const path = `pdfs/lesson-${targetLessonId}-${Date.now()}.pdf`;
    const { error: upErr } = await supabase()
      .storage
      .from("course-files")
      .upload(path, file, { contentType: "application/pdf", upsert: false });
    if (upErr) {
      setBusy(false);
      setFormError(`Upload failed: ${upErr.message}`);
      return;
    }

    const { error: updErr } = await supabase()
      .from("lessons")
      .update({ storage_path: path })
      .eq("id", Number(targetLessonId));
    setBusy(false);
    if (updErr) {
      setFormError(updErr.message);
      return;
    }
    setOk("PDF uploaded.");
    setForm((f) => ({ ...f, storage_path: path }));
    lessons.refetch();
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[420px_1fr]">
      <div className="space-y-4 self-start">
        <div className="card">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">PDF storage</span>
            <span className="text-zinc-500">
              {usedBytes === null ? "…" : `${formatBytes(usedBytes)} / 1 GB`}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-indigo-600 transition-all"
              style={{ width: `${Math.min(100, ((usedBytes ?? 0) / STORAGE_QUOTA) * 100)}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-zinc-500">10 MB max per PDF.</p>
        </div>

        <form onSubmit={save} className="card space-y-3">
          <h2 className="font-semibold">{form.id ? "Edit lesson" : "New lesson"}</h2>
          {formError ? <p className="text-sm text-red-600">{formError}</p> : null}
          {ok ? <p className="text-sm text-emerald-600">{ok}</p> : null}

          <div>
            <label className="label" htmlFor="l-course">Course</label>
            <select
              id="l-course"
              className="input"
              required
              value={form.course_id}
              onChange={(e) => setForm({ ...form, course_id: e.target.value })}
            >
              <option value="">Choose a course…</option>
              {(courses.rows ?? []).map((c) => (
                <option key={c.id} value={c.id}>
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label" htmlFor="l-title">Title</label>
            <input
              id="l-title"
              className="input"
              required
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="l-type">Type</label>
              <select
                id="l-type"
                className="input"
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as Lesson["type"] })}
              >
                <option value="pdf">PDF notes</option>
                <option value="video">Video (YouTube)</option>
                <option value="live">Live session</option>
                <option value="exercise">Coding exercise</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="l-pos">Position</label>
              <input
                id="l-pos"
                className="input"
                type="number"
                min={0}
                value={form.position}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
          </div>

          {form.type === "video" ? (
            <>
              <div>
                <label className="label" htmlFor="l-src">Video source</label>
                <select
                  id="l-src"
                  className="input"
                  value={form.video_source}
                  onChange={(e) =>
                    setForm({ ...form, video_source: e.target.value as Lesson["video_source"] })
                  }
                >
                  <option value="youtube">YouTube (unlisted embed)</option>
                  <option value="hls">Self-hosted HLS (R2)</option>
                </select>
              </div>

              {form.video_source === "youtube" ? (
                <div>
                  <label className="label" htmlFor="l-yt">YouTube URL or ID</label>
                  <input
                    id="l-yt"
                    className="input"
                    placeholder="https://youtu.be/dQw4w9WgXcQ (unlisted video)"
                    value={form.youtube_id}
                    onChange={(e) => {
                      const id = extractYouTubeId(e.target.value);
                      setForm({ ...form, youtube_id: id ?? e.target.value.trim() });
                    }}
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    Paste any YouTube URL or the 11-char ID. Stored in lesson_secrets —
                    never readable by non-subscribers. Set the video to “Unlisted” on YouTube.
                  </p>
                </div>
              ) : (
                <div>
                  <label className="label" htmlFor="l-hls">HLS path in R2</label>
                  <input
                    id="l-hls"
                    className="input"
                    placeholder="hls/lesson-7/master.m3u8"
                    value={form.hls_path}
                    onChange={(e) => setForm({ ...form, hls_path: e.target.value })}
                  />
                  <p className="mt-1 text-xs text-zinc-500">
                    The output folder of scripts/make-hls.sh, uploaded with rclone to the
                    private bucket. Students only ever receive short-lived signed URLs
                    from get-hls-url — the bucket itself has no public access.
                  </p>
                </div>
              )}
            </>
          ) : null}

          {form.type === "exercise" ? (
            <button
              type="button"
              className="btn-outline w-full text-xs"
              onClick={() => setShowPreview((s) => !s)}
            >
              {showPreview ? "Hide exercise editor ↑" : "Exercise editor & student preview ↓"}
            </button>
          ) : null}

          {form.type === "live" ? (
            <>
              <div>
                <label className="label" htmlFor="l-meet">Google Meet URL</label>
                <input
                  id="l-meet"
                  className="input"
                  type="url"
                  placeholder="https://meet.google.com/abc-defg-hij"
                  value={form.meeting_url}
                  onChange={(e) => setForm({ ...form, meeting_url: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="l-starts">Starts at (your local time)</label>
                <input
                  id="l-starts"
                  className="input"
                  type="datetime-local"
                  value={form.starts_at}
                  onChange={(e) => setForm({ ...form, starts_at: e.target.value })}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Stored as an exact moment in time; students see it in IST. The join
                  button unlocks 10 minutes before this time — enforced on the server.
                </p>
              </div>
              <div>
                <label className="label" htmlFor="l-dur-min">Duration (minutes)</label>
                <input
                  id="l-dur-min"
                  className="input"
                  type="number"
                  min={5}
                  max={600}
                  value={form.live_duration_minutes}
                  onChange={(e) => setForm({ ...form, live_duration_minutes: e.target.value })}
                />
              </div>
              <div>
                <label className="label" htmlFor="l-rec">Recording YouTube ID (after the session)</label>
                <input
                  id="l-rec"
                  className="input"
                  placeholder="dQw4w9WgXcQ — leave empty until uploaded"
                  value={form.recording_youtube_id}
                  onChange={(e) => setForm({ ...form, recording_youtube_id: e.target.value })}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Once set, the session page becomes a normal gated video lesson for
                  subscribers. Stored in lesson_secrets.
                </p>
              </div>
            </>
          ) : null}

          {form.type === "pdf" ? (
            <div>
              <label className="label" htmlFor="l-pdf">Upload PDF</label>
              <input
                id="l-pdf"
                type="file"
                accept="application/pdf"
                className="text-sm"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) void uploadPdf(file);
                }}
              />
              {form.storage_path ? (
                <p className="mt-1 text-xs text-zinc-500">Current: {form.storage_path}</p>
              ) : null}
            </div>
          ) : null}

          <div>
            <label className="label" htmlFor="l-dur">Duration label (optional)</label>
            <input
              id="l-dur"
              className="input"
              placeholder="12 min"
              value={form.duration_label}
              onChange={(e) => setForm({ ...form, duration_label: e.target.value })}
            />
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={form.is_free_preview}
              onChange={(e) => setForm({ ...form, is_free_preview: e.target.checked })}
            />
            Free preview (visible without a pass)
          </label>

          <div className="flex gap-2">
            <button className="btn-primary" disabled={busy}>
              {busy ? "Saving…" : form.id ? "Save changes" : "Create lesson"}
            </button>
            {form.id ? (
              <button type="button" className="btn-outline" onClick={() => setForm(EMPTY)}>
                Cancel
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <div className="space-y-3">
        <div>
          <label className="label" htmlFor="l-filter">Filter by course</label>
          <select
            id="l-filter"
            className="input max-w-xs"
            value={filter}
            onChange={(e) => setFilter(e.target.value === "" ? "" : Number(e.target.value))}
          >
            <option value="">All courses</option>
            {(courses.rows ?? []).map((c) => (
              <option key={c.id} value={c.id}>
                {c.title}
              </option>
            ))}
          </select>
        </div>

        {lessons.error ? <p className="text-sm text-red-600">{lessons.error}</p> : null}
        {visible.length === 0 ? (
          <p className="card text-sm text-zinc-500">No lessons yet — create your first one.</p>
        ) : (
          <div className="space-y-2">
            {visible.map((lesson) => (
              <div key={lesson.id} className="card flex items-center gap-3">
                <div className="min-w-0 flex-1">
                  <p className="font-medium">
                    {lesson.title}{" "}
                    {lesson.is_free_preview ? (
                      <span className="badge bg-amber-50 text-amber-700">preview</span>
                    ) : null}
                  </p>
                  <p className="text-xs text-zinc-500">
                    {lesson.type}
                    {lesson.type === "video" ? ` · ${lesson.video_source}` : ""} · position{" "}
                    {lesson.position}
                    {lesson.storage_path ? ` · ${lesson.storage_path}` : ""}
                  </p>
                </div>
                <button
                  className="btn-outline text-xs"
                  onClick={() => void loadSecretIntoForm(lesson)}
                >
                  Edit
                </button>
                <button className="btn-danger text-xs" onClick={() => void remove(lesson.id)}>
                  Delete
                </button>
              </div>
            ))}
          </div>
        )}

        {/* ---- Phase 5: exercise content editor + student preview ---------- */}
        {form.type === "exercise" && form.id && showPreview ? (
          <div className="card space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Exercise content — lesson #{form.id}</h2>
              <button type="button" className="btn-outline px-2 py-0.5 text-xs" onClick={() => setShowPreview(false)}>
                Close
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label" htmlFor="e-lang">Language</label>
                <select
                  id="e-lang"
                  className="input"
                  value={exForm.language}
                  onChange={(e) => setExForm({ ...exForm, language: e.target.value })}
                >
                  <option value="javascript">JavaScript</option>
                  <option value="python">Python (Pyodide)</option>
                  <option value="html-css">HTML/CSS (live preview)</option>
                  <option value="sql">SQL (sql.js)</option>
                </select>
              </div>
              <div>
                <label className="label" htmlFor="e-hints">Hints (one per line)</label>
                <input
                  id="e-hints"
                  className="input"
                  placeholder="Nudge, don't give away the answer"
                  value={exForm.hints}
                  onChange={(e) => setExForm({ ...exForm, hints: e.target.value })}
                />
              </div>
            </div>

            <div>
              <label className="label" htmlFor="e-instr">Instructions (markdown)</label>
              <textarea
                id="e-instr"
                className="input min-h-32 font-mono text-xs"
                value={exForm.instructions_md}
                onChange={(e) => setExForm({ ...exForm, instructions_md: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="e-starter">Starter code</label>
              <textarea
                id="e-starter"
                className="input min-h-24 font-mono text-xs"
                value={exForm.starter_code}
                onChange={(e) => setExForm({ ...exForm, starter_code: e.target.value })}
              />
            </div>

            <div>
              <label className="label" htmlFor="e-tests">Tests — one per line: name | expression | expected</label>
              <textarea
                id="e-tests"
                className="input min-h-24 font-mono text-xs"
                placeholder={exForm.language === "sql" ? "returns Rohit |  | Rohit,91" : "2 + 3 = 5 | sum(2,3) | 5"}
                value={exForm.tests}
                onChange={(e) => setExForm({ ...exForm, tests: e.target.value })}
              />
              <p className="mt-1 text-xs text-zinc-500">
                JS/Python: the expression is evaluated after your code. SQL: leave the
                expression empty — expected is the result grid, one row per line,
                columns joined with commas (e.g. <code>Rohit,91</code>).
                {exForm.language === "sql" ? "" : " Numbers compare as numbers."}
              </p>
            </div>

            {exForm.language === "sql" ? (
              <div>
                <label className="label" htmlFor="e-db">Sample database (CREATE + INSERT)</label>
                <textarea
                  id="e-db"
                  className="input min-h-24 font-mono text-xs"
                  placeholder={"CREATE TABLE students (name TEXT, marks INT);\nINSERT INTO students VALUES ('Aisha', 82);"}
                  value={exForm.sample_db_sql}
                  onChange={(e) => setExForm({ ...exForm, sample_db_sql: e.target.value })}
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Runs fresh before the student's query — each test gets a clean copy.
                </p>
              </div>
            ) : null}

            <div className="flex items-center gap-2">
              <button type="button" className="btn-primary" disabled={exBusy} onClick={() => void saveExercise()}>
                {exBusy ? "Saving…" : "Save exercise"}
              </button>
              <button
                type="button"
                className="btn-outline"
                onClick={() => setShowPreview(false)}
              >
                Done
              </button>
            </div>

            {/* Live student-view preview */}
            <div className="rounded-xl border border-dashed border-zinc-300 p-4">
              <p className="mb-2 text-xs font-medium uppercase tracking-wide text-zinc-400">
                Student view (preview)
              </p>
              <div className="grid gap-4 lg:grid-cols-2">
                <div
                  className="space-y-2 text-sm leading-relaxed text-zinc-700"
                  dangerouslySetInnerHTML={{ __html: renderMarkdown(exForm.instructions_md) }}
                />
                <div className="space-y-2">
                  <pre className="max-h-48 overflow-auto rounded-lg bg-zinc-900 p-3 font-mono text-xs text-zinc-100">
                    {exForm.starter_code || "// starter code appears here"}
                  </pre>
                  <div className="flex flex-wrap gap-1">
                    {parseTests(exForm.tests).map((t, i) => (
                      <span key={i} className="badge bg-zinc-100 text-zinc-600">
                        {t.name || `test ${i + 1}`}
                      </span>
                    ))}
                    {exForm.tests.trim() ? (
                      <span className="badge bg-emerald-50 text-emerald-700">Run & Submit buttons live here</span>
                    ) : null}
                  </div>
                </div>
              </div>
            </div>

            <p className="text-xs text-amber-700 bg-amber-50 rounded-lg p-2">
              Honest note: tests ship to the browser, so students can read them in
              DevTools. This checks learning, not cheating — fine for practice;
              graded exams need server-side checking.
            </p>
          </div>
        ) : null}
      </div>
    </div>
  );
}
