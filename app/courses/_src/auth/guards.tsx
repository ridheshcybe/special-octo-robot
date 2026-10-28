"use client";

import { useRouter } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { useAuth } from "./AuthContext";

/** Blocks /courses/admin for anyone whose profile.role is not 'admin'. */
export function RequireAdmin({ children }: { children: ReactNode }) {
  const { userId, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!userId) router.replace("/courses/login?next=/courses/admin");
    else if (profile?.role !== "admin") router.replace("/courses/dashboard");
  }, [loading, userId, profile, router]);

  if (loading) {
    return <p className="py-16 text-center text-sm text-zinc-500">Loading…</p>;
  }
  if (!userId || profile?.role !== "admin") {
    return <p className="py-16 text-center text-sm text-zinc-500">Redirecting…</p>;
  }
  return <>{children}</>;
}

/** Blocks signed-out visitors from student-only pages. */
export function RequireUser({ children }: { children: ReactNode }) {
  const { userId, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !userId) router.replace("/courses/login");
  }, [loading, userId, router]);

  if (loading) {
    return <p className="py-16 text-center text-sm text-zinc-500">Loading…</p>;
  }
  if (!userId) {
    return <p className="py-16 text-center text-sm text-zinc-500">Redirecting…</p>;
  }
  return <>{children}</>;
}
