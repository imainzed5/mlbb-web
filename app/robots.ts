import type { MetadataRoute } from "next";

import { SITE_URL, absoluteUrl } from "@/lib/seo/metadata";

export default function robots(): MetadataRoute.Robots {
  return {
    host: SITE_URL,
    rules: [
      {
        allow: "/",
        disallow: ["/api/", "/player", "/tools"],
        userAgent: "*",
      },
    ],
    sitemap: absoluteUrl("/sitemap.xml"),
  };
}