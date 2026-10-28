import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";
import { logger } from "@/lib/logger";

const ADMIN_LOGIN_PATH = "/admin/login";

// PrepMeUp Protected Student Routes (Note: /prepmeup/tools/* and /prepmeup/simulations/* are public)
const PMU_STUDENT_PROTECTED = [
  "/prepmeup/dashboard",
  "/prepmeup/doubts",
  "/prepmeup/quizzes",
  "/prepmeup/coding",
  "/prepmeup/progress",
];

export async function middleware(request: NextRequest) {
  const start = performance.now();
  let response = NextResponse.next({ request });
  const { pathname } = request.nextUrl;
  const method = request.method;
  const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "127.0.0.1";
  const userAgent = request.headers.get("user-agent") || "";

  // --------------------------------------------------------------------------
  // API Route Observability Logging
  // --------------------------------------------------------------------------
  if (pathname.startsWith("/api/")) {
    const durationMs = performance.now() - start;
    logger.httpRequest({
      method,
      url: pathname,
      statusCode: response.status,
      durationMs,
      ip,
      userAgent,
    });
    return response;
  }

  // --------------------------------------------------------------------------
  // 1. Existing Portfolio CMS Guard: /admin/*
  // --------------------------------------------------------------------------
  if (pathname.startsWith("/admin")) {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      if (pathname !== ADMIN_LOGIN_PATH) {
        const redirect = request.nextUrl.clone();
        redirect.pathname = ADMIN_LOGIN_PATH;
        redirect.search = "";
        return NextResponse.redirect(redirect);
      }
      return response;
    }

    const supabase = createServerClient(url, key, {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          for (const { name, value } of cookiesToSet) {
            request.cookies.set(name, value);
          }
          response = NextResponse.next({ request });
          for (const { name, value, options } of cookiesToSet) {
            response.cookies.set(name, value, options);
          }
        },
      },
    });

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user && pathname !== ADMIN_LOGIN_PATH) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = ADMIN_LOGIN_PATH;
      redirect.searchParams.set("next", pathname);
      return NextResponse.redirect(redirect);
    }

    if (user && pathname === ADMIN_LOGIN_PATH) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/admin";
      redirect.search = "";
      return NextResponse.redirect(redirect);
    }

    return response;
  }

  // --------------------------------------------------------------------------
  // 2. PrepMeUp AI Guard: /prepmeup/admin/* (Admin Routes)
  // --------------------------------------------------------------------------
  if (pathname.startsWith("/prepmeup/admin")) {
    const isLogin = pathname === "/prepmeup/admin/login";

    const adminSessionCookie = request.cookies.get("pmu-admin-session")?.value;
    let isAdmin = false;

    if (adminSessionCookie) {
      try {
        const parsed = JSON.parse(adminSessionCookie);
        if (parsed.role === "admin") {
          isAdmin = true;
        }
      } catch {}
    }

    if (!isAdmin && !isLogin) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/prepmeup/admin/login";
      redirect.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirect);
    }

    if (isAdmin && isLogin) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/prepmeup/admin";
      redirect.search = "";
      return NextResponse.redirect(redirect);
    }

    return response;
  }

  // --------------------------------------------------------------------------
  // 3. PrepMeUp AI Guard: Student Protected Routes
  // --------------------------------------------------------------------------
  const isStudentProtected = PMU_STUDENT_PROTECTED.some((prefix) => pathname.startsWith(prefix));

  if (isStudentProtected) {
    const pmuSessionCookie = request.cookies.get("pmu-session")?.value;
    let isAuthenticated = false;
    let isProfileComplete = false;

    if (pmuSessionCookie) {
      try {
        const parsed = JSON.parse(pmuSessionCookie);
        if (parsed.userId) {
          isAuthenticated = true;
          isProfileComplete = Boolean(parsed.isProfileComplete);
        }
      } catch {}
    }

    if (!isAuthenticated) {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/prepmeup/login";
      redirect.searchParams.set("redirectTo", pathname);
      return NextResponse.redirect(redirect);
    }

    if (!isProfileComplete && pathname !== "/prepmeup/onboarding") {
      const redirect = request.nextUrl.clone();
      redirect.pathname = "/prepmeup/onboarding";
      return NextResponse.redirect(redirect);
    }

    return response;
  }

  return response;
}

export const config = {
  matcher: [
    "/admin/:path*",
    "/prepmeup/admin/:path*",
    "/prepmeup/dashboard",
    "/prepmeup/doubts",
    "/prepmeup/quizzes",
    "/prepmeup/coding",
    "/prepmeup/progress",
    "/api/:path*",
  ],
};
