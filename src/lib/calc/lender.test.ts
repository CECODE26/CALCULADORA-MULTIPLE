import { describe, expect, it } from "vitest";
import { compareLenders, effectiveToNominal, nominalToEffective, simulateLenderLoan } from "./lender";
import type { Lender, LoanProduct } from "@/data/tasas-ecuador";

// Datos ficticios solo para probar el cálculo (no son tasas reales)
const product = (over: Partial<LoanProduct> = {}): LoanProduct => ({
  id: "consumo",
  name: "Crédito de consumo",
  category: "consumo",
  segment: "consumo",
  nominalRate: 15,
  minMonths: 3,
  maxMonths: 60,
  minAmount: 500,
  maxAmount: 30000,
  source: "https://example.com/tasas",
  asOf: "2026-09-01",
  asOfKind: "vigente",
  ...over,
});

const list: Lender[] = [
  { id: "a", name: "Entidad A", kind: "banco", website: "https://a.example", products: [product({ nominalRate: 15 })] },
  { id: "b", name: "Entidad B", kind: "cooperativa", website: "https://b.example", products: [product({ nominalRate: 12 })] },
  { id: "c", name: "Entidad C", kind: "banco", website: "https://c.example", products: [product({ nominalRate: 10, maxMonths: 24 })] },
  { id: "d", name: "Entidad D", kind: "banco", website: "https://d.example", products: [product({ category: "vivienda", segment: "inmobiliario" })] },
];

describe("simulador por entidad", () => {
  it("convierte entre tasa nominal y efectiva (capitalización mensual)", () => {
    expect(nominalToEffective(12)).toBeCloseTo(12.6825, 4);
    expect(effectiveToNominal(nominalToEffective(15.6))).toBeCloseTo(15.6, 10);
  });

  it("calcula la cuota con la tasa nominal de la entidad", () => {
    const res = simulateLenderLoan({ product: product(), principal: 10000, months: 36, system: "french" });
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.value.firstPayment).toBeCloseTo(346.65, 2);
    expect(res.value.periods).toBe(36);
    expect(res.value.rows.at(-1)!.balance).toBe(0);
  });

  it("respeta plazos y montos publicados", () => {
    const p = product();
    expect(simulateLenderLoan({ product: p, principal: 10000, months: 72, system: "french" })).toMatchObject({ ok: false, field: "term" });
    expect(simulateLenderLoan({ product: p, principal: 10000, months: 2, system: "french" })).toMatchObject({ ok: false, field: "term" });
    expect(simulateLenderLoan({ product: p, principal: 10000, months: 12.5, system: "french" })).toMatchObject({ ok: false, field: "term" });
    expect(simulateLenderLoan({ product: p, principal: 100, months: 12, system: "french" })).toMatchObject({ ok: false, field: "principal" });
    expect(simulateLenderLoan({ product: p, principal: 50000, months: 12, system: "french" })).toMatchObject({ ok: false, field: "principal" });
  });

  it("sin límites publicados admite cualquier plazo entero", () => {
    const p = product({ minMonths: undefined, maxMonths: undefined, minAmount: undefined, maxAmount: undefined });
    expect(simulateLenderLoan({ product: p, principal: 100, months: 240, system: "german" }).ok).toBe(true);
  });

  it("campos vacíos piden datos sin mostrar errores de límites", () => {
    const res = simulateLenderLoan({ product: product(), principal: Number.NaN, months: Number.NaN, system: "french" });
    expect(res).toMatchObject({ ok: false, field: "principal" });
  });

  it("compara la misma categoría, excluye plazos no admitidos y ordena por total", () => {
    const rows = compareLenders("consumo", 10000, 36, "french", list);
    expect(rows.map((r) => r.lender.id)).toEqual(["b", "a"]);
    expect(rows[0]!.totalPaid).toBeLessThan(rows[1]!.totalPaid);
    expect(compareLenders("consumo", 10000, 24, "german", list).map((r) => r.lender.id)).toEqual(["c", "b", "a"]);
  });
});
