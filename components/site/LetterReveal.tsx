"use client";

import { cx } from "@/lib/cx";
import type { CSSProperties } from "react";

type LetterRevealProps = {
  text: string;
  className?: string;
  style?: CSSProperties;
  /** per-letter stagger in ms */
  stagger?: number;
  /** lead-in for this line, in ms (line 2 starts 240ms after line 1) */
  offset?: number;
  /** letter duration, 900ms per the spec */
  duration?: number;
  /** driven by the hero's reveal timeline */
  inView?: boolean;
};

/** Splits a line into per-letter masks that rise from below. */
export function LetterReveal({
  text,
  className,
  style,
  stagger = 52,
  offset = 0,
  duration = 900,
  inView = false,
}: LetterRevealProps) {
  return (
    <span className={cx("rv-lines", inView && "is-in", className)} style={style} aria-hidden="true">
      {Array.from(text).map((char, i) => (
        <span key={`${char}-${i}`} className="rv-mask">
          <span
            className="rv-in"
            style={
              {
                "--rv-delay": `${offset + i * stagger}ms`,
                "--rv-d": `${duration}ms`,
              } as CSSProperties
            }
          >
            {char === " " ? "\u00A0" : char}
          </span>
        </span>
      ))}
    </span>
  );
}
