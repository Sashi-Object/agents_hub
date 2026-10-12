import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { HOME_SECTION_ID, siteConfig } from "@/lib/site";

// Placeholder content — replace with real copy. Section order here must match
// `navItems` in src/lib/site.ts so the sidebar reads top to bottom.
const projects = [
  { name: "Project one", summary: "A short sentence about what this project does and why it matters." },
  { name: "Project two", summary: "A short sentence about what this project does and why it matters." },
  { name: "Project three", summary: "A short sentence about what this project does and why it matters." },
];

export default function Home() {
  return (
    <div className="mx-auto max-w-5xl">
      <section
        id={HOME_SECTION_ID}
        aria-label="Welcome"
        className="flex min-h-[60dvh] items-center justify-center py-16"
      >
        <PageHeader
          align="center"
          title={siteConfig.name}
          description={siteConfig.description}
        />
      </section>

      <Section id="projects" title="Projects" intro="A look at what we're building.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li
              key={project.name}
              className="rounded-xl border border-border bg-surface p-6"
            >
              <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
              <p className="mt-2 text-base text-muted">{project.summary}</p>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="about" title="About" intro="Who I am and what I love to make.">
        <div className="max-w-[65ch] space-y-4 text-base leading-relaxed text-foreground">
          <p>
            Use this space to introduce the team: where you started, what you
            focus on, and what makes your approach different.
          </p>
          <p>
            Keep paragraphs short so the section is easy to scan. Two or three
            focused paragraphs usually say more than one long block.
          </p>
        </div>
      </Section>

      <Section id="contact" title="Contact" intro="How to get in touch with me.">
        <p className="text-base text-foreground">
          Email me at{" "}
          <a
            href={`mailto:${siteConfig.email}`}
            className="rounded-sm font-medium text-accent underline underline-offset-4 transition-colors duration-150 hover:decoration-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-focus"
          >
            {siteConfig.email}
          </a>
          .
        </p>
      </Section>
    </div>
  );
}
