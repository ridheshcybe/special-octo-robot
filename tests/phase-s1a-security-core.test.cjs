/**
 * Phase S1-A — Authentication & Webhook Security Core
 *
 * Runnable with zero extra dependencies:
 *   node --test tests/phase-s1a-security-core.test.cjs
 *
 * The pure security modules are compiled with the repository's own TypeScript
 * into a temp directory and exercised directly, so these are behavioural tests
 * (not source-string assertions) for anything security-critical.
 */

const { test, after } = require("node:test");
const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const fs = require("node:fs");
const os = require("node:os");
const path = require("node:path");

const REPO_ROOT = process.cwd();
const OUT_DIR = fs.mkdtempSync(path.join(os.tmpdir(), "pmu-s1a-"));

execFileSync(
  process.execPath,
  [
    path.join("node_modules", "typescript", "bin", "tsc"),
    path.join("lib", "prepmeup", "session.ts"),
    path.join("lib", "prepmeup", "env.ts"),
    path.join("lib", "prepmeup", "webhookGuard.ts"),
    "--module",
    "commonjs",
    "--target",
    "ES2022",
    "--moduleResolution",
    "node",
    "--esModuleInterop",
    "--skipLibCheck",
    "--rootDir",
    ".",
    "--outDir",
    OUT_DIR,
  ],
  { cwd: REPO_ROOT, stdio: "pipe" }
);

const session = require(path.join(OUT_DIR, "lib", "prepmeup", "session.js"));
const envModule = require(path.join(OUT_DIR, "lib", "prepmeup", "env.js"));
const webhook = require(path.join(OUT_DIR, "lib", "prepmeup", "webhookGuard.js"));

const SECRET = "test-secret-value-that-is-long-enough-1234";
const ADMIN_ROUTE_SOURCE = fs.readFileSync(
  path.join(REPO_ROOT, "app", "api", "prepmeup", "admin", "login", "route.ts"),
  "utf-8"
);
const QUANTUM_WEBHOOK_SOURCE = fs.readFileSync(
  path.join(REPO_ROOT, "app", "api", "prepmeup", "quantum", "webhook", "route.ts"),
  "utf-8"
);
const MIDDLEWARE_SOURCE = fs.readFileSync(path.join(REPO_ROOT, "middleware.ts"), "utf-8");

function decodePayload(token) {
  const [body] = token.split(".");
  return JSON.parse(Buffer.from(body, "base64url").toString("utf-8"));
}

function encodePayload(payload) {
  return Buffer.from(JSON.stringify(payload), "utf-8").toString("base64url");
}

after(() => {
  fs.rmSync(OUT_DIR, { recursive: true, force: true });
});

// ---------------------------------------------------------------------------
// Admin session signing
// ---------------------------------------------------------------------------

test("valid signed admin session is accepted", async () => {
  const token = await session.signPmuAdminSession(
    { sub: "admin-123", email: "admin@example.com", fullName: "Admin" },
    { secret: SECRET }
  );
  assert.equal(typeof token, "string");

  const verified = await session.verifyPmuAdminSessionToken(token, { secret: SECRET });
  assert.ok(verified);
  assert.equal(verified.sub, "admin-123");
  assert.equal(verified.role, "admin");
  assert.ok(verified.jti.length > 0);
  assert.ok(verified.exp > verified.iat);
});

test("token is not JSON — a forged JSON admin cookie is rejected", async () => {
  const forged = JSON.stringify({ userId: "admin-primary", role: "admin" });
  const verified = await session.verifyPmuAdminSessionToken(forged, { secret: SECRET });
  assert.equal(verified, null);

  const decision = await session.evaluatePmuAdminRequest({
    token: forged,
    secret: SECRET,
    method: "GET",
  });
  assert.equal(decision.status, 401);
  assert.equal(decision.reason, "invalid_session");
});

test("tampered payload fails verification", async () => {
  const token = await session.signPmuAdminSession({ sub: "student-1" }, { secret: SECRET });
  const payload = decodePayload(token);
  payload.role = "admin";
  payload.sub = "attacker";

  const tampered = `${encodePayload(payload)}.${token.split(".")[1]}`;
  const verified = await session.verifyPmuAdminSessionToken(tampered, { secret: SECRET });
  assert.equal(verified, null);
});

