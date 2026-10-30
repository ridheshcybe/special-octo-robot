import fs from "fs";
import path from "path";
import { FALLBACK_SUBJECTS } from "@/app/prepmeup/_lib/data";
import { DEFAULT_CALENDAR_SLOTS, type CalendarSlot, type AdminNote, type AdminModule, type AdminPyq, type AdminSession, type PlatformSettings, type AdminSubject } from "@/app/api/prepmeup/admin/manage/route";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export interface PersistentState {
  settings: PlatformSettings;
  subjects: AdminSubject[];
  modules: AdminModule[];
  notes: AdminNote[];
  pastPapers: AdminPyq[];
  sessions: AdminSession[];
  calendarSlots: CalendarSlot[];
  publishedContent: any[];
  simulations?: any[];
  activities: any[];
  lastUpdated?: string;
}

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

const BASELINE_NOTES: AdminNote[] = [
  {
    id: "note-01",
    subject_code: "CSE1001",
    module_number: 1,
    title: "Eigenvalues, Eigenvectors & Diagonalization",
    reading_time_min: 20,
    is_sample: true,
    is_published: true,
    content: `### 1. Fundamental Definition
For any square matrix $A \\in \\mathbb{R}^{n \\times n}$, non-zero $\\mathbf{x}$ is an eigenvector if:
$$A\\mathbf{x} = \\lambda\\mathbf{x} \\implies \\det(A - \\lambda I) = 0$$

---

### 2. Cayley-Hamilton Theorem
Every square matrix satisfies its own characteristic polynomial equation:
$$A^2 - \\text{tr}(A)A + \\det(A)I = \\mathbf{0}$$

This provides a direct, closed-form technique to compute matrix inverses and arbitrary matrix polynomials $A^k$ without iterative matrix multiplication.`,
    updated_at: new Date().toISOString(),
  },
  {
    id: "note-02",
    subject_code: "CSE1002",
    module_number: 1,
    title: "Thevenin & Norton Equivalent Circuits",
    reading_time_min: 25,
    is_sample: true,
    is_published: true,
    content: `### 1. Thevenin Equivalent Model
Any linear two-terminal circuit can be replaced by an equivalent voltage source $V_{th}$ in series with resistance $R_{th}$:
$$I_L = \\frac{V_{th}}{R_{th} + R_L}, \\qquad P_{max} = \\frac{V_{th}^2}{4 R_{th}}$$

---

### 2. Norton Dual Representation
The Norton equivalent models the same circuit using a parallel current source $I_N$ and resistance $R_N$:
$$I_N = \\frac{V_{th}}{R_{th}}, \\qquad R_N = R_{th}$$`,
    updated_at: new Date().toISOString(),
  },
  {
    id: "note-03",
    subject_code: "CSE1005",
    module_number: 1,
    title: "Python Memory Model, Generators & List Comprehensions",
    reading_time_min: 15,
    is_sample: true,
    is_published: true,
    content: `### 1. Python Object Model & Mutability
Everything in Python is an object stored on the private heap. Variables are names bound to references in the current namespace.

\`\`\`python
# Generator expression saves memory over eager evaluation
squares_gen = (x**2 for x in range(1_000_000))
print(next(squares_gen)) # 0
print(next(squares_gen)) # 1
\`\`\`

---

### 2. Time & Space Complexity
- Eager list comprehension: $\\mathcal{O}(N)$ memory allocation upfront.
- Generator generator: $\\mathcal{O}(1)$ memory with lazy yield evaluation.`,
    updated_at: new Date().toISOString(),
  },
  {
    id: "note-04",
    subject_code: "CSE1004",
    module_number: 1,
    title: "Client-Server Architecture, DNS & HTTP/HTTPS Lifecycle",
    reading_time_min: 20,
    is_sample: true,
    is_published: true,
    content: `### 1. HTTP vs HTTPS & The 3-Way Handshake
In Fundamentals of Web Technologies (CSE1004), client-server communication relies on TCP/IP:
- **SYN $\\to$ SYN-ACK $\\to$ ACK** establishes the transport session.
- **TLS 1.3 Cryptographic Handshake** negotiates symmetric encryption keys.`,
    updated_at: new Date().toISOString(),
  },
];

export function getPersistentStateFilePath(): string {
  const customDir = process.env.PREPMEUP_DATA_DIR;
  if (customDir) {
    return path.join(customDir, "admin_state.json");
  }
  return path.join(process.cwd(), "deploy", "cms", "admin_state.json");
}

let cachedState: PersistentState | null = null;

