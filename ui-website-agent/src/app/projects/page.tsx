import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Projects" };

export default function ProjectsPage() {
  return <PageHeader title="Projects" description="A look at what we're building." />;
}
