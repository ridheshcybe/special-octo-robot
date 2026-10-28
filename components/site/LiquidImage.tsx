"use client";

import { cx } from "@/lib/cx";
import type { CSSProperties } from "react";
import { useEffect, useId, useRef, useState } from "react";

/** loose, watery spring */
const TENSION = 140;
const FRICTION = 13;
const BASE_FREQ = 0.009;
const MAX_FREQ = 0.022;
/** slow network or an unsupported codec: show the still instead of a blank box */
const ALPHA_TIMEOUT_MS = 4000;

export type LiquidImageProps = {
  /** image source — also the poster still when `videoSrc` is set */
  src?: string | null;
  /** when set, an autoplaying muted looped video renders instead of the image */
  videoSrc?: string | null;
  poster?: string | null;
  alt: string;
  /** shown behind the media; visible only when nothing loads */
  label: string;
  /** hero portrait: strip every overlay, just the filtered media */
  bare?: boolean;
  /** peak displacement scale on hover */
  scale?: number;
  className?: string;
  style?: CSSProperties;
};

/**
 * The site's image treatment: an SVG turbulence/displacement filter driven
 * imperatively on hover (real spring integration, not a CSS transition), with a
 * grayscale->colour veil, an accent glow sweep and a radial vignette in
 * full mode. Bare mode keeps only the filtered media.
 *
 * Hover effects are disabled on touch / <=768px and under reduced motion.
 */
