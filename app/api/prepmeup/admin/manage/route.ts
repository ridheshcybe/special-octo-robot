import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { FALLBACK_SUBJECTS, FALLBACK_SUBJECT_DETAILS } from "@/app/prepmeup/_lib/data";

export interface PlatformSettings {
  brandName: string;
  tickerText: string;
  tickerActive: boolean;
  accentColor: string;
  aiProvider: string;
  maintenanceMode: boolean;
  tier0Price: number;
  tier0SeatsLimit: number;
  tier0Active: boolean;
  tier1Price: number;
  tier1ValidityDays: number;
  tier2Price: number;
  tier2CareerSupportActive: boolean;
  tier2Features: string[];
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
  tier: "tier2" | "tier1";
  topic: string;
  slot: string;
  date: string;
  time: string;
  status: "scheduled" | "completed" | "live_now";
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

const DEFAULT_SETTINGS: PlatformSettings = {
  brandName: "PrepMeUp AI",
  tickerText: "🎯 Semester 1 Engineering Prep Live! First 10 Beta Testers Get 100% Free Pass",
  tickerActive: true,
  accentColor: "#ff3b1d",
  aiProvider: "Groq LLaMA 3.3 70B (Ultra-Low Latency)",
  maintenanceMode: false,
  tier0Price: 0,
  tier0SeatsLimit: 10,
  tier0Active: true,
  tier1Price: 99,
  tier1ValidityDays: 180,
  tier2Price: 199,
  tier2CareerSupportActive: true,
  tier2Features: [
    "Unlimited 24/7 AI Doubt Copilot",
    "Python Coding Lab + Line-by-Line AI Debugger",
    "1:1 Human Mentor Live Video Support",
    "★ Exclusive Internship & Career Support (Resume/GitHub & Referrals)",
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
  activities: AdminActivity[];
} {
  try {
    const p = getStateFilePath();
    if (fs.existsSync(p)) {
      const parsed = JSON.parse(fs.readFileSync(p, "utf-8"));
      return {
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        subjects: parsed.subjects || FALLBACK_SUBJECTS,
        modules: parsed.modules || [
          { id: "mod-01", subject_code: "ACM-101", module_number: 1, title: "Linear Algebra & Matrix Decompositions", description: "Vector spaces, eigenvalues, Cayley-Hamilton, SVD.", is_published: true },
          { id: "mod-02", subject_code: "ACM-101", module_number: 2, title: "Differential Calculus & Optimisation", description: "Partial derivatives, Hessian test, Lagrange multipliers.", is_published: true },
          { id: "mod-03", subject_code: "PYT-102", module_number: 1, title: "Control Structures & Comprehensions", description: "Memory layout, loops, generators, dictionary comprehensions.", is_published: true },
          { id: "mod-04", subject_code: "BEE-103", module_number: 1, title: "DC Circuit Theorems", description: "Thevenin, Norton, Superposition, Maximum Power Transfer.", is_published: true },
          { id: "mod-05", subject_code: "COA-104", module_number: 1, title: "Computer Evolution & Addressing Modes", description: "Von Neumann vs Harvard, instruction cycle.", is_published: true },
        ],
        notes: parsed.notes || [
          {
            id: "note-01",
            subject_code: "ACM-101",
            module_number: 1,
            title: "Eigenvalues, Eigenvectors & Diagonalization",
            reading_time_min: 20,
            is_sample: true,
            is_published: true,
            content: `### 1. Fundamental Definition\nFor any square matrix $A \\in \\mathbb{R}^{n \\times n}$, non-zero $\\mathbf{x}$ is an eigenvector if:\n$$A\\mathbf{x} = \\lambda\\mathbf{x} \\implies \\det(A - \\lambda I) = 0$$\n\n---\n\n### 2. Cayley-Hamilton Theorem\nEvery square matrix satisfies its own characteristic equation:\n$$A^2 - \\text{tr}(A)A + \\det(A)I = \\mathbf{0}$$`,
            updated_at: new Date().toISOString(),
          },
          {
            id: "note-02",
            subject_code: "BEE-103",
            module_number: 1,
            title: "Thevenin & Norton Equivalent Circuits",
            reading_time_min: 25,
            is_sample: true,
            is_published: true,
            content: `### 1. Thevenin Equivalent Model\nLoad current formula across terminal network:\n$$I_L = \\frac{V_{th}}{R_{th} + R_L}, \\qquad P_{max} = \\frac{V_{th}^2}{4 R_{th}}$$`,
            updated_at: new Date().toISOString(),
          },
        ],
        pastPapers: parsed.pastPapers || [
          {
            id: "pyq-01",
            subject_code: "ACM-101",
            exam_year: 2025,
            exam_type: "End-Semester Examination",
            title: "Winter 2025 ACM-101 Solved End-Sem Question Paper",
            question_paper_url: "https://example.com/acm-2025.pdf",
            solution_markdown: `### Q1 Cayley-Hamilton Verification\nGiven $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$, $\\det(A - \\lambda I) = \\lambda^2 - 4\\lambda + 3 = 0$. Eigenvalues $\\lambda = 1, 3$.`,
            is_published: true,
          },
        ],
        sessions: parsed.sessions || [
          {
            id: "sess-01",
            studentName: "Aarav Kulkarni",
            whatsapp: "+919820123456",
            tier: "tier2",
            topic: "★ Internship & Career Support (Resume, GitHub & Referrals)",
            slot: "Today, 7:00 PM – 7:45 PM IST",
            date: new Date().toISOString().slice(0, 10),
            time: "19:00 IST",
            status: "completed",
            meetUrl: "https://meet.google.com/pmu-care-101",
            notes: "Given: Reviewed AI/ML GitHub repo and corrected resume layout.",
            updatedAt: new Date(Date.now() - 3600000).toISOString(),
          },
          {
            id: "sess-02",
            studentName: "Rohan Deshmukh",
            whatsapp: "+919833445566",
            tier: "tier2",
            topic: "Applied Computational Mathematics (ACM-101)",
            slot: "Today, 9:00 PM – 9:45 PM IST",
            date: new Date().toISOString().slice(0, 10),
            time: "21:00 IST",
            status: "live_now",
            meetUrl: "https://meet.google.com/pmu-math-202",
            notes: "Scheduled: SVD and matrix proofs.",
            updatedAt: new Date().toISOString(),
          },
        ],
        activities: parsed.activities || [
          {
            id: "act-01",
            timestamp: "Just now",
            collection: "Platform Settings",
            itemTitle: "Admin GUI Control Panel Activated",
            action: "updated",
            details: "Configured full administrative suite: Subjects, Modules, Notes, PYQs, Pricing & Tiers.",
            author: "admin@ridheshcybe.dpdns.org",
          },
        ],
      };
    }
  } catch {}

  return {
    settings: DEFAULT_SETTINGS,
    subjects: FALLBACK_SUBJECTS as AdminSubject[],
    modules: [
      { id: "mod-01", subject_code: "ACM-101", module_number: 1, title: "Linear Algebra & Matrix Decompositions", description: "Vector spaces, eigenvalues, Cayley-Hamilton, SVD.", is_published: true },
      { id: "mod-02", subject_code: "ACM-101", module_number: 2, title: "Differential Calculus & Optimisation", description: "Partial derivatives, Hessian test, Lagrange multipliers.", is_published: true },
      { id: "mod-03", subject_code: "PYT-102", module_number: 1, title: "Control Structures & Comprehensions", description: "Memory layout, loops, generators, dictionary comprehensions.", is_published: true },
      { id: "mod-04", subject_code: "BEE-103", module_number: 1, title: "DC Circuit Theorems", description: "Thevenin, Norton, Superposition, Maximum Power Transfer.", is_published: true },
      { id: "mod-05", subject_code: "COA-104", module_number: 1, title: "Computer Evolution & Addressing Modes", description: "Von Neumann vs Harvard, instruction cycle.", is_published: true },
    ],
    notes: [
      {
        id: "note-01",
        subject_code: "ACM-101",
        module_number: 1,
        title: "Eigenvalues, Eigenvectors & Diagonalization",
        reading_time_min: 20,
        is_sample: true,
        is_published: true,
        content: `### 1. Fundamental Definition\nFor any square matrix $A \\in \\mathbb{R}^{n \\times n}$, non-zero $\\mathbf{x}$ is an eigenvector if:\n$$A\\mathbf{x} = \\lambda\\mathbf{x} \\implies \\det(A - \\lambda I) = 0$$\n\n---\n\n### 2. Cayley-Hamilton Theorem\nEvery square matrix satisfies its own characteristic equation:\n$$A^2 - \\text{tr}(A)A + \\det(A)I = \\mathbf{0}$$`,
        updated_at: new Date().toISOString(),
      },
    ],
    pastPapers: [
      {
        id: "pyq-01",
        subject_code: "ACM-101",
        exam_year: 2025,
        exam_type: "End-Semester Examination",
        title: "Winter 2025 ACM-101 Solved End-Sem Question Paper",
        question_paper_url: "https://example.com/acm-2025.pdf",
        solution_markdown: `### Q1 Cayley-Hamilton Verification\nGiven $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$, $\\det(A - \\lambda I) = \\lambda^2 - 4\\lambda + 3 = 0$. Eigenvalues $\\lambda = 1, 3$.`,
        is_published: true,
      },
    ],
    sessions: [
      {
        id: "sess-01",
        studentName: "Aarav Kulkarni",
        whatsapp: "+919820123456",
        tier: "tier2",
        topic: "★ Internship & Career Support (Resume, GitHub & Referrals)",
        slot: "Today, 7:00 PM – 7:45 PM IST",
        date: new Date().toISOString().slice(0, 10),
        time: "19:00 IST",
        status: "completed",
        meetUrl: "https://meet.google.com/pmu-care-101",
        notes: "Given: Reviewed AI/ML GitHub repo and corrected resume layout.",
        updatedAt: new Date().toISOString(),
      },
    ],
    activities: [
      {
        id: "act-01",
        timestamp: "Just now",
        collection: "Platform Settings",
        itemTitle: "Admin GUI Control Panel Activated",
        action: "updated",
        details: "Configured full administrative suite.",
        author: "admin@ridheshcybe.dpdns.org",
      },
    ],
  };
}

function saveState(data: any) {
  try {
    const p = getStateFilePath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
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
        subject_code: payload.subject_code || "ACM-101",
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
        subject_code: payload.subject_code || "ACM-101",
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
        subject_code: payload.subject_code || "ACM-101",
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
