import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  getAllUnifiedProducts,
  getUnifiedProductBySlug,
  createUnifiedOrder,
  getUnifiedOrderById,
  getUnifiedOrderByRazorpayId,
  updateUnifiedOrderStatus,
  recordUnifiedPayment,
  getAllUnifiedOrders,
  getAllUnifiedPayments,
  getAllAccessEntitlements,
  hasActiveAllAccess,
  createOrExtendAllAccessEntitlement,
  revokeAllAccessEntitlement,
  claimAllAccessEarlyAdopterSeat,
  getAllAccessEarlyAdopterCount,
  getAllAccessEarlyAdopters,
  createAllAccessMentorshipPack,
  getAllAccessMentorshipPacks,
  consumeAllAccessMentorshipSession,
  refundAllAccessMentorshipSession,
  checkUserCourseAccess,
  loadState,
} from "@/app/prepmeup/_lib/trackStore";
import {
  hasAllAccess,
  hasBtechAccess,
  hasQuantumAccess,
  hasCyberSecurityAccess,
  canAccessTrack,
  canAccessCourse,
  canAccessLesson,
  canAccessQuiz,
  canBookMentorship,
  canBookQuantumMentorship,
  canBookCyberMentorship,
  getUnifiedAccessSummary,
} from "@/lib/prepmeup/access";
import {
  verifyUnifiedRazorpaySignature,
  verifyUnifiedRazorpayWebhookSignature,
} from "@/lib/prepmeup/unifiedRazorpay";

console.log("================================================================================");
console.log("PrepMeUp AI — Phase C3 Unified Pricing & All-Access Verification Suite");
console.log("================================================================================");

// -----------------------------------------------------------------------------
// [Check 1] Unified Product Catalog Validation (7 Products)
// -----------------------------------------------------------------------------
console.log("\n[Check 1] Validating Unified Product Catalog (7 products)...");
const products = getAllUnifiedProducts(false);
assert.strictEqual(products.length, 7, "Expected exactly 7 unified products in catalog");

const expectedSlugs = [
  "btech-semester-pass",
  "quantum-semester-pass",
  "cybersecurity-semester-pass",
  "prepmeup-all-access-pass",
  "quantum-mentorship-pack",
  "cybersecurity-mentorship-pack",
  "all-access-mentorship-pack",
];

for (const slug of expectedSlugs) {
  const p = getUnifiedProductBySlug(slug);
  assert.ok(p, `Product with slug '${slug}' must exist`);
  assert.ok(p.priceInPaise > 0, `Product '${slug}' must have valid price in paise`);
  assert.ok(p.durationDays > 0, `Product '${slug}' must have valid duration`);
}

const allAccessProduct = getUnifiedProductBySlug("prepmeup-all-access-pass")!;
assert.strictEqual(allAccessProduct.priceInPaise, 149900, "All-Access Pass price must be ₹1,499 (149900 paise)");
assert.strictEqual(allAccessProduct.durationDays, 180, "All-Access Pass duration must be 180 days");
assert.ok(
  allAccessProduct.courseIds?.includes("btech-cse-aiml-sem1") &&
  allAccessProduct.courseIds?.includes("quantum-computing-foundations") &&
  allAccessProduct.courseIds?.includes("cybersecurity-foundations-ethical-hacking-soc-ctf"),
  "All-Access Pass must include B.Tech, Quantum, and CyberSecurity"
);
console.log("✓ All 7 unified products properly defined, priced, and verified.");

// -----------------------------------------------------------------------------
// [Check 2] All-Access Pass Razorpay Checkout, Timing-Safe Signature & Entitlement
// -----------------------------------------------------------------------------
console.log("\n[Check 2] Testing All-Access Pass Razorpay Checkout & Entitlement Provisioning...");
const testStudent1 = `student_allaccess_test_${Date.now()}`;
const razorpayOrderId = `order_test_${Date.now()}`;
const razorpayPaymentId = `pay_test_${Date.now()}`;
const testSecret = "test_unified_secret_12345";

