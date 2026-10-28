"use client";
import type { ReactNode } from "react";
import Link from "next/link";
import { POLICY_LAST_UPDATED, SITE_NAME } from "../../lib/site";

/**
 * Shared shell for the five policy pages: same width, same "last updated"
 * line, same plain-text styling. Content stays simple on purpose.
 */
export default function LegalPage({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold">{title}</h1>
      <p className="mt-1 text-xs text-zinc-500">
        {SITE_NAME} · Last updated: {POLICY_LAST_UPDATED}
      </p>
      <div className="mt-6 space-y-6 text-sm leading-relaxed text-zinc-700">{children}</div>
      <Link href="/courses" className="btn-outline mt-10">
        ← Back to courses
      </Link>
    </div>
  );
}

export function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2">
      <h2 className="text-base font-semibold text-zinc-900">{title}</h2>
      {children}
    </section>
  );
}

export function Bullets({ items }: { items: ReactNode[] }) {
  return (
    <ul className="list-disc space-y-1 pl-5">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