test("invalid signature fails verification", async () => {
  const token = await session.signPmuAdminSession({ sub: "admin-1" }, { secret: SECRET });
  const [body] = token.split(".");
  const badSignature = "0".repeat(43);

  assert.equal(
    await session.verifyPmuAdminSessionToken(`${body}.${badSignature}`, { secret: SECRET }),
    null
  );
  // A token signed with a different secret must not verify either.
  assert.equal(
    await session.verifyPmuAdminSessionToken(token, {
      secret: "a-completely-different-secret-value-0000",
    }),
    null
  );
});

test("expired session fails verification", async () => {
  const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
  const token = await session.signPmuAdminSession(
    { sub: "admin-1", ttlSeconds: 60 },
    { secret: SECRET, now: twoHoursAgo }
  );
  assert.equal(await session.verifyPmuAdminSessionToken(token, { secret: SECRET }), null);

  const decision = await session.evaluatePmuAdminRequest({ token, secret: SECRET });
  assert.equal(decision.status, 401);
});

test("missing session fails verification", async () => {
  assert.equal(await session.verifyPmuAdminSessionToken(null, { secret: SECRET }), null);

  const decision = await session.evaluatePmuAdminRequest({ token: undefined, secret: SECRET });
  assert.equal(decision.status, 401);
  assert.equal(decision.reason, "missing_session");
});

test("a signed token with a non-admin role is rejected", async () => {
  // Even with a valid signature, only role === "admin" is accepted.
  const body = encodePayload({
    sub: "student-1",
    role: "student",
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600,
    jti: "jti-student",
  });
  const crypto = require("node:crypto");
  const signature = crypto.createHmac("sha256", SECRET).update(body).digest("base64url");

  assert.equal(
    await session.verifyPmuAdminSessionToken(`${body}.${signature}`, { secret: SECRET }),
    null
  );
});

test("missing session secret fails closed (503)", async () => {
  const token = await session.signPmuAdminSession({ sub: "admin-1" }, { secret: SECRET });
  const decision = await session.evaluatePmuAdminRequest({ token, secret: null });
  assert.equal(decision.status, 503);
  assert.equal(decision.reason, "session_secret_missing");
});

test("cross-origin state-changing admin request is rejected (CSRF)", async () => {
  const token = await session.signPmuAdminSession({ sub: "admin-1" }, { secret: SECRET });

  const crossOrigin = await session.evaluatePmuAdminRequest({
    token,
    secret: SECRET,
    method: "POST",
    origin: "https://evil.example",
    host: "prepmeup.example",
  });
  assert.equal(crossOrigin.status, 403);
  assert.equal(crossOrigin.reason, "cross_origin_request");

  const sameOrigin = await session.evaluatePmuAdminRequest({
    token,
    secret: SECRET,
    method: "POST",
    origin: "https://prepmeup.example",
    host: "prepmeup.example",
  });
  assert.equal(sameOrigin.status, 200);

  const readOnly = await session.evaluatePmuAdminRequest({
    token,
    secret: SECRET,
    method: "GET",
    origin: "https://evil.example",
    host: "prepmeup.example",
  });
  assert.equal(readOnly.status, 200);
});

test("middleware verifies the signature instead of parsing JSON", () => {
  assert.ok(MIDDLEWARE_SOURCE.includes("verifyPmuAdminSessionToken"));
  assert.ok(!MIDDLEWARE_SOURCE.includes("JSON.parse(adminSessionCookie)"));
});

// ---------------------------------------------------------------------------
// Hardcoded credentials
// ---------------------------------------------------------------------------

test("no hardcoded admin credentials remain in source", () => {
  const sourceFiles = [
    "app/api/prepmeup/admin/login/route.ts",
    "lib/prepmeup/adminAuth.ts",
    "lib/prepmeup/session.ts",
    "app/prepmeup/_lib/studentStore.ts",
    "middleware.ts",
  ];

  for (const relative of sourceFiles) {
    const source = fs.readFileSync(path.join(REPO_ROOT, relative), "utf-8");
    assert.ok(!source.includes("jelly1974"), `${relative} must not contain a hardcoded password`);
    assert.ok(!source.includes("admin1234"), `${relative} must not contain a hardcoded password`);
    assert.ok(
      !/password\s*===\s*["'][^"']+["']/.test(source),
      `${relative} must not compare a password to a literal`
    );
  }
});

