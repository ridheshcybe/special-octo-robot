import fs from "fs";
import path from "path";
import {
  createOrExtendQuantumEnrollment,
  revokeQuantumEnrollment,
} from "@/app/prepmeup/_lib/trackStore";
import {
  CYBER_COURSE_SLUG,
  grantCyberEnrollment,
  revokeCyberEnrollment,
} from "@/app/prepmeup/_lib/cyberStore";

/**
 * PrepMeUp AI — Phase C3 unified commercial store.
 *
 * Single source of truth for the unified product catalog, orders, payments,
 * entitlements, early-adopter redemptions and unified mentorship credits.
 *
 * Runtime persistence is a file-backed JSON store (same strategy as the
 * Phase Q3 / C2 stores) so the platform stays operable without a live
 * Supabase project. When the PrepMeUp Supabase project is configured, the API
 * routes mirror the same records into the `pmu_*` tables from
 * `backend/prepmeup/migration-phase-c3.sql`.
 *
 * IMPORTANT: this module must never import `lib/prepmeup/access.ts` — the
 * access service imports this store, not the other way around.
 */

export type UnifiedProductType = "semester_pass" | "mentorship_pack" | "all_access_pass";
export type UnifiedOrderStatus = "created" | "pending" | "paid" | "failed" | "expired" | "refunded";
export type UnifiedPaymentStatus = "created" | "authorized" | "captured" | "failed" | "refunded";
export type UnifiedVerificationStatus = "pending" | "verified" | "failed";
export type UnifiedWebhookStatus = "pending" | "received" | "processed" | "failed";
export type UnifiedEntitlementStatus = "active" | "expired" | "cancelled" | "revoked";
export type UnifiedEntitlementKind = "course_access" | "mentorship";
export type UnifiedMentorshipBookingStatus = "confirmed" | "completed" | "cancelled" | "rescheduled";

export interface UnifiedCourseMeta {
  slug: string;
  title: string;
  trackSlug: string;
  trackTitle: string;
  courseId: string;
  trackId: string | null;
  instructorName: string;
}

/**
 * Identifiers are aligned with the existing Supabase seeds:
 *  - Quantum course/track come from `seed-quantum.sql`.
 *  - CyberSecurity course comes from the Phase C2 store.
 *  - B.Tech Semester 1 has no single `pmu_courses` row; this placeholder is
 *    what the B.Tech product and entitlements reference.
 */
export const UNIFIED_COURSES: Record<string, UnifiedCourseMeta> = {
  "btech-cse-aiml-semester-1": {
    slug: "btech-cse-aiml-semester-1",
    title: "B.Tech CSE AI/ML Semester 1",
    trackSlug: "btech-cse-aiml",
    trackTitle: "B.Tech CSE AI/ML",
    courseId: "c1111111-1111-4111-8111-111111111111",
    trackId: "11111111-2222-3333-4444-555555550001",
    instructorName: "PrepMeUp Faculty",
  },
  "quantum-computing-foundations": {
    slug: "quantum-computing-foundations",
    title: "Quantum Computing Foundations",
    trackSlug: "quantum-computing",
    trackTitle: "Quantum Computing",
    courseId: "c0000000-0000-0000-0000-000000000001",
    trackId: "11111111-2222-3333-4444-555555550002",
    instructorName: "Dr. Aravind Vaidya, PhD",
  },
  "cybersecurity-foundations": {
    slug: CYBER_COURSE_SLUG,
    title: "CyberSecurity Foundations",
    trackSlug: "cybersecurity",
    trackTitle: "CyberSecurity",
    courseId: "c2222222-2222-4222-8222-222222222222",
    trackId: "11111111-2222-3333-4444-555555550003",
    instructorName: "Meera Raghavan, CISSP",
  },
};

export const UNIFIED_TRACKS: Record<string, { title: string; courseSlugs: string[] }> = {
  "btech-cse-aiml": {
    title: "B.Tech CSE AI/ML",
    courseSlugs: ["btech-cse-aiml-semester-1"],
  },
  "quantum-computing": {
    title: "Quantum Computing",
    courseSlugs: ["quantum-computing-foundations"],
  },
  cybersecurity: {
    title: "CyberSecurity",
    courseSlugs: ["cybersecurity-foundations"],
  },
};

export const ALL_INCLUDED_COURSE_SLUGS = [
  "btech-cse-aiml-semester-1",
  "quantum-computing-foundations",
  "cybersecurity-foundations",
];

export const ALL_INCLUDED_TRACK_SLUGS = ["btech-cse-aiml", "quantum-computing", "cybersecurity"];

export const UNIFIED_MENTORSHIP_SESSION_MINUTES = 45;
export const UNIFIED_MENTORSHIP_PACK_VALIDITY_DAYS = 90;
export const UNIFIED_SEMESTER_DURATION_DAYS = 180;

export interface UnifiedProduct {
  id: string;
  slug: string;
  name: string;
  description: string;
  productType: UnifiedProductType;
  trackId: string | null;
  courseIds: string[];
  includedTrackSlugs: string[];
  includedCourseSlugs: string[];
  priceInPaise: number;
  currency: "INR";
  durationDays: number;
  isActive: boolean;
  isEarlyAdopterEligible: boolean;
  earlyAdopterLimit: number | null;
  mentorshipSessionsIncluded: number;
  features: string[];
}

