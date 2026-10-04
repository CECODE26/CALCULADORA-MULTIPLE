import { amortize, summarizeByYear, type YearSummary } from "./amortization";
import type { RateType, TermUnit } from "./rates";
import { fail, ok, type CalcResult } from "./types";

export interface LoanInput {
  principal: number;
  ratePct: number;
  rateType: RateType;
  term: number;
  termUnit: TermUnit;
}

export interface LoanResult {
  payment: number;
  /** Última cuota (puede diferir unos céntimos por el ajuste de redondeo) */
  lastPayment: number;
  months: number;
  principal: number;
  totalInterest: number;
  totalPaid: number;
  monthlyRate: number;
  effectiveAnnualRate: number;
  /** Porcentaje de intereses sobre el capital */
  interestRatio: number;
  years: YearSummary[];
}

/** Préstamo con cuota mensual fija (sistema francés). */
export function calculateLoan(input: LoanInput): CalcResult<LoanResult> {
  const res = amortize({ ...input, periodsPerYear: 12, system: "french" });
  if (!res.ok) {
    // Solo se adapta el mensaje de "plazo no entero"; el resto de errores se mantienen
    if (res.field === "term" && res.error.startsWith("El plazo no corresponde")) return fail("El plazo debe ser un número entero de meses (por ejemplo 18 meses o 1,5 años).", "term");
    return res;
  }
  const v = res.value;
  return ok({
    payment: v.firstPayment,
    lastPayment: v.lastPayment,
    months: v.periods,
    principal: v.principal,
    totalInterest: v.totalInterest,
    totalPaid: v.totalPaid,
    monthlyRate: v.periodicRate,
    effectiveAnnualRate: v.effectiveAnnualRate,
    interestRatio: v.principal > 0 ? v.totalInterest / v.principal : 0,
    years: summarizeByYear(v.rows, 12),
  });
}
