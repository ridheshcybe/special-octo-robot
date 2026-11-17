import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  loadCustomNotifications,
  createCustomNotification,
  toggleCustomNotification,
  deleteCustomNotification,
  type NotificationCategory,
  type NotificationAudience,
} from "@/lib/prepmeup/notifications";

export const dynamic = "force-dynamic";

async function verifyAdmin(): Promise<boolean> {
  const cookieStore = await cookies();
  const adminCookie = cookieStore.get("pmu-admin-session");
  return Boolean(adminCookie?.value);
}

export async function GET() {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const notifications = loadCustomNotifications();
    return NextResponse.json({
      ok: true,
      notifications,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to load notifications." },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!(await verifyAdmin())) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized: Admin privileges required." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const action = body.action || "send";

    if (action === "send") {
      const title = String(body.title || "").trim();
      const message = String(body.message || "").trim();

      if (!title || !message) {
        return NextResponse.json(
          { ok: false, error: "Both notification title and message are required." },
          { status: 400 }
        );
      }

      const created = await createCustomNotification({
        title,
        message,
        category: (body.category as NotificationCategory) || "info",
        audience: (body.audience as NotificationAudience) || "all",
        recipientTarget: body.recipientTarget,
        ctaLabel: body.ctaLabel,
        ctaHref: body.ctaHref,
        expiresInHours: Number(body.expiresInHours) || 72,
      });

      return NextResponse.json({
        ok: true,
        message: `Notification "${created.title}" broadcast to ${created.audience} audience!`,
        notification: created,
        notifications: loadCustomNotifications(),
      });
    }

    if (action === "toggle") {
      const id = String(body.id || "");
      if (!id) {
        return NextResponse.json({ ok: false, error: "id is required." }, { status: 400 });
      }
      const updated = await toggleCustomNotification(id);
      return NextResponse.json({
        ok: Boolean(updated),
        notification: updated,
        notifications: loadCustomNotifications(),
      });
    }

    if (action === "delete") {
      const id = String(body.id || "");
      if (!id) {
        return NextResponse.json({ ok: false, error: "id is required." }, { status: 400 });
      }
      const deleted = await deleteCustomNotification(id);
      return NextResponse.json({
        ok: deleted,
        notifications: loadCustomNotifications(),
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown notification action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Notification operation failed." },
      { status: 500 }
    );
  }
}
