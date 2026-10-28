// ============================================================================
// htmlRunner.ts — Phase 5. HTML/CSS executor (sandboxed iframe).
//
//   • The student's HTML/CSS is injected into an iframe via `srcdoc`, with
//     sandbox="allow-scripts" and NO allow-same-origin: the iframe gets an
//     OPAQUE origin, so its scripts cannot read cookies, localStorage, or
//     fetch the app's APIs with credentials. This is the strongest sandbox of
//     the four languages — genuinely isolated, and free.
//   • Scripts (if the exercise allows them) run inside that opaque origin.
//   • A watchdog rewrites the iframe to about:blank if a document never
//     settles — though HTML/CSS can't infinite-loop the main thread the way
//     JS/Python can; rendering happens in the iframe's own process.
//   • "Tests" are DOM checks the ADMIN defines: each test's `fn` is a JS
//     expression string evaluated INSIDE the iframe; a truthy result passes.
//     Example: document.querySelectorAll('p').length === 3
// ============================================================================
import type { TestCase, TestResult } from "./jsWorker";

export type HtmlRunResult = {
  results: TestResult[];
  console: { level: string; text: string }[];
  timedOut: boolean;
};

/** Runs the HTML in a hidden iframe, then evaluates test expressions inside it. */
export function runHtmlTests(
  html: string,
  tests: TestCase[],
  timeoutMs = 5000,
): Promise<HtmlRunResult> {
  return new Promise((resolve) => {
    const iframe = document.createElement("iframe");
    iframe.style.display = "none";
    iframe.setAttribute("sandbox", "allow-scripts"); // opaque origin — no cookies, no storage, no same-origin fetch
    iframe.setAttribute("aria-hidden", "true");

    let settled = false;

    const finish = (results: TestResult[], timedOut: boolean) => {
      if (settled) return;
      settled = true;
      window.clearTimeout(timer);
      iframe.remove();
      resolve({
        results,
        console: [],
        timedOut,
      });
    };

    const timer = window.setTimeout(() => {
      finish(
        tests.map((t) => ({
          name: t.name,
          pass: false,
          actual: null,
          error: `Timed out after ${timeoutMs / 1000}s — the page never finished rendering.`,
        })),
        true,
      );
    }, timeoutMs);

    iframe.onerror = () =>
      finish(
        tests.map((t) => ({ name: t.name, pass: false, actual: null, error: "Could not render the page." })),
        false,
      );

    // Inside the iframe: evaluate each admin test expression, post results out.
    // postMessage to parent works from a sandboxed (opaque-origin) frame.
    const harness = `
      <script>
        window.addEventListener("load", function () {
          setTimeout(function () {
            var tests = ${JSON.stringify(tests.map((t) => ({ name: t.name, fn: t.fn })))};
            var out = [];
            for (var i = 0; i < tests.length; i++) {
              var r;
              try {
                var v = eval(tests[i].fn);          // admin-authored DOM check
                r = { name: tests[i].name, pass: !!v, actual: String(v), error: null };
              } catch (e) {
                r = { name: tests[i].name, pass: false, actual: null, error: String((e && e.message) || e) };
              }
              out.push(r);
            }
            parent.postMessage({ type: "html-test-results", results: out }, "*");
          }, 60); // small delay so styles/layout settle
        });
      <\/script>
    `;

    iframe.onload = () => {
      // The harness script above runs on load; results arrive via postMessage.
    };

    iframe.srcdoc = html + harness;
    document.body.appendChild(iframe);

    window.addEventListener("message", function handler(e: MessageEvent) {
      if (e.data?.type !== "html-test-results") return;
      window.removeEventListener("message", handler);
      finish(e.data.results as TestResult[], false);
    });
  });
}

/** Builds the srcdoc for the LIVE PREVIEW pane (same sandbox, no harness). */
export function buildPreviewSrcdoc(html: string): string {
  return html;
}
