// ── Hero tuning knobs: change the feel of the name + underline here ─────────
// Geist is a variable font, so any weight from 100 to 900 is available.
export const WEIGHT_START = 200; // thin weight each letter starts at on load
export const WEIGHT_REST = 600; // weight letters settle at
export const WEIGHT_PEAK = 900; // weight of the letter right under the cursor
export const RADIUS_PX = 160; // how far from the cursor letters start to react
export const STAGGER_MS = 60; // left-to-right ripple between letters on load
export const SETTLE_MS = 600; // how long each letter takes to settle

/** The tagline word that gets the hand-drawn underline. */
export const UNDERLINE_WORD = "storytelling";
/** "brush" = tapered ink stroke; "pen" = clean, even stroke. */
export const UNDERLINE_STYLE: "brush" | "pen" = "brush";
export const UNDERLINE_DRAW_MS = 700;

/** Total length of the name's load animation; the underline starts after it. */
export const nameSettleMs = (name: string) =>
  (Array.from(name).length - 1) * STAGGER_MS + SETTLE_MS;
