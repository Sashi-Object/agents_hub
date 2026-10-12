import Link from "next/link";
import { cacheLife } from "next/cache";
import { HOME_SECTION_ID, navItems, sectionHref, siteConfig } from "@/lib/site";

const focusRing =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus";

const footerLink = `inline-block rounded-sm py-1 text-base text-muted underline-offset-4 transition-colors duration-150 hover:text-foreground hover:underline motion-reduce:transition-none ${focusRing}`;

/**
 * Under cacheComponents, `new Date()` can't run in the prerendered shell.
 * Caching it lets the page stay static while the year refreshes daily.
 */
async function CopyrightYear() {
  "use cache";
  cacheLife("days");
  return <>{new Date().getFullYear()}</>;
}

function FooterHeading({ id, children }: { id: string; children: React.ReactNode }) {
  return (
    <h2 id={id} className="text-base font-semibold text-foreground">
      {children}
    </h2>
  );
}

/** Site-wide footer: identity, section links, contact, then copyright + back to top. */
export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-5xl px-4 py-12 sm:px-8 lg:px-12">
        <div className="grid gap-10 md:grid-cols-[2fr_1fr_1fr]">
          <div>
            <Link
              href={sectionHref(HOME_SECTION_ID)}
              className={`rounded-md text-lg font-semibold tracking-tight text-foreground ${focusRing}`}
            >
              {siteConfig.name}
            </Link>
            <p className="mt-3 max-w-[45ch] text-base text-muted">
              {siteConfig.description}
            </p>
          </div>

          <nav aria-labelledby="footer-nav-heading">
            <FooterHeading id="footer-nav-heading">Navigate</FooterHeading>
            <ul className="mt-3 space-y-1">
              {navItems.map((item) => (
                <li key={item.id}>
                  <Link href={sectionHref(item.id)} className={footerLink}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <FooterHeading id="footer-contact-heading">Get in touch</FooterHeading>
            <ul className="mt-3 space-y-1" aria-labelledby="footer-contact-heading">
              <li>
                <a href={`mailto:${siteConfig.email}`} className={`${footerLink} break-all`}>
                  {siteConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 flex flex-col-reverse gap-4 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-base text-muted">
            © <CopyrightYear /> {siteConfig.name}. All rights reserved.
          </p>
          <Link href={sectionHref(HOME_SECTION_ID)} className={footerLink}>
            Back to top <span aria-hidden="true">↑</span>
          </Link>
        </div>
      </div>
    </footer>
  );
}