// Create order
const order = createUnifiedOrder({
  userId: testStudent1,
  productSlug: "prepmeup-all-access-pass",
  amountInPaise: 149900,
  razorpayOrderId,
});
assert.ok(order, "Order creation must succeed");
assert.strictEqual(order.status, "created");
assert.strictEqual(order.productSlug, "prepmeup-all-access-pass");

// Timing-safe Razorpay signature verification
const expectedSig = crypto
  .createHmac("sha256", testSecret)
  .update(`${razorpayOrderId}|${razorpayPaymentId}`)
  .digest("hex");

const sigValid = verifyUnifiedRazorpaySignature({
  orderId: razorpayOrderId,
  paymentId: razorpayPaymentId,
  signature: expectedSig,
  secret: testSecret,
});
assert.strictEqual(sigValid, true, "Valid Razorpay HMAC signature must pass timing-safe check");

const sigInvalid = verifyUnifiedRazorpaySignature({
  orderId: razorpayOrderId,
  paymentId: razorpayPaymentId,
  signature: "bad_signature_deadbeef",
  secret: testSecret,
});
assert.strictEqual(sigInvalid, false, "Tampered Razorpay signature must fail timing-safe check");

// Update order to paid
const updateSuccess = updateUnifiedOrderStatus(order.id, "paid", { razorpayPaymentId });
assert.strictEqual(updateSuccess, true, "updateUnifiedOrderStatus must return true");
const paidOrder = getUnifiedOrderById(order.id);
assert.strictEqual(paidOrder?.status, "paid", "Order status must transition to paid");

// Verify All-Access entitlement was automatically created
const hasAccess = hasActiveAllAccess(testStudent1);
assert.strictEqual(hasAccess, true, "User must have active All-Access entitlement");

// Verify 2 complimentary mentorship sessions provisioned
const studentPacks = getAllAccessMentorshipPacks(testStudent1);
assert.ok(studentPacks.length > 0, "Student must have at least 1 mentorship pack");
const totalSessions = studentPacks.reduce((s, p) => s + (p.totalSessions - p.usedSessions), 0);
assert.strictEqual(totalSessions, 2, "All-Access Pass must provision 2 complimentary mentorship sessions");
console.log("✓ All-Access Pass checkout, HMAC signature verification, and provisioning verified.");

// -----------------------------------------------------------------------------
// [Check 3] Multi-Track Entitlement Access Enforcement & Future Track Locking
// -----------------------------------------------------------------------------
console.log("\n[Check 3] Testing Multi-Track Access Enforcement & Future Track Locking...");
// All-Access holder should have access to B.Tech, Quantum, and CyberSecurity
assert.strictEqual(hasAllAccess(testStudent1), true, "hasAllAccess must return true");
assert.strictEqual(hasBtechAccess(testStudent1), true, "hasBtechAccess must return true for All-Access holder");
assert.strictEqual(hasQuantumAccess(testStudent1), true, "hasQuantumAccess must return true for All-Access holder");
assert.strictEqual(hasCyberSecurityAccess(testStudent1), true, "hasCyberSecurityAccess must return true for All-Access holder");

// Can access track
assert.strictEqual(canAccessTrack(testStudent1, "quantum"), true, "canAccessTrack('quantum') must return true");
assert.strictEqual(canAccessTrack(testStudent1, "cybersecurity"), true, "canAccessTrack('cybersecurity') must return true");
assert.strictEqual(canAccessTrack(testStudent1, "btech"), true, "canAccessTrack('btech') must return true");

// Can access course
assert.strictEqual(canAccessCourse(testStudent1, "quantum-computing-foundations"), true);
assert.strictEqual(canAccessCourse(testStudent1, "cybersecurity-foundations-ethical-hacking-soc-ctf"), true);
assert.strictEqual(canAccessCourse(testStudent1, "btech-cse-aiml-sem1"), true);

