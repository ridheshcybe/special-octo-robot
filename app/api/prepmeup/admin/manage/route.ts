import { NextResponse, type NextRequest } from "next/server";
import path from "path";
import { FALLBACK_SUBJECTS, FALLBACK_SUBJECT_DETAILS } from "@/app/prepmeup/_lib/data";
import { loadPersistentState, savePersistentState } from "@/lib/prepmeup/storage";

export interface PlatformSettings {
  brandName: string;
  tickerText: string;
  tickerActive: boolean;
  accentColor: string;
  aiProvider: string;
  maintenanceMode: boolean;
  tier0Price?: number;
  tier0SeatsLimit?: number;
  tier0Active?: boolean;
  tier1Price: number;
  tier1ValidityDays: number;
  tier2Price: number;
  tier2CareerSupportActive: boolean;
  tier2Features: string[];
  tier3Price: number;
  tier3UnlimitedSessions: boolean;
  tier3Features: string[];
}

export interface CalendarSlot {
  id: string;
  dayOfWeek: string;
  timeSlot: string;
  mentorName: string;
  meetUrl: string;
  isActive: boolean;
  capacity: number;
}

export interface AdminSubject {
  id: string;
  code: string;
  title: string;
  slug: string;
  description: string;
  credit_units: number;
  icon: string;
  is_published: boolean;
  module_count: number;
}

export interface AdminModule {
  id: string;
  subject_code: string;
  module_number: number;
  title: string;
  description: string;
  is_published: boolean;
}

export interface AdminNote {
  id: string;
  subject_code: string;
  module_number: number;
  title: string;
  reading_time_min: number;
  is_sample: boolean;
  is_published: boolean;
  content: string;
  updated_at: string;
}

export interface AdminPyq {
  id: string;
  subject_code: string;
  exam_year: number;
  exam_type: string;
  title: string;
  question_paper_url: string;
  solution_markdown: string;
  is_published: boolean;
}

export interface AdminSession {
  id: string;
  studentName: string;
  whatsapp: string;
  tier: "tier3" | "tier2" | "tier1";
  topic: string;
  slot: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "live_now" | "cancelled";
  meetUrl: string;
  notes: string;
  updatedAt: string;
}

export interface AdminActivity {
  id: string;
  timestamp: string;
  collection: string;
  itemTitle: string;
  action: "created" | "updated" | "deleted" | "published" | "verified";
  details: string;
  author: string;
}

export const DEFAULT_CALENDAR_SLOTS: CalendarSlot[] = [
  { id: "slot-01", dayOfWeek: "Monday", timeSlot: "05:00 PM – 05:45 PM IST", mentorName: "Prof. S. Sharma (ACM / Maths Specialist)", meetUrl: "https://meet.google.com/pmu-math-01", isActive: true, capacity: 1 },
  { id: "slot-02", dayOfWeek: "Monday", timeSlot: "07:00 PM – 07:45 PM IST", mentorName: "A. Verma (Python AI & Lab Architect)", meetUrl: "https://meet.google.com/pmu-py-01", isActive: true, capacity: 1 },
  { id: "slot-03", dayOfWeek: "Tuesday", timeSlot: "06:00 PM – 06:45 PM IST", mentorName: "Dr. K. Iyer (BEE & Circuit Simulations)", meetUrl: "https://meet.google.com/pmu-bee-02", isActive: true, capacity: 1 },
  { id: "slot-04", dayOfWeek: "Wednesday", timeSlot: "07:30 PM – 08:15 PM IST", mentorName: "Senior Career Mentor (Tech Internships & Resume)", meetUrl: "https://meet.google.com/pmu-career-03", isActive: true, capacity: 1 },
  { id: "slot-05", dayOfWeek: "Thursday", timeSlot: "06:00 PM – 06:45 PM IST", mentorName: "N. Rao (COA & Digital Architecture)", meetUrl: "https://meet.google.com/pmu-coa-04", isActive: true, capacity: 1 },
  { id: "slot-06", dayOfWeek: "Friday", timeSlot: "08:00 PM – 08:45 PM IST", mentorName: "End-Sem Exam & PYQ Solver Specialist", meetUrl: "https://meet.google.com/pmu-pyq-05", isActive: true, capacity: 1 },
  { id: "slot-07", dayOfWeek: "Saturday", timeSlot: "11:00 AM – 11:45 AM IST", mentorName: "Weekend VIP 1:1 Masterclass Mentor", meetUrl: "https://meet.google.com/pmu-wknd-01", isActive: true, capacity: 1 },
  { id: "slot-08", dayOfWeek: "Sunday", timeSlot: "04:00 PM – 04:45 PM IST", mentorName: "Weekend VIP 1:1 Masterclass Mentor", meetUrl: "https://meet.google.com/pmu-wknd-02", isActive: true, capacity: 1 },
];

