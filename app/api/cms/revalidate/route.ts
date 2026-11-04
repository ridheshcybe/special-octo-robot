import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";

/**
 * Directus Outbound Webhook Revalidation Endpoint.
 *
 * Directus calls this endpoint whenever a collection item is created, updated, or deleted.
 * Verification is performed via the shared secret header: `x-cms-webhook-secret`.
 */
export async function POST(req: NextRequest) {
  try {
    const secret = req.headers.get("x-cms-webhook-secret");
    const expectedSecret = process.env.CMS_WEBHOOK_SECRET;

    if (!expectedSecret || secret !== expectedSecret) {
      return NextResponse.json(
        { ok: false, error: "Unauthorized webhook payload." },
        { status: 401 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const collection = body.collection || body.event?.split(".")?.[0] || "all";

    // 1. Tag-based cache invalidation
    revalidateTag("cms", "default");
    revalidateTag(`cms_${collection}`, "default");

    // 2. Path-based cache invalidation according to collection
    if (collection === "projects" || collection === "site_settings" || collection === "story_principles") {
      revalidatePath("/");
      revalidatePath("/projects");
    } else if (collection === "prepmeup_notes" || collection === "pmu_topics") {
      revalidatePath("/prepmeup", "layout");
      revalidatePath("/prepmeup/subjects");
    } else {
      revalidatePath("/");
    }

    return NextResponse.json({
      ok: true,
      collection,
      revalidatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("[CMS Revalidation Error]:", error);
    return NextResponse.json(
      { ok: false, error: "Internal revalidation error." },
      { status: 500 }
    );
  }
}
