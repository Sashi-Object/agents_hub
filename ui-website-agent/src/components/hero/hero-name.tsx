"use client";

import { useEffect, useRef } from "react";
import {
  RADIUS_PX,
  SETTLE_MS,
  STAGGER_MS,
  WEIGHT_PEAK,
  WEIGHT_REST,
  WEIGHT_START,
} from "./tuning";

/**
 * The site owner's name, one letter per span. Letters settle from thin to bold
 * on load (pure CSS, see .hero-glyph in globals.css) and thicken as the mouse
 * approaches each one. Screen readers get the plain name only.
 */
export function HeroName({ name }: { name: string }) {
  const glyphRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const letters = Array.from(name);

  useEffect(() => {
    // Interaction-triggered animation is optional (WCAG 2.3.3): skip it for
    // reduced-motion users. Touch has no hover, so only a mouse drives it.
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let frame = 0;
    let lastX = 0;
    let lastY = 0;

    const setWeights = (weightFor: (el: HTMLSpanElement) => number) => {
      for (const el of glyphRefs.current) {
        if (el) el.style.setProperty("--w", String(weightFor(el)));
      }
    };

    const update = () => {
      frame = 0;
      setWeights((el) => {
        const r = el.getBoundingClientRect();
        const d = Math.hypot(lastX - (r.left + r.width / 2), lastY - (r.top + r.height / 2));
        const t = Math.max(0, 1 - d / RADIUS_PX);
        // Ease-in falloff: a smooth swell rather than a hard on/off edge.
        return Math.round(WEIGHT_REST + (WEIGHT_PEAK - WEIGHT_REST) * t * t);
      });
    };

    const onMove = (e: PointerEvent) => {
      if (e.pointerType !== "mouse" || reduceMotion.matches) return;
      lastX = e.clientX;
      lastY = e.clientY;
      if (!frame) frame = requestAnimationFrame(update);
    };
    const onLeaveWindow = (e: PointerEvent) => {
      if (e.relatedTarget === null) setWeights(() => WEIGHT_REST);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    document.addEventListener("pointerout", onLeaveWindow);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerout", onLeaveWindow);
    };
  }, []);

  return (
    <h1
      className="text-[clamp(3.5rem,14vw,7.5rem)] leading-[1.05] tracking-tight text-foreground"
      style={
        {
          "--w-start": WEIGHT_START,
          "--w-rest": WEIGHT_REST,
          "--settle-ms": `${SETTLE_MS}ms`,
        } as React.CSSProperties
      }
    >
      <span className="sr-only">{name}</span>
      <span aria-hidden="true" className="inline-flex">
        {letters.map((ch, i) => (
          // Each letter reserves the width of its boldest form (invisible copy),
          // so thickening never pushes neighbors around (no layout shift).
          <span key={i} className="inline-grid justify-items-center">
            <span className="invisible [grid-area:1/1]" style={{ fontWeight: WEIGHT_PEAK }}>
              {ch}
            </span>
            <span
              ref={(el) => {
                glyphRefs.current[i] = el;
              }}
              className="hero-glyph [grid-area:1/1]"
              style={{ animationDelay: `${i * STAGGER_MS}ms` }}
            >
              {ch}
            </span>
          </span>
        ))}
      </span>
    </h1>
  );
}
