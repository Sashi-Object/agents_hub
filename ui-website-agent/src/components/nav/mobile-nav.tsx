"use client";

import Link from "next/link";
import { Suspense, useEffect, useRef, useState } from "react";
import { siteConfig } from "@/lib/site";
import { CloseIcon, MenuIcon } from "./icons";
import { NavLinks, NavList } from "./nav-links";

// Keep in sync with the `md:` breakpoint used in the layout.
const DESKTOP_QUERY = "(min-width: 48rem)";

const iconButton =
  "inline-flex size-11 items-center justify-center rounded-lg text-foreground transition-colors duration-150 hover:bg-hover active:bg-pressed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus motion-reduce:transition-none";

/**
 * Top bar + slide-in drawer for small screens. The drawer is a native modal
 * <dialog>, which gives us focus trapping, Escape-to-close, an inert page
 * behind it, and focus restoration to the Menu button for free.
 */
export function MobileNav() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [open, setOpen] = useState(false);

  const show = () => {
    dialogRef.current?.showModal();
    setOpen(true);
  };
  const close = () => dialogRef.current?.close();

  // If the viewport grows to desktop while the drawer is open, close it so the
  // (now hidden) modal doesn't leave the rest of the page inert.
  useEffect(() => {
    const mql = window.matchMedia(DESKTOP_QUERY);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) dialogRef.current?.close();
    };
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/90 px-4 backdrop-blur md:hidden">
      <Link
        href="/"
        className="rounded-md text-base font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
      >
        {siteConfig.name}
      </Link>

      <button
        type="button"
        onClick={show}
        aria-haspopup="dialog"
        aria-expanded={open}
        aria-controls="mobile-nav"
        className={`${iconButton} w-auto gap-2 px-3 text-sm font-medium`}
      >
        <MenuIcon className="size-5" />
        Menu
      </button>

      <dialog
        id="mobile-nav"
        ref={dialogRef}
        aria-label="Site navigation"
        onClose={() => setOpen(false)}
        // Clicks on the dialog element itself (not its content) are backdrop clicks.
        onClick={(e) => {
          if (e.target === e.currentTarget) close();
        }}
        className={[
          "m-0 h-dvh max-h-none w-80 max-w-[85vw] border-r border-border bg-surface p-0 text-foreground",
          "backdrop:bg-black/50",
          "translate-x-0 transition-transform duration-200 ease-out starting:open:-translate-x-full",
          "motion-reduce:transition-none",
        ].join(" ")}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-14 items-center justify-between border-b border-border px-4">
            <span className="text-base font-semibold tracking-tight">
              {siteConfig.name}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Close menu"
              className={iconButton}
            >
              <CloseIcon className="size-5" />
            </button>
          </div>
          <nav aria-label="Main" className="flex-1 overflow-y-auto p-3">
            <Suspense fallback={<NavList pathname={null} />}>
              <NavLinks onNavigate={close} />
            </Suspense>
          </nav>
        </div>
      </dialog>
    </header>
  );
}
