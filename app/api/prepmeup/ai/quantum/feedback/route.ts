import { NextResponse, type NextRequest } from "next/server";
import { recordQuantumFeedback } from "@/lib/prepmeup/quantumTutor";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const { doubtId, helpful } = body;

    if (!doubtId || typeof helpful !== "boolean") {
      return NextResponse.json(
        { ok: false, error: "doubtId and helpful boolean are required." },
        { status: 400 }
      );
    }

    const res = recordQuantumFeedback(doubtId, helpful);
    if (!res.success) {
      return NextResponse.json(
        { ok: false, error: "Quantum doubt not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      helpfulCount: res.helpfulCount,
      unhelpfulCount: res.unhelpfulCount,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to record feedback." },
      { status: 500 }
    );
  }
}
