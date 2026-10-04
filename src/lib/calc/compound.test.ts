import { describe, expect, it } from "vitest";
import { compoundInterest, requiredContribution, type CompoundInput } from "./compound";
import { projectSavings, savingsGoal } from "./savings";

const base: CompoundInput = {
  initial: 1000,
  contribution: 0,
  ratePct: 5,
  term: 10,
  termUnit: "years",
  compoundsPerYear: 12,
  contributionsPerYear: 12,
  timing: "end",
};

function finiteDeep(obj: unknown) {
  JSON.stringify(obj, (_k, v) => {
    if (typeof v === "number") expect(Number.isFinite(v)).toBe(true);
    return v;
  });
}

/** Simulación mes a mes (válida cuando n y m dividen a 12). */
function simulate(i: CompoundInput): number {
  const months = i.termUnit === "years" ? i.term * 12 : i.term;
  let bal = i.initial;
  const monthlyFactor = Math.pow(1 + i.ratePct / 100 / i.compoundsPerYear, i.compoundsPerYear / 12);
  const every = 12 / i.contributionsPerYear;
  for (let mo = 1; mo <= months; mo++) {
    if (i.timing === "begin" && (mo - 1) % every === 0) bal += i.contribution;
    bal *= monthlyFactor;
    if (i.timing === "end" && mo % every === 0) bal += i.contribution;
  }
  return bal;
}

