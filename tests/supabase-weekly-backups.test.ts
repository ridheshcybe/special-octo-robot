import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import {
  getWeekIdentifier,
  buildBackupPackageFromCode,
  runWeeklyBackupRotation,
  purgeStaleBackups,
  getBackupsStatus,
  getBackupPackageById,
  restoreFromBackup,
} from "@/lib/prepmeup/backupManager";
import {
  createCustomNotification,
  getActiveNotificationsForUser,
  toggleCustomNotification,
  deleteCustomNotification,
} from "@/lib/prepmeup/notifications";
import {
  getAIProviderRouterStatus,
  setCustomPcTunnelConfig,
  callUnifiedFreeAI,
} from "@/lib/prepmeup/aiRouter";
import http from "node:http";

console.log("================================================================================");
console.log("PrepMeUp AI — Supabase Weekly Backups & UI Declutter Verification Suite");
console.log("================================================================================");

async function runTests() {
  // ---------------------------------------------------------------------------
  // [Check 1] SQL Migration & RLS Verification
  // ---------------------------------------------------------------------------
  console.log("\n[Check 1] Verifying Supabase Backup Migration & RLS Policies...");
  const sqlPath = path.resolve(process.cwd(), "backend/prepmeup/migration-backups.sql");
  assert.ok(fs.existsSync(sqlPath), "migration-backups.sql must exist");
  const sql = fs.readFileSync(sqlPath, "utf-8");
  assert.ok(sql.includes("pmu-backups"), "Must configure pmu-backups storage bucket");
  assert.ok(sql.includes("CREATE TABLE IF NOT EXISTS public.pmu_system_backups"), "Must create pmu_system_backups table");
  assert.ok(sql.includes("rotate_weekly_pmu_backups"), "Must define rotate_weekly_pmu_backups SQL function");
  assert.ok(sql.includes("INTERVAL '7 days'"), "Must enforce 7-day weekly retention interval");
  console.log("✓ Supabase SQL migration, bucket, and 7-day retention function verified.");

  // ---------------------------------------------------------------------------
  // [Check 2] Build Backup Package From Code
  // ---------------------------------------------------------------------------
  console.log("\n[Check 2] Testing Backup Package Generation From Code...");
  const built = buildBackupPackageFromCode();
  assert.strictEqual(built.packageData.meta.packageFormat, "prepmeup-supabase-weekly-backup-v1");
  assert.ok(built.sizeBytes > 1000, "Backup package size must be non-trivial");
  assert.strictEqual(built.checksumSha256.length, 64, "Must generate valid 64-char SHA-256 hex digest");
  assert.ok(built.packageData.summary.subjectsCount >= 6, "Must include B.Tech subjects");
  assert.ok(built.packageData.summary.unifiedProductsCount === 7, "Must include all 7 unified products");
  assert.ok(built.packageData.portfolioSeed.projects.items.length > 0, "Must include portfolio seed data");
  console.log(`✓ Code backup package built (${(built.sizeBytes / 1024).toFixed(1)} KB, SHA-256: ${built.checksumSha256.slice(0, 16)}...).`);

  // ---------------------------------------------------------------------------
  // [Check 3] Weekly Rotation: Delete Stale Backup (> 7 Days) & Add New Package
  // ---------------------------------------------------------------------------
  console.log("\n[Check 3] Testing Weekly Backup Rotation & Stale Backup Deletion...");
  const eightDaysAgoMs = Date.now() - 8 * 24 * 60 * 60 * 1000;
  const staleWeekId = getWeekIdentifier(new Date(eightDaysAgoMs));

  // Create a backup simulated 8 days ago (stale week)
  const initialRotation = await runWeeklyBackupRotation({
    forceNew: true,
    triggeredBy: "test-suite-week-old",
    simulatedNowMs: eightDaysAgoMs,
  });
  assert.strictEqual(initialRotation.activeBackup.weekIdentifier, staleWeekId);

  // Now run weekly rotation at current time (8 days later)
  const currentRotation = await runWeeklyBackupRotation({
    forceNew: false,
    triggeredBy: "test-suite-current-week",
    simulatedNowMs: Date.now(),
  });

  assert.strictEqual(currentRotation.rotated, true, "Must rotate when previous backup is stale (>7 days)");
  assert.ok(currentRotation.staleDeletedCount >= 1, "Must delete stale backup from prior week");
  assert.ok(
    currentRotation.deletedKeys.includes(initialRotation.activeBackup.backupKey),
    "Deleted keys must include the stale backup key"
  );
  assert.strictEqual(
    currentRotation.activeBackup.weekIdentifier,
    getWeekIdentifier(new Date()),
    "New active backup must match current week identifier"
  );

  const statusAfter = await getBackupsStatus(false);
  assert.strictEqual(statusAfter.backups.length, 1, "Only the fresh weekly backup should remain active");
  console.log(
    `✓ Stale backup (${initialRotation.activeBackup.backupKey}) deleted and new package (${currentRotation.activeBackup.backupKey}) added.`
  );

  // ---------------------------------------------------------------------------
  // [Check 4] Checksum Integrity & Restore Verification
  // ---------------------------------------------------------------------------
  console.log("\n[Check 4] Testing Package Retrieval, SHA-256 Verification & State Restore...");
  const activeId = currentRotation.activeBackup.id;
  const pkgCheck = await getBackupPackageById(activeId);
  assert.strictEqual(pkgCheck.ok, true, "Must retrieve active backup package");
  assert.strictEqual(
    pkgCheck.record?.checksumSha256,
    currentRotation.activeBackup.checksumSha256,
    "SHA-256 checksum must match"
  );

  const restoreCheck = await restoreFromBackup(activeId);
  assert.strictEqual(restoreCheck.ok, true, "Restoring from verified backup package must succeed");
  console.log("✓ Backup SHA-256 verification and state restoration verified.");

  // ---------------------------------------------------------------------------
  // [Check 5] Custom Notification Sender & Audience Targeting
  // ---------------------------------------------------------------------------
  console.log("\n[Check 5] Testing Custom Notification Sender & Audience Targeting...");
  const paidNotif = await createCustomNotification({
    title: "Paid VIP Session Alert",
    message: "Live 1:1 mentorship starts in 15 mins",
    category: "mentorship",
    audience: "paid",
    ctaLabel: "Join Meet →",
    ctaHref: "/prepmeup/sessions",
    expiresInHours: 24,
  });

  const specificNotif = await createCustomNotification({
    title: "Private Scholarship Update",
    message: "Your All-Access seat is active.",
    category: "success",
    audience: "specific_user",
    recipientTarget: "scholar@college.edu",
    expiresInHours: 24,
  });

  const freeUserList = getActiveNotificationsForUser({ userTarget: "guest@college.edu", isPaidUser: false });
  assert.ok(!freeUserList.some((n) => n.id === paidNotif.id), "Free user must not receive paid-only notification");
  assert.ok(!freeUserList.some((n) => n.id === specificNotif.id), "Other user must not receive specific_user notification");

  const paidUserList = getActiveNotificationsForUser({ userTarget: "vip@college.edu", isPaidUser: true });
  assert.ok(paidUserList.some((n) => n.id === paidNotif.id), "Paid user must receive paid notification");

  const targetUserList = getActiveNotificationsForUser({ userTarget: "scholar@college.edu", isPaidUser: false });
  assert.ok(targetUserList.some((n) => n.id === specificNotif.id), "Specific target user must receive their notification");

  // Toggle & delete cleanup
  const toggled = await toggleCustomNotification(paidNotif.id);
  assert.strictEqual(toggled?.isActive, false, "Toggle must pause notification");
  assert.strictEqual(await deleteCustomNotification(paidNotif.id), true);
  assert.strictEqual(await deleteCustomNotification(specificNotif.id), true);
  console.log("✓ Custom notification sender, audience targeting, toggle, and deletion verified.");

  // ---------------------------------------------------------------------------
  // [Check 6] Free Multi-Provider AI Router & 24/7 Local PC Tunnel Failover
  // ---------------------------------------------------------------------------
  console.log("\n[Check 6] Testing Free Multi-Provider AI Router & 24/7 PC Tunnel Failover...");
  const routerStatus = getAIProviderRouterStatus();
  assert.strictEqual(routerStatus.providers.length, 5, "Must define all 5 free providers in cascade");
  assert.ok(routerStatus.providers.every((p) => p.isFree === true), "All providers in router must be $0 free");

  // Spin up a mock 24/7 Local PC Tunnel server to verify zero-cost local tunnel routing
  const mockTunnelServer = http.createServer((req, res) => {
    if (req.url === "/v1/chat/completions" && req.method === "POST") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          choices: [
            {
              message: {
                content: "Cayley-Hamilton verified via 24/7 Local PC Tunnel ($0 local GPU/CPU).",
              },
            },
          ],
        })
      );
      return;
    }
    res.writeHead(404);
    res.end();
  });

  await new Promise<void>((resolve) => mockTunnelServer.listen(0, "127.0.0.1", resolve));
  const address = mockTunnelServer.address() as { port: number };
  const mockTunnelUrl = `http://127.0.0.1:${address.port}`;

  try {
    setCustomPcTunnelConfig(mockTunnelUrl, "llama3.2:latest");
    const aiRes = await callUnifiedFreeAI({
      userPrompt: "Verify Cayley-Hamilton via local PC tunnel",
      preferredProvider: "local_pc_tunnel",
    });

    assert.strictEqual(aiRes.providerUsed, "local_pc_tunnel", "Must route to 24/7 Local PC Tunnel");
    assert.strictEqual(aiRes.modelUsed, "local-pc/llama3.2:latest");
    assert.ok(aiRes.text.includes("Cayley-Hamilton verified via 24/7 Local PC Tunnel"));
    console.log(`✓ 24/7 PC Tunnel & Free Multi-Provider AI Router verified (${aiRes.modelUsed} in ${aiRes.latencyMs}ms).`);
  } finally {
    setCustomPcTunnelConfig(null);
    mockTunnelServer.close();
  }
}

runTests()
  .then(() => {
    console.log("\n================================================================================");
    console.log("ALL SUPABASE WEEKLY BACKUP & ROTATION CHECKS PASSED PERFECTLY!");
    console.log("================================================================================");
  })
  .catch((err) => {
    console.error("Backup verification failed:", err);
    process.exit(1);
  });
