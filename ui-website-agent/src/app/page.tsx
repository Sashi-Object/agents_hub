import Image, { type StaticImageData } from "next/image";
import { PageHeader } from "@/components/page-header";
import { Section } from "@/components/section";
import { HOME_SECTION_ID, siteConfig } from "@/lib/site";

// Project images ─────────────────────────────────────────────────────────
import ragEngineImage from "@/assets/project_1_.png";

// Project type for new additional projects
type Project = {
  name: string;
  summary: string;
  /** Optional. `alt` describes the image for screen readers; use "" only if purely decorative. */
  image?: { src: StaticImageData; alt: string };
};

// Placeholder content — replace with real copy. Section order here must match
// `navItems` in src/lib/site.ts so the sidebar reads top to bottom.
const projects: Project[] = [
  { name: "CLI Course Knowledge Base & RAG Engine", 
    summary: "A lightweight command-line RAG tool that ingests academic texts, stores vector embeddings locally via ChromaDB, and automatically exports markdown diles to render dynamic knowledge graphs in Obsidian.",
    image: {src: ragEngineImage, alt: "A graph that is connecting dots that represent generated Markdown files and topics that are interconnected."},
  },
  { name: "Project two", 
    summary: "A short sentence about what this project does and why it matters." },

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

      <Section id="projects" title="Projects" intro="A look at what I'm building.">
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {projects.map((project) => (
            <li
              key={project.name}
              className="overflow-hidden rounded-xl border border-border bg-surface"
            >
              {project.image && (
                <Image
                  src={project.image.src}
                  alt={project.image.alt}
                  placeholder="blur"
                  // Card widths at the grid's 1 / 2 / 3-column breakpoints.
                  sizes="(min-width: 1024px) 320px, (min-width: 640px) 50vw, 100vw"
                  className="aspect-video w-full border-b border-border object-cover"
                />
              )}
              <div className="p-6">
                <h3 className="text-lg font-semibold text-foreground">{project.name}</h3>
                <p className="mt-2 text-base text-muted">{project.summary}</p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section id="about" title="About" intro="Who I am and what I love to make.">
        <div className="max-w-[65ch] space-y-4 text-base leading-relaxed text-foreground">
          <p>
            There are two passions that have my heart, technology and storytelling. 
            I believe they are two halves of the same coin that accomplish the same result,
            creating experiences for people to enjoy. But also they both keep each other in balance,
            we have technology to share our creative endeavors and we have stories for human connection.
          </p>
          <p>
            Building an experience relies on storytelling, for example:
            I'm a computer science student who finds joy in solving engaging puzzles. But I want my
            projects to leave an impact, that's where my creativity comes into play. My writing helps me 
            be a better software developer, and my tech fluency inspires me to write stories from the heart.
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
