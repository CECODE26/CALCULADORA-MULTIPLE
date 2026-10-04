import { describe, expect, it } from "vitest";
import { nominalToEffective } from "@/lib/calc/lender";
import { BCE_MAX_RATES, lenders } from "./tasas-ecuador";

const ISO = /^\d{4}-\d{2}-\d{2}$/;

describe("tasas de Ecuador (integridad de datos)", () => {
  it("ids únicos y fuentes oficiales con fecha", () => {
    const ids = lenders.map((l) => l.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const l of lenders) {
      const pids = l.products.map((p) => p.id);
      expect(new Set(pids).size, l.id).toBe(pids.length);
      for (const p of l.products) {
        expect(p.source, `${l.id}/${p.id}`).toMatch(/^https:\/\//);
        expect(p.asOf, `${l.id}/${p.id}`).toMatch(ISO);
        expect(p.nominalRate, `${l.id}/${p.id}`).toBeGreaterThan(0);
        expect(p.minMonths, `${l.id}/${p.id}`).toBeGreaterThanOrEqual(1);
        expect(p.maxMonths, `${l.id}/${p.id}`).toBeGreaterThanOrEqual(p.minMonths);
        if (p.minAmount !== undefined && p.maxAmount !== undefined) expect(p.maxAmount).toBeGreaterThanOrEqual(p.minAmount);
      }
    }
  });

  it("si hay tasas máximas del BCE, tienen fecha y ninguna tasa las supera", () => {
    if (Object.keys(BCE_MAX_RATES.rates).length > 0) expect(BCE_MAX_RATES.asOf).toMatch(ISO);
    for (const l of lenders) {
      for (const p of l.products) {
        const cap = BCE_MAX_RATES.rates[p.segment];
        if (!cap) continue;
        const effective = p.effectiveRate ?? nominalToEffective(p.nominalRate);
        expect(effective, `${l.id}/${p.id}`).toBeLessThanOrEqual(cap.maxEffective + 0.005);
      }
    }
  });
});
