import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    message: "Admin logged out successfully.",
  });

  response.cookies.set("pmu-admin-session", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0,
  });

  return response;
}
