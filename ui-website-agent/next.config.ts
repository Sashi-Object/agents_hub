import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  // The site is now one page; send the old section URLs to their anchors.
  async redirects() {
    return ["projects", "about", "contact"].map((id) => ({
      source: `/${id}`,
      destination: `/#${id}`,
      permanent: false,
    }));
  },
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
