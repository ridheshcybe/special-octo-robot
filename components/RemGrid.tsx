"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps `html.rem-grid` in sync across client-side navigations.
 *
 * The portfolio's viewport-based rem grid must apply everywhere EXCEPT the
 * Tailwind-based /courses section, where a scaled rem would distort spacing.
 * The initial class is set before paint by the inline script in app/layout.tsx;
 * this keeps it correct when navigating between the two areas without a full
 * page load.
 */
export function RemGrid() {
  const pathname = usePathname();

  useEffect(() => {
    const isExcluded = pathname.startsWith("/courses") || pathname.startsWith("/prepmeup");
    document.documentElement.classList.toggle("rem-grid", !isExcluded);
    if (isExcluded) {
      document.documentElement.style.removeProperty("font-size");
    }
  }, [pathname]);

  return null;
}
