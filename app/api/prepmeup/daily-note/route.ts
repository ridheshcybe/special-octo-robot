import { NextResponse } from "next/server";
import { getStoredDailyNote } from "@/lib/prepmeup/dailyNotes";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const note = getStoredDailyNote();
    return NextResponse.json({ ok: true, data: note });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load daily note" },
      { status: 500 }
    );
  }
}
