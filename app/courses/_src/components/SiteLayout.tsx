"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { useAuth } from "../auth/AuthContext";
import { isAccessActive, daysLeft } from "../lib/supabase";
import AccessBadge from "./AccessBadge";
import SiteFooter from "./SiteFooter";

/**
 * Shell for the public /courses pages (the admin panel has its own shell).
 * Wraps the section in the light theme the storefront uses, and links back to
 * the portfolio — courses is a section of the one product, not a separate site.
 */
export default function SiteLayout({ children }: { children: ReactNode }) {
  const { userId, profile, signOut } = useAuth();

  return (
    <div className="flex min-h-screen flex-col bg-white text-zinc-900">
      <header className="border-b border-zinc-200">
        <nav className="mx-auto flex h-14 max-w-6xl items-center justify-between gap-4 px-4">
          <div className="flex items-center gap-4">
            <Link href="/" className="text-xs text-zinc-500 hover:text-zinc-900">
              ← Portfolio
            </Link>
            <Link href="/courses" className="font-semibold">
              College Courses
            </Link>
          </div>
          <div className="flex items-center gap-4 text-sm">
            {userId ? (
              <>
                {profile?.role === "admin" ? (
                  <Link href="/courses/admin" className="text-zinc-600 hover:text-zinc-900">
                    Admin
                  </Link>
                ) : null}
                <Link href="/courses/dashboard" className="text-zinc-600 hover:text-zinc-900">
                  My learning
                </Link>
                {profile ? (
                  <AccessBadge
                    active={isAccessActive(profile)}
                    daysLeft={daysLeft(profile.access_expires_at)}
                  />
                ) : null}
                <button onClick={() => void signOut()} className="btn-outline px-3 py-1 text-xs">
                  Sign out
                </button>
              </>
            ) : (
              <Link href="/courses/login" className="btn-primary px-3 py-1 text-xs">
                Sign in
              </Link>
            )}
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-8">{children}</main>

      <SiteFooter />
    </div>
  );
}
