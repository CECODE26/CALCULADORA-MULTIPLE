import { describe, expect, it } from "vitest";
import { EMPTY, formatCurrency, formatDuration, formatHHMM, formatNumber, formatPercent, groupSeparatorFor } from "./format";

const ctx = { locale: "es-MX", currency: "USD" };

describe("formatos", () => {
  it("nunca muestra NaN, Infinity, undefined ni null", () => {
    for (const bad of [Number.NaN, Infinity, -Infinity, undefined, null, "12"]) {
      expect(formatCurrency(bad, ctx)).toBe(EMPTY);
      expect(formatNumber(bad, "es")).toBe(EMPTY);
      expect(formatPercent(bad, "es")).toBe(EMPTY);
      expect(formatDuration(bad)).toBe(EMPTY);
      expect(formatHHMM(bad)).toBe(EMPTY);
    }
  });
  it("moneda con 2 decimales y sin -0", () => {
    expect(formatCurrency(1234.5, ctx)).toContain("1,234.50");
    expect(formatCurrency(-0.001, ctx)).not.toContain("-");
  });
  it("porcentajes", () => {
    expect(formatPercent(12.345, "es-MX")).toBe("12.35\u00a0%");
    expect(formatPercent(0.25, "es-MX", 2, true)).toBe("25\u00a0%");
  });
  it("duraciones", () => {
    expect(formatDuration(450)).toBe("7 h 30 min");
    expect(formatHHMM(450)).toBe("07:30");
    expect(formatHHMM(0)).toBe("00:00");
  });
  it("detecta el separador de miles", () => {
    expect(groupSeparatorFor("es-MX")).toBe(",");
    expect(groupSeparatorFor("es-ES")).toBe(".");
  });
});
