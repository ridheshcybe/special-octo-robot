import fs from "fs";
import path from "path";
import crypto from "crypto";
import { resolvePersistentDataDir } from "@/app/prepmeup/_lib/studentStore";
import { getStoredDailyNote } from "@/lib/prepmeup/dailyNotes";

export interface SquadInviteRecord {
  code: string;
  orderId: string;
  buyerId: string;
  buyerName: string;
  tier: "tier2";
  createdAt: string;
  redeemedBy?: {
    studentId: string;
    name: string;
    email: string;
    whatsapp: string;
    redeemedAt: string;
  } | null;
}

export interface ReferralStatsRecord {
  referrerCode: string;
  ownerId: string;
  ownerName: string;
  clicks: number;
  conversions: number;
  referredStudents: Array<{
    nameOrId: string;
    joinedAt: string;
  }>;
  unlockedRewardCode: string | null;
}

export interface AutomatedBroadcastDigest {
  date: string;
  generatedAt: string;
  capsuleTopic: string;
  subjectCode: string;
  subjectTitle: string;
  whatsappClassBroadcast: string;
  whatsappQuizChallenge: string;
  whatsappSquadPitch: string;
  linkedinOrInstaCaption: string;
}

interface GrowthState {
  squadInvites: Record<string, SquadInviteRecord>;
  referrals: Record<string, ReferralStatsRecord>;
  guestTrialsByIpDate: Record<string, number>;
  dailyBroadcastHistory: AutomatedBroadcastDigest[];
  metrics: {
    totalWhatsappShares: number;
    totalGuestTrials: number;
    totalPromoValidations: number;
    totalSquadPassesCreated: number;
    totalSquadInvitesRedeemed: number;
  };
}

const DEFAULT_GROWTH_STATE: GrowthState = {
  squadInvites: {
    "SQUAD-DEMO-FREE": {
      code: "SQUAD-DEMO-FREE",
      orderId: "order_demo_seed",
      buyerId: "seed-squad-leader",
      buyerName: "Aarav Kulkarni (CSE AI/ML)",
      tier: "tier2",
      createdAt: "2026-10-30T00:00:00.000Z",
      redeemedBy: null,
    },
  },
  referrals: {},
  guestTrialsByIpDate: {},
  dailyBroadcastHistory: [],
  metrics: {
    totalWhatsappShares: 42,
    totalGuestTrials: 19,
    totalPromoValidations: 27,
    totalSquadPassesCreated: 6,
    totalSquadInvitesRedeemed: 9,
  },
};

function getGrowthStateFilePath(): string {
  const dir = resolvePersistentDataDir();
  return path.join(dir, "growth_state.json");
}

export function readGrowthState(): GrowthState {
  const filePath = getGrowthStateFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      return {
        squadInvites: {
          ...DEFAULT_GROWTH_STATE.squadInvites,
          ...(parsed.squadInvites || {}),
        },
        referrals: parsed.referrals || {},
        guestTrialsByIpDate: parsed.guestTrialsByIpDate || {},
        dailyBroadcastHistory: Array.isArray(parsed.dailyBroadcastHistory)
          ? parsed.dailyBroadcastHistory
          : [],
        metrics: {
          ...DEFAULT_GROWTH_STATE.metrics,
          ...(parsed.metrics || {}),
        },
      };
    }
  } catch (err) {
    console.warn("[GrowthEngine] Failed to read growth_state.json:", err);
  }
  return structuredClone(DEFAULT_GROWTH_STATE);
}

export function writeGrowthState(state: GrowthState): void {
  const filePath = getGrowthStateFilePath();
  try {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmpPath = `${filePath}.${process.pid}.${Date.now()}.tmp`;
    fs.writeFileSync(tmpPath, JSON.stringify(state, null, 2), "utf-8");
    fs.renameSync(tmpPath, filePath);
  } catch (err) {
    console.warn("[GrowthEngine] Failed to write growth_state.json:", err);
  }
}

