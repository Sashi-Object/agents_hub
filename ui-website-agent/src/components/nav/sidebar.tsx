import Link from "next/link";
import { Suspense } from "react";
import { siteConfig } from "@/lib/site";
import { NavLinks, NavList } from "./nav-links";

/** Persistent side navigation for md+ viewports. */
export function Sidebar() {
  return (
    <aside className="sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-r border-border bg-surface md:flex">
      <div className="flex h-16 items-center px-6">
        <Link
          href="/"
          className="rounded-md text-lg font-semibold tracking-tight focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
        >
          {siteConfig.name}
        </Link>
      </div>
      <nav aria-label="Main" className="flex-1 overflow-y-auto px-3 py-2">
        {/* usePathname suspends on routes with unknown dynamic params under
            cacheComponents; the fallback keeps the links usable meanwhile. */}
        <Suspense fallback={<NavList pathname={null} />}>
          <NavLinks />
        </Suspense>
      </nav>
    </aside>
  );
}