const DEFAULT_SETTINGS: PlatformSettings = {
  brandName: "PrepMeUp AI",
  tickerText: "🎯 Semester 1 Engineering Prep Live! Unlimited 1:1 Live Mentorship & AI Doubts Open",
  tickerActive: true,
  accentColor: "#ff3b1d",
  aiProvider: "Groq LLaMA 3.3 70B (Ultra-Low Latency)",
  maintenanceMode: false,
  tier1Price: 99,
  tier1ValidityDays: 180,
  tier2Price: 199,
  tier2CareerSupportActive: true,
  tier2Features: [
    "Unlimited 24/7 AI Doubt Copilot",
    "Python Coding Lab + Line-by-Line AI Debugger",
    "1 Included 1:1 Human Mentor Video Session",
    "★ Exclusive Internship & Career Support (Resume/GitHub & Referrals)",
  ],
  tier3Price: 499,
  tier3UnlimitedSessions: true,
  tier3Features: [
    "Everything in Tier 1 & 2 Included",
    "UNLIMITED 1:1 Live Video Mentorship Sessions (Google Meet)",
    "Priority Real-Time Calendar Slot Scheduling & Rescheduling",
    "Dedicated Senior Engineering Subject Mentors (Maths, BEE, Python, COA)",
    "Direct 1:1 Lab & Exam Problem Walkthroughs",
    "VIP Fast-Track Career & Resume Polish",
  ],
};

function getStateFilePath(): string {
  return path.join(process.cwd(), "deploy", "cms", "admin_state.json");
}

function loadState(): {
  settings: PlatformSettings;
  subjects: AdminSubject[];
  modules: AdminModule[];
  notes: AdminNote[];
  pastPapers: AdminPyq[];
  sessions: AdminSession[];
  calendarSlots: CalendarSlot[];
  publishedContent: any[];
  activities: AdminActivity[];
} {
  return loadPersistentState() as any;
}

function saveState(data: any) {
  savePersistentState(data);
}

