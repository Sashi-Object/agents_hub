import { UNDERLINE_DRAW_MS } from "./tuning";

/*
 * Hand-drawn strokes in a 240×24 box, stretched to the word's width. The
 * brush is a filled shape — sharp tips, ~6 units thick mid-stroke — because
 * SVG strokes can't taper. The pen is an even line with rounded ends.
 */
const BRUSH_PATH = "M4 18C70 10 160 5 236 7C160 12 70 18 4 18Z";
const PEN_PATH = "M5 16C62 10 152 6 235 8";

/**
 * Wraps a word with an ink underline that "draws" itself left to right once
 * on load (a clip-path wipe; see .ink-underline in globals.css). Decorative:
 * hidden from screen readers, and placed absolutely so text never shifts.
 */
export function InkUnderline({
  children,
  variant,
  delayMs,
}: {
  children: React.ReactNode;
  variant: "brush" | "pen";
  delayMs: number;
}) {
  return (
    <span className="relative inline-block whitespace-nowrap">
      {children}
      <svg
        aria-hidden="true"
        focusable="false"
        viewBox="0 0 240 24"
        preserveAspectRatio="none"
        className="ink-underline pointer-events-none absolute top-[85%] left-[-2%] h-[0.45em] w-[104%] overflow-visible text-accent"
        style={{
          animationDelay: `${delayMs}ms`,
          animationDuration: `${UNDERLINE_DRAW_MS}ms`,
        }}
      >
        {variant === "brush" ? (
          <path d={BRUSH_PATH} fill="currentColor" />
        ) : (
          <path
            d={PEN_PATH}
            fill="none"
            stroke="currentColor"
            strokeWidth={3}
            strokeLinecap="round"
            vectorEffect="non-scaling-stroke"
          />
        )}
      </svg>
    </span>
  );
}