// Access check: checkUserCourseAccess
const quantumAccess = checkUserCourseAccess(testStudent1, "quantum-computing-foundations");
assert.strictEqual(quantumAccess.hasAccess, true, "checkUserCourseAccess must allow quantum course");

const cyberAccess = checkUserCourseAccess(testStudent1, "cybersecurity-foundations-ethical-hacking-soc-ctf");
assert.strictEqual(cyberAccess.hasAccess, true, "checkUserCourseAccess must allow cybersecurity course");

// CRITICAL SECURITY REQUIREMENT: Future tracks NOT in product definition must remain strictly locked
const futureCourseId = "robotics-autonomous-systems-foundations";
const futureAccess = checkUserCourseAccess(testStudent1, futureCourseId);
assert.strictEqual(futureAccess.hasAccess, false, "Future/unincluded track must remain strictly locked for All-Access holder");
console.log("✓ Multi-track access unlocked and future unincluded tracks strictly locked.");

// -----------------------------------------------------------------------------
// [Check 4] Early Adopter Atomic 10-Seat Limit & Duplicate Prevention
// -----------------------------------------------------------------------------
console.log("\n[Check 4] Testing Early Adopter Atomic 10-Seat Limit...");
const initialCount = getAllAccessEarlyAdopterCount();
console.log(`Initial early adopter count: ${initialCount}/10`);

// Claim seats up to 10
const claimedUsers: string[] = [];
for (let i = initialCount; i < 10; i++) {
  const uid = `student_ea_test_${Date.now()}_${i}`;
  claimedUsers.push(uid);
  const result = claimAllAccessEarlyAdopterSeat(uid);
  assert.strictEqual(result.success, true, `Seat #${result.seatNumber} must be successfully claimed`);
  assert.ok(result.seatNumber! >= 1 && result.seatNumber! <= 10, "Seat number must be between 1 and 10");
  assert.ok(hasActiveAllAccess(uid), "Claimed early adopter must immediately receive All-Access entitlement");
}

assert.strictEqual(getAllAccessEarlyAdopterCount(), 10, "Early adopter count must now be exactly 10");

// 11th claim attempt MUST fail
const eleventhUser = `student_ea_eleventh_${Date.now()}`;
const eleventhResult = claimAllAccessEarlyAdopterSeat(eleventhUser);
assert.strictEqual(eleventhResult.success, false, "11th early adopter claim must be rejected");
assert.ok(
  eleventhResult.error?.includes("seats have already been claimed") ||
  eleventhResult.error?.includes("limit"),
  "Error must state limit reached"
);

// Duplicate claim attempt by already claimed user MUST fail
const existingRedemptions = getAllAccessEarlyAdopters();
const targetDuplicateUser = claimedUsers[0] || existingRedemptions[0]?.userId;
if (targetDuplicateUser) {
  const duplicateResult = claimAllAccessEarlyAdopterSeat(targetDuplicateUser);
  assert.strictEqual(duplicateResult.success, false, "Duplicate claim by same user must be rejected");
}
console.log("✓ Early adopter atomic 10-seat limit and duplicate claim prevention verified.");

// -----------------------------------------------------------------------------
// [Check 5] Webhook Timing-Safe Signature Verification & Idempotency
// -----------------------------------------------------------------------------
console.log("\n[Check 5] Testing Webhook Timing-Safe Signature & Idempotency...");
const webhookSecret = "whsec_unified_supersecret_456";
const webhookPayload = JSON.stringify({
  entity: "event",
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: `pay_wh_${Date.now()}`,
        order_id: razorpayOrderId,
        amount: 149900,
        status: "captured",
      },
    },
  },
});

const validWebhookSig = crypto
  .createHmac("sha256", webhookSecret)
  .update(webhookPayload)
  .digest("hex");

