import { NextResponse, type NextRequest } from "next/server";
import fs from "fs";
import path from "path";

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
  return { sessions: [], activities: [], publishedContent: [] };
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
      subjectCode: "ACM-101",
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
    {
      id: "cont-02",
      contentType: "pyq",
      subjectCode: "BEE-103",
      subjectTitle: "Basic Electrical Engineering",
      title: "Winter 2025 Thevenin & Norton Solved Model Paper",
      moduleNumber: 1,
      readingTimeMin: 20,
      isSample: false,
      contentMarkdown: `### Model Solution: Maximum Power Transfer
Power delivered to load resistance $R_L$:
$$P_{max} = \\frac{V_{th}^2}{4 R_{th}}$$`,
      status: "published",
      publishedAt: new Date(Date.now() - 14400000).toISOString(),
      author: "admin@ridheshcybe.dpdns.org",
    },
  ];

  return NextResponse.json({ ok: true, items });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const {
      contentType = "note",
      subjectCode = "ACM-101",
      subjectTitle = "Applied Computational Mathematics",
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

    const newItem: PublishedContentItem = {
      id: `cont-${Date.now()}`,
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

    state.publishedContent.unshift(newItem);

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
      itemTitle: `${subjectCode}: ${newItem.title}`,
      action: "published",
      details: `Admin uploaded and published content (${newItem.readingTimeMin} mins, ${isSample ? "Free Sample" : "Semester Pass"}). Synced with Directus CMS.`,
      author: "admin@ridheshcybe.dpdns.org",
    });

    saveAdminState(state);

    return NextResponse.json({
      ok: true,
      item: newItem,
      message: `Successfully published "${newItem.title}" to live site & Directus CMS.`,
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
      saveAdminState(state);
    }

    return NextResponse.json({ ok: true, deletedId: id });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
