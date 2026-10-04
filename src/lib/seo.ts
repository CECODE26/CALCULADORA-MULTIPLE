import type { Metadata } from "next";
import { absoluteUrl, siteConfig } from "@/config/site";
import { markets } from "@/config/markets";
import { getCategory } from "@/config/categories";
import { getTool, toolPath, type ToolEntry } from "@/tools/registry";

interface PageMetaInput {
  title: string;
  description: string;
  path: string;
  /** true = no añadir la marca al título */
  absoluteTitle?: boolean;
  noindex?: boolean;
  languages?: Record<string, string>;
}

export function pageMetadata({ title, description, path, absoluteTitle, noindex, languages }: PageMetaInput): Metadata {
  const url = absoluteUrl(path);
  return {
    title: absoluteTitle ? { absolute: title } : title,
    description,
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
    openGraph: {
      type: "website",
      url,
      title,
      description,
      siteName: siteConfig.name,
      locale: siteConfig.defaultLocale.replace("-", "_"),
    },
    twitter: { card: "summary_large_image", title, description },
    robots: noindex ? { index: false, follow: true } : undefined,
  };
}

/**
 * hreflang: solo se emite cuando la herramienta tiene versiones regionales
 * reales. Hoy ninguna las tiene, por lo que no se generan etiquetas.
 */
export function hreflangFor(tool: ToolEntry): Record<string, string> | undefined {
  if (!tool.regional || Object.keys(tool.regional).length === 0) return undefined;
  const languages: Record<string, string> = { "x-default": absoluteUrl(toolPath(tool.slug)), es: absoluteUrl(toolPath(tool.slug)) };
  for (const m of markets) {
    const p = tool.regional[m.code];
    if (m.active && p) languages[m.hreflang] = absoluteUrl(p);
  }
  return languages;
}

export function toolMetadata(slug: string): Metadata {
  const tool = getTool(slug);
  return pageMetadata({
    title: tool.title,
    description: tool.description,
    path: toolPath(tool.slug),
    languages: hreflangFor(tool),
    noindex: !tool.live,
  });
}

export interface Crumb {
  name: string;
  path: string;
}

export function toolCrumbs(tool: ToolEntry): Crumb[] {
  const cat = getCategory(tool.category);
  return [
    { name: "Inicio", path: "/" },
    ...(cat ? [{ name: cat.name, path: `/${cat.slug}` }] : []),
    { name: tool.name, path: toolPath(tool.slug) },
  ];
}

/* ──────────── Datos estructurados (solo tipos apropiados) ──────────── */

export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((c, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: c.name,
      item: absoluteUrl(c.path),
    })),
  };
}

/** Las calculadoras son aplicaciones web gratuitas: WebApplication es fiel. */
export function toolJsonLd(tool: ToolEntry) {
  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: tool.h1,
    description: tool.description,
    url: absoluteUrl(toolPath(tool.slug)),
    applicationCategory: tool.category === "finanzas" ? "FinanceApplication" : "BusinessApplication",
    operatingSystem: "Cualquiera (navegador web)",
    inLanguage: siteConfig.language,
    isAccessibleForFree: true,
    offers: { "@type": "Offer", price: "0", priceCurrency: siteConfig.defaultCurrency },
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: siteConfig.name,
    url: absoluteUrl("/"),
    description: siteConfig.description,
    inLanguage: siteConfig.language,
  };
}
