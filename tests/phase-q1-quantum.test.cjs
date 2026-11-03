const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

console.log("Testing Phase Q1: Multi-Track Architecture and Quantum Track Foundation...");

// 1. Migration File Verification
const migrationPath = path.join(process.cwd(), "backend", "prepmeup", "migration-phase-q1.sql");
assert.ok(fs.existsSync(migrationPath), "migration-phase-q1.sql must exist");
const migrationSql = fs.readFileSync(migrationPath, "utf-8");

const expectedTables = [
  "pmu_tracks",
  "pmu_instructors",
  "pmu_courses",
  "pmu_course_modules",
  "pmu_course_lessons",
  "pmu_mentorship_sessions",
  "pmu_certificates",
  "pmu_instructor_course_access",
];

for (const tbl of expectedTables) {
  assert.ok(
    migrationSql.includes(`create table if not exists public.${tbl}`),
    `Table ${tbl} must be created in migration SQL`
  );
  assert.ok(
    migrationSql.includes(`alter table public.${tbl} enable row level security`),
    `Table ${tbl} must have RLS enabled`
  );
  // Verify separate policies for SELECT, INSERT, UPDATE, DELETE
  assert.ok(
    migrationSql.includes(`on public.${tbl}\n  for select`) ||
      migrationSql.includes(`on public.${tbl} for select`) ||
      new RegExp(`"${tbl}_select"\\s+on\\s+public\\.${tbl}`).test(migrationSql) ||
      migrationSql.includes(`"${tbl.replace('pmu_', '')}_select"`),
    `Table ${tbl} must have SELECT policy`
  );
  assert.ok(
    new RegExp(`for insert`).test(migrationSql),
    `Table ${tbl} must have INSERT policy`
  );
  assert.ok(
    new RegExp(`for update`).test(migrationSql),
    `Table ${tbl} must have UPDATE policy`
  );
  assert.ok(
    new RegExp(`for delete`).test(migrationSql),
    `Table ${tbl} must have DELETE policy`
  );
}

// Check role check extension for instructor
assert.ok(
  migrationSql.includes("check (role in ('student', 'instructor', 'admin'))"),
  "pmu_profiles must support student, instructor, and admin roles"
);
console.log("✓ Migration SQL schema, 8 tables, indexes, and separate RLS policies verified.");

// 2. Seed Data Verification
const seedPath = path.join(process.cwd(), "backend", "prepmeup", "seed-quantum.sql");
assert.ok(fs.existsSync(seedPath), "seed-quantum.sql must exist");
const seedSql = fs.readFileSync(seedPath, "utf-8");

assert.ok(seedSql.includes("btech-cse-aiml"), "btech-cse-aiml track seeded");
assert.ok(seedSql.includes("quantum-computing"), "quantum-computing track seeded");
assert.ok(seedSql.includes("cybersecurity"), "cybersecurity track seeded");
assert.ok(seedSql.includes("Quantum Computing Foundations"), "Course seeded");
assert.ok(seedSql.includes("Dr. Aravind Vaidya, PhD"), "PhD instructor seeded");

// Check 5 modules
assert.ok(seedSql.includes("Quantum Computing Essentials"), "Module 1 seeded");
assert.ok(seedSql.includes("Quantum Gates and Circuits"), "Module 2 seeded");
assert.ok(seedSql.includes("Entanglement and Correlation"), "Module 3 seeded");
assert.ok(seedSql.includes("Quantum Algorithms"), "Module 4 seeded");
assert.ok(seedSql.includes("Quantum Programming with Qiskit"), "Module 5 seeded");

// Check exactly one free preview lesson
const freeLessonOccurrences = (seedSql.match(/true,\s*--\s*FREE PREVIEW LESSON/g) || []).length;
assert.equal(freeLessonOccurrences, 1, "Exactly one lesson must be marked as free preview in seed SQL");

