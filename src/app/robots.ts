import type { MetadataRoute } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";

export default function robots(): MetadataRoute.Robots {
  // Si el dominio aún es localhost/staging, se bloquea la indexación.
  const isProductionHost = siteConfig.url.startsWith("https://") && !/localhost|staging|127\.0\.0\.1/.test(siteConfig.url);
  if (!isProductionHost) {
    return { rules: [{ userAgent: "*", disallow: "/" }] };
  }
  return {
    rules: [{ userAgent: "*", allow: "/", disallow: ["/api/"] }],
    sitemap: absoluteUrl("/sitemap.xml"),
    host: siteConfig.url,
  };
}
