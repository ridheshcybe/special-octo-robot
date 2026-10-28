import { NextResponse, type NextRequest } from "next/server";
import { onboardingSchema } from "@/app/prepmeup/_lib/validation";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function PATCH(req: NextRequest) {
  try {
    const pmuCookie = req.cookies.get("pmu-session")?.value;
    if (!pmuCookie) {
      return NextResponse.json({ ok: false, error: "Unauthorized. Please log in." }, { status: 401 });
    }

    let sessionData: { userId: string; phone?: string } | null = null;
    try {
      sessionData = JSON.parse(pmuCookie);
    } catch {
      return NextResponse.json({ ok: false, error: "Invalid session." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));
    const parseResult = onboardingSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid profile data" },
        { status: 400 }
      );
    }

    const { fullName, college, branch, currentSemester } = parseResult.data;

    const serviceClient = createPmuServiceClient();
    if (serviceClient && sessionData?.userId) {
      await serviceClient
        .from("pmu_profiles")
        .update({
          full_name: fullName,
          college,
          branch,
          current_semester: currentSemester,
          updated_at: new Date().toISOString(),
        })
        .eq("id", sessionData.userId);
    }

    // Update session cookie state
    const response = NextResponse.json({
      ok: true,
      message: "Profile updated successfully.",
      profile: {
        fullName,
        college,
        branch,
        currentSemester,
        isComplete: true,
      },
    });

    response.cookies.set(
      "pmu-session",
      JSON.stringify({
        ...sessionData,
        isProfileComplete: true,
        fullName,
        college,
      }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7,
      }
    );

    return response;
  } catch (err) {
    return NextResponse.json({ ok: false, error: "Failed to update profile." }, { status: 500 });
  }
}
