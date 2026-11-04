"use client";

import { cx } from "@/lib/cx";
import { useEffect, useState } from "react";
import { useSmoothScroll } from "../SmoothScroll";
import { useReducedMotion } from "../useReducedMotion";

const COUNT_MS = 2000;
const LABEL_FADE_MS = 300;
const WIPE_DELAY_MS = 200;
const WIPE_MS = 650;

type Stage = "run" | "out" | "wipe" | "done";

/**
 * Full-screen intro: counts 0 -> 100 over 2000ms, fades both labels out over
 * ~300ms, waits 200ms, then wipes upward over ~650ms and releases the scroll
 * lock. Skipped entirely under reduced motion (the CSS also hides it before
 * hydration so there is no flash).
 */
export function Preloader() {
  const reduced = useReducedMotion();
  const { lock, unlock } = useSmoothScroll();
  const [count, setCount] = useState(0);
  const [stage, setStage] = useState<Stage>("run");

  /* Count, then fade -> pause -> wipe -> done. */
  useEffect(() => {
    if (reduced) {
      setCount(100);
      setStage("done");
      return;
    }

    let raf = 0;
    let wipeTimer = 0;
    let doneTimer = 0;
    const started = performance.now();

    const tick = (now: number) => {
      const p = Math.min(1, (now - started) / COUNT_MS);
      setCount(Math.round(p * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
        return;
      }
      setCount(100);
      setStage("out");
      wipeTimer = window.setTimeout(() => setStage("wipe"), LABEL_FADE_MS + WIPE_DELAY_MS);
      doneTimer = window.setTimeout(
        () => setStage("done"),
        LABEL_FADE_MS + WIPE_DELAY_MS + WIPE_MS,
      );
    };

    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(wipeTimer);
      window.clearTimeout(doneTimer);
    };
  }, [reduced]);

  /* Start at the top of the page, and hold scroll until the wipe rests. */
  useEffect(() => {
    try {
      history.scrollRestoration = "manual";
    } catch {
      // older browsers
    }
    window.scrollTo(0, 0);
  }, []);

  useEffect(() => {
    if (stage === "done") unlock("preloader");
    else lock("preloader");
  }, [stage, lock, unlock]);

  useEffect(() => () => unlock("preloader"), [unlock]);

  if (reduced) return null;

  const fading = stage !== "run";
  const wiping = stage === "wipe" || stage === "done";
  const done = stage === "done";

  return (
    <div
      id="preloader"
      className={cx("preloader", fading && "is-out", wiping && "is-wipe", done && "is-done")}
      aria-hidden={done ? "true" : undefined}
    >
      <div className="preloader-bg" />
      <p className="preloader-brand">Ridhesh Walavalkar</p>
      <p className="preloader-count">
        <span>{count}</span>
        <span className="pct">%</span>
      </p>
    </div>
  );
}
