export type NavIcon = "projects" | "about" | "contact";

/** A section of the one-page site. `id` is the element id on the home page. */
export type NavItem = {
  id: string;
  label: string;
  icon: NavIcon;
};

export const siteConfig = {
  name: "Natalie",
  description:
    "A writer who combines words and variables. An intersection of technology and storytelling.",
  email: "nataliebonilla2@gmail.com",
};

/** Id of the welcome section at the top of the page; the site name links here. */
export const HOME_SECTION_ID = "home";

/** Sections in page order, top to bottom. The sidebar lists them in this order. */
export const navItems: NavItem[] = [
  { id: "projects", label: "Projects", icon: "projects" },
  { id: "about", label: "About", icon: "about" },
  { id: "contact", label: "Contact", icon: "contact" },
];

/** Root-relative so the links also work from pages other than "/" (e.g. 404). */
export const sectionHref = (id: string) => `/#${id}`;
