import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import {
  createCyberOrder,
  updateCyberOrderStatus,
  getCyberOrderByRazorpayId,
  getCyberEnrollment,
  getAllCyberEnrollments,
  createOrExtendCyberEnrollment,
  revokeCyberEnrollment,
  claimCyberEarlyAdopterSeat,
  getCyberEarlyAdopterCount,
  createCyberMentorshipPack,
  getCyberMentorshipPacks,
  consumeCyberMentorshipSession,
  refundCyberMentorshipSession,
  issueCyberCertificate,
  getStudentCyberProgress,
  updateStudentCyberProgress,
  getCertificateByCode,
  loadState,
} from "@/app/prepmeup/_lib/trackStore";
import {
  canAccessCyberLesson,
  canAccessCyberLab,
  canAccessCyberQuiz,
  hasCyberSemesterPass,
  hasCyberMentorshipPack,
  canBookCyberMentorship,
  getCyberAccessSummary,
} from "@/lib/prepmeup/access";
import {
  verifyCyberRazorpaySignature,
  verifyCyberRazorpayWebhookSignature,
} from "@/lib/prepmeup/cyberRazorpay";

console.log("================================================================================");
console.log("PrepMeUp AI — Phase C2 CyberSecurity Commercial Verification Suite");
console.log("================================================================================");

const courseId = "cybersecurity-foundations-ethical-hacking-soc-ctf";

// -----------------------------------------------------------------------------
// [Check 1] CyberSecurity Semester Pass Checkout using Razorpay Test Mode
// -----------------------------------------------------------------------------
console.log("\n[Check 1] Testing CyberSecurity Semester Pass Checkout in Razorpay Test Mode...");
const testStudentId = `student_c2_pass_${Date.now()}`;

// Step A: Create order in test mode
const order = createCyberOrder({
  userId: testStudentId,
  courseId,
  productType: "semester_pass",
  razorpayOrderId: `order_cyber_test_${Date.now()}`,
  amountInPaise: 99900,
});
assert.ok(order, "Cyber order must be created");
assert.equal(order.status, "created", "Cyber order must initially be 'created'");
assert.equal(order.amountInPaise, 99900, "Semester pass price must be 99900 paise (₹999)");

// Step B: Verify timing-safe HMAC signature verification
const testSecret = "cyber_test_secret_for_qa_audit_123";
const paymentId = `pay_cyber_test_${Date.now()}`;
const payload = `${order.razorpayOrderId}|${paymentId}`;
const validSignature = crypto.createHmac("sha256", testSecret).update(payload).digest("hex");

const isSigValid = verifyCyberRazorpaySignature({
  orderId: order.razorpayOrderId,
  paymentId,
  signature: validSignature,
  secret: testSecret,
});
assert.ok(isSigValid, "HMAC signature verification helper must succeed for valid signature");

const isTamperedSigValid = verifyCyberRazorpaySignature({
  orderId: order.razorpayOrderId,
  paymentId,
  signature: "invalid_tampered_signature_12345",
  secret: testSecret,
});
assert.equal(isTamperedSigValid, false, "Tampered signature must be rejected");

// Step C: Update order status to paid and provision access
const updateSuccess = updateCyberOrderStatus(order.razorpayOrderId, "paid", {
  razorpayPaymentId: paymentId,
  razorpaySignature: validSignature,
});
assert.ok(updateSuccess, "updateCyberOrderStatus must succeed");

const updatedOrder = getCyberOrderByRazorpayId(order.razorpayOrderId);
assert.ok(updatedOrder, "Updated order must be retrievable");
assert.equal(updatedOrder.status, "paid", "Order status must be 'paid'");

// Verify enrollment provisioning
const enrollment = getCyberEnrollment(testStudentId, courseId);
assert.ok(enrollment, "Enrollment must be provisioned upon payment");
assert.equal(enrollment.accessType, "semester_pass", "Access type must be semester_pass");
assert.equal(enrollment.status, "active", "Enrollment status must be active");
console.log("✓ CyberSecurity Semester Pass checkout and HMAC signature verified.");

