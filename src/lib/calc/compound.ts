import { round2 } from "@/lib/number";
import type { TermUnit } from "./rates";
import { fail, isNum, MAX_AMOUNT, ok, type CalcResult } from "./types";

/**
 * Interés compuesto con aportaciones periódicas.
 *
 * Sin aportaciones:      A = P (1 + r/n)^(n·t)
 * Con aportaciones C, m veces al año, se usa la tasa equivalente por
 * periodo de aportación i_c = (1 + r/n)^(n/m) − 1:
 *   FV = P (1 + r/n)^(n·t) + C · ((1 + i_c)^k − 1) / i_c        (al final de cada periodo)
 *   FV = … · (1 + i_c)                                          (al inicio de cada periodo)
 * donde k = m·t es el número de aportaciones.
 */
export type ContributionTiming = "end" | "begin";

export interface CompoundInput {
  initial: number;
  contribution: number;
  /** Tasa anual nominal en % */
  ratePct: number;
  term: number;
  termUnit: TermUnit;
  /** Capitalizaciones por año (n): 1, 2, 4, 12, 365 */
  compoundsPerYear: number;
  /** Aportaciones por año (m): 1, 2, 4, 12, 26, 52 */
  contributionsPerYear: number;
  timing: ContributionTiming;
}

export interface CompoundYear {
  year: number;
  /** Etiqueta del periodo (año completo o fracción final) */
  months: number;
  contributed: number;
  interest: number;
  balance: number;
}

export interface CompoundResult {
  finalBalance: number;
  totalContributed: number;
  totalInterest: number;
  /** Crecimiento sobre lo aportado, en %; null si no se aportó nada */
  growthPct: number | null;
  contributionsCount: number;
  effectiveAnnualRate: number;
  years: CompoundYear[];
}

export const COMPOUND_FREQUENCIES = [1, 2, 4, 12, 365] as const;
export const CONTRIBUTION_FREQUENCIES = [1, 2, 4, 12, 26, 52] as const;
const EPS = 1e-9;

function termYears(term: number, unit: TermUnit): number {
  return unit === "years" ? term : term / 12;
}

/** Número de aportaciones realizadas hasta el instante t (años). */
function contributionsUntil(t: number, m: number, timing: ContributionTiming, totalT: number): number {
  const mt = m * t;
  if (timing === "end") return Math.floor(mt + EPS);
  // Al inicio: aportaciones en 0, 1/m, 2/m… estrictamente antes de t, sin superar el plazo total
  const count = Math.ceil(mt - EPS);
  return Math.min(count, Math.ceil(m * totalT - EPS));
}

/** Valor en t de 1 unidad aportada k veces (factor de acumulación). */
function annuityValueAt(t: number, k: number, m: number, G: number, timing: ContributionTiming): number {
  if (k <= 0) return 0;
  const ic = Math.pow(G, 1 / m) - 1;
  const lastTime = timing === "end" ? k / m : (k - 1) / m;
  const growthAfterLast = Math.pow(G, t - lastTime);
  const series = Math.abs(ic) < 1e-15 ? k : (Math.pow(1 + ic, k) - 1) / ic;
  return series * growthAfterLast;
}

function validate(input: CompoundInput, requireSomething = true): CalcResult<{ T: number; G: number }> {
  const { initial, contribution, ratePct, term, termUnit, compoundsPerYear: n, contributionsPerYear: m } = input;
  if (!isNum(initial) || initial < 0) return fail("El capital inicial debe ser 0 o mayor.", "initial");
  if (initial > MAX_AMOUNT) return fail("El capital inicial es demasiado grande.", "initial");
  if (!isNum(contribution) || contribution < 0) return fail("La aportación debe ser 0 o mayor.", "contribution");
  if (contribution > MAX_AMOUNT) return fail("La aportación es demasiado grande.", "contribution");
  if (!isNum(ratePct)) return fail("Introduce la tasa de interés anual (puede ser 0).", "rate");
  if (ratePct < 0) return fail("La tasa no puede ser negativa.", "rate");
  if (ratePct > 100) return fail("La tasa anual no puede superar el 100 %.", "rate");
  if (!isNum(term) || term <= 0) return fail("El plazo debe ser mayor que cero.", "term");
  const T = termYears(term, termUnit);
  if (T > 100) return fail("El plazo máximo es de 100 años.", "term");
  if (!COMPOUND_FREQUENCIES.includes(n as (typeof COMPOUND_FREQUENCIES)[number])) return fail("Frecuencia de capitalización no válida.");
  if (!CONTRIBUTION_FREQUENCIES.includes(m as (typeof CONTRIBUTION_FREQUENCIES)[number])) return fail("Frecuencia de aportación no válida.");
  if (requireSomething && initial === 0 && contribution === 0) {
    return fail("Introduce un capital inicial o una aportación periódica.", "initial");
  }
  const G = Math.pow(1 + ratePct / 100 / n, n);
  return ok({ T, G });
}

