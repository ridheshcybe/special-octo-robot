import { NextResponse } from "next/server";
import { createClient, SupabaseClient } from "@supabase/supabase-js";

// Health endpoint for production validation
// GET /api/prepmeup/health

export const dynamic = "force-dynamic";

// Environment variables (no secrets exposed in browser):
// - NEXT_PUBLIC_SUPABASE_URL
// - NEXT_PUBLIC_SUPABASE_ANON_KEY
// - RAZORPAY_KEY_ID
// - GEMINI_API_KEY


let supabase: SupabaseClient | null = null;
// Status flags
let razorpayStatus = "not_configured";
let geminiStatus = "not_configured";

// Health status union type
type HealthStatus = "ok" | "degraded" | "error";

// Initialize Supabase client on first request
if (!supabase) {
  const supabaseUrl = process.env.NEXT_PUBLIC_PMU_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (supabaseUrl && supabaseAnonKey) {
    supabase = createClient(supabaseUrl, supabaseAnonKey);
    razorpayStatus = process.env.RAZORPAY_KEY_ID ? "configured" : "not_configured";
    geminiStatus = process.env.GEMINI_API_KEY ? "configured" : "not_configured";
  }
}

export async function GET() {
  // Initial health status
  let healthStatus: HealthStatus = "ok";

  try {
    const health = {
      status: healthStatus,
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      database: {
        supabase: supabase ? "connected" : "disconnected",
      },
      storage: supabase ? "connected" : "disconnected",
      razorpay: razorpayStatus,
      gemini: geminiStatus,
    };

    // Verify actual database connectivity
    if (supabase) {
      try {
        // Lightweight query to verify connectivity
        const { error } = await supabase.from("pmu_users").select("count", { count: "exact", head: true });
        if (error) {
          healthStatus = "degraded";
          health.database.supabase = "error: " + (error as Error).message;
        }
      } catch (dbError) {
        healthStatus = "error";
        health.database.supabase = "unreachable";
      }
    }

    return NextResponse.json(health, { status: healthStatus === "ok" ? 200 : 503 });
  } catch (error) {
    console.error("Health check error:", error);
    return NextResponse.json(
      { status: "error", error: "Health check failed" },
      { status: 500 }
    );
  }
}