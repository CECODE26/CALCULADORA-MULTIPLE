import { describe, expect, it } from "vitest";
import { percentage } from "./percentage";
import { inverseDiscount, simpleDiscount, successiveDiscounts } from "./discount";
import { parseTime, shiftDuration, weeklyHours } from "./hours";
import { calculateTax } from "./tax";

const val = <T,>(r: { ok: true; value: T } | { ok: false; error: string }): T => {
  if (!r.ok) throw new Error(r.error);
  return r.value;
};

describe("porcentajes", () => {
  it("los 7 modos", () => {
    expect(val(percentage("of", 15, 200)).value).toBe(30);
    expect(val(percentage("whatPercent", 30, 200)).value).toBe(15);
    expect(val(percentage("increase", 10, 50)).value).toBeCloseTo(55, 10);
    expect(val(percentage("decrease", 20, 50)).value).toBeCloseTo(40, 10);
    expect(val(percentage("change", 80, 100)).value).toBeCloseTo(25, 10);
    expect(val(percentage("change", 100, 80)).value).toBeCloseTo(-20, 10);
    expect(val(percentage("originalBeforeIncrease", 15, 115)).value).toBeCloseTo(100, 10);
    expect(val(percentage("originalBeforeDecrease", 20, 80)).value).toBeCloseTo(100, 10);
  });
  it("decimales y negativos", () => {
    expect(val(percentage("of", 12.5, 80)).value).toBe(10);
    expect(val(percentage("of", 10, -50)).value).toBe(-5);
    expect(val(percentage("change", -50, -25)).value).toBeCloseTo(50, 10);
    expect(val(percentage("of", 0, 999)).value).toBe(0);
  });
  it("divisiones por cero y límites", () => {
    expect(percentage("whatPercent", 5, 0).ok).toBe(false);
    expect(percentage("change", 0, 5).ok).toBe(false);
    expect(percentage("originalBeforeDecrease", 100, 5).ok).toBe(false);
    expect(percentage("originalBeforeIncrease", -100, 5).ok).toBe(false);
    expect(percentage("decrease", 150, 5).ok).toBe(false);
    expect(percentage("of", Number.NaN, 5).ok).toBe(false);
    expect(percentage("of", 5, 1e20).ok).toBe(false);
  });
});

describe("descuentos", () => {
  it("simple", () => {
    const r = val(simpleDiscount(80, 25));
    expect(r.savings).toBe(20);
    expect(r.finalPrice).toBe(60);
  });
  it("sucesivos 20 % + 10 % = 28 %, no 30 %", () => {
    const r = val(successiveDiscounts(100, [20, 10]));
    expect(r.finalPrice).toBe(72);
    expect(r.effectivePct).toBeCloseTo(28, 10);
    expect(r.naiveSumPct).toBe(30);
    expect(r.steps.map((s) => s.priceAfter)).toEqual([80, 72]);
  });
  it("sucesivos: el orden no altera el resultado; 100 % deja precio 0", () => {
    expect(val(successiveDiscounts(250, [10, 30])).finalPrice).toBe(val(successiveDiscounts(250, [30, 10])).finalPrice);
    expect(val(successiveDiscounts(50, [100, 10])).finalPrice).toBe(0);
  });
  it("inverso", () => {
    const r = val(inverseDiscount(120, 90));
    expect(r.effectivePct).toBe(25);
    expect(r.savings).toBe(30);
  });
  it("errores", () => {
    expect(simpleDiscount(100, 120).ok).toBe(false);
    expect(simpleDiscount(-1, 10).ok).toBe(false);
    expect(successiveDiscounts(100, []).ok).toBe(false);
    expect(successiveDiscounts(100, [10, -5]).ok).toBe(false);
    expect(inverseDiscount(0, 0).ok).toBe(false);
    expect(inverseDiscount(100, 120).ok).toBe(false);
    expect(inverseDiscount(Number.NaN, 1).ok).toBe(false);
  });
});

describe("horas trabajadas", () => {
  it("parseo de horas", () => {
    expect(parseTime("08:30")).toBe(510);
    expect(parseTime("8:05")).toBe(485);
    expect(parseTime("24:00")).toBeNull();
    expect(parseTime("12:60")).toBeNull();
    expect(parseTime("")).toBeNull();
    expect(parseTime("abc")).toBeNull();
  });
  it("jornada normal con descanso", () => {
    const r = val(shiftDuration("08:00", "17:30", 60));
    expect(r.minutes).toBe(510);
    expect(r.hours).toBe(8);
    expect(r.remainderMinutes).toBe(30);
    expect(r.decimalHours).toBe(8.5);
    expect(r.crossesMidnight).toBe(false);
  });
  it("turno que cruza la medianoche 22:00 → 06:00", () => {
    const r = val(shiftDuration("22:00", "06:00", 0));
    expect(r.minutes).toBe(480);
    expect(r.crossesMidnight).toBe(true);
    expect(val(shiftDuration("23:45", "00:15", 0)).minutes).toBe(30);
  });
  it("horas decimales con minutos sueltos", () => {
    expect(val(shiftDuration("09:00", "16:20", 0)).decimalHours).toBe(7.33);
  });
  it("errores", () => {
    expect(shiftDuration("08:00", "08:00", 0).ok).toBe(false);
    expect(shiftDuration("08:00", "09:00", 60).ok).toBe(false);
    expect(shiftDuration("08:00", "09:00", -5).ok).toBe(false);
    expect(shiftDuration("xx", "09:00", 0).ok).toBe(false);
  });
  it("semana", () => {
    const day = { enabled: true, start: "09:00", end: "17:00", breakMinutes: 30 };
    const off = { enabled: false, start: "", end: "", breakMinutes: 0 };
    const r = val(weeklyHours([day, day, day, day, { ...day, end: "13:00", breakMinutes: 0 }, off, off]));
    expect(r.totalMinutes).toBe(4 * 450 + 240);
    expect(r.workedDays).toBe(5);
    expect(r.averageMinutes).toBe(408);
    expect(r.days[5]).toBeNull();
    expect(weeklyHours([off, off]).ok).toBe(false);
    const bad = weeklyHours([day, { ...day, start: "10:00", end: "10:00" }]);
    expect(bad.ok).toBe(false);
    if (!bad.ok) expect(bad.field).toBe("day1-end");
  });
});

describe("IVA / impuestos", () => {
  it("agregar", () => {
    const r = val(calculateTax("add", 100, 15));
    expect(r).toMatchObject({ base: 100, tax: 15, total: 115 });
  });
  it("quitar: base + impuesto = total exacto", () => {
    const r = val(calculateTax("remove", 115, 15));
    expect(r.base).toBe(100);
    expect(r.tax).toBe(15);
    const odd = val(calculateTax("remove", 99.99, 21));
    expect(odd.base + odd.tax).toBeCloseTo(99.99, 10);
    expect(odd.base).toBe(82.64);
  });
  it("impuesto incluido y su peso en el precio", () => {
    const r = val(calculateTax("included", 116, 16));
    expect(r.tax).toBe(16);
    expect(r.shareOfTotalPct).toBeCloseTo(13.793, 3);
  });
  it("tasa 0 y errores", () => {
    expect(val(calculateTax("add", 50, 0)).total).toBe(50);
    expect(val(calculateTax("add", 0, 15)).shareOfTotalPct).toBe(0);
    expect(calculateTax("add", -1, 15).ok).toBe(false);
    expect(calculateTax("add", 10, -1).ok).toBe(false);
    expect(calculateTax("add", 10, 101).ok).toBe(false);
    expect(calculateTax("remove", Number.NaN, 10).ok).toBe(false);
  });
});
