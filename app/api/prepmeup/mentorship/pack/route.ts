import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  bookUnifiedMentorshipSession,
  cancelUnifiedMentorshipBooking,
  completeUnifiedMentorshipBooking,
  getAvailableMentorshipSessions,
  getMentorshipEntitlements,
  getUnifiedAccessSummary,
  getUnifiedMentorshipBookings,
  getUnifiedMentorshipSlots,
  rescheduleUnifiedMentorshipBooking,
} from "@/app/prepmeup/_lib/unifiedStore";

export const dynamic = "force-dynamic";

/**
 * Unified mentorship entitlement endpoints (Phase C3).
 *
 * These cover mentorship credits purchased through the unified checkout,
 * including the All-Access Mentorship Pack (one session, bookable for any
 * included track). Legacy Quantum / CyberSecurity pack endpoints are untouched.
 */
export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);
    if (!identity) {
      return NextResponse.json(
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const courseSlug = req.nextUrl.searchParams.get("courseSlug") || undefined;
    const entitlements = getMentorshipEntitlements(studentId, courseSlug);
    const availableSessions = getAvailableMentorshipSessions(studentId, courseSlug);

    const includedCourses = [
      ...new Set(entitlements.flatMap((entitlement) => entitlement.includedCourseSlugs)),
    ];
    // Surface the requested course first when one is supplied.
    if (courseSlug && includedCourses.includes(courseSlug)) {
      includedCourses.sort((a, b) =>
        a === courseSlug ? -1 : b === courseSlug ? 1 : a.localeCompare(b)
      );
    }
    const slotsByCourse = includedCourses.map((slug) => ({
      courseSlug: slug,
      slots: getUnifiedMentorshipSlots(slug),
    }));

    return NextResponse.json({
      ok: true,
      availableSessions,
      upgradeRequired: availableSessions <= 0,
      entitlements,
      bookings: getUnifiedMentorshipBookings(studentId, courseSlug),
      slotsByCourse,
      access: getUnifiedAccessSummary(studentId),
      upgradeCta: {
        label: "Get a Mentorship Pack",
        href: "/prepmeup/pricing",
      },
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load mentorship entitlements." },
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
        { ok: false, error: "Authentication required." },
        { status: 401 }
      );
    }

    const studentId = identity.canonicalId;
    const body = await req.json().catch(() => ({}));
    const action = body?.action;

    if (action === "book") {
      const courseSlug = typeof body.courseSlug === "string" ? body.courseSlug : "";
      const slotId = typeof body.slotId === "string" ? body.slotId : "";
      if (!courseSlug || !slotId) {
        return NextResponse.json(
          { ok: false, error: "courseSlug and slotId are required." },
          { status: 400 }
        );
      }

      const result = bookUnifiedMentorshipSession({
        userId: studentId,
        courseSlug,
        slotId,
        notes: typeof body.notes === "string" ? body.notes.slice(0, 500) : undefined,
      });

      if (!result.success) {
        return NextResponse.json(
          {
            ok: false,
            upgradeRequired: Boolean(result.upgradeRequired),
            error: result.error,
            upgradeCta: result.upgradeRequired
              ? { label: "Get a Mentorship Pack", href: "/prepmeup/pricing" }
              : undefined,
          },
          { status: result.upgradeRequired ? 403 : 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        booking: result.booking,
        bookings: getUnifiedMentorshipBookings(studentId, courseSlug),
        availableSessions: getAvailableMentorshipSessions(studentId, courseSlug),
      });
    }

    if (action === "cancel" || action === "complete" || action === "reschedule") {
      const bookingId = typeof body.bookingId === "string" ? body.bookingId : "";
      if (!bookingId) {
        return NextResponse.json(
          { ok: false, error: "bookingId is required." },
          { status: 400 }
        );
      }

      let result;
      if (action === "cancel") {
        result = cancelUnifiedMentorshipBooking(studentId, bookingId);
      } else if (action === "complete") {
        result = completeUnifiedMentorshipBooking(studentId, bookingId);
      } else {
        const slotId = typeof body.slotId === "string" ? body.slotId : "";
        if (!slotId) {
          return NextResponse.json(
            { ok: false, error: "slotId is required for rescheduling." },
            { status: 400 }
          );
        }
        result = rescheduleUnifiedMentorshipBooking({
          userId: studentId,
          bookingId,
          slotId,
        });
      }

      if (!result.success) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        booking: result.booking,
        bookings: getUnifiedMentorshipBookings(studentId),
        availableSessions: getAvailableMentorshipSessions(studentId),
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid mentorship action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process mentorship action." },
      { status: 500 }
    );
  }
}
