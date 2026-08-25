import type { MetadataRoute } from "next";
import { noIndexRoutes, siteUrl } from "@/lib/config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      // Keep these two out of the index. Each page also sends its own
      // `noindex` header — robots.txt asks politely, the meta tag decides.
      disallow: [...noIndexRoutes, "/api/"],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