export function balanceAt(input: CompoundInput, t: number, T: number, G: number) {
  const k = contributionsUntil(t, input.contributionsPerYear, input.timing, T);
  const fromInitial = input.initial * Math.pow(G, t);
  const fromContrib = input.contribution * annuityValueAt(t, k, input.contributionsPerYear, G, input.timing);
  return { balance: fromInitial + fromContrib, contributed: input.initial + input.contribution * k, k };
}

export function compoundInterest(input: CompoundInput): CalcResult<CompoundResult> {
  const v = validate(input);
  if (!v.ok) return v;
  const { T, G } = v.value;

  const years: CompoundYear[] = [];
  const fullYears = Math.ceil(T - EPS);
  for (let y = 1; y <= fullYears; y++) {
    const t = Math.min(y, T);
    const b = balanceAt(input, t, T, G);
    years.push({
      year: y,
      months: Math.round(t * 12),
      contributed: round2(b.contributed),
      interest: round2(b.balance - b.contributed),
      balance: round2(b.balance),
    });
  }
  const end = balanceAt(input, T, T, G);
  if (!isNum(end.balance) || end.balance > 1e15) return fail("El resultado es demasiado grande para mostrarlo. Reduce la tasa o el plazo.");

  const totalContributed = round2(end.contributed);
  const finalBalance = round2(end.balance);
  const totalInterest = round2(finalBalance - totalContributed);
  return ok({
    finalBalance,
    totalContributed,
    totalInterest,
    growthPct: totalContributed > 0 ? (totalInterest / totalContributed) * 100 : null,
    contributionsCount: end.k,
    effectiveAnnualRate: G - 1,
    years,
  });
}

export interface GoalResult {
  /** Aportación periódica necesaria (0 si el capital inicial basta) */
  requiredContribution: number;
  alreadyReached: boolean;
  projection: CompoundResult;
}

/** ¿Cuánto debo aportar en cada periodo para alcanzar la meta? */
export function requiredContribution(input: Omit<CompoundInput, "contribution"> & { goal: number }): CalcResult<GoalResult> {
  const { goal } = input;
  if (!isNum(goal) || goal <= 0) return fail("Introduce la meta que quieres alcanzar.", "goal");
  if (goal > MAX_AMOUNT) return fail("La meta es demasiado grande.", "goal");
  const base = { ...input, contribution: 0 };
  const v = validate(base, false);
  if (!v.ok) return v;
  const { T, G } = v.value;

  const fromInitial = input.initial * Math.pow(G, T);
  const k = contributionsUntil(T, input.contributionsPerYear, input.timing, T);
  const factor = annuityValueAt(T, k, input.contributionsPerYear, G, input.timing);
  const gap = goal - fromInitial;

  let required = 0;
  let alreadyReached = false;
  if (gap <= 0.005) {
    alreadyReached = true;
  } else {
    if (k === 0 || factor <= 0) return fail("El plazo es demasiado corto para realizar aportaciones con esa frecuencia.", "term");
    // Redondeo hacia arriba al céntimo para garantizar que se alcanza la meta
    required = Math.ceil((gap / factor) * 100 - 1e-6) / 100;
  }
  const projection = compoundInterest({ ...input, contribution: required, initial: input.initial });
  if (!projection.ok) {
    // Caso inicial 0 y aportación 0 (meta ya alcanzada sin nada) no ocurre: gap > 0 si initial = 0
    return projection;
  }
  return ok({ requiredContribution: required, alreadyReached, projection: projection.value });
}
