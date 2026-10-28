"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Editor from "@monaco-editor/react";
import { callEdgeFunction, supabase, envReady } from "../lib/supabase";
import { GET_EXERCISE_URL } from "../config";
import { EXERCISE_CODE_MAX_BYTES } from "../lib/validation";
import { runExercise } from "../executors/runExercise";
import { renderMarkdown } from "../lib/markdown";
import type { Exercise, ExerciseProgress, ExerciseTest } from "../lib/types";

type Props = { lessonId: number; userId: string; email: string };

type TestResult = { name: string; pass: boolean; actual: unknown; error: string | null };

const LANG_LABEL: Record<string, string> = {
  javascript: "JavaScript",
  python: "Python",
  "html-css": "HTML/CSS",
  sql: "SQL",
};

const DEFAULTS: Record<string, string> = {
  javascript: "// write your code here\n",
  python: "# write your code here\n",
  "html-css": "<!-- write your HTML here -->\n",
  sql: "SELECT 1;\n",
};

function friendlyError(e: unknown): string {
  if (e instanceof Error) return e.message;
  return "Something went wrong. Try again.";
}

/** Per-language editor options. SQL/HTML get no console; the rest do. */
const EDITOR_OPTIONS = {
  minimap: { enabled: false },
  fontSize: 13,
  tabSize: 2,
  scrollBeyondLastLine: false,
  wordWrap: "on" as const,
  lineNumbers: "on" as const,
  renderLineHighlight: "none" as const,
  padding: { top: 10 },
  fixedOverflowWidgets: true,
};

