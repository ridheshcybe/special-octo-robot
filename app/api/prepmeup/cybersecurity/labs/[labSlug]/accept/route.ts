import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { resolveSessionIdentity } from "@/app/prepmeup/_lib/studentStore";
import { getCyberLabBySlug, recordLabAcceptance } from "@/app/prepmeup/_lib/trackStore";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ labSlug: string }> }
) {
  try {
    const { labSlug } = await params;
    const cookieStore = await cookies();
    const identity = resolveSessionIdentity(cookieStore);

    const lab = getCyberLabBySlug(labSlug);
    if (!lab) {
      return NextResponse.json(
        { ok: false, error: "CyberSecurity lab not found." },
        { status: 404, headers: { "Cache-Control": "no-store" } }
      );
    }

    const ip =
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      req.headers.get("x-real-ip") ||
      "127.0.0.1";
    const userAgent = req.headers.get("user-agent") || "unknown";

    const userId = identity?.canonicalId || `guest-${ip}`;

    const body = await req.json().catch(() => ({}));
    const policyVersion = body.policyVersion || "1.0";

    const result = recordLabAcceptance(userId, lab.id, policyVersion, {
      ip,
      userAgent,
      acceptedAt: new Date().toISOString(),
      studentTarget: identity?.email || identity?.phone || identity?.canonicalId,
    });

    return NextResponse.json(
      {
        ok: true,
        accepted: true,
        policyVersion,
        acceptance: result.acceptance,
      },
      { headers: { "Cache-Control": "no-store" } }
    );
  } catch (err: any) {
    console.error("[LabAcceptRoute] Error:", err);
    return NextResponse.json(
      { ok: false, error: "Internal server error processing policy acceptance." },
      { status: 500, headers: { "Cache-Control": "no-store" } }
    );
  }
}
