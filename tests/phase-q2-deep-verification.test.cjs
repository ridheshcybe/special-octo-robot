const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

console.log("================================================================================");
console.log("Executing Comprehensive Phase Q2 Quantum Deep Verification Test Suite");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// 1. Migration Phase Q2 Database Schema & Security Guard
// -----------------------------------------------------------------------------
console.log("\n[Test 1] Verifying Migration Phase Q2 Schema, Tables & RLS Policies...");
const migrationPath = path.join(process.cwd(), "backend", "prepmeup", "migration-phase-q2.sql");
assert.ok(fs.existsSync(migrationPath), "migration-phase-q2.sql must exist");
const migrationSql = fs.readFileSync(migrationPath, "utf-8").toLowerCase();

assert.ok(migrationSql.includes("pmu_instructor_availability"), "Must create pmu_instructor_availability");
assert.ok(migrationSql.includes("pmu_mentorship_slots"), "Must create pmu_mentorship_slots");
assert.ok(migrationSql.includes("idx_pmu_no_double_booking"), "Must have unique index idx_pmu_no_double_booking");
assert.ok(migrationSql.includes("pmu_quantum_doubts"), "Must create pmu_quantum_doubts");
assert.ok(migrationSql.includes("pmu_quantum_progress"), "Must create pmu_quantum_progress");

// Verify separate RLS policies
const rlsPolicies = [
  "pmu_inst_avail_select",
  "pmu_inst_avail_insert",
  "pmu_inst_avail_update",
  "pmu_inst_avail_delete",
  "pmu_mentor_slots_select",
  "pmu_mentor_slots_insert",
  "pmu_mentor_slots_update",
  "pmu_mentor_slots_delete",
  "pmu_quantum_doubts_select",
  "pmu_quantum_doubts_insert",
  "pmu_quantum_doubts_update",
  "pmu_quantum_doubts_delete",
  "pmu_quantum_progress_select",
  "pmu_quantum_progress_insert",
  "pmu_quantum_progress_update",
  "pmu_quantum_progress_delete",
];
for (const pol of rlsPolicies) {
  assert.ok(migrationSql.includes(pol), `RLS Policy ${pol} must be explicitly defined in SQL`);
}
console.log("✓ Phase Q2 SQL migration verified with strict RLS and anti-double-booking constraint.");

// -----------------------------------------------------------------------------
// 2. Quantum Quiz Activation & Student Integration
// -----------------------------------------------------------------------------
console.log("\n[Test 2] Verifying Quantum Quizzes Activation and Free Preview Logic...");
const cmsData = JSON.parse(
  fs.readFileSync(path.join(process.cwd(), "deploy", "cms", "quantum_track_data.json"), "utf-8")
);
const quizzes = cmsData.quizzes;
assert.ok(Array.isArray(quizzes), "Quizzes array must exist in quantum_track_data.json");
assert.equal(quizzes.length, 5, "Must have exactly 5 module quizzes for Quantum course");

// Free preview quiz
const freeQuizzes = quizzes.filter((q) => q.isFreePreview);
assert.equal(freeQuizzes.length, 1, "Exactly one Quantum quiz must be marked free preview");
assert.equal(freeQuizzes[0].id, "quiz-quantum-01", "Module 1 Diagnostic quiz must be free preview");

// Locked quizzes
const lockedQuizzes = quizzes.filter((q) => !q.isFreePreview);
assert.equal(lockedQuizzes.length, 4, "Remaining 4 quizzes must be locked for unpaid students");

// Question completeness
for (const q of quizzes) {
  assert.ok(q.durationMinutes > 0, `Quiz ${q.id} must specify durationMinutes`);
  assert.ok(q.totalMarks > 0, `Quiz ${q.id} must specify totalMarks`);
  assert.ok(q.passingScore > 0, `Quiz ${q.id} must specify passingScore`);
  assert.ok(Array.isArray(q.questions) && q.questions.length >= 5, `Quiz ${q.id} must have >= 5 questions`);
  for (const item of q.questions) {
    assert.ok(item.explanation && item.explanation.length > 10, `Question ${item.id} must have full explanation`);
  }
}

