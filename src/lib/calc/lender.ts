import { amortize, type AmortizationResult, type AmortizationSystem } from "./amortization";
import { effectiveAnnualRate } from "./rates";
import { fail, isNum, type CalcResult } from "./types";
import { lenders, type Lender, type LoanCategory, type LoanProduct } from "@/data/tasas-ecuador";

/** Tasa efectiva anual equivalente a una nominal anual con pagos mensuales (como la publica el BCE). */
export function nominalToEffective(nominalPct: number): number {
  return effectiveAnnualRate(nominalPct / 100 / 12, 12) * 100;
}

/** Tasa nominal anual (pagos mensuales) equivalente a una efectiva anual. */
export function effectiveToNominal(effectivePct: number): number {
  return (Math.pow(1 + effectivePct / 100, 1 / 12) - 1) * 12 * 100;
}

export function findLender(id: string, list: readonly Lender[] = lenders): Lender | undefined {
  return list.find((l) => l.id === id);
}

export interface LenderLoanInput {
  product: LoanProduct;
  principal: number;
  months: number;
  system: AmortizationSystem;
}

/**
 * Simula un crédito con la tasa nominal publicada por la entidad
 * (cuotas mensuales). Valida que el plazo sea un número entero de meses y,
 * si la entidad publica límites de plazo o monto, que se respeten.
 */
export function simulateLenderLoan({ product, principal, months, system }: LenderLoanInput): CalcResult<AmortizationResult> {
  if (isNum(months) && months > 0 && !Number.isInteger(months)) {
    return fail("El plazo debe ser un número entero de meses.", "term");
  }
  if (isNum(principal) && principal > 0) {
    if (product.minAmount !== undefined && principal < product.minAmount) {
      return fail(`El monto mínimo de este producto es ${product.minAmount.toLocaleString("es-EC")} USD.`, "principal");
    }
    if (product.maxAmount !== undefined && principal > product.maxAmount) {
      return fail(`El monto máximo de este producto es ${product.maxAmount.toLocaleString("es-EC")} USD.`, "principal");
    }
  }
  if (isNum(months) && months > 0) {
    if (months < product.minMonths) return fail(`El plazo mínimo de este producto es ${product.minMonths} meses.`, "term");
    if (months > product.maxMonths) return fail(`El plazo máximo de este producto es ${product.maxMonths} meses.`, "term");
  }
  return amortize({
    principal,
    ratePct: product.nominalRate,
    rateType: "nominal-annual",
    term: months,
    termUnit: "months",
    periodsPerYear: 12,
    system,
  });
}

export interface LenderComparisonRow {
  lender: Lender;
  product: LoanProduct;
  firstPayment: number;
  totalInterest: number;
  totalPaid: number;
}

/**
 * Compara el mismo crédito (monto, plazo y sistema) en todas las entidades
 * que tienen un producto de la categoría indicada. Solo se incluyen los
 * productos cuyo plazo y monto admiten la simulación. Orden: menor costo total.
 */
export function compareLenders(
  category: LoanCategory,
  principal: number,
  months: number,
  system: AmortizationSystem,
  list: readonly Lender[] = lenders,
): LenderComparisonRow[] {
  const rows: LenderComparisonRow[] = [];
  for (const lender of list) {
    for (const product of lender.products) {
      if (product.category !== category) continue;
      const res = simulateLenderLoan({ product, principal, months, system });
      if (!res.ok) continue;
      rows.push({
        lender,
        product,
        firstPayment: res.value.firstPayment,
        totalInterest: res.value.totalInterest,
        totalPaid: res.value.totalPaid,
      });
    }
  }
  return rows.sort((a, b) => a.totalPaid - b.totalPaid || a.lender.name.localeCompare(b.lender.name, "es"));
}