export function loadPersistentState(): PersistentState {
  if (cachedState) return cachedState;

  const filePath = getPersistentStateFilePath();
  try {
    if (fs.existsSync(filePath)) {
      const raw = fs.readFileSync(filePath, "utf-8");
      const parsed = JSON.parse(raw);
      cachedState = {
        settings: { ...DEFAULT_SETTINGS, ...(parsed.settings || {}) },
        subjects: parsed.subjects && parsed.subjects.length > 0 ? parsed.subjects : (FALLBACK_SUBJECTS as AdminSubject[]),
        modules: parsed.modules && parsed.modules.length > 0 ? parsed.modules : [
          { id: "mod-01", subject_code: "CSE1001", module_number: 1, title: "Linear Algebra & Matrix Decompositions", description: "Vector spaces, eigenvalues, Cayley-Hamilton, SVD.", is_published: true },
          { id: "mod-02", subject_code: "CSE1001", module_number: 2, title: "Differential Calculus & Optimisation", description: "Partial derivatives, Hessian test, Lagrange multipliers.", is_published: true },
          { id: "mod-03", subject_code: "CSE1005", module_number: 1, title: "Control Structures & Comprehensions", description: "Memory layout, loops, generators, dictionary comprehensions.", is_published: true },
          { id: "mod-04", subject_code: "CSE1002", module_number: 1, title: "DC Circuit Theorems", description: "Thevenin, Norton, Superposition, Maximum Power Transfer.", is_published: true },
          { id: "mod-05", subject_code: "CSE1003", module_number: 1, title: "Computer Evolution & Addressing Modes", description: "Von Neumann vs Harvard, instruction cycle.", is_published: true },
        ],
        notes: parsed.notes && parsed.notes.length > 0 ? parsed.notes : BASELINE_NOTES,
        pastPapers: parsed.pastPapers || [],
        sessions: parsed.sessions || [],
        calendarSlots: parsed.calendarSlots && parsed.calendarSlots.length > 0 ? parsed.calendarSlots : DEFAULT_CALENDAR_SLOTS,
        publishedContent: parsed.publishedContent || [],
        activities: parsed.activities || [],
        lastUpdated: parsed.lastUpdated || new Date().toISOString(),
      };
      return cachedState;
    }
  } catch (err) {
    console.warn("[Storage] Could not parse local state file, initializing baseline:", err);
  }

  // Initialize and write baseline to disk so it never starts from zero
  cachedState = {
    settings: DEFAULT_SETTINGS,
    subjects: FALLBACK_SUBJECTS as AdminSubject[],
    modules: [
      { id: "mod-01", subject_code: "CSE1001", module_number: 1, title: "Linear Algebra & Matrix Decompositions", description: "Vector spaces, eigenvalues, Cayley-Hamilton, SVD.", is_published: true },
      { id: "mod-02", subject_code: "CSE1001", module_number: 2, title: "Differential Calculus & Optimisation", description: "Partial derivatives, Hessian test, Lagrange multipliers.", is_published: true },
      { id: "mod-03", subject_code: "CSE1005", module_number: 1, title: "Control Structures & Comprehensions", description: "Memory layout, loops, generators, dictionary comprehensions.", is_published: true },
      { id: "mod-04", subject_code: "CSE1002", module_number: 1, title: "DC Circuit Theorems", description: "Thevenin, Norton, Superposition, Maximum Power Transfer.", is_published: true },
      { id: "mod-05", subject_code: "CSE1003", module_number: 1, title: "Computer Evolution & Addressing Modes", description: "Von Neumann vs Harvard, instruction cycle.", is_published: true },
    ],
    notes: BASELINE_NOTES,
    pastPapers: [
      {
        id: "pyq-01",
        subject_code: "CSE1001",
        exam_year: 2025,
        exam_type: "End-Semester Examination",
        title: "Winter 2025 CSE1001 Solved End-Sem Question Paper",
        question_paper_url: "https://example.com/acm-2025.pdf",
        solution_markdown: `### Q1 Cayley-Hamilton Verification\nGiven $A = \\begin{bmatrix} 2 & 1 \\\\ 1 & 2 \\end{bmatrix}$, $\\det(A - \\lambda I) = \\lambda^2 - 4\\lambda + 3 = 0$. Eigenvalues $\\lambda = 1, 3$.`,
        is_published: true,
      },
    ],
    sessions: [],
    calendarSlots: DEFAULT_CALENDAR_SLOTS,
    publishedContent: [],
    activities: [
      {
        id: "act-init",
        timestamp: "Just now",
        collection: "System Storage",
        itemTitle: "Persistent State Initialized",
        action: "created",
        details: "Loaded baseline curriculum, notes, and calendar availability.",
        author: "admin@ridheshcybe.dpdns.org",
      },
    ],
    lastUpdated: new Date().toISOString(),
  };

  savePersistentState(cachedState);
  return cachedState;
}

