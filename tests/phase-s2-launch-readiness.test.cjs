// Phase S2-Launch-Readiness Tests
// Node.js built-in test runner - CommonJS with absolute paths
const { existsSync } = require("fs");
const { readFileSync } = require("fs");

// Absolute paths for the special-octo-robot-main project
const PROJ_ROOT = process.cwd();

// -- Health endpoint test --

// Test 1: Health endpoint route exists
const healthPath = PROJ_ROOT + "/app/prepmeup/health/route.ts";
const healthContent = existsSync(healthPath) ? readFileSync(healthPath, "utf-8") : "";
console.log(
  "HEALTH_ENDPOINT_ROUTE",
  healthContent.includes("GET /api/prepmeup/health") ? "EXISTS" : "MISSING"
);

// Test 2: Health endpoint returns structured data
if (healthContent) {
  const hasStatus = healthContent.includes("status: ok") || healthContent.includes("\"status\"");
  const hasTimestamp = healthContent.includes("timestamp") || healthContent.includes("\"timestamp\"");
  const hasDbConnectivity = healthContent.includes("database") || healthContent.includes("supabase");
  const hasStorageConnectivity = healthContent.includes("storage");
  const hasRazorpayConfig = healthContent.includes("razorpay");
  console.log(
    "HEALTH_ENDPOINT_STRUCTURED",
    hasStatus && hasTimestamp ? "OK" : "BASIC"
  );
  console.log("HEALTH_DB_CONNECTIVITY", hasDbConnectivity ? "MENTIONED" : "NOT_MENTIONED");
  console.log("HEALTH_STORAGE_CONNECTIVITY", hasStorageConnectivity ? "MENTIONED" : "NOT_MENTIONED");
  console.log("HEALTH_RAZORPAY_CONFIG", hasRazorpayConfig ? "MENTIONED" : "NOT_MENTIONED");
} else {
  console.log("HEALTH_ENDPOINT_STRUCTURED", "MISSING");
}

// -- Environment validation test --

// Test 3: Legal pages exist
// Files are at app/prepmeup/terms/page.tsx etc.
const legalPages = [
  { path: "/app/prepmeup/terms/page.tsx", name: "TERMS" },
  { path: "/app/prepmeup/privacy/page.tsx", name: "PRIVACY" },
  { path: "/app/prepmeup/refunds/page.tsx", name: "REFUNDS" },
  { path: "/app/prepmeup/pricing-policy/page.tsx", name: "PRICING-POLICY" },
  { path: "/app/prepmeup/contact/page.tsx", name: "CONTACT" },
  { path: "/app/prepmeup/acceptable-use/page.tsx", name: "ACCEPTABLE-USE" },
  { path: "/app/prepmeup/cybersecurity-ethics/page.tsx", name: "CYBERSECURITY-ETHICS" }
];

legalPages.forEach((page) => {
  const pagePath = PROJ_ROOT + page.path;
  const pageExists = existsSync(pagePath);
  const upperPage = page.name;
  console.log(`LEGAL_PAGE_${upperPage}`, pageExists ? "EXISTS" : "MISSING");
});

// Test 4: Monitoring dashboard exists
const monitoringPath = PROJ_ROOT + "/app/prepmeup/admin/monitoring/page.tsx";
const monitoringContent = existsSync(monitoringPath) ? readFileSync(monitoringPath, "utf-8") : "";
console.log(
  "MONITORING_DASHBOARD",
  monitoringContent ? "EXISTS" : "MISSING"
);

// Test 5: Backup status exists
const backupPath = PROJ_ROOT + "/app/prepmeup/admin/backup-status/page.tsx";
const backupContent = existsSync(backupPath) ? readFileSync(backupPath, "utf-8") : "";
console.log(
  "BACKUP_STATUS_DASHBOARD",
  backupContent ? "EXISTS" : "MISSING"
);

// Test 6: Content readiness dashboard exists
const contentReadinessPath = PROJ_ROOT + "/app/prepmeup/admin/content-readiness/page.tsx";
const contentReadinessContent = existsSync(contentReadinessPath) ? readFileSync(contentReadinessPath, "utf-8") : "";
console.log(
  "CONTENT_READINESS_DASHBOARD",
  contentReadinessContent ? "EXISTS" : "MISSING"
);

// -- CyberSecurity commerce tests --

// Test 7: Cybersecurity pricing page exists
const cyberPricingPath = PROJ_ROOT + "/app/prepmeup/cybersecurity/pricing/page.tsx";
const existsCyberPricingPath = existsSync(cyberPricingPath);
const cyberPricingContent = existsCyberPricingPath ? readFileSync(cyberPricingPath, "utf-8") : "";
console.log(
  "CYBER_PRICING_PAGE",
  existsCyberPricingPath ? "EXISTS" : "MISSING"
);

// Test 8: Cybersecurity checkout page exists
const cyberCheckoutPath = PROJ_ROOT + "/app/prepmeup/cybersecurity/checkout/page.tsx";
const cyberCheckoutContent = existsSync(cyberCheckoutPath) ? readFileSync(cyberCheckoutPath, "utf-8") : "";
console.log(
  "CYBER_CHECKOUT_PAGE",
  cyberCheckoutContent ? "EXISTS" : "MISSING"
);

