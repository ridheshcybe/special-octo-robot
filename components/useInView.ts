"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first enters the viewport — IntersectionObserver,
 * threshold 0, matching the spec's "in-view triggers" behaviour. Without
 * IntersectionObserver (or in a non-DOM environment) it resolves to visible so
 * the content is never stuck in its hidden state.
 */
export function useInView<T extends HTMLElement>(once = true) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (typeof IntersectionObserver === "undefined") {
      setInView(true);
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          setInView(true);
          if (once) io.unobserve(entry.target);
        }
      },
      { threshold: 0 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [once]);

  return { ref, inView };
}