export function savePersistentState(state: PersistentState): void {
  cachedState = state;
  state.lastUpdated = new Date().toISOString();

  const filePath = getPersistentStateFilePath();
  try {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(filePath, JSON.stringify(state, null, 2), "utf-8");
  } catch (err) {
    console.error("[Storage] Error writing state to disk:", err);
  }
}

/**
 * Saves or updates a note immediately upon upload so it is NEVER lost.
 */
export function saveOrUpdateNote(note: {
  id?: string;
  subjectCode: string;
  moduleNumber?: number;
  title: string;
  readingTimeMin?: number;
  isSample?: boolean;
  content: string;
  isPublished?: boolean;
}): AdminNote {
  const state = loadPersistentState();
  if (!state.notes) state.notes = [];

  const noteId = note.id || `note-${Date.now()}`;
  const existingIndex = state.notes.findIndex(
    (n) => n.id === noteId || (n.subject_code === note.subjectCode && n.title === note.title)
  );

  const updatedNote: AdminNote = {
    id: noteId,
    subject_code: note.subjectCode,
    module_number: note.moduleNumber || 1,
    title: note.title.trim(),
    reading_time_min: note.readingTimeMin || 15,
    is_sample: Boolean(note.isSample),
    is_published: note.isPublished !== undefined ? Boolean(note.isPublished) : true,
    content: note.content,
    updated_at: new Date().toISOString(),
  };

  if (existingIndex >= 0) {
    state.notes[existingIndex] = updatedNote;
  } else {
    state.notes.unshift(updatedNote);
  }

  // Also sync publishedContent
  if (!state.publishedContent) state.publishedContent = [];
  const pubIdx = state.publishedContent.findIndex(
    (x) => x.id === noteId || (x.subjectCode === note.subjectCode && x.title === note.title)
  );
  const pubItem = {
    id: noteId,
    contentType: "note",
    subjectCode: note.subjectCode,
    subjectTitle: note.subjectCode,
    title: note.title.trim(),
    moduleNumber: note.moduleNumber || 1,
    readingTimeMin: note.readingTimeMin || 15,
    isSample: Boolean(note.isSample),
    contentMarkdown: note.content,
    status: "published",
    publishedAt: new Date().toISOString(),
    author: "admin@ridheshcybe.dpdns.org",
  };
  if (pubIdx >= 0) {
    state.publishedContent[pubIdx] = pubItem;
  } else {
    state.publishedContent.unshift(pubItem);
  }

  // Record audit activity
  if (!state.activities) state.activities = [];
  state.activities.unshift({
    id: `act-${Date.now()}`,
    timestamp: "Just now",
    collection: "Academic Notes",
    itemTitle: `${note.subjectCode}: ${note.title}`,
    action: existingIndex >= 0 ? "updated" : "created",
    details: `Persisted study note with ${note.content.length} characters.`,
    author: "admin@ridheshcybe.dpdns.org",
  });

  savePersistentState(state);
  return updatedNote;
}

export function getAllPersistentNotes(): AdminNote[] {
  const state = loadPersistentState();
  return state.notes || [];
}

const BUCKET_NAME = "pmu-content";

/**
 * Storage helper for PrepMeUp AI documents (notes, past papers, syllabus).
 * Uses private bucket `pmu-content` and generates short-lived signed URLs (10 min expiry).
 */
export async function uploadPrepMeUpFile(params: {
  filePath: string;
  fileBuffer: Buffer | ArrayBuffer | Uint8Array;
  contentType: string;
}): Promise<{ success: boolean; path?: string; error?: string }> {
  const service = createPmuServiceClient();
  if (!service) {
    return { success: true, path: `mock-storage://${params.filePath}` };
  }

  try {
    const { data, error } = await service.storage
      .from(BUCKET_NAME)
      .upload(params.filePath, params.fileBuffer, {
        contentType: params.contentType,
        upsert: true,
      });

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true, path: data.path };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to upload file." };
  }
}

/**
 * Creates a short-lived (max 10-minute / 600s) signed URL for secure streaming.
 * Never exposes permanent or public URLs.
 */
export async function getSecureSignedUrl(filePath: string, expiresInSec: number = 600): Promise<string | null> {
  if (filePath.startsWith("mock-storage://")) {
    return filePath;
  }

  const service = createPmuServiceClient();
  if (!service) return null;

  try {
    const { data, error } = await service.storage
      .from(BUCKET_NAME)
      .createSignedUrl(filePath, Math.min(expiresInSec, 600));

    if (error || !data?.signedUrl) {
      return null;
    }

    return data.signedUrl;
  } catch {
    return null;
  }
}
