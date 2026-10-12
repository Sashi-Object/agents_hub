import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { SiteNav } from "@/components/nav/site-nav";
import { SiteFooter } from "@/components/site-footer";
import { siteConfig } from "@/lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: { default: siteConfig.name, template: `%s · ${siteConfig.name}` },
  description: siteConfig.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      // Smooth scrolling applies to in-page section links; Next.js turns it off
      // during route changes so navigating between pages stays instant.
      data-scroll-behavior="smooth"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-base leading-relaxed">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-accent-soft px-4 py-2 font-medium text-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-2 focus:outline-focus"
        >
          Skip to content
        </a>
        <SiteNav />
        <main
          id="main"
          tabIndex={-1}
          className="px-4 py-8 focus:outline-none sm:px-8 md:py-12 lg:px-12"
        >
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