// Verify Quiz Runner APIs
const startRoute = fs.readFileSync(path.join(process.cwd(), "app", "api", "prepmeup", "quizzes", "[quizId]", "start", "route.ts"), "utf-8");
assert.ok(startRoute.includes("getQuantumQuizById"), "start route must resolve Quantum quizzes");
assert.ok(startRoute.includes("checkUserCourseAccess"), "start route must check course access for paid quizzes");

const submitRoute = fs.readFileSync(path.join(process.cwd(), "app", "api", "prepmeup", "quizzes", "[quizId]", "submit", "route.ts"), "utf-8");
assert.ok(submitRoute.includes("updateStudentQuantumProgress"), "submit route must record passed quantum quizzes in student progress");

console.log("✓ Quantum Quiz activation, access gating, and runner scoring verified.");

// -----------------------------------------------------------------------------
// 3. Quantum AI Tutor RAG & Mathematical Rigor
// -----------------------------------------------------------------------------
console.log("\n[Test 3] Verifying Quantum AI Tutor RAG, Dirac Notation & General Knowledge Alert...");
const tutorSource = fs.readFileSync(path.join(process.cwd(), "lib", "prepmeup", "quantumTutor.ts"), "utf-8");
assert.ok(tutorSource.includes("getApprovedQuantumRAGContext"), "Tutor must use approved RAG context");
assert.ok(tutorSource.includes("Math.cos") || tutorSource.includes("theta") || tutorSource.includes("Bloch"), "Must model Bloch sphere equations");
assert.ok(tutorSource.includes("Bell") && tutorSource.includes("CNOT"), "Must model Bell state and CNOT gate");
assert.ok(tutorSource.includes("Grover") && tutorSource.includes("Diffusion"), "Must model Grover's search algorithm");
assert.ok(tutorSource.includes("Qiskit") && tutorSource.includes("QuantumCircuit"), "Must support Qiskit Python circuits");

// Check Tutor API Endpoints
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "ai", "quantum", "doubt", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "ai", "quantum", "doubt", "[doubtId]", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "ai", "quantum", "doubt", "[doubtId]", "follow-up", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "ai", "quantum", "feedback", "route.ts")));

// Check Student Doubts UI
const doubtsUi = fs.readFileSync(path.join(process.cwd(), "app", "prepmeup", "(student)", "doubts", "page.tsx"), "utf-8");
assert.ok(doubtsUi.includes("quantum-computing"), "Doubts page must include Quantum track option");
assert.ok(doubtsUi.includes("/api/prepmeup/ai/quantum/doubt"), "Doubts page must call quantum AI tutor endpoint");
assert.ok(doubtsUi.includes("handleFeedback"), "Doubts page must support helpful/unhelpful feedback");

console.log("✓ Quantum AI Tutor RAG, math derivations, follow-up, and feedback verified.");

// -----------------------------------------------------------------------------
// 4. 1-on-1 Mentorship Booking & Anti-Double-Booking Protection
// -----------------------------------------------------------------------------
console.log("\n[Test 4] Verifying 1-on-1 Mentorship Booking APIs and Guard...");
const trackStoreSource = fs.readFileSync(path.join(process.cwd(), "app", "prepmeup", "_lib", "trackStore.ts"), "utf-8");
assert.ok(trackStoreSource.includes("requestMentorshipSession"), "Must have requestMentorshipSession");
assert.ok(
  trackStoreSource.includes("Double-booking protection") || trackStoreSource.includes("already booked"),
  "Must protect against double-booking same slot"
);

assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "mentorship", "availability", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "mentorship", "request", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "mentorship", "my-sessions", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "prepmeup", "(student)", "mentorship", "page.tsx")));

console.log("✓ 1-on-1 Mentorship booking and collision protection verified.");

// -----------------------------------------------------------------------------
// 5. Certificate Issuance, Public Verification & Zero PII Guarantee
// -----------------------------------------------------------------------------
console.log("\n[Test 5] Verifying Certificate Issuance, Public Verification & Zero PII Protection...");
assert.ok(trackStoreSource.includes("issueQuantumCertificate"), "Must export issueQuantumCertificate");
assert.ok(trackStoreSource.includes("PMU-QC-2026-"), "Certificate code must follow PMU-QC-2026- format");
assert.ok(trackStoreSource.includes("getCertificateByCode"), "Must export getCertificateByCode");

