import { HeroName } from "./hero-name";
import { InkUnderline } from "./ink-underline";
import { nameSettleMs, UNDERLINE_STYLE, UNDERLINE_WORD } from "./tuning";

/** Pause between the name settling and the underline starting to draw. */
const UNDERLINE_GAP_MS = 100;

/** Welcome section content: animated name, then the tagline with its underline. */
export function Hero({ name, tagline }: { name: string; tagline: string }) {
  // Underline the chosen word; if the tagline no longer contains it, show
  // the tagline as plain text rather than breaking.
  const at = tagline.indexOf(UNDERLINE_WORD);

  return (
    <div className="mx-auto max-w-[65ch] text-center">
      <HeroName name={name} />
      <p className="mx-auto mt-6 max-w-[36ch] font-serif text-xl leading-snug text-balance text-hero-tagline italic [font-variation-settings:'SOFT'_100] sm:text-2xl">
        {at === -1 ? (
          tagline
        ) : (
          <>
            {tagline.slice(0, at)}
            <InkUnderline
              variant={UNDERLINE_STYLE}
              delayMs={nameSettleMs(name) + UNDERLINE_GAP_MS}
            >
              {UNDERLINE_WORD}
            </InkUnderline>
            {tagline.slice(at + UNDERLINE_WORD.length)}
          </>
        )}
      </p>
    </div>
  );
}
