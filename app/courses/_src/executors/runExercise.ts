// ============================================================================
// runExercise.ts — Phase 5. One entry point for all four language runners.
// Uniform shape back: results per test, console lines, timedOut flag.
// All executors run off the main thread (Workers) or in an opaque-origin
// iframe — nothing student-authored ever blocks or touches the app.
// ============================================================================
import { runInJsWorker, type TestCase, type TestResult } from "./jsWorker";
import { runInPyWorker } from "./pyWorker";
import { runInSqlWorker } from "./sqlWorker";
import { runHtmlTests } from "./htmlRunner";
import type { ExerciseLanguage } from "../lib/types";

export type RunOutcome = {
  results: TestResult[];
  console: { level: string; text: string }[];
  timedOut: boolean;
};

export async function runExercise(
  language: ExerciseLanguage,
  code: string,
  tests: TestCase[],
  sampleDbSql: string,
): Promise<RunOutcome> {
  switch (language) {
    case "javascript":
      return runInJsWorker(code, tests);
    case "python":
      return runInPyWorker(code, tests);
    case "sql":
      return runInSqlWorker(code, tests, sampleDbSql);
    case "html-css":
      // html-css has a live preview instead of Run; tests via hidden iframe.
      return runHtmlTests(code, tests);
  }
}