test("development admin fallback is gated and cannot run in production", () => {
  assert.ok(ADMIN_ROUTE_SOURCE.includes("isPmuDevAdminFallbackEnabled"));

  const production = {
    NODE_ENV: "production",
    PMU_ENABLE_DEV_ADMIN_FALLBACK: "true",
    PMU_ADMIN_EMAIL: "dev@example.com",
    PMU_ADMIN_PASSWORD: "dev-password",
  };
  assert.equal(envModule.isPmuDevAdminFallbackEnabled(production), false);

  const development = {
    NODE_ENV: "development",
    PMU_ENABLE_DEV_ADMIN_FALLBACK: "true",
    PMU_ADMIN_EMAIL: "dev@example.com",
    PMU_ADMIN_PASSWORD: "dev-password",
  };
  assert.equal(envModule.isPmuDevAdminFallbackEnabled(development), true);

  // Flag alone is not enough.
  assert.equal(
    envModule.isPmuDevAdminFallbackEnabled({ NODE_ENV: "development", PMU_ENABLE_DEV_ADMIN_FALLBACK: "true" }),
    false
  );
});

test("production startup fails when the insecure fallback is enabled", () => {
  const result = envModule.validatePmuEnv({
    NODE_ENV: "production",
    PMU_ENABLE_DEV_ADMIN_FALLBACK: "true",
    PMU_OTP_DEV_MODE: "true",
  });

  assert.equal(result.ok, false);
  const categories = result.issues.map((issue) => issue.category);
  assert.ok(categories.includes("Session security"));
});

// ---------------------------------------------------------------------------
// Webhook fail-closed behaviour
// ---------------------------------------------------------------------------

test("missing webhook secret fails closed with 503", () => {
  const decision = webhook.authorizeWebhookRequest({
    secret: undefined,
    rawBody: '{"event":"payment.captured"}',
    signature: "anything",
  });
  assert.equal(decision.ok, false);
  assert.equal(decision.status, 503);
  assert.equal(decision.error, "WEBHOOK_SECRET_MISSING");
});

test("invalid webhook signature fails with 400", () => {
  const rawBody = '{"event":"payment.captured"}';
  const decision = webhook.authorizeWebhookRequest({
    secret: SECRET,
    rawBody,
    signature: "deadbeef",
  });
  assert.equal(decision.ok, false);
  assert.equal(decision.status, 400);

  const missing = webhook.authorizeWebhookRequest({ secret: SECRET, rawBody, signature: "" });
  assert.equal(missing.status, 400);
});

test("valid webhook signature is accepted", () => {
  const rawBody = '{"event":"payment.captured","payload":{"payment":{"entity":{"id":"pay_1"}}}}';
  const signature = webhook.computeWebhookSignature(rawBody, SECRET);

  const decision = webhook.authorizeWebhookRequest({ secret: SECRET, rawBody, signature });
  assert.equal(decision.ok, true);

  // Signature is HMAC-SHA256 hex, as Razorpay sends it.
  assert.match(signature, /^[0-9a-f]{64}$/);

  // Body tampering invalidates the signature.
  assert.equal(
    webhook.authorizeWebhookRequest({
      secret: SECRET,
      rawBody: `${rawBody} `,
      signature,
    }).status,
    400
  );
});

test("quantum webhook route uses the fail-closed guard", () => {
  assert.ok(QUANTUM_WEBHOOK_SOURCE.includes("authorizeWebhookRequest"));
  assert.ok(QUANTUM_WEBHOOK_SOURCE.includes('"RAZORPAY_WEBHOOK_SECRET"') ||
    QUANTUM_WEBHOOK_SOURCE.includes("process.env.RAZORPAY_WEBHOOK_SECRET"));
  assert.ok(!QUANTUM_WEBHOOK_SOURCE.includes("|| process.env.RAZORPAY_KEY_SECRET"));
  assert.ok(QUANTUM_WEBHOOK_SOURCE.includes("503"));
  assert.ok(QUANTUM_WEBHOOK_SOURCE.includes("pmu_webhook_events"));

  // Durable idempotency: unique (provider, event_id) in the C0 migration.
  const migration = fs.readFileSync(
    path.join(REPO_ROOT, "backend", "prepmeup", "migration-phase-c0.sql"),
    "utf-8"
  );
  assert.match(migration, /unique\s*\(\s*provider\s*,\s*event_id\s*\)/i);
});

