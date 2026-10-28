"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import { cx } from "@/lib/cx";
import { createClient } from "@/lib/supabase/client";

const NAV = [
  { label: "Overview", href: "/admin" },
  { label: "Settings", href: "/admin/settings" },
  { label: "Story", href: "/admin/story" },
  { label: "Projects", href: "/admin/projects" },
  { label: "Research", href: "/admin/research" },
  { label: "Social", href: "/admin/social" },
  { label: "Media", href: "/admin/media" },
];

/**
 * The panel chrome. Deliberately site-free: no Preloader, no SiteNav, no Lenis
 * and no marquee — just the same tokens and faces so it matches the site.
 */
export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [signingOut, setSigningOut] = useState(false);

  const signOut = async () => {
    setSigningOut(true);
    try {
      await createClient().auth.signOut();
    } catch {
      // No Supabase configured: bounce to login anyway.
    }
    router.replace("/admin/login");
    router.refresh();
  };

  return (
    <div className="admin">
      <aside className="admin-side">
        <Link className="admin-brand" href="/admin">
          <span className="logo-badge">RW</span>
          <span className="admin-brand-text">
            <span className="admin-brand-name">Admin</span>
            <span className="admin-brand-sub">Ridhesh Walavalkar</span>
          </span>
        </Link>

        <nav className="admin-nav" aria-label="Admin">
          {NAV.map((item) => {
            const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} aria-current={active ? "page" : undefined}>
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="admin-side-foot">
          <Link className="admin-link" href="/" target="_blank" rel="noreferrer">
            View site ↗
          </Link>
          <button
            className={cx("admin-btn", "admin-btn-sm")}
            type="button"
            onClick={signOut}
            disabled={signingOut}
          >
            {signingOut ? "Signing out…" : "Sign out"}
          </button>
        </div>
      </aside>

      <div className="admin-main">{children}</div>
    </div>
  );
}