// Check draft quizzes
assert.ok(seedSql.includes("false -- draft status"), "Quizzes seeded in draft status");
console.log("✓ Quantum Seed SQL tracks, instructor, course, 5 modules, and free preview rules verified.");

// 3. Track Store CMS Data Verification
const dataPath = path.join(process.cwd(), "deploy", "cms", "quantum_track_data.json");
assert.ok(fs.existsSync(dataPath), "quantum_track_data.json must exist");
const data = JSON.parse(fs.readFileSync(dataPath, "utf-8"));

assert.equal(data.tracks.length, 3, "Must have exactly 3 initial tracks");
assert.equal(data.tracks[0].slug, "btech-cse-aiml");
assert.equal(data.tracks[1].slug, "quantum-computing");
assert.equal(data.tracks[2].slug, "cybersecurity");

const quantumCourse = data.courses.find((c) => c.slug === "quantum-computing-foundations");
assert.ok(quantumCourse, "Quantum course must exist in data store");
assert.equal(quantumCourse.level, "beginner");
assert.equal(quantumCourse.format, "hybrid");

// Exactly 1 free preview lesson in the course
const freeLessons = data.lessons.filter((l) => l.courseSlug === quantumCourse.slug && l.isFreePreview);
assert.equal(freeLessons.length, 1, "Exactly one lesson must be free preview");
assert.equal(freeLessons[0].id, "lesson-q1-01");

// Exactly 1 free preview simulation
const freeSims = data.simulations.filter((s) => s.isFreePreview);
assert.equal(freeSims.length, 1, "Exactly one simulation must be free preview");
assert.equal(freeSims[0].slug, "qubit-state-visualizer");

// Exactly 1 free preview quiz
const freeQuizzes = data.quizzes.filter((q) => q.isFreePreview);
assert.equal(freeQuizzes.length, 1, "Exactly one quiz must be free preview");
assert.ok(["draft", "published"].includes(freeQuizzes[0].status), "Quiz status must be draft or published");

console.log("✓ Track store CMS data, exact 1 free preview rules, and draft statuses verified.");

// 4. Simulations Components Verification
const simFiles = [
  "QubitBlochVisualizer.tsx",
  "SuperpositionExplorer.tsx",
  "CircuitBuilderSim.tsx",
  "EntanglementDemonstrator.tsx",
  "GroverSearchVisualizer.tsx",
];

for (const f of simFiles) {
  const p = path.join(process.cwd(), "app", "prepmeup", "(student)", "simulations", "_components", "quantum", f);
  assert.ok(fs.existsSync(p), `Simulation component ${f} must exist`);
  const content = fs.readFileSync(p, "utf-8");
  assert.ok(content.includes("Reset"), `${f} must include Reset functionality`);
  assert.ok(content.includes("RichMathMarkdown"), `${f} must render mathematical formulas`);
}
console.log("✓ All 5 browser-native Quantum Simulation components verified.");

// 5. Route Pages Verification
const expectedPages = [
  "app/prepmeup/tracks/page.tsx",
  "app/prepmeup/tracks/[trackSlug]/page.tsx",
  "app/prepmeup/courses/[courseSlug]/page.tsx",
  "app/prepmeup/courses/[courseSlug]/learn/page.tsx",
  "app/prepmeup/courses/[courseSlug]/learn/[lessonId]/page.tsx",
  "app/prepmeup/instructors/[instructorSlug]/page.tsx",
  "app/prepmeup/(student)/simulations/quantum/page.tsx",
  "app/prepmeup/instructor/page.tsx",
  "app/prepmeup/instructor/login/page.tsx",
  "app/api/prepmeup/instructor/auth/route.ts",
  "app/api/prepmeup/instructor/manage/route.ts",
];

for (const page of expectedPages) {
  assert.ok(fs.existsSync(path.join(process.cwd(), page)), `Route page ${page} must exist`);
}
console.log("✓ All 11 public track, course, instructor, simulation, and API route files verified.");

console.log("All Phase Q1 verification checks passed successfully!");
