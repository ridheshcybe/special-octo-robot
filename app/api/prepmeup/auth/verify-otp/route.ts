import { NextResponse, type NextRequest } from "next/server";
import { phoneSchema, otpSchema } from "@/app/prepmeup/_lib/validation";
import { checkAndIncrementVerifyAttempts, resetVerifyAttempts } from "@/app/prepmeup/_lib/rateLimit";
import { verifyTwilioOtp } from "@/app/prepmeup/_lib/twilioVerify";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Validate inputs with Zod
    const phoneResult = phoneSchema.safeParse(body.phone);
    if (!phoneResult.success) {
      return NextResponse.json(
        { ok: false, error: phoneResult.error.issues[0]?.message ?? "Invalid phone number" },
        { status: 400 }
      );
    }
    const phone = phoneResult.data;

    const otpResult = otpSchema.safeParse(body.code);
    if (!otpResult.success) {
      return NextResponse.json(
        { ok: false, error: otpResult.error.issues[0]?.message ?? "Invalid 6-digit OTP code" },
        { status: 400 }
      );
    }
    const code = otpResult.data;

    // 2. Brute-force protection: Max 5 verification attempts per phone
    const attemptCheck = checkAndIncrementVerifyAttempts(phone);
    if (!attemptCheck.allowed) {
      return NextResponse.json(
        { ok: false, error: "Maximum verification attempts exceeded. Please request a new code." },
        { status: 429 }
      );
    }

    // 3. Verify OTP via Twilio Verify (or Dev Mock)
    const verifyResult = await verifyTwilioOtp(phone, code);
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
    resetVerifyAttempts(phone);

    // 4. Supabase User Management
    const serviceClient = createPmuServiceClient();
    let userId: string = `mock_pmu_user_${phone.replace(/\+/g, "")}`;
    let isProfileComplete = false;
    let fullName = "";
    let college = "";

    if (serviceClient && process.env.PMU_SUPABASE_SERVICE_ROLE_KEY) {
      try {
        const { data: existingProfile } = await serviceClient
          .from("pmu_profiles")
          .select("*")
          .eq("phone", phone)
          .maybeSingle();

        if (existingProfile) {
          userId = existingProfile.id;
          fullName = existingProfile.full_name || "";
          college = existingProfile.college || "";
          isProfileComplete = Boolean(fullName.trim());
        } else {
          // Provision in pmu_profiles
          const { data: newProfile } = await serviceClient
            .from("pmu_profiles")
            .insert({
              phone,
              full_name: "",
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

    const response = NextResponse.json({
      ok: true,
      message: "Authentication successful.",
      isNewUser: !isProfileComplete,
      isProfileComplete,
      redirectTo: isProfileComplete ? "/prepmeup/dashboard" : "/prepmeup/onboarding",
      user: {
        id: userId,
        phone,
        role: "student",
        fullName,
        college,
      },
    });

    // 5. Set HTTP-Only Secure Auth Cookies for PrepMeUp Student
    response.cookies.set(
      "pmu-session",
      JSON.stringify({ userId, phone, role: "student", isProfileComplete, fullName, college }),
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
