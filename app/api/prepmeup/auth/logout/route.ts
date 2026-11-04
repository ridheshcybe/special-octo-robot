import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({
    ok: true,
    message: "Logged out successfully.",
  });

  // Clear session cookies
  response.cookies.set("pmu-session", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0,
  });

  response.cookies.set("pmu-admin-session", "", {
    path: "/",
    httpOnly: true,
    maxAge: 0,
  });

  return response;
}