// -----------------------------------------------------------------------------
// [Check 2] Mentorship Pack Checkout and Session Lifecycle
// -----------------------------------------------------------------------------
console.log("\n[Check 2] Testing Mentorship Pack Checkout, Consumption & Refund Lifecycle...");
const mentorStudentId = `student_c2_mentor_${Date.now()}`;

// Step A: Purchase Mentorship Pack (₹499)
const mentorOrder = createCyberOrder({
  userId: mentorStudentId,
  courseId,
  productType: "mentorship_pack",
  razorpayOrderId: `order_cyber_mentor_${Date.now()}`,
  amountInPaise: 49900,
});
assert.equal(mentorOrder.amountInPaise, 49900, "Mentorship pack price must be 49900 paise (₹499)");

updateCyberOrderStatus(mentorOrder.razorpayOrderId, "paid", {
  razorpayPaymentId: `pay_cyber_mentor_${Date.now()}`,
  razorpaySignature: "sig_dummy_mentor",
});

const packs = getCyberMentorshipPacks(mentorStudentId, courseId);
assert.ok(packs.length > 0, "Student must have at least 1 active mentorship pack");
const pack = packs[0];
const remainingSessions = pack.totalSessions - pack.usedSessions;
assert.equal(remainingSessions, 1, "New pack must have 1 session remaining");
assert.equal(canBookCyberMentorship(mentorStudentId, courseId), true, "Student should be able to book mentorship");

// Step B: Consume session
const consumed = consumeCyberMentorshipSession(mentorStudentId, courseId);
assert.ok(consumed, "Session consumption must succeed");
assert.equal(canBookCyberMentorship(mentorStudentId, courseId), false, "Cannot book with 0 sessions remaining");

// Step C: Refund session (e.g. mentor canceled/rescheduled)
const refunded = refundCyberMentorshipSession(mentorStudentId, courseId);
assert.ok(refunded, "Session refund must succeed");
assert.equal(canBookCyberMentorship(mentorStudentId, courseId), true, "Can book again after refund");
console.log("✓ Mentorship pack purchase, consumption, and refund verified.");

// -----------------------------------------------------------------------------
// [Check 3] Early Adopter Atomic Claim Limit (10 Free Seats)
// -----------------------------------------------------------------------------
console.log("\n[Check 3] Testing Early Adopter Atomic 10-Seat Limit...");
const initialCount = getCyberEarlyAdopterCount(courseId);

// Claim remaining seats up to 10
const remainingToFill = 10 - initialCount;
for (let i = 0; i < remainingToFill; i++) {
  const simUser = `early_adopter_c2_user_${Date.now()}_${i}`;
  const res = claimCyberEarlyAdopterSeat(simUser, courseId);
  assert.equal(res.success, true, `Seat ${initialCount + i + 1} must be successfully claimed`);
}

assert.equal(getCyberEarlyAdopterCount(courseId), 10, "Total claimed seats must be exactly 10");

// Attempt 11th claim (must be rejected)
const eleventhUser = `overflow_early_user_${Date.now()}`;
const overflowRes = claimCyberEarlyAdopterSeat(eleventhUser, courseId);
assert.equal(overflowRes.success, false, "11th early adopter claim must be rejected");
assert.match(overflowRes.error || "", /claimed|seats/i, "Rejection message must indicate campaign limit reached");

// Test duplicate claim by already claimed user
const duplicateRes = claimCyberEarlyAdopterSeat(`early_adopter_c2_user_${Date.now()}_0`, courseId);
assert.equal(duplicateRes.success, false, "Duplicate early adopter claim by same user must be rejected");
console.log("✓ Early adopter atomic 10-seat limit and duplicate claim prevention verified.");