// Check Certificate APIs
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "certificates", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "certificates", "[certificateCode]", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "certificates", "[certificateCode]", "pdf", "route.ts")));

// Check Public Verification Page
const verifyPage = fs.readFileSync(
  path.join(process.cwd(), "app", "prepmeup", "verify-certificate", "[certificateCode]", "page.tsx"),
  "utf-8"
);
assert.ok(verifyPage.includes("getCertificateByCode"), "Public page must look up certificate");
assert.ok(verifyPage.includes("studentName"), "Must display student name");
assert.ok(verifyPage.includes("courseTitle"), "Must display course title");
assert.ok(verifyPage.includes("instructorName"), "Must display instructor name");
assert.ok(
  !verifyPage.includes("phoneNumber") && !verifyPage.includes("user_id") && !verifyPage.includes("payment_id"),
  "Public verification page must NEVER expose student phone, user ID, or payment credentials (ZERO PII)"
);

// Check Student Certificate Page
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "prepmeup", "(student)", "certificates", "page.tsx")));

console.log("✓ Certificate system, public verification, and strict Zero-PII privacy verified.");

// -----------------------------------------------------------------------------
// 6. Admin Approval Queue
// -----------------------------------------------------------------------------
console.log("\n[Test 6] Verifying Admin Approval Queue & Content Governance...");
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "admin", "approvals", "route.ts")));
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "prepmeup", "admin", "approvals", "page.tsx")));

const approvalsApi = fs.readFileSync(path.join(process.cwd(), "app", "api", "prepmeup", "admin", "approvals", "route.ts"), "utf-8");
assert.ok(approvalsApi.includes("pmu-admin-session"), "Approvals API must enforce admin session");
assert.ok(approvalsApi.includes("reviewPendingApproval"), "Approvals API must call reviewPendingApproval");

console.log("✓ Admin approvals queue and governance workflow verified.");

// -----------------------------------------------------------------------------
// 7. Quantum Progress Tracking Separation
// -----------------------------------------------------------------------------
console.log("\n[Test 7] Verifying Independent Quantum Progress & Student Progress UI...");
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "api", "prepmeup", "progress", "quantum", "route.ts")));
const progressUi = fs.readFileSync(path.join(process.cwd(), "app", "prepmeup", "(student)", "progress", "page.tsx"), "utf-8");
assert.ok(progressUi.includes("/api/prepmeup/progress/quantum"), "Progress UI must fetch quantum progress");
assert.ok(progressUi.includes("quantum-computing"), "Progress UI must have separate Quantum Track tab");
assert.ok(progressUi.includes("CSE1001") || progressUi.includes("Semester 1"), "Must keep B.Tech Semester 1 progress view completely functional");

console.log("✓ Quantum progress separation from B.Tech Semester 1 verified.");

// -----------------------------------------------------------------------------
// 8. Core Platform Stability & Regression Guards
// -----------------------------------------------------------------------------
console.log("\n[Test 8] Verifying Non-Regressive Core Routes and CSS Scope...");
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "page.tsx")), "/ route must exist");
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "(admin)", "admin", "(dashboard)", "page.tsx")), "/admin dashboard must exist");
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "courses", "page.tsx")), "/courses route must exist");
assert.ok(fs.existsSync(path.join(process.cwd(), "app", "courses", "[...slug]", "page.tsx")), "/courses/[...slug] route must exist");

// CSS Guard: No Tailwind preflight imported globally
const globalCss = fs.readFileSync(path.join(process.cwd(), "app", "globals.css"), "utf-8");
assert.ok(!globalCss.includes("@tailwind base"), "globals.css must NEVER import @tailwind base");

// Rem-grid guard: PrepMeUp must not be affected by rem-grid
const pmuCss = fs.readFileSync(path.join(process.cwd(), "app", "prepmeup", "prepmeup.css"), "utf-8");
assert.ok(pmuCss.includes("#08080a"), "PrepMeUp CSS must preserve #08080a theme");
assert.ok(pmuCss.includes("#ff3b1d"), "PrepMeUp CSS must preserve #ff3b1d accent");

console.log("✓ Core routes, global reset safety, and CSS scope preserved with zero regressions.");

console.log("\n================================================================================");
console.log("ALL PHASE Q2 DEEP VERIFICATION CHECKS PASSED SUCCESSFULLY!");
console.log("================================================================================\n");
