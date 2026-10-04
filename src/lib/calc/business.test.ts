import { describe, expect, it } from "vitest";
import { marginFromPrice, marginToMarkup, markupToMargin, priceFromMargin, priceFromMarkup } from "./margin";
import { calculatePrice } from "./pricing";
import { breakEven, breakEvenSeries, simulateSales } from "./breakeven";

describe("margen de ganancia", () => {
  it("costo + precio", () => {
    const r = marginFromPrice(60, 100);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.profit).toBe(40);
    expect(r.value.marginPct).toBeCloseTo(40, 10);
    expect(r.value.markupPct).toBeCloseTo(66.6667, 3);
  });
  it("venta con pérdida y costo cero", () => {
    const loss = marginFromPrice(120, 100);
    if (!loss.ok) throw new Error(loss.error);
    expect(loss.value.profit).toBe(-20);
    expect(loss.value.marginPct).toBeCloseTo(-20, 10);
    const free = marginFromPrice(0, 50);
    if (!free.ok) throw new Error(free.error);
    expect(free.value.markupPct).toBeNull();
    expect(free.value.marginPct).toBe(100);
  });
  it("precio para un margen: 60 con 40 % → 100", () => {
    const r = priceFromMargin(60, 40);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.price).toBe(100);
    const zero = priceFromMargin(10, 0);
    expect(zero.ok && zero.value.price).toBe(10);
  });
  it("precio con markup", () => {
    const r = priceFromMarkup(60, 40);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.price).toBe(84);
    expect(r.value.marginPct).toBeCloseTo(28.5714, 3);
  });
  it("conversión margen ↔ markup", () => {
    expect(marginToMarkup(50)).toBeCloseTo(100);
    expect(markupToMargin(100)).toBeCloseTo(50);
    expect(marginToMarkup(100)).toBeNull();
  });
  it("entradas inválidas", () => {
    expect(marginFromPrice(10, 0).ok).toBe(false);
    expect(marginFromPrice(-1, 10).ok).toBe(false);
    expect(marginFromPrice(Number.NaN, 10).ok).toBe(false);
    expect(priceFromMargin(10, 100).ok).toBe(false);
    expect(priceFromMargin(10, 150).ok).toBe(false);
    expect(priceFromMargin(0, 30).ok).toBe(false);
    expect(priceFromMargin(10, -5).ok).toBe(false);
    expect(priceFromMarkup(10, -5).ok).toBe(false);
  });
});

describe("precio de venta", () => {
  it("modo simple = costo / (1 − margen)", () => {
    const r = calculatePrice({ cost: 70, marginPct: 30 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.priceBeforeTax).toBe(100);
    expect(r.value.finalPrice).toBe(100);
    expect(r.value.profit).toBe(30);
  });
  it("modo avanzado: comisión sobre precio sin impuesto", () => {
    const r = calculatePrice({ cost: 50, shipping: 5, packaging: 3, other: 2, commissionPct: 10, marginPct: 30, taxPct: 15 });
    if (!r.ok) throw new Error(r.error);
    // 60 / (1 − 0,1 − 0,3) = 100
    expect(r.value.realCost).toBe(60);
    expect(r.value.priceBeforeTax).toBe(100);
    expect(r.value.commission).toBe(10);
    expect(r.value.profit).toBe(30);
    expect(r.value.tax).toBe(15);
    expect(r.value.finalPrice).toBe(115);
    // Verificación: precio − comisión − costo = ganancia
    expect(r.value.priceBeforeTax - r.value.commission - r.value.realCost).toBeCloseTo(r.value.profit, 6);
  });
  it("comisión sobre el precio con impuesto", () => {
    const r = calculatePrice({ cost: 60, commissionPct: 10, marginPct: 30, taxPct: 20, commissionOnFinalPrice: true });
    if (!r.ok) throw new Error(r.error);
    // 60 / (1 − 0,12 − 0,3) = 103,448…
    expect(r.value.priceBeforeTax).toBeCloseTo(103.45, 2);
    expect(r.value.commission).toBeCloseTo(0.1 * 103.448 * 1.2, 1);
    expect(r.value.priceBeforeTax - r.value.commission - r.value.realCost).toBeCloseTo(r.value.profit, 1);
  });
  it("sin impuesto definido no aplica ninguna tasa", () => {
    const r = calculatePrice({ cost: 10, marginPct: 50 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.tax).toBe(0);
  });
  it("errores: comisión + margen ≥ 100 %, negativos, vacíos", () => {
    expect(calculatePrice({ cost: 10, commissionPct: 60, marginPct: 40 }).ok).toBe(false);
    expect(calculatePrice({ cost: 10, marginPct: 100 }).ok).toBe(false);
    expect(calculatePrice({ cost: 0, marginPct: 10 }).ok).toBe(false);
    expect(calculatePrice({ cost: 10, shipping: -1, marginPct: 10 }).ok).toBe(false);
    expect(calculatePrice({ cost: 10, marginPct: Number.NaN }).ok).toBe(false);
    expect(calculatePrice({ cost: 10, marginPct: 10, taxPct: -3 }).ok).toBe(false);
  });
});

describe("punto de equilibrio", () => {
  const input = { fixedCosts: 5000, unitPrice: 25, unitVariableCost: 15 };
  it("unidades y ventas", () => {
    const r = breakEven(input);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.contributionMargin).toBe(10);
    expect(r.value.contributionMarginPct).toBe(40);
    expect(r.value.units).toBe(500);
    expect(r.value.sales).toBe(12500);
  });
  it("unidades fraccionarias se redondean hacia arriba", () => {
    const r = breakEven({ fixedCosts: 1000, unitPrice: 10, unitVariableCost: 7 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.unitsExact).toBeCloseTo(333.333, 3);
    expect(r.value.units).toBe(334);
    expect(r.value.sales).toBe(3340);
  });
  it("costos fijos 0 → equilibrio en 0 unidades", () => {
    const r = breakEven({ ...input, fixedCosts: 0 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.units).toBe(0);
  });
  it("margen de contribución ≤ 0 → error, nunca Infinity", () => {
    const eq = breakEven({ ...input, unitVariableCost: 25 });
    expect(eq.ok).toBe(false);
    const neg = breakEven({ ...input, unitVariableCost: 30 });
    expect(neg.ok).toBe(false);
    expect(breakEven({ ...input, unitPrice: 0 }).ok).toBe(false);
    expect(breakEven({ ...input, fixedCosts: -1 }).ok).toBe(false);
    expect(breakEven({ ...input, fixedCosts: Number.NaN }).ok).toBe(false);
  });
  it("simulación de ventas", () => {
    const at = simulateSales(input, 500);
    const above = simulateSales(input, 800);
    const below = simulateSales(input, 100);
    if (!at.ok || !above.ok || !below.ok) throw new Error("fallo");
    expect(at.value.profit).toBe(0);
    expect(above.value.profit).toBe(3000);
    expect(below.value.profit).toBe(-4000);
    expect(simulateSales(input, -1).ok).toBe(false);
    expect(simulateSales(input, Number.NaN).ok).toBe(false);
  });
  it("serie del gráfico se cruza en el equilibrio", () => {
    const s = breakEvenSeries(input, 1000, 10);
    expect(s.units).toHaveLength(11);
    expect(s.revenue[5]).toBe(s.costs[5]); // 500 unidades
  });
});
