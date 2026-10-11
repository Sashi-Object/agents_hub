import { PageHeader } from "@/components/page-header";
import { siteConfig } from "@/lib/site";

export default function Home() {
  return (
    <PageHeader
      title={`Welcome to ${siteConfig.name}`}
      description="Use the navigation to explore the site. On small screens, open it with the Menu button at the top."
    />
  );
}
