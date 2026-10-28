import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ doubtId: string }> }
) {
  try {
    const { doubtId } = await params;
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!studentSession?.value && !adminSession?.value) {
      return NextResponse.json({ ok: false, error: "Please log in." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const { helpful, messageId } = body;

    const serviceClient = createPmuServiceClient();
    if (serviceClient && messageId) {
      await serviceClient
        .from("pmu_doubt_messages")
        .update({ feedback_helpful: Boolean(helpful) })
        .eq("id", messageId);
    }

    return NextResponse.json({ ok: true, message: "Feedback recorded. Thank you!" });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
