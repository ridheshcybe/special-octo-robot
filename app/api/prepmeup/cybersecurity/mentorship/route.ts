import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import {
  CYBER_COURSE_SLUG,
  bookCyberMentorshipSession,
  cancelCyberMentorshipBooking,
  completeCyberMentorshipBooking,
  getCyberMentorshipBookings,
  getCyberMentorshipSlots,
  rescheduleCyberMentorshipBooking,
} from "@/app/prepmeup/_lib/cyberStore";
import { canBookCyberMentorship, getCyberAccessSummary } from "@/lib/prepmeup/access";

export const dynamic = "force-dynamic";

export async function GET() {
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
    const summary = getCyberAccessSummary(studentId, CYBER_COURSE_SLUG);

    return NextResponse.json({
      ok: true,
      summary,
      slots: summary.canBookMentorship ? getCyberMentorshipSlots() : [],
      bookings: getCyberMentorshipBookings(studentId),
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load CyberSecurity mentorship data." },
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
    const action = body.action;

    if (action === "book") {
      if (!canBookCyberMentorship(studentId, CYBER_COURSE_SLUG)) {
        return NextResponse.json(
          {
            ok: false,
            upgradeRequired: true,
            error:
              "No unused CyberSecurity mentorship entitlement. Purchase a Mentorship Pack or Semester Pass.",
          },
          { status: 403 }
        );
      }

      if (!body.slotId || typeof body.slotId !== "string") {
        return NextResponse.json(
          { ok: false, error: "A mentorship slot is required." },
          { status: 400 }
        );
      }

      const result = bookCyberMentorshipSession({
        userId: studentId,
        slotId: body.slotId,
        notes: typeof body.notes === "string" ? body.notes.slice(0, 500) : undefined,
      });

      if (!result.success) {
        return NextResponse.json(
          { ok: false, upgradeRequired: Boolean(result.upgradeRequired), error: result.error },
          { status: result.upgradeRequired ? 403 : 400 }
        );
      }

      return NextResponse.json({
        ok: true,
        booking: result.booking,
        summary: getCyberAccessSummary(studentId, CYBER_COURSE_SLUG),
      });
    }

    if (action === "cancel" || action === "complete" || action === "reschedule") {
      if (!body.bookingId || typeof body.bookingId !== "string") {
        return NextResponse.json(
          { ok: false, error: "A booking id is required." },
          { status: 400 }
        );
      }

      let result;
      if (action === "cancel") {
        result = cancelCyberMentorshipBooking(studentId, body.bookingId);
      } else if (action === "complete") {
        result = completeCyberMentorshipBooking(studentId, body.bookingId);
      } else {
        if (!body.slotId || typeof body.slotId !== "string") {
          return NextResponse.json(
            { ok: false, error: "A target slot is required for rescheduling." },
            { status: 400 }
          );
        }
        result = rescheduleCyberMentorshipBooking({
          userId: studentId,
          bookingId: body.bookingId,
          slotId: body.slotId,
        });
      }

      if (!result.success) {
        return NextResponse.json({ ok: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        ok: true,
        booking: result.booking,
        summary: getCyberAccessSummary(studentId, CYBER_COURSE_SLUG),
        bookings: getCyberMentorshipBookings(studentId),
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid mentorship action." }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process CyberSecurity mentorship action." },
      { status: 500 }
    );
  }
}
