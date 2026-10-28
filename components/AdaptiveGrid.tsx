"use client";

import { useEffect } from "react";

const FONT_BASE = 16;
const BASE_W = 1920;
const COEF = 0.6666;

/**
 * The rem-based adaptive grid scales *down* through the `vw` media queries in
 * globals.css. Above 1920px nothing scales, so this damps the root font size up
 * proportionally instead.
 */
function applyAdaptiveGrid() {
  const w = window.innerWidth;
  const reduction = ((BASE_W - w) / BASE_W) * 100 * COEF;
  const size = FONT_BASE - (FONT_BASE * reduction) / 100;
  if (size > FONT_BASE) document.documentElement.style.fontSize = `${size}px`;
  else document.documentElement.style.removeProperty("font-size");
}

export function AdaptiveGrid() {
  useEffect(() => {
    applyAdaptiveGrid();
    window.addEventListener("resize", applyAdaptiveGrid);
    window.addEventListener("orientationchange", applyAdaptiveGrid);
    return () => {
      window.removeEventListener("resize", applyAdaptiveGrid);
      window.removeEventListener("orientationchange", applyAdaptiveGrid);
    };
  }, []);

  return null;
}
