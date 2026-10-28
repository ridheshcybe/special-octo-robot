"use client";

import Lenis from "lenis";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

type SmoothScrollApi = {
  lenis: Lenis | null;
  /** Hold the page. Multiple owners can hold it at once. */
  lock: (id: string) => void;
  /** Release one holder; scrolling resumes when nobody holds it. */
  unlock: (id: string) => void;
  scrollTo: (target: Element | string, options?: { duration?: number; offset?: number }) => void;
};

const SmoothScrollContext = createContext<SmoothScrollApi>({
  lenis: null,
  lock: () => {},
  unlock: () => {},
  scrollTo: () => {},
});

export function useSmoothScroll() {
  return useContext(SmoothScrollContext);
}

/**
 * Initialises Lenis once and exposes it through context.
 *
 * The preloader and the mobile menu are independent scroll locks (both stop
 * Lenis), so this keeps a registry rather than a single boolean — the page only
 * starts scrolling again when every holder has released it.
 *
 * Under `prefers-reduced-motion` Lenis is never created and the page uses
 * native scrolling.
 */
export function SmoothScroll({ children }: { children: ReactNode }) {
  const [lenis, setLenis] = useState<Lenis | null>(null);
  const lenisRef = useRef<Lenis | null>(null);
  const locks = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const instance = new Lenis({ smoothWheel: true });
    lenisRef.current = instance;
    setLenis(instance);
    // Child effects run before this one, so a holder may already be waiting.
    if (locks.current.size > 0) instance.stop();
    // The original exposed window.lenis; keep that for parity with the design.
    (window as unknown as { lenis?: Lenis }).lenis = instance;

    let raf = requestAnimationFrame(function loop(time: number) {
      instance.raf(time);
      raf = requestAnimationFrame(loop);
    });

    return () => {
      cancelAnimationFrame(raf);
      instance.destroy();
      lenisRef.current = null;
      (window as unknown as { lenis?: Lenis }).lenis = undefined;
    };
  }, []);

  const lock = useCallback((id: string) => {
    locks.current.add(id);
    lenisRef.current?.stop();
  }, []);

  const unlock = useCallback((id: string) => {
    locks.current.delete(id);
    if (locks.current.size === 0) lenisRef.current?.start();
  }, []);

  const scrollTo = useCallback<SmoothScrollApi["scrollTo"]>((target, options) => {
    const el = (
      typeof target === "string" ? document.querySelector(target) : target
    ) as HTMLElement | null;
    if (!el) return;
    const instance = lenisRef.current;
    if (instance) instance.scrollTo(el, { duration: options?.duration ?? 1.2, offset: options?.offset });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  /* Smooth anchors: intercept every same-page `#` link. */
  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null;
      const link = target?.closest?.('a[href^="#"]');
      if (!link) return;
      const href = link.getAttribute("href");
      if (!href || href.length < 2) return;
      const el = document.querySelector(href);
      if (!el) return;
      event.preventDefault();
      scrollTo(el);
    };

    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, [scrollTo]);

  const value = useMemo<SmoothScrollApi>(
    () => ({ lenis, lock, unlock, scrollTo }),
    [lenis, lock, unlock, scrollTo],
  );

  return <SmoothScrollContext.Provider value={value}>{children}</SmoothScrollContext.Provider>;
}
