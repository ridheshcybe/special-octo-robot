import { NextResponse, type NextRequest } from "next/server";
import { getQuantumDoubtById } from "@/lib/prepmeup/quantumTutor";

export const dynamic = "force-dynamic";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ doubtId: string }> }
) {
  try {
    const { doubtId } = await params;
    const doubt = getQuantumDoubtById(doubtId);

    if (!doubt) {
      return NextResponse.json(
        { ok: false, error: "Quantum doubt not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({ ok: true, doubt });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to fetch doubt." },
      { status: 500 }
    );
  }
}
