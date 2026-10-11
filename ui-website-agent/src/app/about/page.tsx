import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "About" };

export default function AboutPage() {
  return <PageHeader title="About" description="Who we are and what we care about." />;
}
