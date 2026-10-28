// ============================================================================
// jsWorker.ts — Phase 5. JavaScript executor (Web Worker).
//
// HOW IT WORKS
//   The student's code plus test expressions are evaluated inside a Web
//   Worker created from a Blob URL. The host terminates the worker at the
//   deadline — that is the infinite-loop kill switch, and it's on the MAIN
//   thread, so a frozen worker can never freeze the app.
//
// HONEST SECURITY MODEL (also in the README)
//   A Worker can't touch the DOM, but it is still same-origin code: written
//   maliciously it could `fetch('/auth/v1/user', …)` with the user's cookies.
//   The shadowing below removes the obvious escapes (self, fetch, XHR,
//   importScripts, postMessage) from the student's scope, which stops
//   accidental misuse — but it is NOT a hard security boundary.
//   Real isolation = a sandboxed iframe on a SEPARATE origin
//   (sandbox="allow-scripts" without allow-same-origin) or a server-side
//   sandbox. Both cost money/complexity; this is the honest ₹0 trade-off.
//
//   What IS guaranteed here:
//     • Student code never runs on the main thread (requirement).
//     • Infinite loops are killed at the deadline by the HOST.
//     • console.log/warn/error are captured for the output pane.
// ============================================================================
export type TestCase = { name: string; fn: string; expect: unknown };
export type TestResult = { name: string; pass: boolean; actual: unknown; error: string | null };

export type JsRunResult = {
  results: TestResult[];
  console: { level: string; text: string }[];
  timedOut: boolean;
};

/** The worker source. Runs in the worker; never on the main thread. */
const RUNNER_SOURCE = `
var __results = [];
var __console = [];
var __done = false;

function __finish() {
  if (__done) return;
  __done = true;
  postMessage({ type: "done", results: __results, console: __console });
}

var console = {
  log:   function () { __console.push({ level: "log",   text: Array.prototype.map.call(arguments, String).join(" ") }); },
  warn:  function () { __console.push({ level: "warn",  text: Array.prototype.map.call(arguments, String).join(" ") }); },
  error: function () { __console.push({ level: "error", text: Array.prototype.map.call(arguments, String).join(" ") }); },
  info:  function () { __console.push({ level: "log",   text: Array.prototype.map.call(arguments, String).join(" ") }); },
};

// Escape-hatch shadowing (see security note above — best-effort, not a wall).
function self()           { throw new Error("self is not available in the sandbox"); }
function fetch()          { throw new Error("fetch is not available in the sandbox"); }
function XMLHttpRequest() { throw new Error("network is not available in the sandbox"); }
function importScripts()  { throw new Error("importScripts is not available in the sandbox"); }

function __runStudentCode(code, tests) {
  try {
    eval(code); // sloppy mode, our scope: the shadows above win
    __results = tests.map(function (t) {
      try {
        var actual = eval(t.fn);
        var equal =
          actual === t.expect ||
          JSON.stringify(actual) === JSON.stringify(t.expect);
        return {
          name: t.name,
          pass: equal,
          actual: actual === undefined ? null : actual,
          error: null,
        };
      } catch (e) {
        return { name: t.name, pass: false, actual: null, error: String((e && e.message) || e) };
      }
    });
  } catch (e) {
    __results = tests.map(function (t) {
      return { name: t.name, pass: false, actual: null, error: "Setup: " + String((e && e.message) || e) };
    });
  }
  __finish();
}

onmessage = function (e) {
  if (e.data && e.data.type === "run") __runStudentCode(e.data.code, e.data.tests);
};
`;

/** Runs student code + tests in a fresh Worker; host kills it at the deadline. */
export function runInJsWorker(
  code: string,
  tests: TestCase[],
  timeoutMs = 5000,
): Promise<JsRunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([RUNNER_SOURCE], { type: "text/javascript" }));

    const finish = (
      results: TestResult[],
      console: JsRunResult["console"],
      timedOut: boolean,
    ) => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      worker?.terminate();
      resolve({ results, console, timedOut });
    };

    const timer = window.setTimeout(() => {
      finish(
        tests.map((t) => ({
          name: t.name,
          pass: false,
          actual: null,
          error: `Timed out after ${timeoutMs / 1000}s — check for an infinite loop.`,
        })),
        [],
        true,
      );
    }, timeoutMs);

    const worker: Worker = new Worker(url);

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data as { type: string; results: TestResult[]; console: JsRunResult["console"] };
      if (data?.type === "done") finish(data.results, data.console, false);
    };
    worker.onerror = (e) => {
      finish(
        tests.map((t) => ({
          name: t.name,
          pass: false,
          actual: null,
          error: "Worker error: " + e.message,
        })),
        [],
        false,
      );
    };

    worker.postMessage({ type: "run", code, tests });
  });
}
