import type { MetadataRoute } from "next";
import { absoluteUrl } from "@/config/site";
import { categories } from "@/config/categories";
import { liveTools, toolPath, toolsInCategory } from "@/tools/registry";

const STATIC_PAGES = ["/acerca-de", "/contacto", "/privacidad", "/cookies", "/terminos"];

export default function sitemap(): MetadataRoute.Sitemap {
  const tools = liveTools();
  const latest = tools.map((t) => t.updated).sort().at(-1) ?? "2026-10-03";

  return [
    { url: absoluteUrl("/"), lastModified: latest, changeFrequency: "weekly", priority: 1 },
    { url: absoluteUrl("/herramientas"), lastModified: latest, changeFrequency: "weekly", priority: 0.7 },
    ...categories
      .filter((c) => toolsInCategory(c.slug).length > 0)
      .map((c) => ({
        url: absoluteUrl(`/${c.slug}`),
        lastModified: latest,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      })),
    ...tools.map((t) => ({
      url: absoluteUrl(toolPath(t.slug)),
      lastModified: t.updated,
      changeFrequency: "monthly" as const,
      priority: 0.9,
    })),
    ...STATIC_PAGES.map((p) => ({ url: absoluteUrl(p), changeFrequency: "yearly" as const, priority: 0.2 })),
  ];
}