test("duplicate webhook events are short-circuited as idempotent", () => {
  // The route returns 200 + idempotent:true on a unique-violation insert, and
  // only processes after successful insertion.
  assert.ok(QUANTUM_WEBHOOK_SOURCE.includes("idempotent: true"));
  assert.ok(QUANTUM_WEBHOOK_SOURCE.includes("23505"));
  const duplicateBranch = QUANTUM_WEBHOOK_SOURCE.indexOf("if (atomicRecord.isDuplicate)");
  const activationCall = QUANTUM_WEBHOOK_SOURCE.indexOf('updateQuantumOrderStatus(orderId, "paid"');
  assert.ok(duplicateBranch > -1, "duplicate branch must exist");
  assert.ok(activationCall > -1, "activation call must exist");
  assert.ok(
    duplicateBranch < activationCall,
    "duplicate detection must run before access activation"
  );
});

// ---------------------------------------------------------------------------
// Environment validation
// ---------------------------------------------------------------------------

test("missing production configuration produces a clear, secret-free error", () => {
  const result = envModule.validatePmuEnv({ NODE_ENV: "production" });
  assert.equal(result.ok, false);
  assert.ok(result.issues.length > 0);

  const categories = result.issues.map((issue) => issue.category);
  for (const expected of [
    "Supabase",
    "Razorpay",
    "Twilio",
    "Gemini",
    "App URL",
    "Certificate signing",
    "Rate limiting",
    "Session security",
  ]) {
    assert.ok(categories.includes(expected), `expected a ${expected} issue`);
  }

  const serialized = JSON.stringify(result);
  assert.ok(!serialized.includes("jelly1974"));
  assert.ok(!serialized.includes("admin1234"));

  let thrown = null;
  try {
    envModule.assertPmuEnv({ NODE_ENV: "production" });
  } catch (error) {
    thrown = error;
  }
  assert.ok(thrown);
  assert.match(thrown.message, /Supabase/);
});

test("development OTP mock cannot run in production", () => {
  const result = envModule.validatePmuEnv({
    NODE_ENV: "production",
    PMU_OTP_DEV_MODE: "true",
  });
  assert.equal(result.ok, false);
  assert.ok(
    result.issues.some((issue) => issue.variables.includes("PMU_OTP_DEV_MODE")),
    "PMU_OTP_DEV_MODE must be reported as a production issue"
  );
});

test("a short session secret is rejected in production", () => {
  const result = envModule.validatePmuEnv({
    NODE_ENV: "production",
    PMU_SESSION_SECRET: "too-short",
  });
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.variables.includes("PMU_SESSION_SECRET") &&
        /at least 32 characters/.test(issue.message)
    )
  );
});

test("a fully configured production environment validates cleanly", () => {
  const complete = {
    NODE_ENV: "production",
    PMU_SESSION_SECRET: SECRET,
    NEXT_PUBLIC_PMU_SUPABASE_URL: "https://example.supabase.co",
    NEXT_PUBLIC_PMU_SUPABASE_ANON_KEY: "anon",
    PMU_SUPABASE_SERVICE_ROLE_KEY: "service",
    UNIFIED_RAZORPAY_KEY_ID: "rzp_live_x",
    UNIFIED_RAZORPAY_KEY_SECRET: "secret",
    NEXT_PUBLIC_UNIFIED_RAZORPAY_KEY_ID: "rzp_live_x",
    UNIFIED_RAZORPAY_WEBHOOK_SECRET: "webhook",
    RAZORPAY_WEBHOOK_SECRET: "webhook",
    TWILIO_ACCOUNT_SID: "AC",
    TWILIO_AUTH_TOKEN: "token",
    TWILIO_VERIFY_SERVICE_SID: "VA",
    GEMINI_API_KEY: "key",
    PMU_APP_URL: "https://prepmeup.example",
    CERTIFICATE_SIGNING_SECRET: "cert",
    UPSTASH_REDIS_REST_URL: "https://redis.example",
    UPSTASH_REDIS_REST_TOKEN: "token",
  };

  const result = envModule.validatePmuEnv(complete);
  assert.deepEqual(result.issues, []);
  assert.equal(result.ok, true);
  assert.doesNotThrow(() => envModule.assertPmuEnv(complete));
});
