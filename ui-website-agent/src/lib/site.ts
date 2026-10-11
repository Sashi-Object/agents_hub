export type NavIcon = "home" | "projects" | "about" | "contact";

export type NavItem = {
  href: string;
  label: string;
  icon: NavIcon;
};

export const siteConfig = {
  name: "Agents Hub",
  description: "A clean, accessible starting point for our site.",
};

export const navItems: NavItem[] = [
  { href: "/", label: "Home", icon: "home" },
  { href: "/projects", label: "Projects", icon: "projects" },
  { href: "/about", label: "About", icon: "about" },
  { href: "/contact", label: "Contact", icon: "contact" },
];

export function isActive(href: string, pathname: string | null) {
  if (pathname === null) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