export function getOrCreateStudentReferralCode(
  studentId: string,
  studentName = "Engineering Student"
): ReferralStatsRecord {
  const state = readGrowthState();
  const hash = crypto
    .createHash("sha1")
    .update(studentId || "guest")
    .digest("hex")
    .slice(0, 6)
    .toUpperCase();
  const code = `REF-${hash}`;

  if (!state.referrals[code]) {
    state.referrals[code] = {
      referrerCode: code,
      ownerId: studentId,
      ownerName: studentName,
      clicks: 0,
      conversions: 0,
      referredStudents: [],
      unlockedRewardCode: null,
    };
    writeGrowthState(state);
  }
  return state.referrals[code];
}

export function trackReferralAction(
  refCodeRaw: string,
  eventType: "click" | "conversion",
  friendLabel = "Classmate"
): ReferralStatsRecord | null {
  const code = (refCodeRaw || "").trim().toUpperCase();
  if (!code) return null;

  const state = readGrowthState();
  if (!state.referrals[code]) {
    state.referrals[code] = {
      referrerCode: code,
      ownerId: `owner-${code.toLowerCase()}`,
      ownerName: "Batch Referrer",
      clicks: 0,
      conversions: 0,
      referredStudents: [],
      unlockedRewardCode: null,
    };
  }

  const record = state.referrals[code];
  if (eventType === "click") {
    record.clicks += 1;
  } else {
    record.conversions += 1;
    record.referredStudents.unshift({
      nameOrId: friendLabel,
      joinedAt: new Date().toISOString(),
    });
    if (record.conversions >= 2 && !record.unlockedRewardCode) {
      record.unlockedRewardCode = "VIP100";
    }
  }

  writeGrowthState(state);
  return record;
}

export interface PromoValidationResult {
  valid: boolean;
  code: string;
  kind: "promo" | "referral" | "squad_invite" | "invalid";
  discountRupees: number;
  finalPriceRupees: number;
  message: string;
  squadInvite?: SquadInviteRecord;
}

export function validatePromoOrSquadCode(
  rawCode: string,
  selectedTier: string
): PromoValidationResult {
  const code = (rawCode || "").trim().toUpperCase();
  const basePrices: Record<string, number> = {
    tier1: 99,
    tier2: 199,
    tier2_squad: 449,
    tier3: 499,
  };
  const basePrice = basePrices[selectedTier] ?? 199;

  if (!code) {
    return {
      valid: false,
      code: "",
      kind: "invalid",
      discountRupees: 0,
      finalPriceRupees: basePrice,
      message: "Enter a promo, referral, or squad invite code.",
    };
  }

  const state = readGrowthState();
  state.metrics.totalPromoValidations += 1;
  writeGrowthState(state);

  // 1. Check if it's a Squad Invite Code (e.g. SQUAD-XXXX-1)
  if (state.squadInvites[code]) {
    const invite = state.squadInvites[code];
    if (invite.redeemedBy) {
      return {
        valid: false,
        code,
        kind: "squad_invite",
        discountRupees: 0,
        finalPriceRupees: basePrice,
        message: `Squad code ${code} has already been redeemed by ${invite.redeemedBy.name}.`,
      };
    }
    return {
      valid: true,
      code,
      kind: "squad_invite",
      discountRupees: 199,
      finalPriceRupees: 0,
      message: `Valid Study Squad Pass from ${invite.buyerName}! Click 'Redeem Free Squad Seat' to activate Tier 2 Pro immediately (₹0 due).`,
      squadInvite: invite,
    };
  }

  // 2. Built-in Promo Codes
  if (code === "EXAM50" || code === "SQUAD50" || code === "REF50") {
    const discount =
      selectedTier === "tier3" || selectedTier === "tier2_squad"
        ? 50
        : selectedTier === "tier2"
        ? 30
        : 15;
    return {
      valid: true,
      code,
      kind: "promo",
      discountRupees: discount,
      finalPriceRupees: Math.max(1, basePrice - discount),
      message: `Promo '${code}' applied! ₹${discount} instant exam-week discount unlocked.`,
    };
  }

  if (code === "DYPIU25" || code === "BATCH25") {
    const discount = 25;
    return {
      valid: true,
      code,
      kind: "promo",
      discountRupees: discount,
      finalPriceRupees: Math.max(1, basePrice - discount),
      message: `Campus code '${code}' applied! ₹${discount} off your Semester 1 Pass.`,
    };
  }

  if (code === "VIP100") {
    const discount = selectedTier === "tier3" || selectedTier === "tier2_squad" ? 100 : 40;
    return {
      valid: true,
      code,
      kind: "promo",
      discountRupees: discount,
      finalPriceRupees: Math.max(1, basePrice - discount),
      message: `Referral milestone reward '${code}' applied! ₹${discount} off.`,
    };
  }

  // 3. Student Referral Codes (REF-XXXXXX)
  if (code.startsWith("REF-") && code.length >= 7) {
    const discount = selectedTier === "tier1" ? 15 : 30;
    return {
      valid: true,
      code,
      kind: "referral",
      discountRupees: discount,
      finalPriceRupees: Math.max(1, basePrice - discount),
      message: `Classmate referral '${code}' applied! You save ₹${discount} and your friend earns +1 referral credit.`,
    };
  }

  return {
    valid: false,
    code,
    kind: "invalid",
    discountRupees: 0,
    finalPriceRupees: basePrice,
    message: `Code '${code}' was not recognized. Try EXAM50, DYPIU25, or a classmate's REF-XXXXXX / SQUAD-XXXX code.`,
  };
}