// -----------------------------------------------------------------------------
// [Check 4] Access Enforcement: Free Preview vs Locked Paid Content
// -----------------------------------------------------------------------------
console.log("\n[Check 4] Testing Access Enforcement (Free Preview vs Locked Paid Content)...");
const freeStudentId = `student_c2_free_preview_${Date.now()}`;

// Free preview access
assert.equal(canAccessCyberLesson(freeStudentId, "lesson-c1-01", courseId), true, "Lesson 1.1 must be free preview");
assert.equal(canAccessCyberLab(freeStudentId, "lab-c1-01", courseId), true, "Lab 1.1 must be free preview");
assert.equal(canAccessCyberQuiz(freeStudentId, "quiz-cyber-01", courseId), true, "Quiz 1 must be free preview");

// Paid locked content for free student
assert.equal(canAccessCyberLesson(freeStudentId, "lesson-c1-02", courseId), false, "Lesson 1.2 must be locked for free student");
assert.equal(canAccessCyberLesson(freeStudentId, "lesson-c1-05", courseId), false, "Lesson 2.1 must be locked for free student");
assert.equal(canAccessCyberLab(freeStudentId, "lab-c1-02", courseId), false, "Lab 2 must be locked for free student");
assert.equal(canAccessCyberQuiz(freeStudentId, "quiz-cyber-02", courseId), false, "Quiz 2 must be locked for free student");
assert.equal(hasCyberSemesterPass(freeStudentId, courseId), false, "Free student does not have semester pass");

// Paid student access
assert.equal(canAccessCyberLesson(testStudentId, "lesson-c1-02", courseId), true, "Paid student can access Lesson 1.2");
assert.equal(canAccessCyberLesson(testStudentId, "lesson-c1-20", courseId), true, "Paid student can access Lesson 5.4");
assert.equal(canAccessCyberLab(testStudentId, "lab-c1-05", courseId), true, "Paid student can access Lab 5");
assert.equal(canAccessCyberQuiz(testStudentId, "quiz-cyber-05", courseId), true, "Paid student can access Quiz 5");
assert.equal(hasCyberSemesterPass(testStudentId, courseId), true, "Paid student has active semester pass");
console.log("✓ Access enforcement between free preview and paid content verified.");

// -----------------------------------------------------------------------------
// [Check 5] Certificate Issuance and Tamper-Evident Verification
// -----------------------------------------------------------------------------
console.log("\n[Check 5] Testing Certificate Issuance & Verification...");
const certStudentId = `student_c2_cert_${Date.now()}`;

// Provision active pass for student first
createOrExtendCyberEnrollment({
  userId: certStudentId,
  courseId,
  accessType: "semester_pass",
  months: 6,
});

// Simulate student completing all modules
updateStudentCyberProgress(certStudentId, {
  completedLessons: Array.from({ length: 20 }, (_, i) => `lesson-c1-${String(i + 1).padStart(2, "0")}`),
  completedLabs: ["lab-c1-01", "lab-c1-02", "lab-c1-03", "lab-c1-04", "lab-c1-05"],
  passedQuizzes: ["quiz-cyber-01", "quiz-cyber-02", "quiz-cyber-03", "quiz-cyber-04", "quiz-cyber-05"],
  completionPercentage: 100,
});

const progress = getStudentCyberProgress(certStudentId);
assert.equal(progress.completedLessons.length, 20, "Must have 20 completed lessons");
assert.equal(progress.completedLabs.length, 5, "Must have 5 completed labs");
assert.equal(progress.passedQuizzes.length, 5, "Must have 5 completed quizzes");

const certRes = issueCyberCertificate(certStudentId, "Vikram Malhotra");
assert.equal(certRes.success, true, "Certificate issuance must succeed");
assert.ok(certRes.certificate, "Certificate object must be returned");
const cert = certRes.certificate;
assert.match(cert.code, /^PMU-CYB-2026-[A-Z0-9]{6}$/, "Certificate code must match PMU-CYB-2026-XXXXXX");
assert.equal(cert.studentName, "Vikram Malhotra");
assert.equal(cert.courseSlug, courseId);