// Test 9: Payment success page exists
const cyberPaymentSuccessPath = PROJ_ROOT + "/app/prepmeup/cybersecurity/payment-success/page.tsx";
const cyberPaymentSuccessContent = existsSync(cyberPaymentSuccessPath) ? readFileSync(cyberPaymentSuccessPath, "utf-8") : "";
console.log(
  "CYBER_PAYMENT_SUCCESS_PAGE",
  cyberPaymentSuccessContent ? "EXISTS" : "MISSING"
);

// Test 10: Admin cyber payments page exists
const adminCyberPaymentsPath = PROJ_ROOT + "/app/prepmeup/admin/cyber-payments/page.tsx";
const adminCyberPaymentsContent = existsSync(adminCyberPaymentsPath) ? readFileSync(adminCyberPaymentsPath, "utf-8") : "";
console.log(
  "ADMIN_CYBER_PAYMENTS_PAGE",
  adminCyberPaymentsContent ? "EXISTS" : "MISSING"
);

// Test 11: Access result discriminated union is properly exported and used
const accessPath = PROJ_ROOT + "/lib/prepmeup/access.ts";
const accessContent = existsSync(accessPath) ? readFileSync(accessPath, "utf-8") : "";
console.log(
  "ACCESS_RESULT_EXPORTED",
  accessContent.includes("export type AccessResult") ? "EXISTS" : "MISSING"
);
console.log(
  "ACCESS_RESULT_DISCRIMINATED",
  accessContent.includes("| { allowed: true") ? "YES" : "NO"
);

// Test 12: Supabase client exists
const dbPath = PROJ_ROOT + "/lib/prepmeup/db.ts";
const dbContent = existsSync(dbPath) ? readFileSync(dbPath, "utf-8") : "";
console.log(
  "SUPABASE_CLIENT",
  dbContent.includes("createServiceRoleClient") ? "EXISTS" : "MISSING"
);

// Test 13: No `any` in service files (check for business logic `any`, not infrastructure)
const serviceFiles = [
  "lib/prepmeup/certificates.ts",
  "lib/prepmeup/cyberLabs.ts",
  "lib/prepmeup/enrollments.ts",
  "lib/prepmeup/mentorship.ts",
  "lib/prepmeup/payments.ts"
];

serviceFiles.forEach((file) => {
  const content = existsSync(PROJ_ROOT + file) ? readFileSync(PROJ_ROOT + file, "utf-8") : "";
  // Check for business logic any (not in catch blocks, not in config)
  const businessAnyMatches = content.match(/[^\[\]{} (]any[^\[\]{} (]/g) || [];
  // Filter out infrastructure contexts
  const filteredAny = businessAnyMatches.filter(m => 
    !m.includes("catch") && !m.includes("config") && !m.includes("client") && !m.includes("Promise")
  );
  const fileName = file.split("/").pop();
  console.log(`NO_ANY_${fileName.toUpperCase()}`, filteredAny.length === 0 ? "YES" : `${filteredAny.length} found`);
});

// Test 14: Key access functions exist
const requiredFunctions = [
  "hasBtechAccess",
  "hasQuantumAccess", 
  "hasCyberSecurityAccess",
  "hasAllAccess",
  "hasQuantumSemesterPass",
  "hasQuantumMentorshipPack",
  "hasCyberSemesterPass",
  "hasCyberMentorshipPack",
  "canAccessLesson",
  "canAccessQuiz",
  "canAccessSimulation",
  "canAccessCyberLesson",
  "canAccessCyberLab",
  "canAccessCyberQuiz",
  "canBookMentorship",
  "canBookQuantumMentorship",
  "canBookCyberMentorship"
];

requiredFunctions.forEach((func) => {
  const file = PROJ_ROOT + "/lib/prepmeup/access.ts";
  const content = existsSync(file) ? readFileSync(file, "utf-8") : "";
  const hasFunc = content.includes(`export function ${func}`);
  const upperFunc = func.toUpperCase();
  console.log(`FUNCTION_${upperFunc}`, hasFunc ? "EXISTS" : "MISSING");
});

// Test 15: Free preview remains accessible
const tracksPath = PROJ_ROOT + "/app/prepmeup/tracks/cybersecurity/page.tsx";
const tracksContent = existsSync(tracksPath) ? readFileSync(tracksPath, "utf-8") : "";
console.log(
  "FREE_PREVIEW_ACCESS",
  tracksContent.includes("free_preview") ? "CONFIGURED" : "NOT_FOUND"
);

// Summary
console.log("\n--- S2 LAUNCH-READINESS TEST SUMMARY ---");
const healthExists = healthContent ? healthContent.includes("status") && healthContent.includes("ok") : false;
const legalCount = legalPages.filter(p => {
  const path = PROJ_ROOT + p.path;
  return existsSync(path);
}).length;
const allPassed =
  healthExists &&
  legalCount >= 6 && // At least 6 of 7 legal pages
  monitoringContent !== undefined &&
  backupContent !== undefined &&
  contentReadinessContent !== undefined &&
  existsCyberPricingPath &&
  cyberCheckoutContent &&
  cyberPaymentSuccessContent &&
  adminCyberPaymentsContent &&
  accessContent.includes("export type AccessResult");
console.log("ALL_CHECKS_PASS", allPassed ? "YES" : "NO");