import { describe, expect, it } from "vitest";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { liveTools, tools } from "./registry";
import { categories } from "@/config/categories";

const appDir = join(process.cwd(), "src", "app");

describe("registro de herramientas (SEO e integridad)", () => {
  it("slugs, títulos, H1 y descripciones únicos", () => {
    for (const key of ["slug", "title", "h1", "description"] as const) {
      const values = tools.map((t) => t[key]);
      expect(new Set(values).size, key).toBe(values.length);
    }
  });

  it("longitudes razonables para title y meta description", () => {
    for (const t of tools) {
      expect(t.title.length, t.slug).toBeLessThanOrEqual(62);
      expect(t.description.length, t.slug).toBeGreaterThanOrEqual(110);
      expect(t.description.length, t.slug).toBeLessThanOrEqual(170);
    }
  });

  it("cada herramienta publicada tiene su página", () => {
    for (const t of liveTools()) {
      expect(existsSync(join(appDir, t.slug, "page.tsx")), t.slug).toBe(true);
    }
  });

  it("categorías válidas y relacionadas existentes, sin autorreferencias", () => {
    const slugs = new Set(tools.map((t) => t.slug));
    const cats = new Set(categories.map((c) => c.slug));
    for (const t of tools) {
      expect(cats.has(t.category)).toBe(true);
      expect(t.related.length, t.slug).toBeGreaterThanOrEqual(2);
      for (const r of t.related) {
        expect(slugs.has(r), `${t.slug} → ${r}`).toBe(true);
        expect(r).not.toBe(t.slug);
      }
    }
  });

  it("clusters temáticos enlazados en ambos sentidos", () => {
    const clusters = [
      ["calculadora-prestamos", "tabla-amortizacion"],
      ["tabla-amortizacion", "calculadora-interes-compuesto"],
      ["calculadora-interes-compuesto", "calculadora-ahorro"],
      ["calculadora-margen-ganancia", "calculadora-precio-venta"],
      ["calculadora-precio-venta", "calculadora-punto-equilibrio"],
      ["calculadora-margen-ganancia", "calculadora-descuentos"],
      ["calculadora-precio-venta", "calculadora-iva"],
      ["calculadora-porcentajes", "calculadora-descuentos"],
    ];
    const bySlug = new Map(tools.map((t) => [t.slug, t]));
    for (const [a, b] of clusters) {
      expect(bySlug.get(a!)!.related, `${a} → ${b}`).toContain(b);
      expect(bySlug.get(b!)!.related, `${b} → ${a}`).toContain(a);
    }
  });

  it("todas las categorías tienen herramientas publicadas", () => {
    for (const c of categories) {
      expect(liveTools().some((t) => t.category === c.slug || t.alsoIn?.includes(c.slug)), c.slug).toBe(true);
    }
  });
});
