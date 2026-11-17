import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const url = request.nextUrl;

  // Health check endpoint - always allow
  if (url.pathname.startsWith("/api/prepmeup/health")) {
    const checks: Record<string, { status: string; details?: string }> = {
      db: { status: typeof process !== "undefined" && process.env.SUPABASE_URL ? "configured" : "missing-config" },
      storage: { status: typeof process !== "undefined" && process.env.SUPABASE_STORAGE_BUCKET ? "configured" : "missing-config" },
      razorpay: { status: typeof process !== "undefined" && process.env.RAZORPAY_KEY_ID ? "configured" : "missing-config" },
      gemini: { status: typeof process !== "undefined" && process.env.GEMINI_API_KEY ? "configured" : "missing-config" },
    };

    const allConfigured = Object.values(checks).every(
      c => c.status === "configured"
    );

    const health = {
      status: allConfigured ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      checks,
    };

    return NextResponse.json(health, {
      status: allConfigured ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json",
      },
    });
  }

  return NextResponse.next();
}

// Static GET handler for /api/prepmeup/health
export async function GET(request: Request) {
  const url = new URL(request.url);

  if (url.pathname === "/api/prepmeup/health") {
    const checks: Record<string, { status: string; details?: string }> = {
      db: { status: typeof process !== "undefined" && process.env.SUPABASE_URL ? "configured" : "missing-config" },
      storage: { status: typeof process !== "undefined" && process.env.SUPABASE_STORAGE_BUCKET ? "configured" : "missing-config" },
      razorpay: { status: typeof process !== "undefined" && process.env.RAZORPAY_KEY_ID ? "configured" : "missing-config" },
      gemini: { status: typeof process !== "undefined" && process.env.GEMINI_API_KEY ? "configured" : "missing-config" },
    };

    const allConfigured = Object.values(checks).every(
      c => c.status === "configured"
    );

    const health = {
      status: allConfigured ? "ok" : "degraded",
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "development",
      checks,
    };

    return NextResponse.json(health, {
      status: allConfigured ? 200 : 503,
      headers: {
        "Cache-Control": "no-store, max-age=0",
        "Content-Type": "application/json",
      },
    });
  }

  return new Response("Not Found", { status: 404 });
}