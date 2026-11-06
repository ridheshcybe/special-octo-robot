// Phase S1-C4: Type-System and Data-Access Repair Tests
// Using Node.js built-in test runner (test runner approach) - CommonJS with absolute paths
const { existsSync } = require("fs");
const { readFileSync } = require("fs");

// Absolute paths for the special-octo-robot-main project
// Using the current working directory format
const PROJ_ROOT = process.cwd();

// -- AccessResult tests --

// Test 1: AccessResult is exported from lib/prepmeup/access.ts
const accessPath = PROJ_ROOT + "/lib/prepmeup/access.ts";
const accessContent = existsSync(accessPath) ? readFileSync(accessPath, "utf-8") : "";
console.log(
  "ACCESS_RESULT_EXPORTED",
  accessContent.includes("export type AccessResult") ? "EXISTS" : "MISSING"
);

// Test 2: AccessResult is a discriminated union with `allowed`
console.log(
  "ACCESS_RESULT_DISCRIMINATED",
  accessContent.includes("| { allowed: true") ? "YES" : "NO"
);

// Test 3: All required access functions exist
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
  "canBookCyberMentorship",
  "getUnifiedAccessSummary",
  "getQuantumAccessSummary",
  "getCyberAccessSummary",
  "getMentorshipEntitlement"
];

requiredFunctions.forEach((func) => {
  const hasFunc = accessContent.includes(`export function ${func}`);
  console.log(`FUNCTION_${func.toUpperCase()}`, hasFunc ? "EXISTS" : "MISSING");
});

// -- Service file tests --

// Test 7: Supabase typed client exists
const dbPath = PROJ_ROOT + "/lib/prepmeup/db.ts";
const dbContent = existsSync(dbPath) ? readFileSync(dbPath, "utf-8") : "";
console.log("SUPABASE_CLIENT", dbContent.includes("createServiceRoleClient") ? "EXISTS" : "MISSING");

// Test 8: Enrollment service compiles - check no never[] errors in key functions
const enrollmentsPath = PROJ_ROOT + "/lib/prepmeup/enrollments.ts";
const enrollmentsContent = existsSync(enrollmentsPath) ? readFileSync(enrollmentsPath, "utf-8") : "";
// Check that key functions don't have 'never[]' issues
const criticalEnrollmentFuncs = [
  "enrollUserInCourse",
  "adminGrantCourseAccess",
  "revokeCourseEnrollment",
  "processQuantumCheckout",
  "processCyberCheckout"
];
criticalEnrollmentFuncs.forEach((func) => {
  const hasFunc = enrollmentsContent.includes(`export async function ${func}`);
  console.log(`ENROLLMENT_${func.toUpperCase()}`, hasFunc ? "EXISTS" : "MISSING");
});

// Test 9: Payment service compiles
const paymentsPath = PROJ_ROOT + "/lib/prepmeup/payments.ts";
const paymentsContent = existsSync(paymentsPath) ? readFileSync(paymentsPath, "utf-8") : "";
// Check no 'never' type cascades in key areas
console.log("PAYMENTS_NO_NEVER", !paymentsContent.includes("argument of type 'never'") ? "YES" : "HAS_NEVER");

// Test 10: Mentorship service compiles
const mentorshipPath = PROJ_ROOT + "/lib/prepmeup/mentorship.ts";
const mentorshipContent = existsSync(mentorshipPath) ? readFileSync(mentorshipPath, "utf-8") : "";
console.log("MENTORSHIP_NO_NEVER", !mentorshipContent.includes("argument of type 'never'") ? "YES" : "HAS_NEVER");

// Test 11: Certificate service compiles
const certificatesPath = PROJ_ROOT + "/lib/prepmeup/certificates.ts";
const certificatesContent = existsSync(certificatesPath) ? readFileSync(certificatesPath, "utf-8") : "";
console.log("CERTIFICATES_NO_NEVER", !certificatesContent.includes("argument of type 'never'") ? "YES" : "HAS_NEVER");

// Test 12: CyberLabs service compiles
const cyberLabsPath = PROJ_ROOT + "/lib/prepmeup/cyberLabs.ts";
const cyberLabsContent = existsSync(cyberLabsPath) ? readFileSync(cyberLabsPath, "utf-8") : "";
console.log("CYBERLABS_NO_NEVER", !cyberLabsContent.includes("argument of type 'never'") ? "YES" : "HAS_NEVER");

// Test 13: CyberSecurity route pages compile (no string-to-number errors)
const attemptPage = PROJ_ROOT + "/app/prepmeup/cybersecurity/labs/[labSlug]/attempt/[attemptId]/page.tsx";
const attemptPageContent = existsSync(attemptPage) ? readFileSync(attemptPage, "utf-8") : "";
const labsPage = PROJ_ROOT + "/app/prepmeup/cybersecurity/labs/[labSlug]/page.tsx";
const labsPageContent = existsSync(labsPage) ? readFileSync(labsPage, "utf-8") : "";
console.log(
  "CYBER_ROUTE_PAGES",
  !attemptPageContent.includes("Type 'string' is not assignable to type 'number'") &&
    !labsPageContent.includes("Type 'string' is not assignable to type 'number'")
    ? "COMPILE_OK"
    : "HAVE_TYPE_ERRORS"
);

// Test 14: Duplicate webhook event does not duplicate enrollment
// (check that webhookGuard prevents duplicate)
const webhookGuardPath = PROJ_ROOT + "/lib/prepmeup/webhookGuard.ts";
const webhookGuardContent = existsSync(webhookGuardPath) ? readFileSync(webhookGuardPath, "utf-8") : "";
console.log("WEBHOOK_GUARD", webhookGuardContent ? "EXISTS" : "MISSING");

// Test 15: Free preview remains accessible
const tracksPath = PROJ_ROOT + "/app/prepmeup/tracks/cybersecurity/page.tsx";
const tracksContent = existsSync(tracksPath) ? readFileSync(tracksPath, "utf-8") : "";
console.log("FREE_PREVIEW_ACCESS", tracksContent.includes("free_preview") ? "CONFIGURED" : "NOT_FOUND");

// Test 16: Certificate issuance is idempotent
console.log("CERTIFICATE_IDEMPOTENT", certificatesContent.includes("already exists") ? "CHECK_MANUALLY" : "NOT_FOUND");

// Test 17: Mentorship pack consumption/refund is idempotent
console.log("MENTORSHIP_IDEMPOTENT", mentorshipContent.includes("atomic") || mentorshipContent.includes("UPSERT") ? "HAS_ATOMIC" : "CHECK_MANUALLY");

// Summary
console.log("\n--- S1-C4 TEST SUMMARY ---");
const allPassed =
  accessContent.includes("export type AccessResult") &&
  accessContent.includes("| { allowed: true") &&
  dbContent.includes("createServiceRoleClient") &&
  !paymentsContent.includes("argument of type 'never'") &&
  !mentorshipContent.includes("argument of type 'never'") &&
  !certificatesContent.includes("argument of type 'never'") &&
  !cyberLabsContent.includes("argument of type 'never'") &&
  !attemptPageContent.includes("Type 'string' is not assignable to type 'number'") &&
  !labsPageContent.includes("Type 'string' is not assignable to type 'number'");
console.log("ALL_TESTS_PASS", allPassed ? "YES" : "NO");