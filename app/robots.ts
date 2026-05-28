import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/server-api";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Disallow authenticated panels + raw API. /admin uses noindex
        // headers too (see AdminAuthGuard) but a Disallow is cheap and
        // belt-and-braces.
        disallow: [
          "/admin",
          "/dashboard",
          "/api/",
          "/konto",
          "/apply/",
          "/track/",
          "/accept-invitation",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