export interface UnifiedOrder {
  id: string;
  userId: string;
  productId: string;
  productSlug: string;
  razorpayOrderId: string;
  amountInPaise: number;
  currency: "INR";
  status: UnifiedOrderStatus;
  metadata: Record<string, any>;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedPayment {
  id: string;
  orderId: string;
  userId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise: number;
  currency: "INR";
  status: UnifiedPaymentStatus;
  verificationStatus: UnifiedVerificationStatus;
  webhookStatus: UnifiedWebhookStatus;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedEntitlement {
  id: string;
  userId: string;
  productId: string;
  productSlug: string;
  kind: UnifiedEntitlementKind;
  includedTrackSlugs: string[];
  includedCourseSlugs: string[];
  includedTrackIds: string[];
  includedCourseIds: string[];
  startsAt: string;
  expiresAt: string;
  status: UnifiedEntitlementStatus;
  sessionsTotal?: number;
  sessionsUsed?: number;
  source?: string;
  sourceOrderId?: string;
  /** Legacy enrollment ids created only to keep Phase Q3/C2 guards in sync. */
  legacyMirrorIds?: { quantumEnrollmentId?: string; cyberEnrollmentId?: string };
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedEarlyAdopterRedemption {
  id: string;
  userId: string;
  productId: string;
  productSlug: string;
  redemptionNumber: number;
  status: "claimed" | "revoked";
  createdAt: string;
}

export interface UnifiedMentorshipBooking {
  id: string;
  userId: string;
  courseSlug: string;
  entitlementId: string;
  slotId: string;
  instructorName: string;
  scheduledAt: string;
  durationMinutes: number;
  status: UnifiedMentorshipBookingStatus;
  isConsumed: boolean;
  isRefunded: boolean;
  rescheduledFromSlotId?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface UnifiedWebhookEventRecord {
  id: string;
  provider: string;
  eventId: string;
  eventType: string;
  status: "received" | "processing" | "processed" | "failed" | "ignored";
  payload: any;
  attempts: number;
  createdAt: string;
}

export interface UnifiedMentorshipSlot {
  id: string;
  courseSlug: string;
  scheduledAt: string;
  durationMinutes: number;
  instructorName: string;
  isBooked: boolean;
}

// ---------------------------------------------------------------------------
// Pricing configuration (server-authoritative; env overrides only)
// ---------------------------------------------------------------------------
function readPrice(envKeys: string[], fallback: number): number {
  for (const key of envKeys) {
    const configured = Number(process.env[key]);
    if (Number.isFinite(configured) && configured > 0) return Math.floor(configured);
  }
  return fallback;
}

export function getUnifiedEarlyAdopterLimit(): number {
  const configured = Number(process.env.ALL_ACCESS_EARLY_ADOPTER_LIMIT);
  return Number.isFinite(configured) && configured > 0 ? Math.floor(configured) : 10;
}

export function getUnifiedPricesInPaise() {
  return {
    btechSemesterPass: readPrice(["BTech_SEMESTER_PASS_PRICE_IN_PAISE", "BTECH_SEMESTER_PASS_PRICE_IN_PAISE"], 9900),
    quantumSemesterPass: readPrice(["QUANTUM_SEMESTER_PASS_PRICE_IN_PAISE"], 99900),
    cyberSecuritySemesterPass: readPrice(
      ["CYBER_SECURITY_SEMESTER_PASS_PRICE_IN_PAISE", "CYBER_SEMESTER_PASS_PRICE_IN_PAISE"],
      99900
    ),
    allAccessSemesterPass: readPrice(
      ["ALL_ACCESS_SEMESTER_PASS_PRICE_IN_PAISE", "ALL_ACCESS_SEMESTER_PASS_PRICE_IN_PAISE"],
      149900
    ),
    quantumMentorshipPack: readPrice(
      ["QUANTUM_MENTORSHIP_PACK_PRICE_IN_PAISE"],
      49900
    ),
    cyberSecurityMentorshipPack: readPrice(
      ["CYBER_SECURITY_MENTORSHIP_PACK_PRICE_IN_PAISE", "CYBER_MENTORSHIP_PACK_PRICE_IN_PAISE"],
      49900
    ),
    allAccessMentorshipPack: readPrice(
      ["ALL_ACCESS_MENTORSHIP_PACK_PRICE_IN_PAISE", "ALL_ACCESS_MENTORSHIP_PACK_PRICE_IN_PAISE"],
      89900
    ),
  };
}

function makeProducts(): UnifiedProduct[] {
  const prices = getUnifiedPricesInPaise();
  const base = (
    product: Omit<UnifiedProduct, "currency" | "isActive" | "trackId" | "courseIds"> & {
      trackId?: string | null;
    }
  ): UnifiedProduct => ({
    currency: "INR",
    isActive: true,
    trackId: product.trackId ?? null,
    courseIds: product.includedCourseSlugs
      .map((slug) => UNIFIED_COURSES[slug]?.courseId)
      .filter((id): id is string => Boolean(id)),
    ...product,
  });

  return [
    base({
      id: "a0000000-0000-4000-8000-000000000001",
      slug: "btech-semester-pass",
      name: "B.Tech CSE AI/ML Semester Pass",
      description: "Full access to B.Tech CSE AI/ML Semester 1 content for one semester.",
      productType: "semester_pass",
      trackId: "11111111-2222-3333-4444-555555550001",
      includedTrackSlugs: ["btech-cse-aiml"],
      includedCourseSlugs: ["btech-cse-aiml-semester-1"],
      priceInPaise: prices.btechSemesterPass,
      durationDays: UNIFIED_SEMESTER_DURATION_DAYS,
      isEarlyAdopterEligible: false,
      earlyAdopterLimit: null,
      mentorshipSessionsIncluded: 0,
      features: [
        "All Semester 1 subjects",
        "Module notes & previous-year papers",
        "Quizzes and progress tracking",
      ],
    }),
    base({
      id: "a0000000-0000-4000-8000-000000000002",
      slug: "quantum-semester-pass",
      name: "Quantum Semester Pass",
      description:
        "Six months of full Quantum Computing Foundations access with one included 1-on-1 session.",
      productType: "semester_pass",
      trackId: "11111111-2222-3333-4444-555555550002",
      includedTrackSlugs: ["quantum-computing"],
      includedCourseSlugs: ["quantum-computing-foundations"],
      priceInPaise: prices.quantumSemesterPass,
      durationDays: UNIFIED_SEMESTER_DURATION_DAYS,
      isEarlyAdopterEligible: false,
      earlyAdopterLimit: null,
      mentorshipSessionsIncluded: 1,
      features: [
        "All 20 Quantum lessons",
        "All simulators, labs & quizzes",
        "1 included 45-minute 1-on-1 session",
        "Certificate eligibility",
      ],
    }),
    base({
      id: "a0000000-0000-4000-8000-000000000003",
      slug: "cybersecurity-semester-pass",
      name: "CyberSecurity Semester Pass",
      description:
        "Six months of full CyberSecurity Foundations access with one included 1-on-1 session.",
      productType: "semester_pass",
      trackId: null,
      includedTrackSlugs: ["cybersecurity"],
      includedCourseSlugs: ["cybersecurity-foundations"],
      priceInPaise: prices.cyberSecuritySemesterPass,
      durationDays: UNIFIED_SEMESTER_DURATION_DAYS,
      isEarlyAdopterEligible: false,
      earlyAdopterLimit: null,
      mentorshipSessionsIncluded: 1,
      features: [
        "All CyberSecurity modules, labs & CTFs",
        "Final assessment & certificate eligibility",
        "1 included 45-minute 1-on-1 session",
      ],
    }),
    base({
      id: "a0000000-0000-4000-8000-000000000004",
      slug: "prepmeup-all-access-pass",
      name: "PrepMeUp All-Access Semester Pass",
      description:
        "One pass for B.Tech CSE AI/ML Semester 1, Quantum Computing Foundations and CyberSecurity Foundations.",
      productType: "all_access_pass",
      trackId: null,
      includedTrackSlugs: ALL_INCLUDED_TRACK_SLUGS,
      includedCourseSlugs: ALL_INCLUDED_COURSE_SLUGS,
      priceInPaise: prices.allAccessSemesterPass,
      durationDays: UNIFIED_SEMESTER_DURATION_DAYS,
      isEarlyAdopterEligible: true,
      earlyAdopterLimit: getUnifiedEarlyAdopterLimit(),
      mentorshipSessionsIncluded: 1,
      features: [
        "All three included tracks + all lessons",
        "Certificates for each included track",
        "1 included 45-minute 1-on-1 session",
        "Future tracks are NOT included automatically",
      ],
    }),
    base({
      id: "a0000000-0000-4000-8000-000000000005",
      slug: "quantum-mentorship-pack",
      name: "Quantum Mentorship Pack",
      description: "One private 45-minute 1-on-1 session with Quantum faculty.",
      productType: "mentorship_pack",
      trackId: "11111111-2222-3333-4444-555555550002",
      includedTrackSlugs: ["quantum-computing"],
      includedCourseSlugs: ["quantum-computing-foundations"],
      priceInPaise: prices.quantumMentorshipPack,
      durationDays: UNIFIED_MENTORSHIP_PACK_VALIDITY_DAYS,
      isEarlyAdopterEligible: false,
      earlyAdopterLimit: null,
      mentorshipSessionsIncluded: 1,
      features: [
        "One 45-minute 1-on-1 session",
        "Credit valid for 90 days",
        "Credit refunded if cancelled before completion",
      ],
    }),
    base({
      id: "a0000000-0000-4000-8000-000000000006",
      slug: "cybersecurity-mentorship-pack",
      name: "CyberSecurity Mentorship Pack",
      description: "One private 45-minute 1-on-1 session with CyberSecurity faculty.",
      productType: "mentorship_pack",
      trackId: null,
      includedTrackSlugs: ["cybersecurity"],
      includedCourseSlugs: ["cybersecurity-foundations"],
      priceInPaise: prices.cyberSecurityMentorshipPack,
      durationDays: UNIFIED_MENTORSHIP_PACK_VALIDITY_DAYS,
      isEarlyAdopterEligible: false,
      earlyAdopterLimit: null,
      mentorshipSessionsIncluded: 1,
      features: [
        "One 45-minute 1-on-1 session",
        "Credit valid for 90 days",
        "Credit refunded if cancelled before completion",
      ],
    }),
    base({
      id: "a0000000-0000-4000-8000-000000000007",
      slug: "all-access-mentorship-pack",
      name: "All-Access Mentorship Pack",
      description: "One private 45-minute session, bookable for any included PrepMeUp track.",
      productType: "mentorship_pack",
      trackId: null,
      includedTrackSlugs: ALL_INCLUDED_TRACK_SLUGS,
      includedCourseSlugs: ALL_INCLUDED_COURSE_SLUGS,
      priceInPaise: prices.allAccessMentorshipPack,
      durationDays: UNIFIED_MENTORSHIP_PACK_VALIDITY_DAYS,
      isEarlyAdopterEligible: false,
      earlyAdopterLimit: null,
      mentorshipSessionsIncluded: 1,
      features: [
        "One 45-minute 1-on-1 session",
        "Bookable for any included track",
        "Credit valid for 90 days",
      ],
    }),
  ];
}

export function listUnifiedProducts(options: { includeInactive?: boolean } = {}): UnifiedProduct[] {
  const products = makeProducts();
  return options.includeInactive ? products : products.filter((p) => p.isActive);
}

export function getUnifiedProductBySlug(slug: string | null | undefined): UnifiedProduct | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  return listUnifiedProducts().find((p) => p.slug === normalized) || null;
}

export function getUnifiedProductById(productId: string | null | undefined): UnifiedProduct | null {
  if (!productId) return null;
  return listUnifiedProducts({ includeInactive: true }).find((p) => p.id === productId) || null;
}

export function getUnifiedCourse(slug: string | null | undefined): UnifiedCourseMeta | null {
  if (!slug) return null;
  const normalized = slug.trim().toLowerCase();
  if (UNIFIED_COURSES[normalized]) return UNIFIED_COURSES[normalized];
  // Accept DB UUIDs as well as slugs at the boundary.
  return Object.values(UNIFIED_COURSES).find((c) => c.courseId === normalized) || null;
}

export function getIncludedCourseIds(product: UnifiedProduct): string[] {
  return product.includedCourseSlugs
    .map((slug) => UNIFIED_COURSES[slug]?.courseId)
    .filter((id): id is string => Boolean(id));
}

export function getIncludedTrackIds(product: UnifiedProduct): string[] {
  return product.includedTrackSlugs
    .map((slug) =>
      Object.values(UNIFIED_COURSES).find((course) => course.trackSlug === slug)?.trackId
    )
    .filter((id): id is string => Boolean(id));
}

// ---------------------------------------------------------------------------
// Persisted state
// ---------------------------------------------------------------------------
interface UnifiedStoreState {
  orders: UnifiedOrder[];
  payments: UnifiedPayment[];
  entitlements: UnifiedEntitlement[];
  earlyAdopterRedemptions: UnifiedEarlyAdopterRedemption[];
  mentorshipBookings: UnifiedMentorshipBooking[];
  webhookEvents: UnifiedWebhookEventRecord[];
}

let cachedUnifiedState: UnifiedStoreState | null = null;

function getUnifiedDataFilePath(): string {
  return path.join(process.cwd(), "deploy", "cms", "unified_billing_data.json");
}

function freshState(): UnifiedStoreState {
  return {
    orders: [],
    payments: [],
    entitlements: [],
    earlyAdopterRedemptions: [],
    mentorshipBookings: [],
    webhookEvents: [],
  };
}

export function loadUnifiedState(): UnifiedStoreState {
  if (cachedUnifiedState) return cachedUnifiedState;

  try {
    const filePath = getUnifiedDataFilePath();
    if (fs.existsSync(filePath)) {
      const parsed = JSON.parse(fs.readFileSync(filePath, "utf-8")) as Partial<UnifiedStoreState>;
      const base = freshState();
      cachedUnifiedState = {
        orders: Array.isArray(parsed.orders) ? parsed.orders : base.orders,
        payments: Array.isArray(parsed.payments) ? parsed.payments : base.payments,
        entitlements: Array.isArray(parsed.entitlements) ? parsed.entitlements : base.entitlements,
        earlyAdopterRedemptions: Array.isArray(parsed.earlyAdopterRedemptions)
          ? parsed.earlyAdopterRedemptions
          : base.earlyAdopterRedemptions,
        mentorshipBookings: Array.isArray(parsed.mentorshipBookings)
          ? parsed.mentorshipBookings
          : base.mentorshipBookings,
        webhookEvents: Array.isArray(parsed.webhookEvents)
          ? parsed.webhookEvents
          : base.webhookEvents,
      };
      return cachedUnifiedState;
    }
  } catch (err) {
    console.error("[UnifiedStore] Error loading billing data:", err);
  }

  cachedUnifiedState = freshState();
  return cachedUnifiedState;
}

export function persistUnifiedState() {
  if (!cachedUnifiedState) return;
  try {
    const filePath = getUnifiedDataFilePath();
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tempPath = `${filePath}.${process.pid}.tmp`;
    fs.writeFileSync(tempPath, JSON.stringify(cachedUnifiedState, null, 2), "utf-8");
    try {
      fs.renameSync(tempPath, filePath);
    } catch (renameErr) {
      // Windows can lock the target briefly (antivirus / concurrent readers).
      // Fall back to an in-place write so the latest state is never dropped.
      fs.writeFileSync(filePath, JSON.stringify(cachedUnifiedState, null, 2), "utf-8");
      try {
        fs.unlinkSync(tempPath);
      } catch {
        // Best effort cleanup only.
      }
      console.warn(
        "[UnifiedStore] Atomic rename failed, wrote in place:",
        (renameErr as NodeJS.ErrnoException)?.code
      );
    }
  } catch (err) {
    console.error("[UnifiedStore] Persist error:", err);
  }
}

function normalizeId(value: string | null | undefined): string {
  return (value || "").trim().toLowerCase();
}

function nowIso(): string {
  return new Date().toISOString();
}

function makeId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(16).substring(2, 8)}`;
}

function addDays(from: Date, days: number): Date {
  return new Date(from.getTime() + days * 24 * 60 * 60 * 1000);
}

function isExpired(iso: string | undefined): boolean {
  if (!iso) return false;
  return new Date(iso).getTime() < Date.now();
}

// ---------------------------------------------------------------------------
// Entitlements
// ---------------------------------------------------------------------------
export function getAllUnifiedEntitlements(): UnifiedEntitlement[] {
  return [...loadUnifiedState().entitlements].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnifiedEntitlementsForUser(userId: string | null | undefined): UnifiedEntitlement[] {
  if (!userId) return [];
  const key = normalizeId(userId);
  return loadUnifiedState()
    .entitlements.filter((e) => normalizeId(e.userId) === key)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/**
 * Returns active, unexpired entitlements; flips stale records to `expired`
 * immediately so paid content locks the moment the horizon passes.
 */
export function getActiveUnifiedEntitlements(
  userId: string | null | undefined
): UnifiedEntitlement[] {
  if (!userId) return [];
  const state = loadUnifiedState();
  const key = normalizeId(userId);
  let mutated = false;
  const now = new Date();

  const active = state.entitlements.filter((entitlement) => {
    if (normalizeId(entitlement.userId) !== key) return false;
    if (entitlement.status !== "active") return false;
    if (entitlement.expiresAt && new Date(entitlement.expiresAt) < now) {
      entitlement.status = "expired";
      entitlement.updatedAt = nowIso();
      mutated = true;
      return false;
    }
    if (entitlement.kind === "mentorship") {
      return (entitlement.sessionsUsed || 0) < (entitlement.sessionsTotal || 0);
    }
    return true;
  });

  if (mutated) persistUnifiedState();
  return active;
}

export function hasActiveCourseEntitlement(
  userId: string | null | undefined,
  courseSlug: string
): boolean {
  const course = getUnifiedCourse(courseSlug);
  if (!course) return false;
  return getActiveUnifiedEntitlements(userId).some(
    (entitlement) =>
      entitlement.kind === "course_access" &&
      entitlement.includedCourseSlugs.includes(course.slug)
  );
}

export function hasActiveTrackEntitlement(
  userId: string | null | undefined,
  trackSlug: string
): boolean {
  const normalized = normalizeId(trackSlug);
  const track = UNIFIED_TRACKS[normalized];
  if (!track) return false;
  return getActiveUnifiedEntitlements(userId).some(
    (entitlement) =>
      entitlement.kind === "course_access" &&
      (entitlement.includedTrackSlugs.includes(normalized) ||
        track.courseSlugs.some((slug) => entitlement.includedCourseSlugs.includes(slug)))
  );
}

export function hasActiveAllAccessEntitlement(userId: string | null | undefined): boolean {
  return getActiveUnifiedEntitlements(userId).some(
    (entitlement) =>
      entitlement.kind === "course_access" &&
      entitlement.productSlug === "prepmeup-all-access-pass" &&
      ALL_INCLUDED_COURSE_SLUGS.every((slug) => entitlement.includedCourseSlugs.includes(slug))
  );
}

export function grantUnifiedEntitlement(params: {
  userId: string;
  product: UnifiedProduct;
  kind?: UnifiedEntitlementKind;
  durationDays?: number;
  sessionsTotal?: number;
  source?: string;
  sourceOrderId?: string;
}): UnifiedEntitlement {
  const state = loadUnifiedState();
  const now = new Date();
  const kind = params.kind || "course_access";
  const durationDays = params.durationDays || params.product.durationDays;
  const expiresAt = addDays(now, durationDays).toISOString();

  // Idempotent: one entitlement per source order + kind.
  if (params.sourceOrderId) {
    const existing = state.entitlements.find(
      (entitlement) =>
        entitlement.sourceOrderId === params.sourceOrderId &&
        entitlement.kind === kind &&
        normalizeId(entitlement.userId) === normalizeId(params.userId)
    );
    if (existing) return existing;
  }

  // A repurchase of course access for the same product extends the horizon
  // instead of stacking duplicate entitlement rows.
  if (kind === "course_access") {
    const existing = state.entitlements.find(
      (entitlement) =>
        normalizeId(entitlement.userId) === normalizeId(params.userId) &&
        entitlement.kind === "course_access" &&
        entitlement.productSlug === params.product.slug &&
        entitlement.status === "active"
    );
    if (existing) {
      const currentExpiry = new Date(existing.expiresAt).getTime();
      const nextExpiry = new Date(expiresAt).getTime();
      if (nextExpiry > currentExpiry) existing.expiresAt = expiresAt;
      existing.updatedAt = nowIso();
      existing.source = params.source || existing.source;
      persistUnifiedState();
      return existing;
    }
  }

  const entitlement: UnifiedEntitlement = {
    id: makeId("uni-ent"),
    userId: params.userId,
    productId: params.product.id,
    productSlug: params.product.slug,
    kind,
    includedTrackSlugs: [...params.product.includedTrackSlugs],
    includedCourseSlugs: [...params.product.includedCourseSlugs],
    includedTrackIds: getIncludedTrackIds(params.product),
    includedCourseIds: getIncludedCourseIds(params.product),
    startsAt: now.toISOString(),
    expiresAt,
    status: "active",
    sessionsTotal:
      kind === "mentorship" ? Math.max(1, params.sessionsTotal || 1) : undefined,
    sessionsUsed: kind === "mentorship" ? 0 : undefined,
    source: params.source,
    sourceOrderId: params.sourceOrderId,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  state.entitlements.push(entitlement);
  persistUnifiedState();
  return entitlement;
}

/**
 * Admin-granted access flows through entitlement records, never a special case
 * in the read paths.
 */
export function grantUnifiedAccessByAdmin(params: {
  userId: string;
  productSlug: string;
  durationDays?: number;
  mentorshipSessions?: number;
}): { success: boolean; entitlement?: UnifiedEntitlement; error?: string } {
  const product = getUnifiedProductBySlug(params.productSlug);
  if (!product) return { success: false, error: "Unknown product." };

  const entitlement = grantUnifiedEntitlement({
    userId: params.userId,
    product,
    kind: params.productSlug.includes("mentorship") ? "mentorship" : "course_access",
    durationDays: params.durationDays || product.durationDays,
    sessionsTotal: params.mentorshipSessions || product.mentorshipSessionsIncluded || 1,
    source: "admin_granted",
  });

  return { success: true, entitlement };
}

export function revokeUnifiedEntitlement(entitlementId: string): boolean {
  const state = loadUnifiedState();
  const entitlement = state.entitlements.find((e) => e.id === entitlementId);
  if (!entitlement) return false;

  // Revoke siblings created by the same order as well (for example the
  // mentorship credit issued alongside an All-Access semester pass), so an
  // admin revoke never leaves a usable credit behind.
  const orderPrefix = entitlement.sourceOrderId?.split(":")[0];
  const targets = state.entitlements.filter(
    (e) =>
      e.id === entitlement.id ||
      (orderPrefix &&
        e.userId === entitlement.userId &&
        e.sourceOrderId?.startsWith(orderPrefix))
  );

  for (const target of targets) {
    target.status = "revoked";
    target.updatedAt = nowIso();
    if (target.kind === "course_access") {
      revokeLegacyMirrors(target.legacyMirrorIds);
    }
  }

  persistUnifiedState();
  return true;
}

// ---------------------------------------------------------------------------
// Early adopter redemptions (atomic in-process; durable RPC in migration-c3)
// ---------------------------------------------------------------------------
export function getUnifiedEarlyAdopterCount(productSlug = "prepmeup-all-access-pass"): number {
  const product = getUnifiedProductBySlug(productSlug);
  if (!product) return 0;
  return loadUnifiedState().earlyAdopterRedemptions.filter(
    (r) => r.productId === product.id && r.status === "claimed"
  ).length;
}

export function getUnifiedEarlyAdopterRedemption(
  userId: string,
  productSlug = "prepmeup-all-access-pass"
): UnifiedEarlyAdopterRedemption | null {
  const product = getUnifiedProductBySlug(productSlug);
  if (!product) return null;
  const key = normalizeId(userId);
  return (
    loadUnifiedState().earlyAdopterRedemptions.find(
      (r) => normalizeId(r.userId) === key && r.productId === product.id && r.status === "claimed"
    ) || null
  );
}

export function getAllUnifiedEarlyAdopterRedemptions(): UnifiedEarlyAdopterRedemption[] {
  return [...loadUnifiedState().earlyAdopterRedemptions].sort(
    (a, b) => a.redemptionNumber - b.redemptionNumber
  );
}

export function getUnifiedEarlyAdopterStatus(userId?: string | null) {
  const product = getUnifiedProductBySlug("prepmeup-all-access-pass");
  const limit = product?.earlyAdopterLimit ?? getUnifiedEarlyAdopterLimit();
  const claimed = getUnifiedEarlyAdopterCount();
  const existing = userId ? getUnifiedEarlyAdopterRedemption(userId) : null;

  return {
    limit,
    claimedCount: claimed,
    remainingSeats: Math.max(0, limit - claimed),
    isAvailable: claimed < limit,
    alreadyClaimed: Boolean(existing),
    redemptionNumber: existing?.redemptionNumber,
  };
}

/**
 * Read-count/write-claim happens inside one synchronous call, so concurrent
 * requests in this process can never both take the last seat. Cross-instance
 * atomicity is provided by `pmu_claim_all_access_early_adopter` (migration C3).
 */
export function claimUnifiedEarlyAdopterSeat(
  userId: string,
  productSlug = "prepmeup-all-access-pass",
  limitOverride?: number
): {
  success: boolean;
  alreadyClaimed?: boolean;
  exhausted?: boolean;
  redemptionNumber?: number;
  error?: string;
} {
  const product = getUnifiedProductBySlug(productSlug);
  if (!product) return { success: false, error: "Unknown product." };
  if (product.productType !== "all_access_pass" || !product.isEarlyAdopterEligible) {
    return { success: false, error: "This product is not eligible for the Early Adopter offer." };
  }

  const existing = getUnifiedEarlyAdopterRedemption(userId, productSlug);
  if (existing) {
    return {
      success: true,
      alreadyClaimed: true,
      redemptionNumber: existing.redemptionNumber,
    };
  }

  const state = loadUnifiedState();
  const limit = limitOverride && limitOverride > 0 ? limitOverride : product.earlyAdopterLimit || 10;
  const claimed = state.earlyAdopterRedemptions.filter(
    (r) => r.productId === product.id && r.status === "claimed"
  );

  if (claimed.length >= limit) {
    return {
      success: false,
      exhausted: true,
      error: `All ${limit} All-Access Early Adopter seats have been claimed.`,
    };
  }

  const redemptionNumber =
    claimed.reduce((max, r) => Math.max(max, r.redemptionNumber), 0) + 1;

  state.earlyAdopterRedemptions.push({
    id: makeId("uni-ea"),
    userId,
    productId: product.id,
    productSlug: product.slug,
    redemptionNumber,
    status: "claimed",
    createdAt: nowIso(),
  });
  persistUnifiedState();

  return { success: true, redemptionNumber, exhausted: false };
}

// ---------------------------------------------------------------------------
// Orders & payments
// ---------------------------------------------------------------------------
export function getAllUnifiedOrders(): UnifiedOrder[] {
  return [...loadUnifiedState().orders].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnifiedOrdersForUser(userId: string | null | undefined): UnifiedOrder[] {
  if (!userId) return [];
  const key = normalizeId(userId);
  return loadUnifiedState()
    .orders.filter((o) => normalizeId(o.userId) === key)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnifiedOrderByRazorpayId(razorpayOrderId: string): UnifiedOrder | null {
  return (
    loadUnifiedState().orders.find((o) => o.razorpayOrderId === razorpayOrderId) || null
  );
}

export function createUnifiedOrder(params: {
  userId: string;
  product: UnifiedProduct;
  razorpayOrderId: string;
  amountInPaise: number;
  metadata?: Record<string, any>;
}): UnifiedOrder {
  const state = loadUnifiedState();
  const now = nowIso();

  const order: UnifiedOrder = {
    id: makeId("uni-ord"),
    userId: params.userId,
    productId: params.product.id,
    productSlug: params.product.slug,
    razorpayOrderId: params.razorpayOrderId,
    amountInPaise: params.amountInPaise,
    currency: "INR",
    status: "created",
    metadata: params.metadata || {},
    createdAt: now,
    updatedAt: now,
  };

  state.orders.push(order);
  persistUnifiedState();
  return order;
}

export function getAllUnifiedPayments(): UnifiedPayment[] {
  return [...loadUnifiedState().payments].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function getUnifiedPaymentsForUser(userId: string | null | undefined): UnifiedPayment[] {
  if (!userId) return [];
  const key = normalizeId(userId);
  return loadUnifiedState()
    .payments.filter((p) => normalizeId(p.userId) === key)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function upsertUnifiedPayment(params: {
  order: UnifiedOrder;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise?: number;
  status: UnifiedPaymentStatus;
  verificationStatus: UnifiedVerificationStatus;
  webhookStatus?: UnifiedWebhookStatus;
}): UnifiedPayment {
  const state = loadUnifiedState();
  const existing = state.payments.find(
    (p) => p.razorpayPaymentId === params.razorpayPaymentId
  );

  if (existing) {
    existing.status = params.status;
    existing.verificationStatus = params.verificationStatus;
    if (params.webhookStatus) existing.webhookStatus = params.webhookStatus;
    if (params.razorpaySignature) existing.razorpaySignature = params.razorpaySignature;
    existing.updatedAt = nowIso();
    persistUnifiedState();
    return existing;
  }

  const payment: UnifiedPayment = {
    id: makeId("uni-pay"),
    orderId: params.order.id,
    userId: params.order.userId,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    amountInPaise: params.amountInPaise ?? params.order.amountInPaise,
    currency: "INR",
    status: params.status,
    verificationStatus: params.verificationStatus,
    webhookStatus: params.webhookStatus || "pending",
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  state.payments.push(payment);
  persistUnifiedState();
  return payment;
}

/**
 * Grants the access described by a paid order. Idempotent, so checkout
 * verification and a later webhook can both call it safely.
 */
export function provisionUnifiedEntitlementsForOrder(order: UnifiedOrder): void {
  const state = loadUnifiedState();
  const live = state.orders.find((o) => o.id === order.id) || order;
  if (live.metadata?.entitlementsGrantedAt) return;

  const product =
    getUnifiedProductById(live.productId) || getUnifiedProductBySlug(live.productSlug);
  if (!product) return;

  if (product.productType === "mentorship_pack") {
    grantUnifiedEntitlement({
      userId: live.userId,
      product,
      kind: "mentorship",
      durationDays: product.durationDays,
      sessionsTotal: product.mentorshipSessionsIncluded || 1,
      source: `order:${live.id}`,
      sourceOrderId: live.id,
    });
  } else {
    const courseEntitlement = grantUnifiedEntitlement({
      userId: live.userId,
      product,
      kind: "course_access",
      durationDays: product.durationDays,
      source: `order:${live.id}`,
      sourceOrderId: live.id,
    });

    if (product.mentorshipSessionsIncluded > 0) {
      grantUnifiedEntitlement({
        userId: live.userId,
        product,
        kind: "mentorship",
        durationDays: product.durationDays,
        sessionsTotal: product.mentorshipSessionsIncluded,
        source: `order:${live.id}`,
        sourceOrderId: `${live.id}:mentorship`,
      });
    }

    // Mirror with the exact same horizon so legacy guards expire together.
    const mirrorIds = mirrorCourseAccessToLegacyStores(
      live.userId,
      product,
      courseEntitlement.expiresAt
    );
    const storedEntitlement = state.entitlements.find((e) => e.id === courseEntitlement.id);
    if (storedEntitlement) {
      storedEntitlement.legacyMirrorIds = mirrorIds;
    }
  }

  const persisted = state.orders.find((o) => o.id === live.id);
  if (persisted) {
    persisted.metadata = {
      ...(persisted.metadata || {}),
      entitlementsGrantedAt: nowIso(),
    };
    persisted.updatedAt = nowIso();
  }
  persistUnifiedState();
}

/**
 * Keeps the existing Quantum / CyberSecurity course guards in sync with a
 * unified purchase. Mentorship credits intentionally stay in the unified store
 * so there is exactly one credit ledger per order.
 */
function mirrorCourseAccessToLegacyStores(
  userId: string,
  product: UnifiedProduct,
  expiresAt?: string
): { quantumEnrollmentId?: string; cyberEnrollmentId?: string } {
  const ids: { quantumEnrollmentId?: string; cyberEnrollmentId?: string } = {};
  try {
    if (product.includedCourseSlugs.includes("quantum-computing-foundations")) {
      const enrollment = createOrExtendQuantumEnrollment({
        userId,
        accessType: "semester_pass",
        months: Math.max(1, Math.round(product.durationDays / 30)),
        expiresAt,
      });
      ids.quantumEnrollmentId = enrollment.id;
    }
    if (product.includedCourseSlugs.includes(CYBER_COURSE_SLUG)) {
      const enrollment = grantCyberEnrollment({
        userId,
        accessType: "semester_pass",
        months: Math.max(1, Math.round(product.durationDays / 30)),
        expiresAt,
        source: `unified:${product.slug}`,
      });
      ids.cyberEnrollmentId = enrollment.id;
    }
  } catch (err) {
    console.error("[UnifiedStore] Legacy access mirror failed:", err);
  }
  return ids;
}

/**
 * Revokes only the legacy enrollments this entitlement created, so refunding a
 * unified purchase never touches an independently purchased pass.
 */
function revokeLegacyMirrors(
  ids: { quantumEnrollmentId?: string; cyberEnrollmentId?: string } | undefined
): void {
  if (!ids) return;
  try {
    if (ids.quantumEnrollmentId) revokeQuantumEnrollment(ids.quantumEnrollmentId);
    if (ids.cyberEnrollmentId) revokeCyberEnrollment(ids.cyberEnrollmentId);
  } catch (err) {
    console.error("[UnifiedStore] Legacy access revoke failed:", err);
  }
}

export function markUnifiedOrderPaid(params: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature?: string;
  amountInPaise?: number;
  source: "checkout_verify" | "webhook" | "early_adopter";
}): { order: UnifiedOrder | null; alreadyPaid: boolean } {
  const state = loadUnifiedState();
  const order = state.orders.find((o) => o.razorpayOrderId === params.razorpayOrderId);
  if (!order) return { order: null, alreadyPaid: false };

  const alreadyPaid = order.status === "paid";
  order.status = "paid";
  order.updatedAt = nowIso();
  order.metadata = {
    ...(order.metadata || {}),
    paidVia: params.source,
    lastPaymentId: params.razorpayPaymentId,
  };
  persistUnifiedState();

  upsertUnifiedPayment({
    order,
    razorpayPaymentId: params.razorpayPaymentId,
    razorpaySignature: params.razorpaySignature,
    amountInPaise: params.amountInPaise,
    status: "captured",
    verificationStatus: "verified",
    webhookStatus:
      params.source === "webhook" ? "processed" : params.source === "early_adopter" ? "processed" : "pending",
  });

  provisionUnifiedEntitlementsForOrder(order);
  return { order, alreadyPaid };
}

export function markUnifiedOrderFailed(
  razorpayOrderId: string,
  razorpayPaymentId?: string
): UnifiedOrder | null {
  const state = loadUnifiedState();
  const order = state.orders.find((o) => o.razorpayOrderId === razorpayOrderId);
  if (!order) return null;
  if (order.status === "paid") return order;

  order.status = "failed";
  order.updatedAt = nowIso();
  persistUnifiedState();

  if (razorpayPaymentId) {
    upsertUnifiedPayment({
      order,
      razorpayPaymentId,
      status: "failed",
      verificationStatus: "failed",
      webhookStatus: "processed",
    });
  }
  return order;
}

export function markUnifiedOrderVerificationFailed(
  razorpayOrderId: string,
  razorpayPaymentId: string,
  razorpaySignature?: string
): void {
  const state = loadUnifiedState();
  const order = state.orders.find((o) => o.razorpayOrderId === razorpayOrderId);
  if (!order || order.status === "paid") return;

  order.status = "failed";
  order.updatedAt = nowIso();
  persistUnifiedState();

  upsertUnifiedPayment({
    order,
    razorpayPaymentId,
    razorpaySignature,
    status: "failed",
    verificationStatus: "failed",
  });
}

export function refundUnifiedOrder(
  razorpayOrderId: string,
  razorpayPaymentId?: string
): UnifiedOrder | null {
  const state = loadUnifiedState();
  const order = state.orders.find((o) => o.razorpayOrderId === razorpayOrderId);
  if (!order) return null;

  order.status = "refunded";
  order.updatedAt = nowIso();
  persistUnifiedState();

  if (razorpayPaymentId) {
    const payment = state.payments.find((p) => p.razorpayPaymentId === razorpayPaymentId);
    if (payment) {
      payment.status = "refunded";
      payment.updatedAt = nowIso();
    }
  }

  // A refund ends only the access granted by this order.
  for (const entitlement of state.entitlements) {
    if (entitlement.sourceOrderId?.startsWith(order.id) && entitlement.status === "active") {
      entitlement.status = "revoked";
      entitlement.updatedAt = nowIso();
      if (entitlement.kind === "course_access") {
        revokeLegacyMirrors(entitlement.legacyMirrorIds);
      }
    }
  }

  persistUnifiedState();
  return order;
}

// ---------------------------------------------------------------------------
// Webhook idempotency (durable file-backed ledger)
// ---------------------------------------------------------------------------
export function recordUnifiedWebhookEvent(event: {
  eventId: string;
  eventType: string;
  payload: any;
  provider?: string;
}): { isDuplicate: boolean; event: UnifiedWebhookEventRecord } {
  const state = loadUnifiedState();
  const provider = event.provider || "razorpay_unified";
  const existing = state.webhookEvents.find(
    (e) => e.provider === provider && e.eventId === event.eventId
  );

  if (existing) {
    existing.attempts += 1;
    persistUnifiedState();
    return { isDuplicate: true, event: existing };
  }

  const record: UnifiedWebhookEventRecord = {
    id: makeId("uni-wh"),
    provider,
    eventId: event.eventId,
    eventType: event.eventType,
    status: "processing",
    payload: event.payload,
    attempts: 1,
    createdAt: nowIso(),
  };

  state.webhookEvents.push(record);
  persistUnifiedState();
  return { isDuplicate: false, event: record };
}

export function updateUnifiedWebhookEventStatus(
  eventId: string,
  status: UnifiedWebhookEventRecord["status"],
  provider = "razorpay_unified"
): boolean {
  const state = loadUnifiedState();
  const record = state.webhookEvents.find(
    (e) => e.provider === provider && e.eventId === eventId
  );
  if (!record) return false;
  record.status = status;
  persistUnifiedState();
  return true;
}

// ---------------------------------------------------------------------------
// Mentorship credits, bookings & usage
// ---------------------------------------------------------------------------
export function getMentorshipEntitlements(
  userId: string | null | undefined,
  courseSlug?: string
): UnifiedEntitlement[] {
  const course = courseSlug ? getUnifiedCourse(courseSlug) : null;
  return getActiveUnifiedEntitlements(userId).filter(
    (entitlement) =>
      entitlement.kind === "mentorship" &&
      (entitlement.sessionsTotal || 0) > (entitlement.sessionsUsed || 0) &&
      (!course || entitlement.includedCourseSlugs.includes(course.slug))
  );
}

export function getAvailableMentorshipSessions(
  userId: string | null | undefined,
  courseSlug?: string
): number {
  return getMentorshipEntitlements(userId, courseSlug).reduce(
    (sum, entitlement) =>
      sum + Math.max(0, (entitlement.sessionsTotal || 0) - (entitlement.sessionsUsed || 0)),
    0
  );
}

/**
 * Picks the entitlement that funds the booking and consumes exactly one credit.
 * Returned `entitlementId` must be stored on the booking for refund parity.
 */
export function consumeUnifiedMentorshipCredit(
  userId: string,
  courseSlug: string
): { success: boolean; entitlementId?: string; error?: string } {
  const course = getUnifiedCourse(courseSlug);
  if (!course) return { success: false, error: "Unknown course." };

  const entitlement = getMentorshipEntitlements(userId, course.slug)[0];
  if (!entitlement) {
    return { success: false, error: "No unused mentorship entitlement for this course." };
  }

  entitlement.sessionsUsed = (entitlement.sessionsUsed || 0) + 1;
  entitlement.updatedAt = nowIso();
  persistUnifiedState();

  return { success: true, entitlementId: entitlement.id };
}

export function refundUnifiedMentorshipCredit(entitlementId: string): boolean {
  const state = loadUnifiedState();
  const entitlement = state.entitlements.find((e) => e.id === entitlementId);
  if (!entitlement || entitlement.kind !== "mentorship") return false;
  if ((entitlement.sessionsUsed || 0) <= 0) return false;

  entitlement.sessionsUsed = Math.max(0, (entitlement.sessionsUsed || 0) - 1);
  if (entitlement.status === "expired" && !isExpired(entitlement.expiresAt)) {
    entitlement.status = "active";
  }
  entitlement.updatedAt = nowIso();
  persistUnifiedState();
  return true;
}

export function getUnifiedMentorshipSlots(courseSlug: string): UnifiedMentorshipSlot[] {
  const course = getUnifiedCourse(courseSlug);
  if (!course) return [];
  const state = loadUnifiedState();
  const slots: UnifiedMentorshipSlot[] = [];
  const now = new Date();

  for (let dayOffset = 1; dayOffset <= 7; dayOffset += 1) {
    for (let slotIndex = 0; slotIndex < 2; slotIndex += 1) {
      const date = new Date(now);
      date.setUTCDate(date.getUTCDate() + dayOffset);
      date.setUTCHours(slotIndex === 0 ? 10 : 15, 0, 0, 0);
      const id = `uni-slot-${course.slug}-${date.toISOString().slice(0, 10).replace(/-/g, "")}-${slotIndex}`;
      const isBooked = state.mentorshipBookings.some(
        (booking) =>
          booking.courseSlug === course.slug &&
          booking.slotId === id &&
          (booking.status === "confirmed" || booking.status === "rescheduled")
      );
      slots.push({
        id,
        courseSlug: course.slug,
        scheduledAt: date.toISOString(),
        durationMinutes: UNIFIED_MENTORSHIP_SESSION_MINUTES,
        instructorName: course.instructorName,
        isBooked,
      });
    }
  }

  return slots;
}

export function getUnifiedMentorshipBookings(
  userId: string | null | undefined,
  courseSlug?: string
): UnifiedMentorshipBooking[] {
  if (!userId) return [];
  const key = normalizeId(userId);
  return loadUnifiedState()
    .mentorshipBookings.filter(
      (booking) =>
        normalizeId(booking.userId) === key &&
        (!courseSlug || booking.courseSlug === courseSlug)
    )
    .sort((a, b) => b.scheduledAt.localeCompare(a.scheduledAt));
}

export function bookUnifiedMentorshipSession(params: {
  userId: string;
  courseSlug: string;
  slotId: string;
  notes?: string;
}): {
  success: boolean;
  booking?: UnifiedMentorshipBooking;
  error?: string;
  upgradeRequired?: boolean;
} {
  const course = getUnifiedCourse(params.courseSlug);
  if (!course) return { success: false, error: "Unknown course." };

  const slot = getUnifiedMentorshipSlots(course.slug).find((s) => s.id === params.slotId);
  if (!slot) return { success: false, error: "Selected mentorship slot does not exist." };
  if (slot.isBooked) return { success: false, error: "This mentorship slot is already booked." };

  const consumed = consumeUnifiedMentorshipCredit(params.userId, course.slug);
  if (!consumed.success || !consumed.entitlementId) {
    return {
      success: false,
      upgradeRequired: true,
      error:
        consumed.error ||
        "No unused mentorship entitlement. Purchase a Mentorship Pack or Semester Pass.",
    };
  }

  const state = loadUnifiedState();
  const booking: UnifiedMentorshipBooking = {
    id: makeId("uni-book"),
    userId: params.userId,
    courseSlug: course.slug,
    entitlementId: consumed.entitlementId,
    slotId: slot.id,
    instructorName: slot.instructorName,
    scheduledAt: slot.scheduledAt,
    durationMinutes: slot.durationMinutes,
    status: "confirmed",
    isConsumed: true,
    isRefunded: false,
    notes: params.notes,
    createdAt: nowIso(),
    updatedAt: nowIso(),
  };

  state.mentorshipBookings.push(booking);
  persistUnifiedState();
  return { success: true, booking };
}

export function cancelUnifiedMentorshipBooking(
  userId: string,
  bookingId: string
): { success: boolean; booking?: UnifiedMentorshipBooking; error?: string } {
  const state = loadUnifiedState();
  const booking = state.mentorshipBookings.find(
    (b) => b.id === bookingId && normalizeId(b.userId) === normalizeId(userId)
  );
  if (!booking) return { success: false, error: "Mentorship booking not found." };
  if (booking.status === "completed") {
    return { success: false, error: "Completed sessions cannot be cancelled or refunded." };
  }
  if (booking.status === "cancelled") {
    return { success: false, error: "This session is already cancelled." };
  }

  // Refund exactly once, and only before completion.
  if (booking.isConsumed && !booking.isRefunded) {
    if (refundUnifiedMentorshipCredit(booking.entitlementId)) {
      booking.isRefunded = true;
    }
  }

  booking.status = "cancelled";
  booking.updatedAt = nowIso();
  persistUnifiedState();
  return { success: true, booking };
}

export function completeUnifiedMentorshipBooking(
  userId: string,
  bookingId: string
): { success: boolean; booking?: UnifiedMentorshipBooking; error?: string } {
  const state = loadUnifiedState();
  const booking = state.mentorshipBookings.find(
    (b) => b.id === bookingId && normalizeId(b.userId) === normalizeId(userId)
  );
  if (!booking) return { success: false, error: "Mentorship booking not found." };
  if (booking.status === "cancelled") {
    return { success: false, error: "Cancelled sessions cannot be completed." };
  }
  if (booking.status === "completed") {
    return { success: true, booking };
  }

  // Credit was consumed at booking time; completing never consumes again.
  booking.status = "completed";
  booking.isConsumed = true;
  booking.updatedAt = nowIso();
  persistUnifiedState();
  return { success: true, booking };
}

export function rescheduleUnifiedMentorshipBooking(params: {
  userId: string;
  bookingId: string;
  slotId: string;
}): { success: boolean; booking?: UnifiedMentorshipBooking; error?: string } {
  const state = loadUnifiedState();
  const booking = state.mentorshipBookings.find(
    (b) => b.id === params.bookingId && normalizeId(b.userId) === normalizeId(params.userId)
  );
  if (!booking) return { success: false, error: "Mentorship booking not found." };
  if (booking.status === "completed") {
    return { success: false, error: "Completed sessions cannot be rescheduled." };
  }
  if (booking.status === "cancelled") {
    return { success: false, error: "Cancelled sessions cannot be rescheduled." };
  }

  const target = getUnifiedMentorshipSlots(booking.courseSlug).find(
    (s) => s.id === params.slotId
  );
  if (!target) return { success: false, error: "Target mentorship slot does not exist." };
  if (target.isBooked) return { success: false, error: "Target mentorship slot is already booked." };

  // Rescheduling never refunds and never re-consumes a credit.
  booking.rescheduledFromSlotId = booking.slotId;
  booking.slotId = target.id;
  booking.scheduledAt = target.scheduledAt;
  booking.status = "rescheduled";
  booking.updatedAt = nowIso();
  persistUnifiedState();
  return { success: true, booking };
}

// ---------------------------------------------------------------------------
// Access summary + revenue reporting
// ---------------------------------------------------------------------------
export interface UnifiedAccessSummary {
  userId: string;
  hasBtechAccess: boolean;
  hasQuantumAccess: boolean;
  hasCyberSecurityAccess: boolean;
  hasAllAccess: boolean;
  accessibleCourseSlugs: string[];
  accessibleTrackSlugs: string[];
  activeEntitlements: number;
  nextExpiry?: string;
  availableMentorshipSessions: number;
  mentorshipCourseSlugs: string[];
  hasActivePass: boolean;
}

export function getUnifiedAccessSummary(userId: string | null | undefined): UnifiedAccessSummary {
  if (!userId) {
    return {
      userId: "",
      hasBtechAccess: false,
      hasQuantumAccess: false,
      hasCyberSecurityAccess: false,
      hasAllAccess: false,
      accessibleCourseSlugs: [],
      accessibleTrackSlugs: [],
      activeEntitlements: 0,
      availableMentorshipSessions: 0,
      mentorshipCourseSlugs: [],
      hasActivePass: false,
    };
  }

  const active = getActiveUnifiedEntitlements(userId);
  const courseAccess = active.filter((e) => e.kind === "course_access");
  const courses = new Set<string>();
  const tracks = new Set<string>();

  for (const entitlement of courseAccess) {
    entitlement.includedCourseSlugs.forEach((slug) => courses.add(slug));
    entitlement.includedTrackSlugs.forEach((slug) => tracks.add(slug));
  }

  const mentorshipEntitlements = active.filter((e) => e.kind === "mentorship");
  const mentorshipCourses = new Set<string>();
  mentorshipEntitlements.forEach((entitlement) =>
    entitlement.includedCourseSlugs.forEach((slug) => mentorshipCourses.add(slug))
  );

  const expiries = courseAccess
    .map((e) => e.expiresAt)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  return {
    userId,
    hasBtechAccess: courses.has("btech-cse-aiml-semester-1"),
    hasQuantumAccess: courses.has("quantum-computing-foundations"),
    hasCyberSecurityAccess: courses.has("cybersecurity-foundations"),
    hasAllAccess:
      courses.has("btech-cse-aiml-semester-1") &&
      courses.has("quantum-computing-foundations") &&
      courses.has("cybersecurity-foundations"),
    accessibleCourseSlugs: [...courses],
    accessibleTrackSlugs: [...tracks],
    activeEntitlements: active.length,
    nextExpiry: expiries[0],
    availableMentorshipSessions: mentorshipEntitlements.reduce(
      (sum, e) => sum + Math.max(0, (e.sessionsTotal || 0) - (e.sessionsUsed || 0)),
      0
    ),
    mentorshipCourseSlugs: [...mentorshipCourses],
    hasActivePass: courseAccess.length > 0,
  };
}

export interface UnifiedRevenueFilters {
  productSlug?: string;
  userId?: string;
  status?: string;
  paymentId?: string;
  from?: string;
  to?: string;
}

function inDateRange(iso: string, from?: string, to?: string): boolean {
  const time = new Date(iso).getTime();
  if (from && time < new Date(from).getTime()) return false;
  if (to) {
    // Inclusive end date when a plain YYYY-MM-DD is supplied.
    const end = /^\d{4}-\d{2}-\d{2}$/.test(to)
      ? new Date(`${to}T23:59:59.999Z`).getTime()
      : new Date(to).getTime();
    if (time > end) return false;
  }
  return true;
}

export function getUnifiedRevenueReport(filters: UnifiedRevenueFilters = {}) {
  const state = loadUnifiedState();

  const orders = state.orders.filter((order) => {
    if (filters.productSlug && order.productSlug !== filters.productSlug) return false;
    if (filters.userId && normalizeId(order.userId) !== normalizeId(filters.userId)) return false;
    if (filters.status && order.status !== filters.status) return false;
    if (!inDateRange(order.createdAt, filters.from, filters.to)) return false;
    return true;
  });
  const orderIds = new Set(orders.map((o) => o.id));

  // The UI filters by order status (paid/failed/refunded), while payment rows
  // use capture terminology. Map the shared values so revenue never drops to
  // zero when an order-status filter is applied.
  const paymentStatusFilter =
    filters.status === "paid"
      ? "captured"
      : filters.status === "failed"
        ? "failed"
        : filters.status === "refunded"
          ? "refunded"
          : filters.status;

  const payments = state.payments.filter((payment) => {
    if (filters.paymentId && payment.razorpayPaymentId !== filters.paymentId) return false;
    if (filters.userId && normalizeId(payment.userId) !== normalizeId(filters.userId)) return false;
    if (paymentStatusFilter && payment.status !== paymentStatusFilter) return false;
    if (!inDateRange(payment.createdAt, filters.from, filters.to)) return false;
    if (filters.productSlug && !orderIds.has(payment.orderId)) return false;
    return true;
  });

  const captured = payments.filter((p) => p.status === "captured");
  const refunded = payments.filter((p) => p.status === "refunded");
  const capturedPaise = captured.reduce((sum, p) => sum + (p.amountInPaise || 0), 0);
  const refundedPaise = refunded.reduce((sum, p) => sum + (p.amountInPaise || 0), 0);

  const revenueByProductMap = new Map<
    string,
    { productSlug: string; productName: string; orders: number; revenueInPaise: number }
  >();
  const revenueByTrackMap = new Map<string, { trackSlug: string; revenueInPaise: number }>();
  const monthlyMap = new Map<string, { month: string; revenueInPaise: number; orders: number }>();

  for (const payment of captured) {
    const order = state.orders.find((o) => o.id === payment.orderId);
    if (!order) continue;
    const product = getUnifiedProductById(order.productId);
    const productEntry = revenueByProductMap.get(order.productSlug) || {
      productSlug: order.productSlug,
      productName: product?.name || order.productSlug,
      orders: 0,
      revenueInPaise: 0,
    };
    productEntry.orders += 1;
    productEntry.revenueInPaise += payment.amountInPaise || 0;
    revenueByProductMap.set(order.productSlug, productEntry);

    const tracks = product?.includedTrackSlugs?.length
      ? product.includedTrackSlugs
      : ["unassigned"];
    const share = Math.round((payment.amountInPaise || 0) / tracks.length);
    for (const trackSlug of tracks) {
      const trackEntry = revenueByTrackMap.get(trackSlug) || {
        trackSlug,
        revenueInPaise: 0,
      };
      trackEntry.revenueInPaise += share;
      revenueByTrackMap.set(trackSlug, trackEntry);
    }

    const month = payment.createdAt.slice(0, 7);
    const monthlyEntry = monthlyMap.get(month) || { month, revenueInPaise: 0, orders: 0 };
    monthlyEntry.revenueInPaise += payment.amountInPaise || 0;
    monthlyEntry.orders += 1;
    monthlyMap.set(month, monthlyEntry);
  }

  const entitlements = state.entitlements.filter((entitlement) => {
    if (filters.userId && normalizeId(entitlement.userId) !== normalizeId(filters.userId)) return false;
    if (filters.productSlug && entitlement.productSlug !== filters.productSlug) return false;
    return true;
  });

  const mentorshipUsage = state.entitlements
    .filter((e) => e.kind === "mentorship")
    .map((entitlement) => ({
      entitlementId: entitlement.id,
      userId: entitlement.userId,
      productSlug: entitlement.productSlug,
      includedCourseSlugs: entitlement.includedCourseSlugs,
      sessionsTotal: entitlement.sessionsTotal || 0,
      sessionsUsed: entitlement.sessionsUsed || 0,
      status: entitlement.status,
      expiresAt: entitlement.expiresAt,
      bookings: state.mentorshipBookings.filter((b) => b.entitlementId === entitlement.id).length,
    }));

  return {
    summary: {
      totalRevenueRupees: Math.round(capturedPaise / 100),
      refundedRupees: Math.round(refundedPaise / 100),
      netRevenueRupees: Math.round((capturedPaise - refundedPaise) / 100),
      totalOrders: orders.length,
      paidOrders: orders.filter((o) => o.status === "paid").length,
      failedOrders: orders.filter((o) => o.status === "failed").length,
      refundedOrders: orders.filter((o) => o.status === "refunded").length,
      capturedPayments: captured.length,
      refundedPayments: refunded.length,
      earlyAdopterRedemptions: state.earlyAdopterRedemptions.filter((r) => r.status === "claimed")
        .length,
      earlyAdopterLimit: getUnifiedEarlyAdopterLimit(),
      activeEntitlements: entitlements.filter((e) => e.status === "active").length,
      expiredEntitlements: entitlements.filter(
        (e) => e.status === "expired" || e.status === "revoked"
      ).length,
      activeMentorshipEntitlements: mentorshipUsage.filter(
        (m) => m.status === "active" && m.sessionsUsed < m.sessionsTotal
      ).length,
    },
    revenueByProduct: [...revenueByProductMap.values()].map((row) => ({
      ...row,
      revenueRupees: Math.round(row.revenueInPaise / 100),
    })),
    revenueByTrack: [...revenueByTrackMap.values()].map((row) => ({
      ...row,
      revenueRupees: Math.round(row.revenueInPaise / 100),
    })),
    monthlyRevenue: [...monthlyMap.values()]
      .map((row) => ({ ...row, revenueRupees: Math.round(row.revenueInPaise / 100) }))
      .sort((a, b) => a.month.localeCompare(b.month)),
    orders,
    payments,
    entitlements,
    mentorshipUsage,
  };
}
