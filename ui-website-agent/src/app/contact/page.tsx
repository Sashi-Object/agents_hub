import type { Metadata } from "next";
import { PageHeader } from "@/components/page-header";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return <PageHeader title="Contact" description="How to get in touch with us." />;
}