export function generateSquadInviteCodesForOrder(params: {
  orderId: string;
  buyerId: string;
  buyerName: string;
}): SquadInviteRecord[] {
  const state = readGrowthState();

  // Idempotency check: if codes already exist for this orderId, return them
  const existing = Object.values(state.squadInvites).filter(
    (inv) => inv.orderId === params.orderId
  );
  if (existing.length > 0) {
    return existing;
  }

  const hash = crypto
    .createHash("sha1")
    .update(`${params.orderId}:${params.buyerId}`)
    .digest("hex")
    .slice(0, 4)
    .toUpperCase();

  const created: SquadInviteRecord[] = [1, 2].map((idx) => {
    const code = `SQUAD-${hash}-${idx}`;
    const rec: SquadInviteRecord = {
      code,
      orderId: params.orderId,
      buyerId: params.buyerId,
      buyerName: params.buyerName || "Squad Leader",
      tier: "tier2",
      createdAt: new Date().toISOString(),
      redeemedBy: null,
    };
    state.squadInvites[code] = rec;
    return rec;
  });

  state.metrics.totalSquadPassesCreated += 1;
  writeGrowthState(state);
  return created;
}

export function redeemSquadInviteCode(params: {
  code: string;
  studentId: string;
  name: string;
  email: string;
  whatsapp: string;
}): { ok: boolean; error?: string; invite?: SquadInviteRecord } {
  const cleanCode = (params.code || "").trim().toUpperCase();
  const state = readGrowthState();
  const invite = state.squadInvites[cleanCode];

  if (!invite) {
    return {
      ok: false,
      error: `Squad invite code '${cleanCode}' does not exist.`,
    };
  }

  if (invite.redeemedBy && invite.code !== "SQUAD-DEMO-FREE") {
    return {
      ok: false,
      error: `Squad invite code '${cleanCode}' was already claimed by ${invite.redeemedBy.name}.`,
    };
  }

  // For real squad codes, mark as redeemed so they are strictly single-use
  if (invite.code !== "SQUAD-DEMO-FREE") {
    invite.redeemedBy = {
      studentId: params.studentId,
      name: params.name,
      email: params.email,
      whatsapp: params.whatsapp,
      redeemedAt: new Date().toISOString(),
    };
  }
  state.metrics.totalSquadInvitesRedeemed += 1;
  writeGrowthState(state);

  return { ok: true, invite };
}

