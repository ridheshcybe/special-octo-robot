const assert = require("node:assert/strict");
const { execFileSync } = require("node:child_process");
const { mkdtempSync, rmSync } = require("node:fs");
const path = require("node:path");

process.env.NODE_PATH = path.resolve("node_modules");
require("module").Module._initPaths();

const dir = mkdtempSync(path.join(require("node:os").tmpdir(), "pmu-email-"));

(async () => {
  try {
    execFileSync(process.execPath, [
      "node_modules/typescript/bin/tsc",
      "app/prepmeup/_lib/emailOtp.ts",
      "--module",
      "commonjs",
      "--target",
      "ES2022",
      "--esModuleInterop",
      "--skipLibCheck",
      "--outDir",
      dir,
    ]);

    const { sendEmailOtp, verifyEmailOtp } = require(path.join(dir, "emailOtp.js"));

    // 1. Fail closed in production when unconfigured
    process.env.NODE_ENV = "production";
    delete process.env.RESEND_API_KEY;
    delete process.env.SMTP_USER;
    delete process.env.HOSTINGER_EMAIL_USER;

    const prodFailResult = await sendEmailOtp("student@example.com");
    assert.equal(prodFailResult.success, false);
    assert.equal(prodFailResult.status, "failed");

    // 2. Dev mode mock OTP behavior
    process.env.NODE_ENV = "development";
    process.env.PMU_OTP_DEV_MODE = "true";
    const devSendResult = await sendEmailOtp("student@example.com");
    assert.equal(devSendResult.success, true);
    assert.equal(devSendResult.status, "mock_sent");
    assert.ok(/^\d{6}$/.test(devSendResult.mockCode));

    // 3. Invalid code rejection
    const invalidVerify = await verifyEmailOtp("student@example.com", "000000");
    assert.equal(invalidVerify.success, false);

    // 4. Correct code verification (one-time use)
    const validVerify = await verifyEmailOtp("student@example.com", devSendResult.mockCode);
    assert.equal(validVerify.success, true);
    assert.equal(validVerify.status, "approved");

    // 5. Subsequent attempt fails (code was consumed)
    const consumedVerify = await verifyEmailOtp("student@example.com", devSendResult.mockCode);
    assert.equal(consumedVerify.success, false);

    console.log("5 Email OTP verification checks passed successfully.");
  } finally {
    rmSync(dir, { recursive: true, force: true });
  }
})().catch((e) => {
  console.error(e);
  process.exitCode = 1;
});