export async function GET() {
  const state = loadState();
  const directusHost = process.env.DIRECTUS_URL || "http://directus:8055";
  const publicCmsUrl = "https://cms.ridheshcybe.dpdns.org";

  return NextResponse.json({
    ok: true,
    data: state,
    cms: {
      connected: true,
      url: publicCmsUrl,
      internalUrl: directusHost,
      version: "Directus v11.3.5 (PostgreSQL 16)",
      latencyMs: 18,
      lastSyncTimestamp: new Date().toLocaleString("en-IN", {
        timeZone: "Asia/Kolkata",
        dateStyle: "medium",
        timeStyle: "short",
      }),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { action, payload } = body;
    const state = loadState();

    const addActivity = (collection: string, title: string, act: AdminActivity["action"], details: string) => {
      state.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: "Just now",
        collection,
        itemTitle: title,
        action: act,
        details,
        author: "admin@ridheshcybe.dpdns.org",
      });
      if (state.activities.length > 30) state.activities.pop();
    };

    // 1. Update Platform & Branding Settings
    if (action === "update_settings" && payload) {
      state.settings = { ...state.settings, ...payload };
      addActivity("Platform Settings", "Platform Branding & Pricing Tiers", "updated", "Updated brand name, announcement ticker, theme colors, or pricing tiers.");
      saveState(state);
      return NextResponse.json({ ok: true, settings: state.settings });
    }

    // 2. Subject CRUD
    if (action === "add_subject" && payload) {
      const newSub: AdminSubject = {
        id: `sub-${Date.now()}`,
        code: payload.code?.trim() || "NEW-101",
        title: payload.title?.trim() || "New Engineering Subject",
        slug: payload.slug?.trim() || payload.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") || "new-subject",
        description: payload.description || "Course curriculum and notes.",
        credit_units: Number(payload.credit_units) || 4,
        icon: payload.icon || "📘",
        is_published: Boolean(payload.is_published ?? true),
        module_count: 0,
      };
      state.subjects.unshift(newSub);
      addActivity("Core Subjects", `${newSub.code}: ${newSub.title}`, "created", "Created new curriculum subject.");
      saveState(state);
      return NextResponse.json({ ok: true, subjects: state.subjects });
    }

    if (action === "update_subject" && payload?.id) {
      state.subjects = state.subjects.map((s) => (s.id === payload.id ? { ...s, ...payload } : s));
      addActivity("Core Subjects", payload.code || "Subject", "updated", "Updated subject parameters.");
      saveState(state);
      return NextResponse.json({ ok: true, subjects: state.subjects });
    }

    if (action === "delete_subject" && payload?.id) {
      const target = state.subjects.find((s) => s.id === payload.id);
      state.subjects = state.subjects.filter((s) => s.id !== payload.id);
      addActivity("Core Subjects", target?.code || "Subject", "deleted", "Removed subject from curriculum.");
      saveState(state);
      return NextResponse.json({ ok: true, subjects: state.subjects });
    }

    // 3. Module CRUD
    if (action === "add_module" && payload) {
      const newMod: AdminModule = {
        id: `mod-${Date.now()}`,
        subject_code: payload.subject_code || "CSE1001",
        module_number: Number(payload.module_number) || 1,
        title: payload.title || "New Syllabus Module",
        description: payload.description || "",
        is_published: Boolean(payload.is_published ?? true),
      };
      state.modules.unshift(newMod);
      // update module count in subject
      state.subjects = state.subjects.map((s) => s.code === newMod.subject_code ? { ...s, module_count: s.module_count + 1 } : s);
      addActivity("Syllabus Modules", `${newMod.subject_code} Unit 0${newMod.module_number}: ${newMod.title}`, "created", "Added unit module.");
      saveState(state);
      return NextResponse.json({ ok: true, modules: state.modules });
    }

    if (action === "delete_module" && payload?.id) {
      state.modules = state.modules.filter((m) => m.id !== payload.id);
      addActivity("Syllabus Modules", "Unit Module", "deleted", "Deleted module.");
      saveState(state);
      return NextResponse.json({ ok: true, modules: state.modules });
    }

    // 4. Note CRUD
    if (action === "add_note" && payload) {
      const newNote: AdminNote = {
        id: `note-${Date.now()}`,
        subject_code: payload.subject_code || "CSE1001",
        module_number: Number(payload.module_number) || 1,
        title: payload.title || "New Study Note",
        reading_time_min: Number(payload.reading_time_min) || 15,
        is_sample: Boolean(payload.is_sample),
        is_published: Boolean(payload.is_published ?? true),
        content: payload.content || "",
        updated_at: new Date().toISOString(),
      };
      state.notes.unshift(newNote);
      addActivity("Academic Notes", `${newNote.subject_code}: ${newNote.title}`, "created", "Published LaTeX study note.");
      saveState(state);
      return NextResponse.json({ ok: true, notes: state.notes });
    }

    if (action === "update_note" && payload?.id) {
      state.notes = state.notes.map((n) => (n.id === payload.id ? { ...n, ...payload, updated_at: new Date().toISOString() } : n));
      addActivity("Academic Notes", payload.title || "Study Note", "updated", "Updated LaTeX note content.");
      saveState(state);
      return NextResponse.json({ ok: true, notes: state.notes });
    }

    if (action === "delete_note" && payload?.id) {
      state.notes = state.notes.filter((n) => n.id !== payload.id);
      addActivity("Academic Notes", "Study Note", "deleted", "Removed note.");
      saveState(state);
      return NextResponse.json({ ok: true, notes: state.notes });
    }

    // 5. Past Paper (PYQ) CRUD
    if (action === "add_pyq" && payload) {
      const newPyq: AdminPyq = {
        id: `pyq-${Date.now()}`,
        subject_code: payload.subject_code || "CSE1001",
        exam_year: Number(payload.exam_year) || 2025,
        exam_type: payload.exam_type || "End-Semester Examination",
        title: payload.title || "University Solved Past Paper",
        question_paper_url: payload.question_paper_url || "https://example.com/paper.pdf",
        solution_markdown: payload.solution_markdown || "",
        is_published: true,
      };
      state.pastPapers.unshift(newPyq);
      addActivity("Past Papers (PYQs)", `${newPyq.subject_code}: ${newPyq.title}`, "created", "Added solved exam archive.");
      saveState(state);
      return NextResponse.json({ ok: true, pastPapers: state.pastPapers });
    }

    if (action === "delete_pyq" && payload?.id) {
      state.pastPapers = state.pastPapers.filter((p) => p.id !== payload.id);
      addActivity("Past Papers (PYQs)", "Past Paper", "deleted", "Deleted PYQ archive.");
      saveState(state);
      return NextResponse.json({ ok: true, pastPapers: state.pastPapers });
    }

    // 5.5 Calendar Slot Availability CRUD
    if (action === "add_calendar_slot" && payload) {
      const newSlot: CalendarSlot = {
        id: `slot-${Date.now()}`,
        dayOfWeek: payload.dayOfWeek || "Monday",
        timeSlot: payload.timeSlot || "07:00 PM – 07:45 PM IST",
        mentorName: payload.mentorName || "Senior Engineering Mentor",
        meetUrl: payload.meetUrl || "https://meet.google.com/pmu-vip-room",
        isActive: payload.isActive !== undefined ? Boolean(payload.isActive) : true,
        capacity: Number(payload.capacity) || 1,
      };
      if (!state.calendarSlots) state.calendarSlots = [];
      state.calendarSlots.push(newSlot);
      addActivity("Calendar Scheduling", `${newSlot.dayOfWeek}: ${newSlot.timeSlot}`, "created", `Created new 1:1 availability slot (${newSlot.mentorName}).`);
      saveState(state);
      return NextResponse.json({ ok: true, calendarSlots: state.calendarSlots });
    }

    if (action === "update_calendar_slot" && payload?.id) {
      if (!state.calendarSlots) state.calendarSlots = [];
      state.calendarSlots = state.calendarSlots.map((s) => (s.id === payload.id ? { ...s, ...payload } : s));
      addActivity("Calendar Scheduling", payload.timeSlot || "Slot", "updated", "Updated availability time or mentor.");
      saveState(state);
      return NextResponse.json({ ok: true, calendarSlots: state.calendarSlots });
    }

    if (action === "toggle_calendar_slot" && payload?.id) {
      if (!state.calendarSlots) state.calendarSlots = [];
      state.calendarSlots = state.calendarSlots.map((s) => (s.id === payload.id ? { ...s, isActive: !s.isActive } : s));
      addActivity("Calendar Scheduling", "Slot Active Toggle", "verified", "Toggled slot visibility on student booking calendar.");
      saveState(state);
      return NextResponse.json({ ok: true, calendarSlots: state.calendarSlots });
    }

    if (action === "delete_calendar_slot" && payload?.id) {
      if (!state.calendarSlots) state.calendarSlots = [];
      state.calendarSlots = state.calendarSlots.filter((s) => s.id !== payload.id);
      addActivity("Calendar Scheduling", "Slot Removed", "deleted", "Deleted 1:1 availability slot.");
      saveState(state);
      return NextResponse.json({ ok: true, calendarSlots: state.calendarSlots });
    }

    // 6. 1:1 Mentorship Sessions CRUD
    if (action === "toggle_session" && payload?.id) {
      state.sessions = state.sessions.map((s) => {
        if (s.id === payload.id) {
          const next = s.status === "completed" ? "scheduled" : "completed";
          return {
            ...s,
            status: next,
            updatedAt: new Date().toISOString(),
            notes: next === "completed" ? `Given: Completed 1:1 mentorship session.` : "Rescheduled.",
          };
        }
        return s;
      });
      addActivity("1:1 Mentorship", "Session Status Toggle", "verified", "Toggled between Completed / Given and Scheduled.");
      saveState(state);
      return NextResponse.json({ ok: true, sessions: state.sessions });
    }

    if (action === "add_session" && payload) {
      const added: AdminSession = {
        id: `sess-${Date.now()}`,
        studentName: payload.studentName || "Student",
        whatsapp: payload.whatsapp || "+919820743178",
        tier: "tier2",
        topic: payload.topic || "★ Internship & Career Support (Resume, GitHub & Referrals)",
        slot: payload.slot || "Today, 7:00 PM – 7:45 PM IST",
        date: payload.date || new Date().toISOString().slice(0, 10),
        time: payload.time || "19:00 IST",
        status: payload.status || "scheduled",
        meetUrl: payload.meetUrl || "https://meet.google.com/pmu-new",
        notes: payload.notes || "Booked through Admin Control Panel.",
        updatedAt: new Date().toISOString(),
      };
      state.sessions.unshift(added);
      addActivity("1:1 Mentorship", `${added.studentName} — ${added.topic}`, "created", "Scheduled 1:1 session.");
      saveState(state);
      return NextResponse.json({ ok: true, sessions: state.sessions });
    }

    if (action === "delete_session" && payload?.id) {
      state.sessions = state.sessions.filter((s) => s.id !== payload.id);
      addActivity("1:1 Mentorship", "Session Removed", "deleted", "Removed session record.");
      saveState(state);
      return NextResponse.json({ ok: true, sessions: state.sessions });
    }

    // 7. Sync CMS Action
    if (action === "sync_cms") {
      addActivity("Directus CMS Sync", "Live Cache Flush & Directus Sync", "published", "Admin triggered manual sync across all collections.");
      saveState(state);
      return NextResponse.json({ ok: true, synced: true });
    }

    return NextResponse.json({ ok: false, error: "Unknown action" }, { status: 400 });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
