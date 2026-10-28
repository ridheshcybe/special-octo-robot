// ============================================================================
// sqlWorker.ts — Phase 5. SQL executor (sql.js / SQLite compiled to WASM).
//
//   • sql.js (~1.5 MB wasm) is fetched from jsDelivr once per session, cached
//     by the browser; this file is code-split with the exercise player.
//   • Everything runs in a Worker; the host kills infinite/looping or heavy
//     queries at the deadline. sql.js itself has no built-in query timeout,
//     so the host-side kill is the only guard.
//   • Each exercise gets a FRESH in-memory DB: sample_db_sql runs first
//     (CREATE/INSERT), then the student's query. The result of the LAST
//     statement is compared against `expect` as a normalized grid string —
//     same format admins see when writing tests ("Rohit,91").
// ============================================================================
export type TestCase = { name: string; fn: string; expect: unknown };
export type TestResult = { name: string; pass: boolean; actual: unknown; error: string | null };

export type SqlRunResult = {
  results: TestResult[];
  console: { level: string; text: string }[];
  timedOut: boolean;
};

const SQLJS_VERSION = "1.13.0";
const SQLJS_BASE = `https://cdn.jsdelivr.net/npm/sql.js@${SQLJS_VERSION}/dist/`;

const RUNNER_SOURCE = `
importScripts("${SQLJS_BASE}sql-wasm.js");

var initPromise = null;
function getSql() {
  if (!initPromise) {
    initPromise = initSqlJs({ locateFile: function (file) { return "${SQLJS_BASE}" + file; } });
  }
  return initPromise;
}

function rowsToText(rows) {
  return rows.map(function (r) { return r.join(","); }).join("\\n");
}

onmessage = function (e) {
  var msg = e.data || {};
  if (msg.type !== "run") return;

  getSql()
    .then(function (SQL) {
      var logs = [];
      var db = new SQL.Database();
      try {
        if (msg.sampleDbSql) db.exec(msg.sampleDbSql);   // CREATE + INSERTs
        db.exec(msg.code);                                // student SQL (can be multi-statement)
        var lastResult = db.exec("SELECT * FROM sqlite_master WHERE 0"); // shape ref
        var stmts = db.exec(msg.code);
        var last = stmts.length > 0 ? stmts[stmts.length - 1] : null;
        void lastResult;

        // Run each test as a fresh DB seeded the same way, comparing grids.
        var results = msg.tests.map(function (t) {
          try {
            var testDb = new SQL.Database();
            if (msg.sampleDbSql) testDb.exec(msg.sampleDbSql);
            var out = testDb.exec(msg.code);
            testDb.close();
            var last2 = out.length > 0 ? out[out.length - 1] : null;
            var actualText = last2 ? rowsToText(last2.values) : "(no rows)";
            var expectedText = String(t.expect);
            return {
              name: t.name,
              pass: actualText === expectedText,
              actual: actualText,
              error: null,
            };
          } catch (err) {
            return { name: t.name, pass: false, actual: null, error: String((err && err.message) || err) };
          }
        });

        // For the output pane: show the student's own query result.
        var preview = last ? rowsToText(last.values) : "(no rows)";
        if (logs.length === 0) logs.push({ level: "log", text: "Result:\\n" + preview });

        postMessage({ type: "done", results: results, console: logs });
      } finally {
        db.close();
      }
    })
    .catch(function (err) {
      postMessage({
        type: "done",
        results: msg.tests.map(function (t) {
          return { name: t.name, pass: false, actual: null, error: String((err && err.message) || err) };
        }),
        console: [],
      });
    });
};
`;

export function runInSqlWorker(
  code: string,
  tests: TestCase[],
  sampleDbSql: string,
  timeoutMs = 8000,
): Promise<SqlRunResult> {
  return new Promise((resolve) => {
    const url = URL.createObjectURL(new Blob([RUNNER_SOURCE], { type: "text/javascript" }));
    const worker = new Worker(url);

    const finish = (payload: Omit<SqlRunResult, "timedOut">, timedOut: boolean) => {
      window.clearTimeout(timer);
      URL.revokeObjectURL(url);
      worker.terminate();
      resolve({ ...payload, timedOut });
    };

    const timer = window.setTimeout(() => {
      finish(
        {
          results: tests.map((t) => ({
            name: t.name,
            pass: false,
            actual: null,
            error: `Timed out after ${timeoutMs / 1000}s — the query is too heavy or loops forever.`,
          })),
          console: [],
        },
        true,
      );
    }, timeoutMs);

    worker.onmessage = (e: MessageEvent) => {
      const data = e.data as { type: string; results?: TestResult[]; console?: SqlRunResult["console"] };
      if (data?.type === "done") {
        finish({ results: data.results ?? [], console: data.console ?? [] }, false);
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

    worker.postMessage({ type: "run", code, tests, sampleDbSql });
  });
}
