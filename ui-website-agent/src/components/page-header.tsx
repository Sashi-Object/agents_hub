export function PageHeader({
  title,
  description,
  align = "start",
}: {
  title: string;
  description: string;
  align?: "start" | "center";
}) {
  return (
    <header
      className={`max-w-[65ch] ${align === "center" ? "mx-auto text-center text-balance" : ""}`}
    >
      <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
        {title}
      </h1>
      <p className="mt-3 text-lg text-muted">{description}</p>
    </header>
  );
}
