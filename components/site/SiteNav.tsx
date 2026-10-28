"use client";

import { cx } from "@/lib/cx";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "../SmoothScroll";

const NAV_LINKS = [
  { label: "Story", href: "#story" },
  { label: "Projects", href: "#projects" },
  { label: "Research", href: "#research" },
  { label: "Courses", href: "#courses" },
  { label: "Numbers", href: "#numbers" },
  { label: "Contact", href: "#contact" },
];

const MENU_STAGGER_MS = 80;
const MENU_LEAD_IN_MS = 120;

/** Fixed header: monogram badge, desktop links, and the mobile menu. */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const { lock, unlock } = useSmoothScroll();

  useEffect(() => {
    if (open) lock("menu");
    else unlock("menu");
  }, [open, lock, unlock]);

  useEffect(() => () => unlock("menu"), [unlock]);

  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  return (
    <>
      <header className="site-nav">
        <nav>
          <a className="logo" href="#top" aria-label="Ridhesh Walavalkar — back to top">
            <span className="logo-badge">RW</span>
            <span className="logo-name">Ridhesh Walavalkar</span>
          </a>

          <ul className="nav-links">
            {NAV_LINKS.map((link) => (
              <li key={link.href}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>

          <button
            className="burger"
            type="button"
            aria-label={open ? "Close menu" : "Menu"}
            aria-expanded={open}
            aria-controls="mobile-menu"
            onClick={() => setOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
        </nav>
      </header>

      <div
        id="mobile-menu"
        className={cx("mobile-menu", open && "is-open")}
        aria-hidden={!open}
        onClick={(event) => {
          if ((event.target as HTMLElement).closest("a")) setOpen(false);
        }}
      >
        <ul>
          {NAV_LINKS.map((link, i) => (
            <li key={link.href}>
              <a
                href={link.href}
                style={{ "--rv-delay": `${MENU_LEAD_IN_MS + i * MENU_STAGGER_MS}ms` } as CSSProperties}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
