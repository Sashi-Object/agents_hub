"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { isActive, navItems } from "@/lib/site";
import { NavIconGlyph } from "./icons";

type NavListProps = {
  pathname: string | null;
  onNavigate?: () => void;
};

/**
 * Pure list of links. Rendered with `pathname={null}` as the Suspense
 * fallback so the nav is never missing, even while the pathname resolves.
 */
export function NavList({ pathname, onNavigate }: NavListProps) {
  return (
    <ul className="flex flex-col gap-1">
      {navItems.map((item) => {
        const active = isActive(item.href, pathname);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
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
              <NavIconGlyph icon={item.icon} className="size-5 shrink-0" />
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

export function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return <NavList pathname={pathname} onNavigate={onNavigate} />;
}
