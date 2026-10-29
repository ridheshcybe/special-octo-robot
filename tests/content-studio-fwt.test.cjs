const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");

// 1. Verify content studio has FWT in subjectOptions
const contentStudioPage = fs.readFileSync("app/prepmeup/admin/content-studio/page.tsx", "utf8");
assert.ok(contentStudioPage.includes("CSE1004"), "content-studio/page.tsx must include CSE1004");
assert.ok(contentStudioPage.includes("Fundamentals of Web Technologies"), "content-studio/page.tsx must include Fundamentals of Web Technologies");
assert.ok(contentStudioPage.includes("handleEditItem"), "content-studio/page.tsx must support handleEditItem");

// 2. Verify syllabus page has FWT in subjects
const syllabusPage = fs.readFileSync("app/prepmeup/admin/syllabus/page.tsx", "utf8");
assert.ok(syllabusPage.includes("CSE1004"), "syllabus/page.tsx must include CSE1004");
assert.ok(syllabusPage.includes("Fundamentals of Web Technologies"), "syllabus/page.tsx must include Fundamentals of Web Technologies");

// 3. Verify content-studio API route handles FWT updates
const contentStudioRoute = fs.readFileSync("app/api/prepmeup/admin/content-studio/route.ts", "utf8");
assert.ok(contentStudioRoute.includes("state.notes"), "content-studio route must sync with state.notes");
assert.ok(contentStudioRoute.includes("state.modules"), "content-studio route must sync with state.modules");

// 4. Verify syllabus commit route persists FWT
const syllabusCommitRoute = fs.readFileSync("app/api/prepmeup/admin/syllabus/commit/route.ts", "utf8");
assert.ok(syllabusCommitRoute.includes("committedSyllabi"), "syllabus commit route must save to committedSyllabi");
assert.ok(syllabusCommitRoute.includes("fundamentals-of-web-technologies"), "syllabus commit route must map FWT slug");

// 5. Verify queries overlay merges FWT
const queriesLib = fs.readFileSync("app/prepmeup/_lib/queries.ts", "utf8");
assert.ok(queriesLib.includes("applyCustomContentOverlay"), "queries.ts must apply custom content overlay");
assert.ok(queriesLib.includes("FWT"), "queries.ts must match FWT subject code");

console.log("All 5 FWT Content Studio & Syllabus verification checks passed.");
