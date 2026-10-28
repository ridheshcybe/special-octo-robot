"use client";

import { cx } from "@/lib/cx";
import type { CSSProperties, ElementType, ReactNode } from "react";
import { useInView } from "../useInView";

type RevealTag = "div" | "p" | "li" | "article" | "section" | "span" | "h2" | "h3" | "figure" | "a";

export type RevealProps = {
  as?: RevealTag;
  className?: string;
  style?: CSSProperties;
  /** slide distance, e.g. "16px" */
  y?: string;
  /** duration + easing overrides, e.g. "560ms" */
  duration?: string;
  delay?: string;
  easing?: string;
  children?: ReactNode;
};

/**
 * The spec's "fade + slide up" block: opacity 0 -> 1 and translateY -> 0, once
 * the element first enters the viewport. Timings come from the motion system
 * (520ms for body copy, 560ms for cards/cells, 620ms for project cards).
 */
export function Reveal({
  as = "div",
  className,
  style,
  y,
  duration,
  delay,
  easing,
  children,
}: RevealProps) {
  const { ref, inView } = useInView<HTMLDivElement>();
  const Component = as as ElementType;

  const vars: Record<string, string> = {};
  if (y != null) vars["--rv-y"] = y;
  if (duration != null) vars["--rv-d"] = duration;
  if (delay != null) vars["--rv-delay"] = delay;
  if (easing != null) vars["--rv-e"] = easing;

  return (
    <Component
      ref={ref}
      data-rv
      className={cx("rv-fade", inView && "is-in", className)}
      style={{ ...style, ...vars } as CSSProperties}
    >
      {children}
    </Component>
  );
}
