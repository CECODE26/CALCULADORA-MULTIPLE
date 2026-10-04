import { round2 } from "@/lib/number";
import { effectiveAnnualRate, periodicRate, termToPeriods, type RateType, type TermUnit } from "./rates";
import { fail, isNum, MAX_AMOUNT, ok, type CalcResult } from "./types";

export type AmortizationSystem = "french" | "german";

export interface AmortizationInput {
  principal: number;
  ratePct: number;
  rateType: RateType;
  term: number;
  termUnit: TermUnit;
  /** Pagos por año: 52, 26, 24, 12, 6, 4, 2, 1 */
  periodsPerYear: number;
  system: AmortizationSystem;
}

export interface AmortizationRow {
  period: number;
  payment: number;
  principal: number;
  interest: number;
  balance: number;
}

export interface AmortizationResult {
  rows: AmortizationRow[];
  periods: number;
  periodicRate: number;
  effectiveAnnualRate: number;
  /** Cuota fija (francés) o primera cuota (alemán) */
  firstPayment: number;
  lastPayment: number;
  totalInterest: number;
  totalPaid: number;
  principal: number;
}

export const MAX_PERIODS = 6000;
export const FREQUENCIES = [52, 26, 24, 12, 6, 4, 2, 1] as const;

/** Cuota fija del sistema francés (sin redondear). */
export function frenchPayment(principal: number, r: number, n: number): number {
  if (n <= 0) return 0;
  if (r === 0) return principal / n;
  return (principal * r) / (1 - Math.pow(1 + r, -n));
}

export function validateLoanBasics(principal: number, ratePct: number, term: number): CalcResult<true> {
  if (!isNum(principal)) return fail("Introduce el monto del préstamo.", "principal");
  if (principal <= 0) return fail("El monto debe ser mayor que cero.", "principal");
  if (principal > MAX_AMOUNT) return fail("El monto es demasiado grande.", "principal");
  if (!isNum(ratePct)) return fail("Introduce la tasa de interés (puede ser 0).", "rate");
  if (ratePct < 0) return fail("La tasa no puede ser negativa.", "rate");
  if (ratePct > 1000) return fail("La tasa parece demasiado alta. Revisa si es anual o mensual.", "rate");
  if (!isNum(term)) return fail("Introduce el plazo.", "term");
  if (term <= 0) return fail("El plazo debe ser mayor que cero.", "term");
  return ok(true);
}

/**
 * Tabla de amortización con control de redondeo: cada importe se redondea
 * a céntimos y la última cuota absorbe la diferencia para que el saldo
 * final sea exactamente 0.
 */
export function amortize(input: AmortizationInput): CalcResult<AmortizationResult> {
  const { principal, ratePct, rateType, term, termUnit, periodsPerYear, system } = input;
  const basic = validateLoanBasics(principal, ratePct, term);
  if (!basic.ok) return basic;
  if (!FREQUENCIES.includes(periodsPerYear as (typeof FREQUENCIES)[number])) {
    return fail("Frecuencia de pago no válida.", "frequency");
  }
  const n = termToPeriods(term, termUnit, periodsPerYear);
  if (n === null || n < 1) {
    return fail(
      "El plazo no corresponde a un número entero de pagos con esa frecuencia. Ajusta el plazo o la frecuencia.",
      "term",
    );
  }
  if (n > MAX_PERIODS) return fail("El plazo es demasiado largo.", "term");

  const r = periodicRate(ratePct, rateType, periodsPerYear);
  if (!isNum(r) || r < 0) return fail("La tasa no es válida.", "rate");

  const rows: AmortizationRow[] = [];
  let balance = round2(principal);
  const fixedPayment = round2(frenchPayment(balance, r, n));
  const fixedPrincipal = round2(balance / n);
  let totalInterest = 0;
  let totalPaid = 0;

  for (let k = 1; k <= n; k++) {
    const interest = round2(balance * r);
    let principalPart = system === "french" ? round2(fixedPayment - interest) : fixedPrincipal;
    if (k === n || principalPart > balance) principalPart = balance;
    if (principalPart < 0) principalPart = 0;
    const payment = round2(principalPart + interest);
    balance = round2(balance - principalPart);
    totalInterest += interest;
    totalPaid += payment;
    rows.push({ period: k, payment, principal: principalPart, interest, balance });
  }

  const first = rows[0]!;
  const last = rows[rows.length - 1]!;
  if (!isNum(totalPaid) || !isNum(first.payment)) return fail("No se pudo calcular con estos valores.");

  return ok({
    rows,
    periods: n,
    periodicRate: r,
    effectiveAnnualRate: effectiveAnnualRate(r, periodsPerYear),
    firstPayment: first.payment,
    lastPayment: last.payment,
    totalInterest: round2(totalInterest),
    totalPaid: round2(totalPaid),
    principal: round2(principal),
  });
}

export interface YearSummary {
  year: number;
  paid: number;
  principal: number;
  interest: number;
  balance: number;
}

/** Agrupa una tabla por años (para resúmenes y gráficos). */
export function summarizeByYear(rows: AmortizationRow[], periodsPerYear: number): YearSummary[] {
  const out: YearSummary[] = [];
  for (const row of rows) {
    const year = Math.ceil(row.period / periodsPerYear);
    let s = out[year - 1];
    if (!s) {
      s = { year, paid: 0, principal: 0, interest: 0, balance: 0 };
      out.push(s);
    }
    s.paid = round2(s.paid + row.payment);
    s.principal = round2(s.principal + row.principal);
    s.interest = round2(s.interest + row.interest);
    s.balance = row.balance;
  }
  return out;
}