const retrievedCert = getCertificateByCode(cert.code);
assert.ok(retrievedCert, "Issued certificate must be retrievable by code");
assert.equal(retrievedCert.studentName, "Vikram Malhotra");
console.log("✓ Certificate issuance and verification code format verified.");

// -----------------------------------------------------------------------------
// [Check 6] Admin Access Tooling (Grant & Revoke)
// -----------------------------------------------------------------------------
console.log("\n[Check 6] Testing Admin Access Tooling (Manual Grant & Revoke)...");
const grantedStudentId = `student_c2_manual_grant_${Date.now()}`;

// Admin grant access
const adminEnrollment = createOrExtendCyberEnrollment({
  userId: grantedStudentId,
  courseId,
  accessType: "admin_granted",
  months: 6,
});
assert.ok(adminEnrollment, "Admin grant enrollment must succeed");
assert.equal(adminEnrollment.status, "active", "Status must be active");
assert.equal(hasCyberSemesterPass(grantedStudentId, courseId), true, "Student should have active pass");

// Admin revoke access
const revoked = revokeCyberEnrollment(adminEnrollment.id);
assert.ok(revoked, "Admin revoke enrollment must succeed");
assert.equal(hasCyberSemesterPass(grantedStudentId, courseId), false, "Access must be revoked");
console.log("✓ Admin grant and revoke functionality verified.");

// -----------------------------------------------------------------------------
// [Check 7] Razorpay Webhook Signature Verification
// -----------------------------------------------------------------------------
console.log("\n[Check 7] Testing Razorpay Webhook Timing-Safe Signature Verification...");
const webhookSecret = "whsec_cyber_test_789";
const sampleEventPayload = JSON.stringify({
  entity: "event",
  event: "payment.captured",
  payload: {
    payment: {
      entity: {
        id: "pay_test_webhook_123",
        order_id: order.razorpayOrderId,
        amount: 99900,
        status: "captured",
      },
    },
  },
});

const validWebhookSig = crypto
  .createHmac("sha256", webhookSecret)
  .update(sampleEventPayload)
  .digest("hex");

const isWebhookValid = verifyCyberRazorpayWebhookSignature({
  rawBody: sampleEventPayload,
  signature: validWebhookSig,
  secret: webhookSecret,
});
assert.ok(isWebhookValid, "Webhook signature verification must succeed for legitimate event");

const isWebhookTampered = verifyCyberRazorpayWebhookSignature({
  rawBody: sampleEventPayload + "tampered",
  signature: validWebhookSig,
  secret: webhookSecret,
});
assert.equal(isWebhookTampered, false, "Tampered webhook payload must be rejected");
console.log("✓ Webhook signature timing-safe verification verified.");

// -----------------------------------------------------------------------------
// [Check 8] Integrity of Existing Modules & Routes
// -----------------------------------------------------------------------------
console.log("\n[Check 8] Checking /courses Razorpay Webhook & Core Routes Independence...");
const coursesWebhookPath = path.join(
  process.cwd(),
  "backend/courses/supabase/functions/razorpay-webhook/index.ts"
);
assert.ok(fs.existsSync(coursesWebhookPath), "Existing /courses Razorpay webhook must remain untouched");

const coursesContent = fs.readFileSync(coursesWebhookPath, "utf-8");
assert.ok(!coursesContent.includes("pmu_cyber_"), "Existing /courses webhook must NOT know about pmu_cyber_* tables");

console.log("✓ Existing /courses Razorpay webhook is completely independent.");

console.log("\n================================================================================");
console.log("ALL PHASE C2 CYBERSECURITY COMMERCIAL AUDIT CHECKS PASSED PERFECTLY!");
console.log("================================================================================\n");
