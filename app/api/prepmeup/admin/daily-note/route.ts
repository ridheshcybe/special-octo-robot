import { NextResponse, type NextRequest } from "next/server";
import {
  getStoredDailyNote,
  saveDailyNote,
  generateDailyNoteWithAI,
  type DailyNoteData,
} from "@/lib/prepmeup/dailyNotes";
import { logger } from "@/lib/logger";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const current = getStoredDailyNote();
    return NextResponse.json({ ok: true, data: current });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to retrieve daily note" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action || "publish";

    if (action === "generate") {
      const topic = body.topic?.trim();
      const subjectCode = body.subjectCode?.trim() || "CSE1001";
      const subjectTitle =
        body.subjectTitle?.trim() || "Applied Computational Mathematics";

      if (!topic) {
        return NextResponse.json(
          { ok: false, error: "Topic is required to generate a daily note" },
          { status: 400 }
        );
      }

      logger.info("ADMIN_DAILY_NOTE", "Generating daily note with AI", { topic, subjectCode });
      const generated = await generateDailyNoteWithAI(
        topic,
        subjectCode,
        subjectTitle
      );
      return NextResponse.json({ ok: true, data: generated });
    }

    if (action === "publish") {
      const noteData: DailyNoteData = body.data;
      if (!noteData || !noteData.topic || !noteData.notesMarkdown) {
        return NextResponse.json(
          { ok: false, error: "Invalid daily note data to publish" },
          { status: 400 }
        );
      }

      // Ensure fresh timestamp on broadcast
      noteData.notification = {
        ...noteData.notification,
        id: `notif-${Date.now()}`,
        publishedAt: new Date().toISOString(),
      };

      saveDailyNote(noteData);
      logger.audit("DAILY_NOTE_BROADCAST", {
        topic: noteData.topic,
        notificationId: noteData.notification.id,
      });

      return NextResponse.json({
        ok: true,
        message: "Daily note and notification published to all users successfully!",
        data: noteData,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unsupported action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    logger.error("ADMIN_DAILY_NOTE", "Error in admin daily note endpoint", err);
    return NextResponse.json(
      { ok: false, error: err?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
