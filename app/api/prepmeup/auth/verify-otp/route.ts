import { NextResponse, type NextRequest } from "next/server";
import { authTargetSchema, otpSchema } from "@/app/prepmeup/_lib/validation";
import { checkAndIncrementVerifyAttempts, resetVerifyAttempts } from "@/app/prepmeup/_lib/rateLimit";
import { verifyTwilioOtp } from "@/app/prepmeup/_lib/twilioVerify";
import { verifyEmailOtp } from "@/app/prepmeup/_lib/emailOtp";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { recordUserPresence, recordGlobalActivity } from "@/app/prepmeup/_lib/studentStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Validate inputs with Zod
    const rawTarget = body.email || body.phone || body.identifier || body.target;
    const targetResult = authTargetSchema.safeParse(rawTarget);
    if (!targetResult.success) {
      return NextResponse.json(
        { ok: false, error: targetResult.error.issues[0]?.message ?? "Invalid email or phone number" },
        { status: 400 }
      );
    }
    const target = targetResult.data;

    const otpResult = otpSchema.safeParse(body.code);
    if (!otpResult.success) {
      return NextResponse.json(
        { ok: false, error: otpResult.error.issues[0]?.message ?? "Invalid 6-digit OTP code" },
        { status: 400 }
      );
    }
    const code = otpResult.data;

    // 2. Brute-force protection: Max 5 verification attempts per target
    const attemptCheck = checkAndIncrementVerifyAttempts(target.value);
    if (!attemptCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: "Maximum verification attempts exceeded. Please request a new code." },
        { status: 429 }
      );
    }

    // 3. Verify OTP via Email OTP or Twilio Verify
    let verifyResult: { success: boolean; error?: string };
    if (target.type === "email") {
      verifyResult = await verifyEmailOtp(target.value, code);
    } else {
      verifyResult = await verifyTwilioOtp(target.value, code);
    }

    if (!verifyResult.success) {
      return NextResponse.json(
        {
          ok: false,
          error: verifyResult.error || "Incorrect verification code. Please check and retry.",
          attemptsLeft: attemptCheck.attemptsLeft,
        },
        { status: 401 }
      );
    }

    // Code verified: reset attempt counter
    resetVerifyAttempts(target.value);

    // 4. Supabase User Management
    const serviceClient = createPmuServiceClient();
    const sanitizedIdSuffix = target.value.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 32);
    let userId: string = `mock_pmu_user_${sanitizedIdSuffix}`;
    let isProfileComplete = true;
    let fullName = target.type === "email" ? target.value.split("@")[0] : "Student";
    let college = "";

    if (serviceClient && process.env.PMU_SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: existingProfile } = await serviceClient
          .from("pmu_profiles")
          .select("*")
          .eq("phone", target.value)
          .maybeSingle();

        if (existingProfile) {
          userId = existingProfile.id;
          if (existingProfile.full_name) fullName = existingProfile.full_name;
          if (existingProfile.college) college = existingProfile.college;
          isProfileComplete = true;
        } else {
          // Provision in pmu_profiles
          const { data: newProfile } = await serviceClient
            .from("pmu_profiles")
            .insert({
              phone: target.value,
              full_name: fullName,
              college: "",
              branch: "B.Tech CSE AI/ML",
              current_semester: 1,
              role: "student",
            })
            .select()
            .maybeSingle();

          if (newProfile) {
            userId = newProfile.id;
          }
        }
      } catch (dbErr) {
        console.warn("[PMU Auth] Database provision deferred or skipped in local mock mode.");
      }
    }

    const requestedRedirect = body.redirectTo || body.redirect;
    const finalRedirect = requestedRedirect && typeof requestedRedirect === "string" && requestedRedirect.startsWith("/prepmeup")
      ? requestedRedirect
      : "/prepmeup/dashboard";

    try {
      recordUserPresence({
        userId,
        name: fullName,
        target: target.value,
        type: target.type,
        college,
        activity: "Signed in via " + (target.type === "email" ? "Email OTP" : "WhatsApp OTP"),
        page: finalRedirect,
      });
      recordGlobalActivity({
        userId,
        userName: fullName,
        userTarget: target.value,
        actionType: "login",
        title: "Student Sign In",
        details: `Authenticated via ${target.type === "email" ? "Resend Email OTP" : "WhatsApp OTP"}`,
        timestamp: new Date().toISOString(),
      });
    } catch {}

    const response = NextResponse.json({
      ok: true,
      message: "Authentication successful.",
      isNewUser: false,
      isProfileComplete: true,
      redirectTo: finalRedirect,
      user: {
        id: userId,
        target: target.value,
        type: target.type,
        phone: target.type === "phone" ? target.value : undefined,
        email: target.type === "email" ? target.value : undefined,
        role: "student",
        fullName,
        college,
      },
    });

    // 5. Set HTTP-Only Secure Auth Cookies for PrepMeUp Student
    response.cookies.set(
      "pmu-session",
      JSON.stringify({
        userId,
        phone: target.type === "phone" ? target.value : undefined,
        email: target.type === "email" ? target.value : undefined,
        role: "student",
        isProfileComplete,
        fullName,
        college,
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
  } catch (err) {
    return NextResponse.json(
      { ok: false, error: "An unexpected error occurred during verification." },
      { status: 500 }
    );
  }
}
