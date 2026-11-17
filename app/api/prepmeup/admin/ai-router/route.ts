import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  getAIProviderRouterStatus,
  setCustomPcTunnelConfig,
  callUnifiedFreeAI,
  type AIProviderId,
} from "@/lib/prepmeup/aiRouter";

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

    const status = getAIProviderRouterStatus();
    return NextResponse.json({
      ok: true,
      ...status,
    });
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to fetch AI router status." },
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
    const action = body.action || "test_router";

    if (action === "update_tunnel") {
      const url = typeof body.tunnelUrl === "string" ? body.tunnelUrl.trim() : "";
      const model = typeof body.localModel === "string" ? body.localModel.trim() : "llama3.2:latest";
      setCustomPcTunnelConfig(url || null, model || "llama3.2:latest");

      const status = getAIProviderRouterStatus();
      return NextResponse.json({
        ok: true,
        message: url
          ? `24/7 PC AI Tunnel configured (${url} • ${model}). Router will prioritize local PC inference!`
          : "24/7 PC AI Tunnel cleared. Router using free cloud cascade.",
        ...status,
      });
    }

    if (action === "test_router") {
      const preferredProvider = body.preferredProvider as AIProviderId | undefined;
      const result = await callUnifiedFreeAI({
        systemInstruction: "You are PrepMeUp AI. Reply in one short sentence confirming you are online.",
        userPrompt: body.prompt || "Confirm AI router status and state the Eigenvalue equation A*x = lambda*x.",
        maxTokens: 120,
        temperature: 0.2,
        preferredProvider,
      });

      const status = getAIProviderRouterStatus();
      return NextResponse.json({
        ok: true,
        message: `Verified via ${result.modelUsed} in ${result.latencyMs}ms!`,
        testResult: result,
        ...status,
      });
    }

    return NextResponse.json(
      { ok: false, error: `Unknown AI router action: ${action}` },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      {
        ok: false,
        error: err?.message || "AI router test failed.",
        ...getAIProviderRouterStatus(),
      },
      { status: 500 }
    );
  }
}
