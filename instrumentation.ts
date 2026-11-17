/**
 * Next.js instrumentation hook — runs once when the server process starts.
 *
 * Phase S1-A: fail production startup when required PrepMeUp configuration is
 * missing, instead of degrading silently at request time.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;

  const { assertPmuEnv } = await import("./lib/prepmeup/env");

  try {
    assertPmuEnv();
  } catch (error) {
    console.error(
      "[pmu-env] Startup validation failed:",
      error instanceof Error ? error.message : "unknown configuration error"
    );
    throw error;
  }
}
