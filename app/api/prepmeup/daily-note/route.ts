import { NextResponse, type NextRequest } from "next/server";
import { getStoredDailyNote } from "@/lib/prepmeup/dailyNotes";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const dateParam = req.nextUrl.searchParams.get("date") || undefined;
    const note = getStoredDailyNote(dateParam);
    return NextResponse.json({ ok: true, data: note });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load daily note" },
      { status: 500 }
    );
  }
}