export function LiquidImage({
  src,
  videoSrc,
  poster,
  alt,
  label,
  bare = false,
  scale = 28,
  className,
  style,
}: LiquidImageProps) {
  const figureRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const rawId = useId();
  const filterId = `liq-${rawId.replace(/[^a-zA-Z0-9_-]/g, "")}`;

  const [missing, setMissing] = useState(false);
  const [videoFailed, setVideoFailed] = useState(false);

  const useVideo = Boolean(videoSrc) && !videoFailed;
  const mediaSrc = useVideo ? null : src;

  /* -------- imperative filter spring ------------------------------------ */
  useEffect(() => {
    const fig = figureRef.current;
    if (!fig) return;

    const turbulence = fig.querySelector("feTurbulence");
    const displacement = fig.querySelector("feDisplacementMap");
    if (!turbulence || !displacement) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const canHover = () => window.matchMedia("(hover: hover) and (min-width: 769px)").matches;

    let progress = 0;
    let velocity = 0;
    let target = 0;
    let rafId: number | null = null;
    let last = 0;

    const write = () => {
      displacement.setAttribute("scale", (1 + progress * (scale - 1)).toFixed(3));
      turbulence.setAttribute(
        "baseFrequency",
        (BASE_FREQ + progress * (MAX_FREQ - BASE_FREQ)).toFixed(5),
      );
    };

    const step = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30) || 1 / 60;
      last = now;
      velocity += (TENSION * (target - progress) - FRICTION * velocity) * dt;
      progress += velocity * dt;
      write();
      if (Math.abs(target - progress) > 0.0015 || Math.abs(velocity) > 0.0015) {
        rafId = requestAnimationFrame(step);
      } else {
        progress = target;
        velocity = 0;
        rafId = null;
        write();
      }
    };

    const go = (to: number) => {
      if (reduced || !canHover()) return;
      target = to;
      last = performance.now();
      if (rafId === null) rafId = requestAnimationFrame(step);
    };

    const onEnter = () => go(1);
    const onLeave = () => go(0);

    fig.addEventListener("pointerenter", onEnter);
    fig.addEventListener("pointerleave", onLeave);
    fig.addEventListener("focusin", onEnter);
    fig.addEventListener("focusout", onLeave);

    return () => {
      fig.removeEventListener("pointerenter", onEnter);
      fig.removeEventListener("pointerleave", onLeave);
      fig.removeEventListener("focusin", onEnter);
      fig.removeEventListener("focusout", onLeave);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [scale]);

  /* -------- VP9 alpha-plane fallback ------------------------------------ */
  useEffect(() => {
    if (!useVideo) return;
    const video = videoRef.current;
    if (!video) return;

    const stillSrc = poster || src;
    const giveUp = () => setVideoFailed(true);

    let settled = false;
    let timer: number | undefined;

    const stopListening = () => {
      if (timer !== undefined) window.clearTimeout(timer);
      video.removeEventListener("loadeddata", decide);
      video.removeEventListener("canplay", decide);
      video.removeEventListener("error", giveUp);
      video.querySelectorAll("source").forEach((s) => s.removeEventListener("error", giveUp));
    };

    const decide = () => {
      if (settled || video.readyState < 2) return;
      settled = true;
      stopListening();
      try {
        const canvas = document.createElement("canvas");
        canvas.width = 32;
        canvas.height = 32;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;
        ctx.drawImage(video, 0, 0, 32, 32);
        const data = ctx.getImageData(0, 0, 32, 32).data;
        let hasAlpha = false;
        for (let i = 3; i < data.length; i += 4) {
          if (data[i] < 250) {
            hasAlpha = true;
            break;
          }
        }
        // Opaque frame: swap to the cutout rather than paint a black box.
        if (!hasAlpha) setVideoFailed(true);
      } catch {
        // tainted canvas or no decodable frame — leave the video alone
      }
    };

    const abandon = () => {
      if (settled) return;
      settled = true;
      stopListening();
      setVideoFailed(true);
    };

    // Never draw an undecoded video: an empty canvas reads as fully transparent.
    if (video.readyState >= 2) {
      decide();
      return;
    }

    if (video.networkState === 3) {
      abandon();
      return;
    }

    video.addEventListener("loadeddata", decide);
    video.addEventListener("canplay", decide);
    video.addEventListener("error", abandon);
    video.querySelectorAll("source").forEach((s) => s.addEventListener("error", abandon));

    if (!stillSrc) {
      // No still to fall back to: an opaque codec is no worse than a blank box,
      // so keep the video and skip the timeout.
      return () => stopListening();
    }

    timer = window.setTimeout(() => {
      if (video.readyState < 2) abandon();
      else decide();
    }, ALPHA_TIMEOUT_MS);

    return () => stopListening();
  }, [useVideo, poster, src]);

  const showMedia = !missing && (useVideo ? Boolean(videoSrc) : Boolean(mediaSrc));

  return (
    <figure
      ref={figureRef}
      role="img"
      aria-label={alt}
      className={cx("liquid", bare && "bare", missing && "is-missing", className)}
      style={style}
      data-liquid-scale={scale}
    >
      <svg className="liquid-defs" width="0" height="0" aria-hidden="true" focusable="false">
        <filter id={filterId}>
          <feTurbulence type="fractalNoise" baseFrequency={BASE_FREQ} numOctaves={2} result="noise" />
          <feDisplacementMap in="SourceGraphic" in2="noise" scale={1} />
        </filter>
      </svg>

      {/* Bare mode strips every overlay, the branded placeholder included. */}
      {!bare ? <div className="liquid-ph">{label}</div> : null}

      {showMedia && useVideo ? (
        <video
          ref={videoRef}
          className="liquid-media"
          poster={poster ?? undefined}
          autoPlay
          muted
          loop
          playsInline
          preload="auto"
          style={{ filter: `url(#${filterId})` }}
        >
          <source
            src={videoSrc as string}
            type={videoSrc && videoSrc.endsWith(".webm") ? "video/webm" : "video/mp4"}
          />
        </video>
      ) : null}

      {/* Plain <img> on purpose: the displacement filter must apply directly to
          the element, which next/image's wrapper breaks. */}
      {showMedia && !useVideo && mediaSrc ? (
        <img
          className="liquid-media"
          src={mediaSrc}
          alt=""
          style={{ filter: `url(#${filterId})` }}
          onError={() => setMissing(true)}
        />
      ) : null}

      {!bare ? (
        <>
          <div className="liquid-veil" />
          <div className="liquid-glow" />
          <div className="liquid-vig" />
        </>
      ) : null}
    </figure>
  );
}