export function buildAutomatedDailyGrowthDigest(): AutomatedBroadcastDigest {
  const daily = getStoredDailyNote();
  const today = new Date().toISOString().slice(0, 10);

  const whatsappClassBroadcast = [
    `🔥 *Semester 1 Daily Exam Capsule (${daily.subjectCode})*`,
    `📌 *Topic:* ${daily.topic}`,
    ``,
    `⚡ *60-Sec Must-Memorize Formula Summary:*`,
    `• ${(daily.summary[0] || "").replace(/\$/g, "")}`,
    `• ${(daily.summary[1] || "").replace(/\$/g, "")}`,
    ``,
    `🎯 Take today's 3-question diagnostic quiz & check your SGPA target here:`,
    `👉 https://prepmeupai.in/prepmeup?utm_source=whatsapp_daily`,
  ].join("\n");

  const whatsappQuizChallenge = [
    `⚡ *B.Tech Sem-1 Quiz Challenge!*`,
    `I just practiced *${daily.subjectCode}: ${daily.topic}* on PrepMeUp.`,
    `Bet you can't get 5/5 on the timed module quiz without checking the hints 👀`,
    `👉 Try the live simulator & quiz: https://prepmeupai.in/prepmeup/quizzes`,
  ].join("\n");

  const whatsappSquadPitch = [
    `🎓 *Anyone want to split the PrepMeUp Study Squad Pass?*`,
    `Individual Tier 2 Pro Pass is ₹199, but the *3-Friend Study Squad Bundle is ₹449 total (₹149/person)* — includes all 93 topic notes, AI Doubt Solver, 17 simulators + 1:1 mentor session.`,
    `Reply if you want one of my 2 squad invite codes!`,
    `👉 https://prepmeupai.in/prepmeup/checkout?tier=tier2_squad`,
  ].join("\n");

  const linkedinOrInstaCaption = `Studying ${daily.subjectTitle} (${daily.subjectCode}) with interactive oscilloscopes, RISC pipeline visualizers, and AI step-by-step LaTeX derivations on PrepMeUp 🚀 #BTech #CSE #Engineering #PrepMeUp`;

  const digest: AutomatedBroadcastDigest = {
    date: today,
    generatedAt: new Date().toISOString(),
    capsuleTopic: daily.topic,
    subjectCode: daily.subjectCode,
    subjectTitle: daily.subjectTitle,
    whatsappClassBroadcast,
    whatsappQuizChallenge,
    whatsappSquadPitch,
    linkedinOrInstaCaption,
  };

  const state = readGrowthState();
  const existingIdx = state.dailyBroadcastHistory.findIndex((d) => d.date === today);
  if (existingIdx >= 0) {
    state.dailyBroadcastHistory[existingIdx] = digest;
  } else {
    state.dailyBroadcastHistory.unshift(digest);
    state.dailyBroadcastHistory = state.dailyBroadcastHistory.slice(0, 14);
  }
  writeGrowthState(state);

  return digest;
}

export function checkAndIncrementGuestTrial(ipKey: string): {
  allowed: boolean;
  used: number;
  limit: number;
} {
  const today = new Date().toISOString().slice(0, 10);
  const bucketKey = `${ipKey}:${today}`;
  const state = readGrowthState();
  const used = state.guestTrialsByIpDate[bucketKey] || 0;
  const limit = 5;

  if (used >= limit) {
    return { allowed: false, used, limit };
  }

  state.guestTrialsByIpDate[bucketKey] = used + 1;
  state.metrics.totalGuestTrials += 1;
  writeGrowthState(state);

  return { allowed: true, used: used + 1, limit };
}