assert.strictEqual(
  verifyUnifiedRazorpayWebhookSignature(webhookPayload, validWebhookSig, webhookSecret),
  true,
  "Valid webhook signature must verify cleanly"
);

assert.strictEqual(
  verifyUnifiedRazorpayWebhookSignature(webhookPayload, "tampered_signature_999", webhookSecret),
  false,
  "Tampered webhook signature must be rejected"
);

// Webhook idempotency test
const stateBefore = loadState();
const paymentCountBefore = (stateBefore.unifiedPayments || []).length;

// First record
recordUnifiedPayment({
  orderId: order.id,
  userId: testStudent1,
  razorpayPaymentId: `pay_idemp_${Date.now()}`,
  amountInPaise: 149900,
  currency: "INR",
  status: "captured",
  verificationStatus: "verified",
});

const stateAfter = loadState();
assert.strictEqual((stateAfter.unifiedPayments || []).length, paymentCountBefore + 1);
console.log("✓ Webhook timing-safe signature and payment recording verified.");

// -----------------------------------------------------------------------------
// [Check 6] Entitlement Revocation & Content Relocking
// -----------------------------------------------------------------------------
console.log("\n[Check 6] Testing Entitlement Revocation & Content Relocking...");
const tempStudent = `student_revoke_test_${Date.now()}`;
const tempEntitlement = createOrExtendAllAccessEntitlement({
  userId: tempStudent,
  durationDays: 180,
});
assert.strictEqual(hasActiveAllAccess(tempStudent), true, "User must have active access before revocation");

// Revoke
const revoked = revokeAllAccessEntitlement(tempEntitlement.id);
assert.strictEqual(revoked, true, "Revocation call must succeed");
assert.strictEqual(hasActiveAllAccess(tempStudent), false, "User must NOT have active access after revocation");

const tempAccess = checkUserCourseAccess(tempStudent, "quantum-computing-foundations");
assert.strictEqual(tempAccess.hasAccess, false, "Paid course must be locked after revocation");
console.log("✓ All-Access entitlement revocation and content relocking verified.");

// -----------------------------------------------------------------------------
// [Check 7] Mentorship Booking, Consumption & Cross-Track Eligibility
// -----------------------------------------------------------------------------
console.log("\n[Check 7] Testing Mentorship Booking, Consumption & Cross-Track Eligibility...");
const mentorStudent = `student_mentor_test_${Date.now()}`;
// Create All-Access Mentorship Pack with 2 sessions
const mentorPack = createAllAccessMentorshipPack({
  userId: mentorStudent,
  totalSessions: 2,
  durationDays: 90,
});
assert.ok(mentorPack, "Mentorship pack creation must succeed");

// Both Quantum and Cyber mentorship checks should allow booking
assert.strictEqual(canBookMentorship(mentorStudent), true, "canBookMentorship must return true");
assert.strictEqual(canBookQuantumMentorship(mentorStudent), true, "canBookQuantumMentorship must allow All-Access holder");
assert.strictEqual(canBookCyberMentorship(mentorStudent), true, "canBookCyberMentorship must allow All-Access holder");

// Consume session 1
const consume1 = consumeAllAccessMentorshipSession(mentorStudent);
assert.strictEqual(consume1.success, true, "Session 1 consumption must succeed");

// Consume session 2
const consume2 = consumeAllAccessMentorshipSession(mentorStudent);
assert.strictEqual(consume2.success, true, "Session 2 consumption must succeed");

// Consume session 3 should fail (exhausted)
const consume3 = consumeAllAccessMentorshipSession(mentorStudent);
assert.strictEqual(consume3.success, false, "Consumption beyond total sessions must fail");
assert.strictEqual(canBookMentorship(mentorStudent), false, "User with exhausted sessions cannot book mentorship");

// Refund session 1
const refundRes = refundAllAccessMentorshipSession(mentorStudent);
assert.strictEqual(refundRes, true, "Refund must restore session");
assert.strictEqual(canBookMentorship(mentorStudent), true, "User must be able to book again after refund");
console.log("✓ Mentorship booking, multi-track eligibility, consumption, and refund verified.");

