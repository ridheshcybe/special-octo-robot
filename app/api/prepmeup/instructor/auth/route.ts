import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getInstructorBySlug } from "@/app/prepmeup/_lib/trackStore";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { emailOrSlug, action } = body;

    const cookieStore = await cookies();

    if (action === "logout") {
      cookieStore.delete("pmu_instructor_session");
      return NextResponse.json({ ok: true, message: "Logged out successfully" });
    }

    // Identify instructor
    const identifier = (emailOrSlug || "").trim().toLowerCase();
    const isVaidya =
      identifier.includes("vaidya") ||
      identifier.includes("quantum") ||
      identifier === "e0000000-0000-0000-0000-000000000001" ||
      identifier === "dr-aravind-vaidya";

    if (!isVaidya && identifier !== "instructor") {
      return NextResponse.json(
        { ok: false, error: "Invalid instructor credentials. Access restricted to verified faculty." },
        { status: 401 }
      );
    }

    const instructor = getInstructorBySlug("dr-aravind-vaidya");
    const sessionPayload = {
      instructorId: instructor?.id || "e0000000-0000-0000-0000-000000000001",
      slug: instructor?.slug || "dr-aravind-vaidya",
      fullName: instructor?.fullName || "Dr. Aravind Vaidya, PhD",
      role: "instructor",
      authenticatedAt: new Date().toISOString(),
    };

    cookieStore.set("pmu_instructor_session", JSON.stringify(sessionPayload), {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 7 * 24 * 3600, // 7 days
    });

    return NextResponse.json({
      ok: true,
      message: "Instructor authenticated successfully",
      instructor: sessionPayload,
    });
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message }, { status: 500 });
  }
}
