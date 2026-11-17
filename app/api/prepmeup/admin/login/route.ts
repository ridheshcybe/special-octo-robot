import { NextResponse, type NextRequest } from "next/server";
import { adminLoginSchema } from "@/app/prepmeup/_lib/validation";
import { createPmuServiceClient } from "@/app/prepmeup/_lib/supabaseServer";
import { signAdminSession } from "@/app/prepmeup/_lib/adminAuth";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));

    // 1. Zod Validation
    const parseResult = adminLoginSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        { ok: false, error: parseResult.error.issues[0]?.message ?? "Invalid credentials" },
        { status: 400 }
      );
    }

    const { email, password } = parseResult.data;
    const normalizedEmail = email.trim().toLowerCase();
    const configuredAdminEmail = (process.env.PMU_ADMIN_EMAIL || "").trim().toLowerCase();
    const configuredAdminPassword = process.env.PMU_ADMIN_PASSWORD || "";

    const isDirectAdminMatch =
      Boolean(configuredAdminEmail && configuredAdminPassword) &&
      normalizedEmail === configuredAdminEmail &&
      password === configuredAdminPassword;

    if (isDirectAdminMatch) {
      const response = NextResponse.json({
        ok: true,
        message: "Admin authentication successful.",
        user: {
          id: "admin-primary",
          email: normalizedEmail,
          role: "admin",
          fullName: "PrepMeUp Admin",
        },
      });

      response.cookies.set(
        "pmu-admin-session",
        signAdminSession({
          userId: "admin-primary",
          email: normalizedEmail,
          role: "admin",
          fullName: "PrepMeUp Admin",
        }),
        {
          path: "/",
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 12,
        }
      );

      return response;
    }

    const serviceClient = createPmuServiceClient();
    if (!serviceClient) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    // 2. Supabase Auth Email/Password Sign-In
    const { data: authData, error: authError } = await serviceClient.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return NextResponse.json({ ok: false, error: "Invalid email or password." }, { status: 401 });
    }

    // 3. Strictly Verify Admin Role in pmu_admins
    const { data: adminRecord } = await serviceClient
      .from("pmu_admins")
      .select("*")
      .eq("id", authData.user.id)
      .maybeSingle();

    if (!adminRecord) {
      return NextResponse.json(
        { ok: false, error: "Access denied. You do not have PrepMeUp admin privileges." },
        { status: 403 }
      );
    }

    const response = NextResponse.json({
      ok: true,
      message: "Admin authentication successful.",
      user: {
        id: adminRecord.id,
        email: adminRecord.email,
        role: "admin",
        fullName: adminRecord.full_name,
      },
    });

    response.cookies.set(
      "pmu-admin-session",
      JSON.stringify({
        userId: adminRecord.id,
        email: adminRecord.email,
        role: "admin",
        fullName: adminRecord.full_name,
      }),
      {
        path: "/",
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 12,
      }
    );

    return response;
  } catch (err) {
    return NextResponse.json({ ok: false, error: "An unexpected error occurred during login." }, { status: 500 });
  }
}
