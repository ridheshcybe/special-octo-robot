"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

const TABS = [
  { to: "/courses/admin", label: "Courses" },
  { to: "/courses/admin/lessons", label: "Lessons" },
  { to: "/courses/admin/plans", label: "Plans" },
  { to: "/courses/admin/users", label: "Users" },
  { to: "/courses/admin/payments", label: "Payments" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="mx-auto w-full max-w-6xl space-y-6 px-4 py-8">
      <div>
        <h1 className="text-2xl font-bold">Courses admin</h1>
        <p className="text-sm text-zinc-500">
          Write access is enforced by RLS (role = admin), not by this UI.
        </p>
      </div>

      <nav className="flex flex-wrap gap-2 border-b border-zinc-200 pb-3">
        {TABS.map((tab) => (
          <Link
            key={tab.to}
            href={tab.to}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition ${
              pathname === tab.to
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </Link>
        ))}
      </nav>

      {children}
    </div>
  );
}
