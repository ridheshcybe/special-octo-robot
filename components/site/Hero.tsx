"use client";

import { cx } from "@/lib/cx";
import type { CSSProperties } from "react";
import { useEffect, useState } from "react";
import { useReducedMotion } from "../useReducedMotion";
import { LetterReveal } from "./LetterReveal";
import { LiquidImage } from "./LiquidImage";

/** The hero waits for the preloader: 2000ms count + ~500ms wipe. */
const REVEAL_DELAY = 2500;

type HeroProps = {
  roles: string[];
  description: string;
  portraitUrl: string | null;
  videoUrl: string | null;
  posterUrl: string | null;
};

/**
 * The signature move: role words and description up top, then the portrait
 * composited in front of the giant accent-red name that bleeds off the bottom.
 *
 * The whole sequence is gated on REVEAL_DELAY so it lands as the preloader
 * wipes away. Lower sections are scroll-triggered instead.
 */
export function Hero({ roles, description, portraitUrl, videoUrl, posterUrl }: HeroProps) {
  const reduced = useReducedMotion();
  const [shown, setShown] = useState({ name: false, roles: false, desc: false, cue: false });

  useEffect(() => {
    if (reduced) {
      setShown({ name: true, roles: true, desc: true, cue: true });
      return;
    }

    const at = (mark: number, key: keyof typeof shown) =>
      window.setTimeout(() => setShown((prev) => ({ ...prev, [key]: true })), REVEAL_DELAY + mark);

    const timers = [at(0, "name"), at(200, "roles"), at(400, "desc"), at(900, "cue")];
    return () => timers.forEach(window.clearTimeout);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reduced]);

  return (
    <section className="hero" id="top">
      <div className="hero-top">
        <h2 className={cx("hero-roles rv-lines", shown.roles && "is-in")}>
          {roles.map((role, i) => (
            <span key={`${role}-${i}`} className="rv-line">
              <span
                className="rv-in"
                style={
                  {
                    "--rv-delay": `${i * 80}ms`,
                    "--rv-d": "760ms",
                  } as CSSProperties
                }
              >
                {role}
              </span>
            </span>
          ))}
        </h2>

        <p
          className={cx("hero-desc rv-fade", shown.desc && "is-in")}
          style={{ "--rv-y": "16px", "--rv-d": "520ms" } as CSSProperties}
        >
          {description}
        </p>
      </div>

      <div className="hero-portrait">
        <LiquidImage
          alt="Portrait of Ridhesh Walavalkar"
          label="Ridhesh Walavalkar"
          bare
          scale={30}
          src={posterUrl ?? portraitUrl}
          videoSrc={videoUrl}
          poster={posterUrl ?? portraitUrl}
        />
      </div>

      <div className="hero-fade" />

      <h1 className="hero-name" aria-label="Ridhesh Walavalkar">
        <span className="hero-name-line">
          <LetterReveal text="Ridhesh" inView={shown.name} stagger={52} offset={0} duration={900} />
        </span>
        <span className="hero-name-line">
          <LetterReveal text="Walavalkar" inView={shown.name} stagger={52} offset={240} duration={900} />
        </span>
      </h1>

      <p
        className={cx("hero-cue rv-fade", shown.cue && "is-in")}
        style={{ "--rv-d": "520ms" } as CSSProperties}
      >
        Scroll to enter
      </p>
    </section>
  );
}
