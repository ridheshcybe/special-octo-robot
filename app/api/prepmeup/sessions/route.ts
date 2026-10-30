import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import fs from "fs";
import path from "path";
import { DEFAULT_CALENDAR_SLOTS, type CalendarSlot, type AdminSession } from "@/app/api/prepmeup/admin/manage/route";

function getStateFilePath(): string {
  return path.join(process.cwd(), "deploy", "cms", "admin_state.json");
}

function loadStateData() {
  try {
    const p = getStateFilePath();
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
      return {
        calendarSlots: (parsed.calendarSlots || DEFAULT_CALENDAR_SLOTS) as CalendarSlot[],
        sessions: (parsed.sessions || []) as AdminSession[],
        settings: parsed.settings || {},
      };
    }
  } catch {}
  return {
    calendarSlots: DEFAULT_CALENDAR_SLOTS,
    sessions: [],
    settings: {},
  };
}

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("pmu-session")?.value;
    const { calendarSlots, sessions, settings } = loadStateData();

    // Filter active slots for student calendar view
    const activeSlots = calendarSlots.filter((s) => s.isActive);

    let studentSessions: AdminSession[] = [];
    let studentTier = "guest";
    let studentName = "";
    let studentPhone = "";

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        studentTier = parsed.tier || "tier1";
        studentName = parsed.fullName || "";
        studentPhone = parsed.phone || "";

        // Find all sessions matching user's phone or name
        studentSessions = sessions.filter((s) => {
          if (studentPhone && s.whatsapp && s.whatsapp.replace(/\D/g, "").slice(-10) === studentPhone.replace(/\D/g, "").slice(-10)) {
            return true;
          }
          if (studentName && s.studentName && s.studentName.toLowerCase() === studentName.toLowerCase()) {
            return true;
          }
          return false;
        });
      } catch {}
    }

    return NextResponse.json({
      ok: true,
      activeSlots,
      studentSessions,
      studentTier,
      tier3Price: settings.tier3Price || 499,
      tier2Price: settings.tier2Price || 199,
      tier1Price: settings.tier1Price || 99,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to load calendar schedule." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("pmu-session")?.value;
    const body = await req.json().catch(() => ({}));

    let studentName = body.fullName || body.studentName || "Engineering Student";
    let whatsapp = body.whatsapp || body.whatsappNumber || "+919820743178";
    let tier = body.tier || "tier3";
    let email = body.email || "";

    if (sessionCookie) {
      try {
        const parsed = JSON.parse(sessionCookie);
        if (parsed.fullName) studentName = parsed.fullName;
        if (parsed.phone) whatsapp = parsed.phone;
        if (parsed.email) email = parsed.email;
        if (parsed.tier) tier = parsed.tier;
      } catch {}
    }

    const {
      slotId,
      date = new Date().toISOString().slice(0, 10),
      time = "Flexible",
      topic = "1:1 Live Mentorship & Doubts",
      notes = "",
    } = body;

    const { calendarSlots, sessions, settings } = loadStateData();
    const selectedSlot = calendarSlots.find((s) => s.id === slotId);

    const slotLabel = selectedSlot
      ? `${selectedSlot.dayOfWeek}, ${selectedSlot.timeSlot} (${selectedSlot.mentorName})`
      : `${date} • ${time}`;

    const meetUrl = selectedSlot?.meetUrl || "https://meet.google.com/pmu-vip-room";

    const newSession: AdminSession = {
      id: `sess-${Date.now()}`,
      studentName,
      whatsapp,
      tier: tier === "tier1" ? "tier1" : tier === "tier2" ? "tier2" : "tier3",
      topic,
      slot: slotLabel,
      date,
      time: selectedSlot ? selectedSlot.timeSlot : time,
      status: "scheduled",
      meetUrl,
      notes: notes || `Student booked via Interactive Calendar Scheduler. Priority Tier: ${tier.toUpperCase()}`,
      updatedAt: new Date().toISOString(),
    };

    // Save to admin state
    try {
      const p = getStateFilePath();
      let stateObj: any = {};
      if (fs.existsSync(p)) {
        stateObj = JSON.parse(fs.readFileSync(p, "utf-8"));
      }
      if (!stateObj.sessions) stateObj.sessions = [];
      stateObj.sessions.unshift(newSession);

      // Record activity
      if (!stateObj.activities) stateObj.activities = [];
      stateObj.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        collection: "1:1 Mentorship",
        itemTitle: `${studentName} — ${topic}`,
        action: "created",
        details: `Booked via Student Calendar for slot: ${slotLabel}`,
        author: studentName,
      });

      fs.mkdirSync(path.dirname(p), { recursive: true });
      fs.writeFileSync(p, JSON.stringify(stateObj, null, 2), "utf-8");
    } catch (saveErr) {
      console.warn("[Session Book Error]:", saveErr);
    }

    return NextResponse.json({
      ok: true,
      message: "1:1 Live Mentorship session successfully booked!",
      session: newSession,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err.message || "Failed to schedule session." },
      { status: 500 }
    );
  }
}
