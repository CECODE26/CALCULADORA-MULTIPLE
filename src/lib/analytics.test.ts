import { describe, expect, it } from "vitest";
import { sanitizeParams, sanitizeSearchTerm } from "./analytics";

describe("privacidad de analítica", () => {
  it("descarta parámetros no permitidos (montos, tasas, etc.)", () => {
    const out = sanitizeParams({
      tool_slug: "calculadora-prestamos",
      mode: "simple",
      amount: 25000,
      rate: "12",
      monto: "10000",
      salary: 1200,
    } as Record<string, string | number>);
    expect(out).toEqual({ tool_slug: "calculadora-prestamos", mode: "simple" });
  });

  it("solo admite enteros pequeños en parámetros numéricos permitidos", () => {
    expect(sanitizeParams({ position: 2 })).toEqual({ position: 2 });
    expect(sanitizeParams({ position: 25000 })).toEqual({});
    expect(sanitizeParams({ position: 1.5 })).toEqual({});
  });

  it("elimina dígitos de los términos de búsqueda", () => {
    expect(sanitizeSearchTerm("préstamo 25000 al 12%")).toBe("préstamo al %");
    expect(sanitizeSearchTerm("a".repeat(100))).toHaveLength(40);
  });

  it("limpia caracteres extraños en strings", () => {
    expect(sanitizeParams({ tool_slug: "<script>x" })).toEqual({ tool_slug: "scriptx" });
  });
});
