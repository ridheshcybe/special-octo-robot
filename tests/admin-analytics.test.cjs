const assert = require("node:assert/strict");
const fs = require("node:fs");

console.log("Testing Admin Analytics & Subject Standardization...");

// 1. Verify subject options in content-studio strictly contain only CSE1001-CSE1006
const csPage = fs.readFileSync("app/prepmeup/admin/content-studio/page.tsx", "utf8");
for (let i = 1; i <= 6; i++) {
  const code = `CSE100${i}`;
  assert.ok(csPage.includes(code), `Content studio must include ${code}`);
}
assert.ok(!csPage.includes("FWT-104"), "Legacy FWT-104 must not be in content studio");
assert.ok(!csPage.includes("ACM-101"), "Legacy ACM-101 must not be in content studio");
assert.ok(!csPage.includes("PYT-102"), "Legacy PYT-102 must not be in content studio");
assert.ok(!csPage.includes("BEE-103"), "Legacy BEE-103 must not be in content studio");
assert.ok(!csPage.includes("COA-104"), "Legacy COA-104 must not be in content studio");

// 2. Verify admin page has Analytics tab and live telemetry components
const adminPage = fs.readFileSync("app/prepmeup/admin/page.tsx", "utf8");
assert.ok(adminPage.includes('id: "analytics"'), "Admin page must define analytics tab");
assert.ok(adminPage.includes("Students Online"), "Admin page must show online students indicator");
assert.ok(adminPage.includes("Total Registered Students"), "Admin page must show registered students card");
assert.ok(adminPage.includes("Student Directory"), "Admin page must have user directory table");
assert.ok(adminPage.includes("Curriculum Subject Engagement (CSE1001–CSE1006)"), "Admin page must show subject breakdown");
assert.ok(adminPage.includes("Live Activity Stream"), "Admin page must show activity stream");

// 3. Verify studentStore has user presence, metrics, and canonical subjects
const store = fs.readFileSync("app/prepmeup/_lib/studentStore.ts", "utf8");
assert.ok(store.includes("recordUserPresence"), "studentStore must export recordUserPresence");
assert.ok(store.includes("getAppOverallMetrics"), "studentStore must export getAppOverallMetrics");
assert.ok(store.includes("getAllAppUsers"), "studentStore must export getAllAppUsers");
assert.ok(store.includes("getGlobalActivityFeed"), "studentStore must export getGlobalActivityFeed");
for (let i = 1; i <= 6; i++) {
  const code = `CSE100${i}`;
  assert.ok(store.includes(code), `studentStore subject breakdown must include ${code}`);
}

// 4. Verify admin analytics API route exists and routes requests
const analyticsRoute = fs.readFileSync("app/api/prepmeup/admin/analytics/route.ts", "utf8");
assert.ok(analyticsRoute.includes("getAppOverallMetrics"), "analytics route must call getAppOverallMetrics");
assert.ok(analyticsRoute.includes("getAllAppUsers"), "analytics route must call getAllAppUsers");
assert.ok(analyticsRoute.includes("getGlobalActivityFeed"), "analytics route must call getGlobalActivityFeed");

// 5. Verify past-papers page uses CSE1001-CSE1006
const ppPage = fs.readFileSync("app/prepmeup/admin/past-papers/page.tsx", "utf8");
assert.ok(ppPage.includes("CSE1001: Applied Computational Mathematics"), "Past papers must use CSE1001");
assert.ok(!ppPage.includes("AM101:"), "Legacy AM101 must be removed from past papers");

console.log("All 5 Admin Analytics & Subject Standardization checks passed successfully!");
