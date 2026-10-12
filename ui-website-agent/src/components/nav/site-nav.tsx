"use client";

import Link from "next/link";
import { useCallback, useEffect, useId, useRef, useState } from "react";
import { HOME_SECTION_ID, sectionHref, siteConfig } from "@/lib/site";
import { MenuIcon } from "./icons";
import { NavLinks } from "./nav-links";

// NN/g "Timing Guidelines for Exposing Hidden Content": wait for a ~0.3s
// pause before revealing on hover (prevents accidental opens while the cursor
// passes by), and keep it open until the cursor has been away for 0.5s.
const OPEN_DELAY_MS = 300;
const CLOSE_DELAY_MS = 500;

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

/**
 * Top bar with a menu button in the top-left corner. The sidebar fades in
 * from the left when the mouse rests on the button, and drifts back out once
 * the cursor leaves the button and sidebar. Click, tap, and Enter/Space open
 * it too, so it never depends on hover alone.
 */
export function SiteNav() {
  const [open, setOpen] = useState(false);
  const zoneRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const timer = useRef<number | undefined>(undefined);
  // Opened by click/tap/keyboard: stays open when the pointer leaves, and
  // closes only by explicit action (NN/g: clicks get click-outside to close).
  const pinned = useRef(false);
  const panelId = useId();

  const clearTimer = () => window.clearTimeout(timer.current);
  const close = useCallback(() => {
    window.clearTimeout(timer.current);
    pinned.current = false;
    setOpen(false);
  }, []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!zoneRef.current?.contains(e.target as Node)) close();
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const hadFocus = zoneRef.current?.contains(document.activeElement);
      close();
      if (hadFocus) buttonRef.current?.focus();
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, close]);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-2 border-b border-border bg-background px-2">
      {/* Hover zone = button + sidebar. Pointer events follow the DOM tree,
          so moving from the button onto the (fixed) sidebar keeps it open. */}
      <div
        ref={zoneRef}
        onPointerEnter={(e) => {
          if (e.pointerType !== "mouse") return;
          clearTimer();
          if (!open) timer.current = window.setTimeout(() => setOpen(true), OPEN_DELAY_MS);
        }}
        onPointerLeave={(e) => {
          if (e.pointerType !== "mouse" || pinned.current) return;
          clearTimer();
          timer.current = window.setTimeout(close, CLOSE_DELAY_MS);
        }}
        onBlur={(e) => {
          if (!e.currentTarget.contains(e.relatedTarget)) close();
        }}
      >
        <button
          ref={buttonRef}
          type="button"
          aria-label="Menu"
          aria-expanded={open}
          aria-controls={panelId}
          onClick={() => {
            if (open && pinned.current) {
              close();
            } else {
              // A click while hover-opened pins it open instead of closing it
              // out from under the user.
              clearTimer();
              pinned.current = true;
              setOpen(true);
            }
          }}
          className={`relative z-10 inline-flex size-11 items-center justify-center rounded-lg text-foreground transition-colors duration-150 hover:bg-hover active:bg-pressed motion-reduce:transition-none ${focusRing}`}
        >
          <MenuIcon className="size-6" />
        </button>

        <div
          id={panelId}
          className={[
            "fixed inset-y-0 left-0 flex w-72 max-w-[85vw] flex-col border-r border-border bg-surface shadow-xl",
            // Fade in from the left; on close, drift back out the way it came.
            // `invisible` (applied after the fade) removes it from tab order.
            "transition-[opacity,translate,visibility] duration-200",
            "motion-reduce:translate-x-0 motion-reduce:transition-[opacity,visibility]",
            open
              ? "visible translate-x-0 opacity-100 ease-out"
              : "invisible -translate-x-6 opacity-0 ease-in",
          ].join(" ")}
        >
          {/* Left padding clears the menu button, which stays on top in its spot. */}
          <div className="flex h-14 shrink-0 items-center border-b border-border pr-4 pl-15">
            <Link
              href={sectionHref(HOME_SECTION_ID)}
              onClick={close}
              className={`rounded-md text-base font-semibold tracking-tight ${focusRing}`}
            >
              {siteConfig.name}
            </Link>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
            <NavLinks onNavigate={close} />
          </nav>
        </div>
      </div>

      <Link
        href={sectionHref(HOME_SECTION_ID)}
        className={`rounded-md text-base font-semibold tracking-tight ${focusRing}`}
      >
        {siteConfig.name}
      </Link>
    </header>
  );
}
