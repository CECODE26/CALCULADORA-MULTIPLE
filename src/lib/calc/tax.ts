import { round2 } from "@/lib/number";
import { fail, isNum, MAX_AMOUNT, ok, type CalcResult } from "./types";

export type TaxMode = "add" | "remove" | "included";

export interface TaxResult {
  base: number;
  tax: number;
  total: number;
  /** Peso del impuesto dentro del precio final (%) */
  shareOfTotalPct: number;
}

/**
 * add:      Total = Base × (1 + t)
 * remove:   Base = Total / (1 + t)
 * included: Impuesto incluido = Total − Total / (1 + t) = Total × t / (1 + t)
 */
export function calculateTax(mode: TaxMode, amount: number, ratePct: number): CalcResult<TaxResult> {
  if (!isNum(amount)) return fail(mode === "add" ? "Introduce el importe sin impuesto." : "Introduce el importe con impuesto.", "amount");
  if (amount < 0) return fail("El importe no puede ser negativo.", "amount");
  if (amount > MAX_AMOUNT) return fail("El importe es demasiado grande.", "amount");
  if (!isNum(ratePct)) return fail("Introduce la tasa del impuesto.", "rate");
  if (ratePct < 0) return fail("La tasa no puede ser negativa.", "rate");
  if (ratePct > 100) return fail("La tasa no puede superar el 100 %.", "rate");
  const t = ratePct / 100;

  if (mode === "add") {
    const tax = round2(amount * t);
    const base = round2(amount);
    const total = round2(base + tax);
    return ok({ base, tax, total, shareOfTotalPct: total > 0 ? (tax / total) * 100 : 0 });
  }
  const total = round2(amount);
  const base = round2(total / (1 + t));
  const tax = round2(total - base);
  return ok({ base, tax, total, shareOfTotalPct: (t / (1 + t)) * 100 });
}
