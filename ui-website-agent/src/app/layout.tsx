import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { MobileNav } from "@/components/nav/mobile-nav";
import { Sidebar } from "@/components/nav/sidebar";
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
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full font-sans text-base leading-relaxed">
        <a
          href="#main"
          className="sr-only z-50 rounded-lg bg-accent-soft px-4 py-2 font-medium text-accent focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:outline-2 focus:outline-focus"
        >
          Skip to content
        </a>
        <div className="flex min-h-dvh">
          <Sidebar />
          <div className="flex min-w-0 flex-1 flex-col">
            <MobileNav />
            <main
              id="main"
              tabIndex={-1}
              className="flex-1 px-4 py-8 focus:outline-none sm:px-8 md:py-12 lg:px-12"
            >
              {children}
            </main>
          </div>
        </div>
      </body>
    </html>
  );
}
