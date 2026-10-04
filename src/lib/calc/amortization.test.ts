import { describe, expect, it } from "vitest";
import { amortize, frenchPayment, summarizeByYear, type AmortizationInput } from "./amortization";
import { periodicRate, termToPeriods } from "./rates";
import { calculateLoan } from "./loan";

const base: AmortizationInput = {
  principal: 10000,
  ratePct: 12,
  rateType: "nominal-annual",
  term: 12,
  termUnit: "months",
  periodsPerYear: 12,
  system: "french",
};

function assertFiniteDeep(obj: unknown) {
  JSON.stringify(obj, (_k, v) => {
    if (typeof v === "number") expect(Number.isFinite(v)).toBe(true);
    return v;
  });
}

describe("tasas", () => {
  it("convierte tasas a periodo", () => {
    expect(periodicRate(12, "nominal-annual", 12)).toBeCloseTo(0.01, 12);
    expect(periodicRate(12.682503, "effective-annual", 12)).toBeCloseTo(0.01, 7);
    expect(periodicRate(1, "monthly", 12)).toBe(0.01);
    expect(periodicRate(1, "monthly", 4)).toBeCloseTo(1.01 ** 3 - 1, 12);
  });
  it("plazo a periodos", () => {
    expect(termToPeriods(2, "years", 12)).toBe(24);
    expect(termToPeriods(18, "months", 12)).toBe(18);
    expect(termToPeriods(1.5, "years", 12)).toBe(18);
    expect(termToPeriods(6, "months", 4)).toBe(2);
    expect(termToPeriods(7, "months", 4)).toBeNull();
    expect(termToPeriods(1, "years", 52)).toBe(52);
  });
});

describe("cuota francesa", () => {
  it("coincide con el valor de referencia", () => {
    // 10.000 al 1 % mensual, 12 meses → 888,4879
    expect(frenchPayment(10000, 0.01, 12)).toBeCloseTo(888.4879, 4);
    // 200.000 al 0,5 % mensual, 360 meses → 1.199,10
    expect(frenchPayment(200000, 0.005, 360)).toBeCloseTo(1199.1, 2);
  });
  it("tasa cero = capital / n", () => {
    expect(frenchPayment(1200, 0, 12)).toBe(100);
  });
});

describe("tabla de amortización", () => {
  it("francés: saldo final exactamente 0 y totales consistentes", () => {
    const r = amortize(base);
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    const v = r.value;
    expect(v.rows).toHaveLength(12);
    expect(v.firstPayment).toBe(888.49);
    expect(v.rows.at(-1)!.balance).toBe(0);
    const sumPrincipal = v.rows.reduce((a, x) => a + x.principal, 0);
    expect(sumPrincipal).toBeCloseTo(10000, 6);
    expect(v.totalPaid).toBeCloseTo(v.principal + v.totalInterest, 6);
    expect(v.totalInterest).toBeCloseTo(661.85, 1);
    expect(Math.abs(v.lastPayment - v.firstPayment)).toBeLessThan(0.1);
    assertFiniteDeep(v);
  });

  it("alemán: capital constante, cuota decreciente, saldo 0", () => {
    const r = amortize({ ...base, system: "german" });
    if (!r.ok) throw new Error(r.error);
    const v = r.value;
    expect(v.rows[0]!.principal).toBe(833.33);
    expect(v.rows[0]!.payment).toBe(933.33);
    expect(v.rows.at(-1)!.balance).toBe(0);
    expect(v.firstPayment).toBeGreaterThan(v.lastPayment);
    // Interés total alemán: P·r·(n+1)/2 = 650
    expect(v.totalInterest).toBeCloseTo(650, 0);
  });

  it("tasa 0 %: sin intereses", () => {
    const r = amortize({ ...base, ratePct: 0, principal: 1000, term: 3 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.totalInterest).toBe(0);
    expect(r.value.rows.map((x) => x.payment)).toEqual([333.33, 333.33, 333.34]);
    expect(r.value.rows.at(-1)!.balance).toBe(0);
  });

  it("decimales, plazos largos y frecuencias distintas llegan a 0", () => {
    for (const ppy of [52, 26, 24, 12, 6, 4, 2, 1]) {
      for (const system of ["french", "german"] as const) {
        const r = amortize({ ...base, principal: 123456.78, ratePct: 9.37, term: 30, termUnit: "years", periodsPerYear: ppy, system });
        if (!r.ok) throw new Error(r.error);
        expect(r.value.rows.at(-1)!.balance).toBe(0);
        expect(r.value.rows.every((x) => x.balance >= 0 && x.principal >= 0)).toBe(true);
        assertFiniteDeep(r.value);
      }
    }
  });

  it("valores extremos siguen siendo finitos", () => {
    const r = amortize({ ...base, principal: 1e12, ratePct: 999, term: 100, termUnit: "years" });
    if (!r.ok) throw new Error(r.error);
    assertFiniteDeep(r.value);
    expect(r.value.rows.at(-1)!.balance).toBe(0);
    const tiny = amortize({ ...base, principal: 0.01, term: 1 });
    if (!tiny.ok) throw new Error(tiny.error);
    expect(tiny.value.totalPaid).toBe(0.01);
  });

  it("entradas inválidas devuelven errores comprensibles", () => {
    expect(amortize({ ...base, principal: 0 }).ok).toBe(false);
    expect(amortize({ ...base, principal: -5 }).ok).toBe(false);
    expect(amortize({ ...base, principal: Number.NaN }).ok).toBe(false);
    expect(amortize({ ...base, ratePct: -1 }).ok).toBe(false);
    expect(amortize({ ...base, ratePct: 5000 }).ok).toBe(false);
    expect(amortize({ ...base, term: 0 }).ok).toBe(false);
    expect(amortize({ ...base, term: 7, periodsPerYear: 4 }).ok).toBe(false);
    expect(amortize({ ...base, periodsPerYear: 7 }).ok).toBe(false);
    expect(amortize({ ...base, term: 1000, termUnit: "years" }).ok).toBe(false);
  });

  it("resumen anual", () => {
    const r = amortize({ ...base, term: 2, termUnit: "years" });
    if (!r.ok) throw new Error(r.error);
    const years = summarizeByYear(r.value.rows, 12);
    expect(years).toHaveLength(2);
    expect(years[1]!.balance).toBe(0);
    expect(years[0]!.principal + years[1]!.principal).toBeCloseTo(10000, 6);
  });
});

describe("calculadora de préstamos", () => {
  it("calcula cuota, intereses y total", () => {
    const r = calculateLoan({ principal: 10000, ratePct: 12, rateType: "nominal-annual", term: 1, termUnit: "years" });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.payment).toBe(888.49);
    expect(r.value.months).toBe(12);
    expect(r.value.totalPaid).toBeCloseTo(10661.85, 1);
    expect(r.value.effectiveAnnualRate).toBeCloseTo(0.126825, 5);
  });
  it("tasa mensual", () => {
    const r = calculateLoan({ principal: 5000, ratePct: 2, rateType: "monthly", term: 24, termUnit: "months" });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.payment).toBeCloseTo(frenchPayment(5000, 0.02, 24), 2);
  });
  it("plazo en años fraccionario no entero en meses → error", () => {
    const r = calculateLoan({ principal: 5000, ratePct: 10, rateType: "nominal-annual", term: 1.33, termUnit: "years" });
    expect(r.ok).toBe(false);
  });
});
