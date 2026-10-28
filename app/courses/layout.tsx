"use client";

import type { ReactNode } from "react";
import { AuthProvider } from "./_src/auth/AuthContext";
import "./courses.css";

/**
 * Root layout for everything under /courses — public storefront and admin.
 * The courses platform authenticates against its OWN Supabase project, so the
 * provider lives here rather than sharing the portfolio's admin session.
 */
export default function CoursesLayout({ children }: { children: ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}
