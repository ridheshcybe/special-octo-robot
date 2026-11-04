import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  CYBER_COURSE_ID,
  CYBER_COURSE_SLUG,
  CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
  CYBER_PASS_MENTORSHIP_VALIDITY_DAYS,
  CYBER_SEMESTER_MONTHS,
  claimCyberEarlyAdopterSeat,
  createCyberMentorshipPack,
  getCyberEarlyAdopterCount,
  getCyberEarlyAdopterLimit,
  getCyberEarlyAdopterRedemption,
  getCyberMentorshipPackPriceInPaise,
  getCyberSemesterPassPriceInPaise,
  grantCyberEnrollment,
} from "@/app/prepmeup/_lib/cyberStore";
import { hasCyberSemesterPass } from "@/lib/prepmeup/access";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { checkDurableRateLimit } from "@/app/prepmeup/_lib/rateLimit";

export const dynamic = "force-dynamic";

const UUID_RE = /^[0-9a-f-]{36}$/i;

export async function GET() {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    const limit = getCyberEarlyAdopterLimit();
    const claimedCount = getCyberEarlyAdopterCount(CYBER_COURSE_SLUG);
    const remainingSeats = Math.max(0, limit - claimedCount);

    const redemption = identity
      ? getCyberEarlyAdopterRedemption(identity.canonicalId, CYBER_COURSE_SLUG)
      : null;

    return NextResponse.json({
      ok: true,
      totalLimit: limit,
      claimedCount,
      remainingSeats,
      isAvailable: remainingSeats > 0,
      alreadyClaimed: Boolean(redemption),
      redemptionNumber: redemption?.redemptionNumber,
      prices: {
        semesterPassInPaise: getCyberSemesterPassPriceInPaise(),
        mentorshipPackInPaise: getCyberMentorshipPackPriceInPaise(),
        currency: "INR",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load Early Adopter availability." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Sign in to claim the CyberSecurity Early Adopter offer." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "127.0.0.1";

    const rate = await checkDurableRateLimit({
      bucketKey: "cyber_early_adopter_claim",
      identifier: `${studentId}_${ip}`,
      limit: 5,
      windowSeconds: 60 * 60,
    });
    if (!rate.allowed) {
      return NextResponse.json(
        {
          ok: false,
          error: `Too many early-adopter claim attempts. Try again in ${rate.retryAfterSec}s.`,
        },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSec || 60) } }
      );
    }

    if (hasCyberSemesterPass(studentId, CYBER_COURSE_SLUG)) {
      return NextResponse.json(
        {
          ok: false,
          alreadyEnrolled: true,
          error: "You already have active CyberSecurity Semester Pass access.",
        },
        { status: 400 }
      );
    }

    const limit = getCyberEarlyAdopterLimit();
    const serviceClient = createPmuServiceClient();
    const canWriteDb = Boolean(serviceClient) && UUID_RE.test(studentId);

    let redemptionNumber: number | undefined;
    let alreadyClaimed = false;
    let exhausted = false;

    if (canWriteDb) {
      try {
        const { data, error } = await serviceClient!.rpc("pmu_claim_cyber_early_adopter", {
          p_user_id: studentId,
          p_course_id: CYBER_COURSE_ID,
          p_limit: limit,
        });
        if (!error && data) {
          const payload = data as Record<string, any>;
          if (payload.exhausted || payload.code === "SEATS_EXHAUSTED") {
            exhausted = true;
          } else {
            redemptionNumber = Number(payload.redemptionNumber || payload.redemption_number);
            alreadyClaimed = Boolean(payload.alreadyClaimed || payload.already_claimed);
          }
        }
      } catch {
        // Fall back to the in-process atomic counter.
      }
    }

    if (!exhausted && !redemptionNumber) {
      const claim = claimCyberEarlyAdopterSeat(studentId, CYBER_COURSE_SLUG, limit);
      if (claim.exhausted) {
        exhausted = true;
      } else if (claim.success) {
        redemptionNumber = claim.redemptionNumber;
        alreadyClaimed = Boolean(claim.alreadyClaimed);
      } else {
        return NextResponse.json(
          { ok: false, error: claim.error || "Early Adopter claim failed." },
          { status: 400 }
        );
      }
    }

    if (exhausted) {
      return NextResponse.json(
        {
          ok: false,
          exhausted: true,
          remainingSeats: 0,
          error: "All Early Adopter seats have been claimed. Semester Pass is available at ₹999.",
        },
        { status: 409 }
      );
    }

    grantCyberEnrollment({
      userId: studentId,
      courseId: CYBER_COURSE_SLUG,
      accessType: "semester_pass",
      months: CYBER_SEMESTER_MONTHS,
      source: "early_adopter",
    });

    if (CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS > 0) {
      createCyberMentorshipPack({
        userId: studentId,
        courseId: CYBER_COURSE_SLUG,
        totalSessions: CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
        validityDays: CYBER_PASS_MENTORSHIP_VALIDITY_DAYS,
        packType: "semester_pass_included",
      });
    }

    if (canWriteDb) {
      try {
        await serviceClient!.from("pmu_course_enrollments").insert({
          user_id: studentId,
          course_id: CYBER_COURSE_ID,
          access_type: "semester_pass",
          status: "active",
          starts_at: new Date().toISOString(),
          expires_at: new Date(
            Date.now() + CYBER_SEMESTER_MONTHS * 30 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
        await serviceClient!.from("pmu_cyber_mentorship_packs").insert({
          user_id: studentId,
          course_id: CYBER_COURSE_ID,
          pack_type: "semester_pass_included",
          total_sessions: CYBER_PASS_INCLUDED_MENTORSHIP_SESSIONS,
          used_sessions: 0,
          status: "active",
          expires_at: new Date(
            Date.now() + CYBER_PASS_MENTORSHIP_VALIDITY_DAYS * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      } catch {
        // Best-effort mirror.
      }
    }

    return NextResponse.json({
      ok: true,
      claimed: true,
      alreadyClaimed,
      redemptionNumber,
      remainingSeats: Math.max(
        0,
        limit - getCyberEarlyAdopterCount(CYBER_COURSE_SLUG)
      ),
      message: `Early Adopter seat #${redemptionNumber} claimed. Your Semester Pass is active for 6 months.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to claim the Early Adopter offer." },
      { status: 500 }
    );
  }
}
