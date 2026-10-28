"use client";
import Link from "next/link";
import { CONTACT_EMAIL, SITE_NAME } from "../lib/site";

const LEGAL_LINKS = [
  { to: "/courses/terms", label: "Terms of Service" },
  { to: "/courses/privacy", label: "Privacy Policy" },
  { to: "/courses/refunds", label: "Refunds & Cancellation" },
  { to: "/courses/pricing-policy", label: "Pricing & Delivery" },
  { to: "/courses/contact", label: "Contact" },
] as const;

/** Footer with the five policy pages — linked on every public page. */
export default function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200 py-8">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
          <nav className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs">
            {LEGAL_LINKS.map((l) => (
              <Link key={l.to} href={l.to} className="text-zinc-500 hover:text-zinc-900">
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
        <p className="mt-4 text-center text-xs text-zinc-500">
          © {new Date().getFullYear()} {SITE_NAME} · Prepaid passes, no auto-debit ·
          Questions?{" "}
          <a href={`mailto:${CONTACT_EMAIL}`} className="hover:text-zinc-900">
            {CONTACT_EMAIL}
          </a>
        </p>
      </div>
    </footer>
  );
}