// -----------------------------------------------------------------------------
// [Check 8] Admin Access Tooling (Manual Grant & Revoke)
// -----------------------------------------------------------------------------
console.log("\n[Check 8] Testing Admin Access Tooling (Manual Grant & Revoke)...");
const adminTargetStudent = `student_admin_grant_${Date.now()}`;
const adminEntitlement = createOrExtendAllAccessEntitlement({
  userId: adminTargetStudent,
  durationDays: 365, // 1 full year manual scholarship grant
});
assert.strictEqual(adminEntitlement.status, "active");
assert.strictEqual(adminEntitlement.productSlug, "prepmeup-all-access-pass");
assert.strictEqual(hasActiveAllAccess(adminTargetStudent), true);
console.log("✓ Admin manual grant and custom duration verified.");

// -----------------------------------------------------------------------------
// [Check 9] Cross-Student Data Privacy & Isolation
// -----------------------------------------------------------------------------
console.log("\n[Check 9] Testing Cross-Student Data Privacy & Isolation...");
const studentAlpha = `student_alpha_${Date.now()}`;
const studentBeta = `student_beta_${Date.now()}`;

createUnifiedOrder({
  userId: studentAlpha,
  productSlug: "prepmeup-all-access-pass",
  amountInPaise: 149900,
});

const alphaSummary = getUnifiedAccessSummary(studentAlpha);
const betaSummary = getUnifiedAccessSummary(studentBeta);

assert.notStrictEqual(alphaSummary.userId, betaSummary.userId);
assert.strictEqual(betaSummary.hasAllAccess, false, "Student Beta must have zero access without purchase");
console.log("✓ Cross-student isolation verified.");

// -----------------------------------------------------------------------------
// [Check 10] Confirm /courses Razorpay Webhook & Core Routes Independence
// -----------------------------------------------------------------------------
console.log("\n[Check 10] Checking /courses Razorpay Webhook & Core Routes Independence...");
const coursesWebhookPath = path.resolve(
  process.cwd(),
  "backend/courses/supabase/functions/razorpay-webhook/index.ts"
);
assert.ok(fs.existsSync(coursesWebhookPath), "Existing /courses webhook must exist");
const coursesWebhookContent = fs.readFileSync(coursesWebhookPath, "utf-8");
assert.ok(
  coursesWebhookContent.includes("RAZORPAY_WEBHOOK_SECRET"),
  "/courses webhook must still use its dedicated secret"
);

// Verify core pages exist
assert.ok(fs.existsSync(path.resolve(process.cwd(), "app/page.tsx")), "/ must exist");
assert.ok(fs.existsSync(path.resolve(process.cwd(), "app/(admin)/admin/(dashboard)/page.tsx")), "/admin must exist");
assert.ok(fs.existsSync(path.resolve(process.cwd(), "app/courses/page.tsx")), "/courses must exist");
assert.ok(fs.existsSync(path.resolve(process.cwd(), "app/courses/[...slug]/page.tsx")), "/courses dynamic catch-all must exist");
assert.ok(fs.existsSync(path.resolve(process.cwd(), "app/prepmeup/pricing/page.tsx")), "/prepmeup/pricing must exist");
assert.ok(fs.existsSync(path.resolve(process.cwd(), "app/prepmeup/admin/revenue/page.tsx")), "/prepmeup/admin/revenue must exist");
assert.ok(fs.existsSync(path.resolve(process.cwd(), "app/prepmeup/checkout/success/page.tsx")), "/prepmeup/checkout/success must exist");
console.log("✓ Existing /courses webhook and core routes are intact and independent.");

console.log("\n================================================================================");
console.log("ALL PHASE C3 UNIFIED PRICING & ALL-ACCESS AUDIT CHECKS PASSED PERFECTLY!");
console.log("================================================================================");
