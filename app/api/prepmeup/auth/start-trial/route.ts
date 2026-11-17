import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { recordUserPresence, recordGlobalActivity, canonicalizeStudentKey } from "@/app/prepmeup/_lib/studentStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const rawName = typeof body.name === "string" ? body.name.trim() : "";
    const rawTarget = typeof body.target === "string" ? body.target.trim() : "";

    if (!rawName) {
      return NextResponse.json(
        { ok: false, error: "Please enter your name to activate your free trial." },
        { status: 400 }
      );
    }

    const sanitizedId = `trial_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const studentKey = rawTarget ? canonicalizeStudentKey(rawTarget) : sanitizedId;

    // Optional Supabase persistence if DB is configured
    const serviceClient = createPmuServiceClient();
    if (serviceClient && process.env.PMU_SUPABASE_SERVICE_ROLE_KEY) {
      try {
        await serviceClient.from("pmu_profiles").upsert(
          {
            phone: rawTarget.includes("@") ? null : rawTarget || `WA-TRIAL-${Date.now().toString().slice(-6)}`,
            email: rawTarget.includes("@") ? rawTarget : null,
            full_name: rawName,
            college: "Free Trial Adopter",
            branch: "B.Tech CSE AI/ML",
            current_semester: 1,
            role: "student",
          },
          { onConflict: rawTarget.includes("@") ? "email" : "phone" }
        );
      } catch (err) {
        console.warn("[Trial] Supabase profile upsert deferred:", err);
      }
    }

    try {
      recordUserPresence({
        userId: studentKey,
        name: rawName,
        target: rawTarget || "Free Guest Trial",
        type: rawTarget.includes("@") ? "email" : "phone",
        college: "Free Trial Adopter",
        activity: "Activated Free Trial (Tier 1 Basic Plan)",
        page: "/prepmeup/dashboard",
      });
      recordGlobalActivity({
        userId: studentKey,
        userName: rawName,
        userTarget: rawTarget || "Free Guest Trial",
        actionType: "login",
        title: "Free Trial Activated",
        details: "Student activated 100% Free Trial with Tier 1 Basic Plan access",
        timestamp: new Date().toISOString(),
      });
    } catch {}

    const response = NextResponse.json({
      ok: true,
      message: `Welcome, ${rawName}! Your Free Trial (Tier 1 Basic Plan) is active.`,
      tier: "tier1",
      redirectTo: "/prepmeup/dashboard",
      user: {
        id: studentKey,
        fullName: rawName,
        role: "student",
        tier: "tier1",
      },
    });

    // Set secure cookie granting tier1 basic plan access
    response.cookies.set(
      "pmu-session",
      JSON.stringify({
        userId: studentKey,
        fullName: rawName,
        tier: "tier1",
        role: "student",
        isProfileComplete: true,
        phone: rawTarget.includes("@") ? undefined : rawTarget,
        email: rawTarget.includes("@") ? rawTarget : undefined,
      }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 7 days
      }
    );

    return response;
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, error: err?.message || "Failed to setup free trial." },
      { status: 500 }
    );
  }
}
