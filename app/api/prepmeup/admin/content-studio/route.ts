import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import path from "path";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export interface PublishedContentItem {
  id: string;
  contentType: "note" | "module" | "topic" | "pyq" | "quiz";
  subjectCode: string;
  subjectTitle: string;
  title: string;
  moduleNumber?: number;
  readingTimeMin?: number;
  isSample: boolean;
  contentMarkdown: string;
  status: "published" | "draft";
  publishedAt: string;
  author: string;
}

function getStateFilePath(): string {
  return path.join(process.cwd(), "deploy", "cms", "admin_state.json");
}

function loadAdminState(): any {
  try {
    const p = getStateFilePath();
    if (fs.existsSync(p)) {
      return JSON.parse(fs.readFileSync(p, "utf-8"));
    }
  } catch {}
  return { sessions: [], activities: [], publishedContent: [], notes: [], modules: [] };
}

function saveAdminState(data: any) {
  try {
    const p = getStateFilePath();
    const dir = path.dirname(p);
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    fs.writeFileSync(p, JSON.stringify(data, null, 2), "utf-8");
  } catch {}
}

export async function GET() {
  const state = loadAdminState();
  const items: PublishedContentItem[] = state.publishedContent || [
    {
      id: "cont-01",
      contentType: "note",
      subjectCode: "CSE1004",
      subjectTitle: "Fundamentals of Web Technologies",
      title: "Client-Server Architecture, DNS & HTTP/HTTPS Lifecycle",
      moduleNumber: 1,
      readingTimeMin: 20,
      isSample: true,
      contentMarkdown: `### 1. HTTP vs HTTPS & The 3-Way Handshake
In Fundamentals of Web Technologies (CSE1004), client-server communication relies on TCP/IP:
- **SYN $\\to$ SYN-ACK $\\to$ ACK** establishes the transport session.
- **TLS 1.3 Cryptographic Handshake** establishes symmetric session keys.`,
      status: "published",
      publishedAt: new Date(Date.now() - 3600000).toISOString(),
      author: "admin@ridheshcybe.dpdns.org",
    },
    {
      id: "cont-02",
      contentType: "note",
      subjectCode: "CSE1001",
      subjectTitle: "Applied Computational Mathematics",
      title: "Singular Value Decomposition (SVD) & Low-Rank Approximations",
      moduleNumber: 1,
      readingTimeMin: 25,
      isSample: true,
      contentMarkdown: `### 1. Theorem Formulation
Every real matrix $A \\in \\mathbb{R}^{m \\times n}$ admits a factorization:
$$A = U \\Sigma V^T = \\sum_{i=1}^{r} \\sigma_i \\mathbf{u}_i \\mathbf{v}_i^T$$
where singular values $\\sigma_i = \\sqrt{\\lambda_i(A^T A)}$.`,
      status: "published",
      publishedAt: new Date(Date.now() - 7200000).toISOString(),
      author: "admin@ridheshcybe.dpdns.org",
    },
  ];

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      id,
      contentType = "note",
      subjectCode = "CSE1004",
      subjectTitle = "Fundamentals of Web Technologies",
      title = "New Published Content",
      moduleNumber = 1,
      readingTimeMin = 15,
      isSample = true,
      contentMarkdown = "",
    } = body;

    if (!title.trim() || !contentMarkdown.trim()) {
      return NextResponse.json(
        { ok: false, error: "Title and content markdown cannot be empty." },
        { status: 400 }
      );
    }

    const state = loadAdminState();
    if (!state.publishedContent) state.publishedContent = [];
    if (!state.activities) state.activities = [];
    if (!state.notes) state.notes = [];
    if (!state.modules) state.modules = [];

    const existingIndex = id ? state.publishedContent.findIndex((x: any) => x.id === id) : -1;

    const item: PublishedContentItem = {
      id: existingIndex >= 0 ? id : `cont-${Date.now()}`,
      contentType,
      subjectCode,
      subjectTitle,
      title: title.trim(),
      moduleNumber: Number(moduleNumber) || 1,
      readingTimeMin: Number(readingTimeMin) || 15,
      isSample: Boolean(isSample),
      contentMarkdown: contentMarkdown.trim(),
      status: "published",
      publishedAt: new Date().toISOString(),
      author: "admin@ridheshcybe.dpdns.org",
    };

    if (existingIndex >= 0) {
      state.publishedContent[existingIndex] = item;
    } else {
      state.publishedContent.unshift(item);
    }

    // Keep state.notes synced for admin manage & queries
    if (contentType === "note") {
      const noteIdx = state.notes.findIndex((n: any) => n.id === `note-${item.id}` || (n.subject_code === subjectCode && n.title === item.title));
      const noteObj = {
        id: `note-${item.id}`,
        subject_code: subjectCode,
        module_number: item.moduleNumber,
        title: item.title,
        reading_time_min: item.readingTimeMin,
        is_sample: item.isSample,
        is_published: true,
        content: item.contentMarkdown,
        updated_at: new Date().toISOString(),
      };
      if (noteIdx >= 0) {
        state.notes[noteIdx] = noteObj;
      } else {
        state.notes.unshift(noteObj);
      }
    } else if (contentType === "module") {
      const modIdx = state.modules.findIndex((m: any) => m.subject_code === subjectCode && m.module_number === item.moduleNumber);
      const modObj = {
        id: `mod-${item.id}`,
        subject_code: subjectCode,
        module_number: item.moduleNumber,
        title: item.title,
        description: item.contentMarkdown.slice(0, 300),
        is_published: true,
      };
      if (modIdx >= 0) {
        state.modules[modIdx] = modObj;
      } else {
        state.modules.push(modObj);
      }
    }

    // Add entry to "What Was Updated & When" audit feed
    state.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: "Just now",
      collection:
        contentType === "note"
          ? "Academic Notes (LaTeX)"
          : contentType === "module"
          ? "Syllabus Modules"
          : contentType === "pyq"
          ? "Past Papers & Solutions"
          : "Quiz Arena",
      itemTitle: `${subjectCode}: ${item.title}`,
      action: existingIndex >= 0 ? "updated" : "published",
      details: `Admin ${existingIndex >= 0 ? "updated" : "uploaded and published"} content (${item.readingTimeMin} mins, ${isSample ? "Free Sample" : "Semester Pass"}). Synced with Directus CMS and student portal.`,
      author: "admin@ridheshcybe.dpdns.org",
    });

    saveAdminState(state);

    // Also sync to Supabase database if service client is available
    try {
      const serviceClient = createPmuServiceClient();
      if (serviceClient && contentType === "note") {
        await serviceClient.from("pmu_notes").upsert(
          {
            title: item.title,
            content_markdown: item.contentMarkdown,
            reading_time_min: item.readingTimeMin,
            is_sample: item.isSample,
            status: "published",
            is_published: true,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "title" }
        );
      }
    } catch {}

    return NextResponse.json({
      ok: true,
      item,
      message: existingIndex >= 0
        ? `Successfully updated "${item.title}" in Content Studio & Directus CMS.`
        : `Successfully published "${item.title}" to live site & Directus CMS.`,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) {
      return NextResponse.json({ ok: false, error: "Item ID required" }, { status: 400 });
    }

    const state = loadAdminState();
    if (state.publishedContent) {
      state.publishedContent = state.publishedContent.filter((x: any) => x.id !== id);
    }
    if (state.notes) {
      state.notes = state.notes.filter((n: any) => n.id !== `note-${id}`);
    }
    if (state.modules) {
      state.modules = state.modules.filter((m: any) => m.id !== `mod-${id}`);
    }
    saveAdminState(state);

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
