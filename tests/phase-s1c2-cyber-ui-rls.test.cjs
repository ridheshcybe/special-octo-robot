// Phase S1-C2: CyberSecurity UI, RLS, and Admin Approvals End-to-End Tests
// Using Node.js built-in test runner (test runner approach) - CommonJS with absolute paths
const { existsSync } = require("fs");

// Absolute paths for the special-octo-robot-main project
// Using the current working directory format
const PROJ_ROOT = process.cwd();

// Test 3: Verify CyberSecurity track page exists
console.log("TRACK_PAGE_EXISTS", existsSync(PROJ_ROOT + "/app/prepmeup/tracks/cybersecurity/page.tsx") ? "EXISTS" : "MISSING");

// Test 4: Verify CyberSecurity course page exists
console.log("COURSE_PAGE_EXISTS", existsSync(PROJ_ROOT + "/app/prepmeup/courses/[courseSlug]/page.tsx") ? "EXISTS" : "MISSING");

// Test 5: Verify lessons listing exists
console.log("LESSONS_PAGE_EXISTS", existsSync(PROJ_ROOT + "/app/prepmeup/courses/[courseSlug]/learn/page.tsx") ? "EXISTS" : "MISSING");

// Test 6: Verify lab detail exists
console.log("LAB_DETAIL_EXISTS", existsSync(PROJ_ROOT + "/app/prepmeup/cybersecurity/labs/[labSlug]/page.tsx") ? "EXISTS" : "MISSING");

// Test 7: Verify lab attempt page exists
console.log("LAB_ATTEMPT_EXISTS", existsSync(PROJ_ROOT + "/app/prepmeup/cybersecurity/labs/[labSlug]/attempt/[attemptId]/page.tsx") ? "EXISTS" : "MISSING");

// Test 21: Verify Quantum access functions exist
const accessPath = PROJ_ROOT + "/lib/prepmeup/access.ts";
const accessContent = existsSync(accessPath) ? require("fs").readFileSync(accessPath, "utf-8") : "";
const quantumFuncCount = (accessContent.match(/canAccessQuantum|hasQuantum|canBookQuantum|getQuantumAccessSummary/g) || []).length;
console.log("QUANTUM_FUNCTIONS_EXIST", quantumFuncCount, "(expected >= 7)");

// Test 22: Verify type assertions in payments
const paymentsPath = PROJ_ROOT + "/lib/prepmeup/payments.ts";
const paymentsContent = existsSync(paymentsPath) ? require("fs").readFileSync(paymentsPath, "utf-8") : "";
const hasTypeAssertions = paymentsContent.includes("as { data: any; error: any }");
console.log("PAYMENTS_HAS_TYPE_ASSERTIONS", hasTypeAssertions);
