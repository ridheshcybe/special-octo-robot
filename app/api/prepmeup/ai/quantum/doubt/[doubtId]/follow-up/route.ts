import { NextResponse, type NextRequest } from "next/server";
import { addQuantumDoubtFollowUp } from "@/lib/prepmeup/quantumTutor";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ doubtId: string }> }
) {
  try {
    const { doubtId } = await params;
    const body = await req.json().catch(() => ({}));
    const { text } = body;

    if (!text || typeof text !== "string" || !text.trim()) {
      return NextResponse.json(
        { ok: false, error: "Follow-up text is required." },
        { status: 400 }
      );
    }

    const result = addQuantumDoubtFollowUp(doubtId, text.trim());
    if (!result.success || !result.record) {
      return NextResponse.json(
        { ok: false, error: "Quantum doubt not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      record: result.record,
      reply: result.reply,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to add follow-up." },
      { status: 500 }
    );
  }
}