describe("interés compuesto", () => {
  it("A = P(1 + r/n)^(nt)", () => {
    const r = compoundInterest(base);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.finalBalance).toBeCloseTo(1000 * (1 + 0.05 / 12) ** 120, 2);
    expect(r.value.finalBalance).toBe(1647.01);
    expect(r.value.totalContributed).toBe(1000);
  });

  it("anualidad al final y al inicio", () => {
    const end = compoundInterest({ ...base, initial: 0, contribution: 100 });
    const begin = compoundInterest({ ...base, initial: 0, contribution: 100, timing: "begin" });
    if (!end.ok || !begin.ok) throw new Error("fallo");
    expect(end.value.finalBalance).toBeCloseTo(15528.23, 1);
    expect(begin.value.finalBalance).toBeCloseTo(15528.23 * (1 + 0.05 / 12), 1);
    expect(end.value.totalContributed).toBe(12000);
    expect(end.value.contributionsCount).toBe(120);
  });

  it.each([
    [12, 12],
    [12, 4],
    [4, 12],
    [1, 12],
    [2, 1],
    [12, 1],
    [4, 2],
  ])("coincide con la simulación (n=%i, m=%i)", (n, m) => {
    for (const timing of ["end", "begin"] as const) {
      const input = { ...base, contribution: 250, compoundsPerYear: n, contributionsPerYear: m, timing, term: 7 };
      const r = compoundInterest(input);
      if (!r.ok) throw new Error(r.error);
      expect(r.value.finalBalance).toBeCloseTo(simulate(input), 2);
    }
  });

  it("plazo en meses no múltiplo de año", () => {
    const input = { ...base, contribution: 50, term: 30, termUnit: "months" as const };
    const r = compoundInterest(input);
    if (!r.ok) throw new Error(r.error);
    expect(r.value.finalBalance).toBeCloseTo(simulate(input), 2);
    expect(r.value.years).toHaveLength(3);
    expect(r.value.years.at(-1)!.months).toBe(30);
  });

  it("tasa 0 %", () => {
    const r = compoundInterest({ ...base, ratePct: 0, contribution: 10 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.finalBalance).toBe(2200);
    expect(r.value.totalInterest).toBe(0);
    expect(r.value.growthPct).toBe(0);
  });

  it("capitalización diaria", () => {
    const r = compoundInterest({ ...base, compoundsPerYear: 365 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.finalBalance).toBeCloseTo(1000 * (1 + 0.05 / 365) ** 3650, 2);
  });

  it("valores extremos e inválidos", () => {
    const big = compoundInterest({ ...base, initial: 1e12, ratePct: 100, term: 100 });
    expect(big.ok).toBe(false); // demasiado grande, sin Infinity
    const ok = compoundInterest({ ...base, initial: 1e9, ratePct: 20, term: 40, contribution: 1e6 });
    if (!ok.ok) throw new Error(ok.error);
    finiteDeep(ok.value);
    expect(compoundInterest({ ...base, initial: -1 }).ok).toBe(false);
    expect(compoundInterest({ ...base, ratePct: -2 }).ok).toBe(false);
    expect(compoundInterest({ ...base, ratePct: Number.NaN }).ok).toBe(false);
    expect(compoundInterest({ ...base, term: 0 }).ok).toBe(false);
    expect(compoundInterest({ ...base, initial: 0, contribution: 0 }).ok).toBe(false);
    expect(compoundInterest({ ...base, compoundsPerYear: 3 }).ok).toBe(false);
  });
});

describe("aportación necesaria para una meta", () => {
  it("la aportación calculada alcanza la meta (y no la supera en más de un periodo)", () => {
    const r = requiredContribution({ ...base, initial: 5000, goal: 50000, term: 15 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.alreadyReached).toBe(false);
    expect(r.value.projection.finalBalance).toBeGreaterThanOrEqual(50000);
    expect(r.value.projection.finalBalance - 50000).toBeLessThan(5);
  });
  it("meta ya cubierta por el capital inicial", () => {
    const r = requiredContribution({ ...base, initial: 10000, goal: 12000 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.alreadyReached).toBe(true);
    expect(r.value.requiredContribution).toBe(0);
  });
  it("tasa 0: meta / número de aportaciones", () => {
    const r = requiredContribution({ ...base, initial: 0, ratePct: 0, goal: 1200, term: 1 });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.requiredContribution).toBe(100);
  });
  it("errores", () => {
    expect(requiredContribution({ ...base, goal: 0 }).ok).toBe(false);
    expect(requiredContribution({ ...base, goal: Number.NaN }).ok).toBe(false);
    expect(requiredContribution({ ...base, initial: 0, goal: 1000, term: 1, termUnit: "months", contributionsPerYear: 1 }).ok).toBe(false);
  });
});

describe("ahorro", () => {
  it("sin rendimiento = suma simple", () => {
    const r = projectSavings({ initial: 500, monthly: 100, ratePct: Number.NaN, term: 12, termUnit: "months" });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.finalBalance).toBe(1700);
    expect(r.value.totalInterest).toBe(0);
  });
  it("con rendimiento supera al ahorro sin rendimiento", () => {
    const r = projectSavings({ initial: 0, monthly: 200, ratePct: 6, term: 5, termUnit: "years" });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.finalBalance).toBeCloseTo(13954.01, 1);
    expect(r.value.finalBalance).toBeGreaterThan(r.value.withoutReturn);
  });
  it("meta: aporte mensual necesario", () => {
    const r = savingsGoal({ goal: 10000, current: 1000, ratePct: 0, term: 18, termUnit: "months" });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.monthlyRequired).toBe(500);
    expect(r.value.monthlyWithoutReturn).toBe(500);
    const withRate = savingsGoal({ goal: 10000, current: 1000, ratePct: 5, term: 18, termUnit: "months" });
    if (!withRate.ok) throw new Error(withRate.error);
    expect(withRate.value.monthlyRequired).toBeLessThan(500);
    expect(withRate.value.projection.finalBalance).toBeGreaterThanOrEqual(10000);
  });
  it("meta ya alcanzada y errores", () => {
    const r = savingsGoal({ goal: 500, current: 1000, ratePct: 0, term: 12, termUnit: "months" });
    if (!r.ok) throw new Error(r.error);
    expect(r.value.alreadyReached).toBe(true);
    expect(r.value.monthlyWithoutReturn).toBe(0);
    expect(savingsGoal({ goal: 1000, current: -5, ratePct: 0, term: 12, termUnit: "months" }).ok).toBe(false);
    expect(projectSavings({ initial: 0, monthly: 0, ratePct: 0, term: 12, termUnit: "months" }).ok).toBe(false);
  });
});
