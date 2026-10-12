"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { navItems, sectionHref } from "@/lib/site";
import { NavIconGlyph } from "./icons";

/**
 * Scrollspy: returns the id of the section currently being read, so the
 * sidebar shows where you are on the page (visibility of system status).
 * A section counts as current once its top passes ~30% down the viewport.
 */
function useActiveSection(ids: string[]) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * 0.3;
      const atBottom =
        window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      let current: string | null = null;
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= line) current = id;
      }
      // A short last section may never reach the line; at the very bottom it's current.
      if (atBottom && document.getElementById(ids[ids.length - 1])) {
        current = ids[ids.length - 1];
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, [ids]);

  return active;
}

const sectionIds = navItems.map((item) => item.id);

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const activeId = useActiveSection(sectionIds);

  return (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = item.id === activeId;
        return (
          <li key={item.id}>
            <Link
              href={sectionHref(item.id)}
              onClick={onNavigate}
              aria-current={active ? "location" : undefined}
              className={[
                // 44px min target height; state-layer hover/press feedback.
                "group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-base",
                "transition-colors duration-150 ease-in-out motion-reduce:transition-none",
                "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus",
                active
                  ? "bg-accent-soft font-semibold text-accent"
                  : "font-medium text-muted hover:bg-hover hover:text-foreground active:bg-pressed",
              ].join(" ")}
            >
              {/* Active indicator bar: state is never conveyed by color alone. */}
              <span
                aria-hidden="true"
                className={[
                  "absolute inset-y-2 left-0 w-1 rounded-full bg-current transition-opacity duration-150",
                  active ? "opacity-100" : "opacity-0",
                ].join(" ")}
              />
              <NavIconGlyph
                icon={item.icon}
                className="size-5 shrink-0 transition-transform duration-150 ease-in-out group-hover:translate-x-0.5 motion-reduce:transition-none motion-reduce:group-hover:translate-x-0"
              />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
