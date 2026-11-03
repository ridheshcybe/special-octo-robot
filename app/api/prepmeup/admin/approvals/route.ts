import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { getPendingApprovals, reviewPendingApproval } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!adminSession?.value) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const items = getPendingApprovals();
    return NextResponse.json({ ok: true, items });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load pending approvals." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const adminSession = cookieStore.get("pmu-admin-session");

    if (!adminSession?.value) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const { itemId, action, comments } = body;

    if (!itemId || !["approve", "reject", "publish"].includes(action)) {
      return NextResponse.json(
        { ok: false, error: "itemId and valid action (approve | reject | publish) are required." },
        { status: 400 }
      );
    }

    const result = reviewPendingApproval(itemId, action, comments || "");
    if (!result.success || !result.item) {
      return NextResponse.json(
        { ok: false, error: "Approval item not found." },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ok: true,
      item: result.item,
      message: `Item has been successfully ${action}d.`,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to process review action." },
      { status: 500 }
    );
  }
}