export default function ExercisePanel({ lessonId, userId, email }: Props) {
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [code, setCode] = useState<string>("");
  const [output, setOutput] = useState<{ level: string; text: string }[]>([]);
  const [results, setResults] = useState<TestResult[] | null>(null);
  const [running, setRunning] = useState(false);
  const [timedOut, setTimedOut] = useState(false);
  const [hintsShown, setHintsShown] = useState(0);
  const [score, setScore] = useState<{ best: number; passed: boolean; attempts: number } | null>(null);
  const [saved, setSaved] = useState(false);
  const saveTimer = useRef<number | null>(null);

  // ---- Load the exercise via the gated edge function ------------------------
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await callEdgeFunction(GET_EXERCISE_URL, { lesson_id: lessonId });
        const body = (await res.json().catch(() => ({}))) as Partial<Exercise> & {
          error?: string;
          progress?: ExerciseProgress | null;
        };
        if (cancelled) return;
        if (!res.ok || !body.language) {
          setError(body.error ?? "Could not load the exercise.");
          return;
        }
        const ex = body as Exercise & { progress: ExerciseProgress | null };
        setExercise(ex);
        const restored = ex.progress?.latest_code?.trim();
        setCode(restored ? ex.progress!.latest_code : ex.starter_code || (DEFAULTS[ex.language] ?? ""));
        if (ex.progress) {
          setScore({ best: ex.progress.best_score, passed: ex.progress.passed, attempts: ex.progress.attempts });
        }
      } catch (err) {
        if (!cancelled) setError(friendlyError(err));
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [lessonId]);

  const language = exercise?.language ?? "javascript";
  const tests: ExerciseTest[] = useMemo(() => exercise?.tests ?? [], [exercise]);

  // ---- Debounced autosave (2 s idle), capped by the DB CHECK (20 KB) -------
  const saveProgress = useCallback(
    async (codeToSave: string, bestScore: number, passed: boolean, attempts: number) => {
      if (!envReady) return;
      const payload = codeToSave.slice(0, EXERCISE_CODE_MAX_BYTES); // hard cap
      const { error: e } = await supabase().from("exercise_progress").upsert({
        user_id: userId,
        lesson_id: lessonId,
        latest_code: payload,
        best_score: bestScore,
        passed,
        attempts,
        updated_at: new Date().toISOString(),
      });
      if (!e) setSaved(true);
    },
    [userId, lessonId],
  );

  useEffect(() => {
    if (!exercise) return;
    if (saveTimer.current) window.clearTimeout(saveTimer.current);
    saveTimer.current = window.setTimeout(() => {
      void saveProgress(code, score?.best ?? 0, score?.passed ?? false, score?.attempts ?? 0);
    }, 2000);
    return () => {
      if (saveTimer.current) window.clearTimeout(saveTimer.current);
    };
  }, [code, exercise, saveProgress, score]);

  // ---- Run / Submit ---------------------------------------------------------
  const runCode = useCallback(async () => {
    if (!exercise || running) return;
    setRunning(true);
    setError(null);
    setResults(null);
    setTimedOut(false);
    setOutput([{ level: "log", text: "Running…" }]);
    try {
      const outcome = await runExercise(language, code, tests, exercise.sample_db_sql);
      setOutput(outcome.console);
      setTimedOut(outcome.timedOut);
      setResults(outcome.results);

      if (outcome.results.length > 0) {
        const pct = Math.round((outcome.results.filter((r) => r.pass).length / outcome.results.length) * 100);
        const best = Math.max(pct, score?.best ?? 0);
        const passed = best === 100;
        setScore({ best, passed, attempts: (score?.attempts ?? 0) + 1 });
        void saveProgress(code, best, passed, (score?.attempts ?? 0) + 1);
      }
    } catch (err) {
      setOutput([{ level: "error", text: friendlyError(err) }]);
    } finally {
      setRunning(false);
    }
  }, [exercise, running, language, code, tests, score, saveProgress]);

  const reset = useCallback(() => {
    if (window.confirm("Reset the code to the starter version? Your saved progress (best score) stays.")) {
      setCode(exercise?.starter_code ?? "");
      setResults(null);
      setOutput([]);
      setHintsShown(0);
    }
  }, [exercise]);

  const showNextHint = useCallback(() => {
    if (!exercise) return;
    setHintsShown((h) => Math.min(h + 1, exercise.hints.length));
  }, [exercise]);

  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!exercise) return <p className="py-16 text-center text-sm text-zinc-500">Loading exercise…</p>;

  const passedCount = results?.filter((r) => r.pass).length ?? 0;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="badge bg-zinc-100 text-zinc-700">{LANG_LABEL[language] ?? language}</span>
        {score && score.attempts > 0 ? (
          <span className={`badge ${score.passed ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"}`}>
            {score.passed ? "✓ Solved" : `Best: ${score.best}% · ${score.attempts} attempt${score.attempts === 1 ? "" : "s"}`}
          </span>
        ) : null}
        {saved ? <span className="text-xs text-zinc-400">progress saved</span> : null}
        {email ? <span className="ml-auto text-xs text-zinc-400">{email}</span> : null}
      </div>

      {/* Split on desktop, stacked on mobile (Monaco needs ≥ ~380px to be usable) */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Instructions */}
        <div className="card prose-sm max-w-none space-y-3 self-start">
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(exercise.instructions_md) }} />
          {hintsShown > 0 ? (
            <div className="space-y-1 rounded-lg bg-amber-50 p-3 text-sm text-amber-800">
              {exercise.hints.slice(0, hintsShown).map((h, i) => (
                <p key={i}>💡 {h}</p>
              ))}
            </div>
          ) : null}
        </div>

        {/* Editor + output */}
        <div className="space-y-3">
          <div className="overflow-hidden rounded-xl border border-zinc-200">
            <Editor
              height="320px"
              language={language === "html-css" ? "html" : language}
              value={code}
              theme="vs"
              options={EDITOR_OPTIONS}
              onChange={(v) => setCode(v ?? "")}
              loading={<div className="p-4 text-sm text-zinc-500">Loading editor…</div>}
            />
          </div>

          {/* Action bar */}
          <div className="flex flex-wrap items-center gap-2">
            {language === "html-css" ? (
              <span className="text-xs text-zinc-500">Live preview on the right →</span>
            ) : (
              <button className="btn-primary px-4 py-1.5 text-sm" disabled={running} onClick={() => void runCode()}>
                {running ? "Running…" : "▶ Run"}
              </button>
            )}
            <button className="btn-outline px-3 py-1.5 text-sm" onClick={reset}>
              Reset
            </button>
            {exercise.hints.length > 0 ? (
              <button
                className="btn-outline px-3 py-1.5 text-sm"
                disabled={hintsShown >= exercise.hints.length}
                onClick={showNextHint}
              >
                Show hint ({hintsShown}/{exercise.hints.length})
              </button>
            ) : null}
            <button className="btn-primary px-3 py-1.5 text-sm" disabled={running} onClick={() => void runCode()}>
              Submit
            </button>
          </div>

          {/* Output / results */}
          {timedOut ? (
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">
              ⏱ Your code ran too long and was stopped. Look for an infinite loop.
            </p>
          ) : null}

          {results ? (
            <div className="card space-y-2 text-sm">
              <p className="font-medium">
                {passedCount} / {results.length} tests passing
              </p>
              {results.map((r, i) => (
                <div key={i} className={`rounded-lg p-2 ${r.pass ? "bg-emerald-50" : "bg-red-50"}`}>
                  <p className="font-medium">
                    {r.pass ? "✓" : "✗"} {r.name}
                  </p>
                  {!r.pass ? (
                    <p className="mt-0.5 text-xs text-zinc-600">
                      {r.error
                        ? `Error: ${r.error}`
                        : `Expected ${JSON.stringify(tests[i]?.expect)} · got ${JSON.stringify(r.actual)}`}
                    </p>
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}

          {output.length > 0 ? (
            <pre className="max-h-56 overflow-auto rounded-xl bg-zinc-900 p-3 font-mono text-xs leading-relaxed text-zinc-100">
              {output.map((l, i) => (
                <div key={i} className={l.level === "error" ? "text-red-400" : ""}>
                  {l.text}
                </div>
              ))}
            </pre>
          ) : null}

          {language === "html-css" ? (
            <div>
              <p className="mb-1 text-xs font-medium text-zinc-500">Live preview</p>
              <iframe
                title="HTML preview"
                sandbox="allow-scripts"
                className="h-64 w-full rounded-xl border border-zinc-200 bg-white"
                srcDoc={code}
              />
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
