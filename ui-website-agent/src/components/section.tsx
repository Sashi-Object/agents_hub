/** One titled section of the single-page site; `id` is the sidebar's scroll target. */
export function Section({
  id,
  title,
  intro,
  children,
}: {
  id: string;
  title: string;
  intro?: string;
  children?: React.ReactNode;
}) {
  const headingId = `${id}-heading`;
  return (
    <section
      id={id}
      aria-labelledby={headingId}
      className="border-t border-border py-16 md:py-24"
    >
      <div className="max-w-[65ch]">
        <h2
          id={headingId}
          className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl"
        >
          {title}
        </h2>
        {intro && <p className="mt-3 text-lg text-muted">{intro}</p>}
      </div>
      {children && <div className="mt-8">{children}</div>}
    </section>
  );
}
