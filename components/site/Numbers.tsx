"use client";

import { cx } from "@/lib/cx";
import type { GithubStats } from "@/lib/types";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useInView } from "../useInView";
import { useReducedMotion } from "../useReducedMotion";
import { Eyebrow } from "./Eyebrow";
import { TextReveal } from "./TextReveal";

const COUNT_MS = 1200;
const STAGGER_MS = 110;

/** easeOutExpo count-up; renders 0 immediately and "—" when the figure failed. */
function CountUp({
  target,
  delay,
  active,
}: {
  target: number | null;
  delay: number;
  active: boolean;
}) {
  const reduced = useReducedMotion();
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active || target === null) return;
    if (reduced) {
      setValue(target);
      return;
    }

    let raf = 0;
    let started = 0;
    const timer = window.setTimeout(() => {
      started = performance.now();
      const step = (now: number) => {
        const p = Math.min(1, (now - started) / COUNT_MS);
        const eased = p === 1 ? 1 : 1 - Math.pow(2, -10 * p);
        setValue(Math.round(target * eased));
        if (p < 1) raf = requestAnimationFrame(step);
        else setValue(target);
      };
      raf = requestAnimationFrame(step);
    }, delay);

    return () => {
      window.clearTimeout(timer);
      cancelAnimationFrame(raf);
    };
  }, [active, target, delay, reduced]);

  if (target === null) return <>—</>;
  return <>{value}</>;
}

type NumbersProps = {
  heading: string;
  stats: GithubStats;
  papersCount: number;
};

/**
 * Live GitHub figures plus the static paper count.
 *
 * The whole section is one in-view group: when it first enters, every cell is
 * revealed with an `index * 110ms` stagger and the count-ups start on the same
 * beat.
 */
export function Numbers({ heading, stats, papersCount }: NumbersProps) {
  const { ref, inView } = useInView<HTMLElement>();

  const cells = [
    { key: "repos", value: stats.repos, label: "Public repositories on GitHub" },
    { key: "stars", value: stats.stars, label: "Stars earned across repos" },
    { key: "followers", value: stats.followers, label: "Followers on GitHub" },
    { key: "papers", value: papersCount, label: "Research paper published" },
  ];

  return (
    <section className="numbers" id="numbers" ref={ref}>
      <div className={cx("rv-fade", inView && "is-in")} style={{ "--rv-d": "520ms" } as CSSProperties}>
        <Eyebrow>By The Numbers</Eyebrow>
      </div>

      <TextReveal
        text={heading}
        className="head-h2"
        stagger={90}
        duration={900}
        forceIn={inView}
      />

      <dl className="stats">
        {cells.map((cell, i) => (
          <div
            key={cell.key}
            className={cx("stat rv-fade", inView && "is-in")}
            style={
              {
                "--rv-d": "560ms",
                "--rv-delay": `${i * STAGGER_MS}ms`,
              } as CSSProperties
            }
          >
            <dd className="stat-figure">
              <CountUp target={cell.value} delay={i * STAGGER_MS} active={inView} />
            </dd>
            <dt className="stat-label">{cell.label}</dt>
          </div>
        ))}
      </dl>
    </section>
  );
}
