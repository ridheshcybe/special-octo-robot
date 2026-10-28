// ============================================================================
// pyWorker.ts — Phase 5. Python executor (Pyodide / WebAssembly, in a Worker).
//
//   • Pyodide (~10 MB) is fetched from jsDelivr ONCE per browser session and
//     cached by the HTTP cache — the lesson page itself stays light because
//     this whole file is imported only from the exercise player (code-split).
//   • Real CPython runs in the worker; nothing on the main thread.
//   • Handshake: worker loads Pyodide, posts "ready"; only THEN does the host
//     arm the kill timer and post "exec" — so the first slow load never eats
//     the execution deadline, while infinite loops still die at the deadline.
//   • stdout/stderr are captured; test expressions are evaluated via
//     json.dumps(...) so results cross to JS cleanly.
// ============================================================================
export type TestCase = { name: string; fn: string; expect: unknown };
export type TestResult = { name: string; pass: boolean; actual: unknown; error: string | null };

export type PyRunResult = {
  results: TestResult[];
  console: { level: string; text: string }[];
  timedOut: boolean;
};

const PYODIDE_VERSION = "0.28.3";
const PYODIDE_URL = `https://cdn.jsdelivr.net/pyodide/v${PYODIDE_VERSION}/full/`;

const RUNNER_SOURCE = `
importScripts("${PYODIDE_URL}pyodide.js");

var pyodidePromise = null;
function getPyodide() {
  if (!pyodidePromise) {
    pyodidePromise = loadPyodide({ indexURL: "${PYODIDE_URL}" });
  }
  return pyodidePromise;
}

var pending = null;

onmessage = function (e) {
  var msg = e.data || {};
  if (msg.type === "run") {
    pending = msg;
    getPyodide()
      .then(function () { postMessage({ type: "ready" }); })
      .catch(function (err) {
        postMessage({ type: "done", error: "Could not load Python: " + String((err && err.message) || err) });
      });
  } else if (msg.type === "exec" && pending) {
    execute(pending);
    pending = null;
  }
};

function execute(job) {
  var logs = [];
  var py;
  getPyodide()
    .then(function (p) {
      py = p;
      py.setStdout({ batched: function (s) { logs.push({ level: "log", text: s }); } });
      py.setStderr({ batched: function (s) { logs.push({ level: "error", text: s }); } });
      return py.runPythonAsync(job.code);
    })
    .then(function () {
      py.runPython("import json");
      var results = job.tests.map(function (t) {
        try {
          var jsonText = py.runPython("json.dumps(" + t.fn + ")");
          var actual = JSON.parse(jsonText);
          var equal = JSON.stringify(actual) === JSON.stringify(t.expect);
          return { name: t.name, pass: equal, actual: actual, error: null };
        } catch (e) {
          return { name: t.name, pass: false, actual: null, error: String((e && e.message) || e) };
        }
      });
      postMessage({ type: "done", results: results, console: logs });
    })
    .catch(function (e) {
      var message = String((e && e.message) || e);
      postMessage({
        type: "done",
        results: job.tests.map(function (t) {
          return { name: t.name, pass: false, actual: null, error: message };
        }),
        console: logs,
      });
    });
}
`;

export function runInPyWorker(
  code: string,
  tests: TestCase[],
  timeoutMs = 8000,
): Promise<PyRunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([RUNNER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url);

    const finish = (payload: Omit<PyRunResult, "timedOut">, timedOut: boolean) => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      worker.terminate();
      resolve({ ...payload, timedOut });
    };

    // Armed only after "ready" — loading Pyodide doesn't burn the deadline.
    let timer = Number.NaN;
    const armTimer = () => {
      timer = window.setTimeout(() => {
        finish(
          {
            results: tests.map((t) => ({
              name: t.name,
              pass: false,
              actual: null,
              error: `Timed out after ${timeoutMs / 1000}s — check for an infinite loop (e.g. while True without a break).`,
            })),
            console: [],
          },
          true,
        );
      }, timeoutMs);
    };

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data as {
        type: string;
        results?: TestResult[];
        console?: PyRunResult["console"];
        error?: string;
      };
      if (data?.type === "ready") {
        armTimer();
        worker.postMessage({ type: "exec" });
      } else if (data?.type === "done") {
        finish(
          {
            results: data.results ?? [],
            console: data.console ?? [],
          },
          false,
        );
      }
    };

    worker.onerror = (e) => {
      finish(
        {
          results: tests.map((t) => ({
            name: t.name,
            pass: false,
            actual: null,
            error: "Worker error: " + e.message,
          })),
          console: [],
        },
        false,
      );
    };

    worker.postMessage({ type: "run", code, tests });
  });
}
