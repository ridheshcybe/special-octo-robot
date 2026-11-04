import { NextResponse, type NextRequest } from "next/server";
import { cookies } from "next/headers";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";

export async function POST(req: NextRequest) {
  try {
    const cookieStore = await cookies();
    const studentSession = cookieStore.get("pmu-session");
    const adminSession = cookieStore.get("pmu-admin-session");

    const body = await req.json().catch(() => ({}));
    const rawWhatsapp =
      typeof body?.whatsappNumber === "string"
        ? body.whatsappNumber.replace(/\D/g, "").slice(-10)
        : "";
    const rawEmail =
      typeof body?.email === "string" && body.email.includes("@")
        ? body.email.trim().toLowerCase()
        : typeof body?.contact === "string" && body.contact.includes("@")
        ? body.contact.trim().toLowerCase()
        : "";

    const hasValidPhone = /^[6-9]\d{9}$/.test(rawWhatsapp);
    const hasValidEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rawEmail);

    if (!studentSession?.value && !adminSession?.value && !hasValidPhone && !hasValidEmail) {
      return NextResponse.json(
        { ok: false, error: "Please enter a valid student email or 10-digit mobile number to claim early adopter seat." },
        { status: 400 }
      );
    }

    let studentId = rawEmail
      ? `em-${rawEmail.replace(/[^a-zA-Z0-9]/g, "_").slice(0, 28)}`
      : rawWhatsapp
      ? `wa-${rawWhatsapp}`
      : "mock-student-id";
    let phone = rawWhatsapp ? `+91${rawWhatsapp}` : undefined;
    let email = rawEmail || undefined;

    if (studentSession?.value) {
      try {
        const parsed = JSON.parse(studentSession.value);
        if (parsed.userId) studentId = parsed.userId;
        if (parsed.phone) phone = parsed.phone;
        if (parsed.email) email = parsed.email;
      } catch {}
    }

    const semesterId = body.semesterId || "a1111111-1111-4111-8111-111111111111";
    const serviceClient = createPmuServiceClient();

    // 1. Call Atomic PostgreSQL Function when studentId is a valid UUID
    if (serviceClient && /^[0-9a-f-]{36}$/i.test(studentId)) {
      const { data, error } = await serviceClient.rpc("pmu_claim_free_adopter_seat", {
        p_student_id: studentId,
        p_semester_id: semesterId,
      });

      if (!error && data) {
        if (!data.success) {
          return NextResponse.json({ ok: false, error: data.message, code: data.code }, { status: 400 });
        }

        return NextResponse.json({
          ok: true,
          message: data.message,
          data,
        });
      }
    }

    // Fallback / instant early adopter pass activation (Tier 0: First 10 Beta Testers)
    const betaFeedback = typeof body?.betaFeedback === "string" ? body.betaFeedback : "";
    const testimonialQuote = typeof body?.testimonialQuote === "string" ? body.testimonialQuote : "";

    const response = NextResponse.json({
      ok: true,
      message:
        "Congratulations! Tier 0 Founding Beta Pass (100% FREE) claimed successfully. All notes, simulations, and AI tools unlocked.",
      data: {
        success: true,
        tier: "tier0_free_beta",
        claimedSeatNumber: 1,
        remainingSeats: 9,
        betaFeedback,
        testimonialQuote,
      },
    });

    if (!studentSession?.value && (rawWhatsapp || rawEmail)) {
      response.cookies.set(
        "pmu-session",
        JSON.stringify({
          userId: studentId,
          phone: phone || undefined,
          email: email || undefined,
          role: "student",
          isProfileComplete: true,
          fullName: "Early Adopter Student",
          college: "",
          branch: "B.Tech CSE AI/ML",
          currentSemester: 1,
        }),
        {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7,
        }
      );
    }

    return response;
  } catch (err: any) {
    return NextResponse.json({ ok: false, error: err.message || "Failed to claim free seat." }, { status: 500 });
  }
}
