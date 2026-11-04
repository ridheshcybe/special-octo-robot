"use client";

import { cx } from "@/lib/cx";
import type { CSSProperties, ElementType } from "react";
import { useEffect, useRef, useState } from "react";
import { useInView } from "../useInView";

type TextRevealProps = {
  text: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  className?: string;
  style?: CSSProperties;
  /** per-line stagger */
  stagger?: number;
  duration?: number;
  /** when the parent owns the trigger (the hero), skip the observer */
  forceIn?: boolean;
};

const FONT_WAIT_MS = 2000;

/**
 * Splits a heading into its measured visual lines and reveals them one by one
 * (translateY(110% -> 0), opacity 0 -> 1, ~90ms line stagger).
 *
 * The raw text is what renders on the server and on first paint — the split
 * happens in an effect and re-measures on resize, so the markup is complete for
 * crawlers and the no-JS case.
 */
export function TextReveal({
  text,
  as = "h2",
  className,
  style,
  stagger = 90,
  duration = 880,
  forceIn = false,
}: TextRevealProps) {
  const { ref, inView } = useInView<HTMLElement>();
  const [lines, setLines] = useState<string[] | null>(null);
  const lastWidth = useRef(0);
  const Tag = as as ElementType;

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;

    const measure = () => {
      const node = ref.current;
      if (cancelled || !node) return;

      const normalized = text.replace(/\s+/g, " ").trim();
      if (!normalized) return;

      const words = normalized.split(" ");
      if (words.length < 2) {
        setLines([normalized]);
        return;
      }

      const width = node.getBoundingClientRect().width;
      if (!width) {
        setLines([normalized]);
        return;
      }
      lastWidth.current = width;

      // Measure in an offscreen clone so the live node keeps a stable width.
      const probe = document.createElement(node.tagName);
      probe.className = node.className;
      probe.setAttribute("aria-hidden", "true");
      probe.style.cssText =
        `position:absolute;left:-99999px;top:0;visibility:hidden;pointer-events:none;` +
        `z-index:-1;width:${width}px;`;

      words.forEach((word, i) => {
        const span = document.createElement("span");
        span.style.cssText = "display:inline-block;white-space:pre";
        span.textContent = word;
        probe.appendChild(span);
        if (i < words.length - 1) probe.appendChild(document.createTextNode(" "));
      });

      document.body.appendChild(probe);
      const spans = Array.from(probe.children) as HTMLElement[];
      const grouped: string[] = [];
      let top: number | null = null;

      spans.forEach((span, i) => {
        const t = Math.round(span.offsetTop);
        if (top === null || Math.abs(t - top) > 2) {
          grouped.push(words[i]);
          top = t;
        } else {
          grouped[grouped.length - 1] += ` ${words[i]}`;
        }
      });

      document.body.removeChild(probe);
      setLines(grouped);
    };

    // Wait for the display face so the wrap is measured against Anton, not the
    // fallback — but never let a stalled font request hold the reveal hostage.
    const fontsReady =
      typeof document !== "undefined" && document.fonts?.ready
        ? document.fonts.ready
        : Promise.resolve();
    Promise.race([fontsReady, new Promise((r) => setTimeout(r, FONT_WAIT_MS))])
      .then(measure)
      .catch(measure);

    let timer: number | undefined;
    const onResize = () => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        const node = ref.current;
        if (!node) return;
        if (Math.abs(node.getBoundingClientRect().width - lastWidth.current) < 2) return;
        measure();
      }, 150);
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
      window.removeEventListener("resize", onResize);
    };
  }, [text, ref]);

  const isIn = forceIn || inView;
  const ready = lines !== null;

  return (
    <Tag
      ref={ref}
      data-split
      className={cx("rv-lines", isIn && "is-in", ready && "split-ready", className)}
      style={style}
    >
      {ready
        ? lines.map((line, i) => (
            <span key={i} className="rv-line">
              <span
                className="rv-in"
                style={
                  {
                    "--rv-delay": `${i * stagger}ms`,
                    "--rv-d": `${duration}ms`,
                  } as CSSProperties
                }
              >
                {line}
              </span>
            </span>
          ))
        : text}
    </Tag>
  );
}
