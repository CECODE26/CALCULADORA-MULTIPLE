import { compoundInterest, requiredContribution, type CompoundResult } from "./compound";
import type { TermUnit } from "./rates";
import { type CalcResult, fail, ok } from "./types";

/**
 * Ahorro mensual con rendimiento opcional. Supone aportes al final de cada
 * mes y capitalización mensual del rendimiento anual estimado (nominal).
 */
export interface SavingsProjectionInput {
  initial: number;
  monthly: number;
  /** Rendimiento anual estimado en %; vacío = 0 */
  ratePct: number;
  term: number;
  termUnit: TermUnit;
}

export interface SavingsProjection extends CompoundResult {
  /** Lo que tendrías sin ningún rendimiento */
  withoutReturn: number;
}

const common = { compoundsPerYear: 12, contributionsPerYear: 12, timing: "end" as const };

export function projectSavings(input: SavingsProjectionInput): CalcResult<SavingsProjection> {
  const res = compoundInterest({
    initial: input.initial,
    contribution: input.monthly,
    ratePct: Number.isFinite(input.ratePct) ? input.ratePct : 0,
    term: input.term,
    termUnit: input.termUnit,
    ...common,
  });
  if (!res.ok) return res.field === "contribution" ? fail(res.error, "monthly") : res;
  return ok({ ...res.value, withoutReturn: res.value.totalContributed });
}

export interface SavingsGoalInput {
  goal: number;
  current: number;
  ratePct: number;
  term: number;
  termUnit: TermUnit;
}

export interface SavingsGoal {
  monthlyRequired: number;
  /** Aporte mensual necesario si no hubiera rendimiento */
  monthlyWithoutReturn: number;
  alreadyReached: boolean;
  projection: CompoundResult;
}

export function savingsGoal(input: SavingsGoalInput): CalcResult<SavingsGoal> {
  const rate = Number.isFinite(input.ratePct) ? input.ratePct : 0;
  const res = requiredContribution({
    goal: input.goal,
    initial: input.current,
    ratePct: rate,
    term: input.term,
    termUnit: input.termUnit,
    ...common,
  });
  if (!res.ok) return res.field === "initial" ? fail(res.error, "current") : res;
  const months = input.termUnit === "years" ? Math.floor(input.term * 12 + 1e-9) : Math.floor(input.term + 1e-9);
  const plain = months > 0 ? Math.max(0, Math.ceil(((input.goal - input.current) / months) * 100 - 1e-6) / 100) : 0;
  return ok({
    monthlyRequired: res.value.requiredContribution,
    monthlyWithoutReturn: plain,
    alreadyReached: res.value.alreadyReached,
    projection: res.value.projection,
  });
}
