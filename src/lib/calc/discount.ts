import { round2 } from "@/lib/number";
import { fail, isNum, MAX_AMOUNT, ok, type CalcResult } from "./types";

export interface DiscountResult {
  price: number;
  savings: number;
  finalPrice: number;
  /** Descuento efectivo total en % */
  effectivePct: number;
}

function checkPrice(price: number, field = "price"): CalcResult<true> {
  if (!isNum(price)) return fail("Introduce el precio.", field);
  if (price < 0) return fail("El precio no puede ser negativo.", field);
  if (price > MAX_AMOUNT) return fail("El precio es demasiado grande.", field);
  return ok(true);
}

function checkPct(p: number, field: string): CalcResult<true> {
  if (!isNum(p)) return fail("Introduce el porcentaje de descuento.", field);
  if (p < 0) return fail("El descuento no puede ser negativo.", field);
  if (p > 100) return fail("El descuento no puede superar el 100 %.", field);
  return ok(true);
}

export function simpleDiscount(price: number, pct: number): CalcResult<DiscountResult> {
  const c = checkPrice(price);
  if (!c.ok) return c;
  const d = checkPct(pct, "pct");
  if (!d.ok) return d;
  const savings = round2((price * pct) / 100);
  return ok({ price: round2(price), savings, finalPrice: round2(price - savings), effectivePct: pct });
}

export interface SuccessiveResult extends DiscountResult {
  /** Suma ingenua de los porcentajes (lo que mucha gente supone) */
  naiveSumPct: number;
  steps: { pct: number; priceAfter: number }[];
}

/** Descuentos sucesivos: Final = P × Π(1 − dᵢ);  efectivo = 1 − Π(1 − dᵢ) */
export function successiveDiscounts(price: number, pcts: number[]): CalcResult<SuccessiveResult> {
  const c = checkPrice(price);
  if (!c.ok) return c;
  if (pcts.length === 0) return fail("Añade al menos un descuento.", "d0");
  let factor = 1;
  let current = price;
  const steps: SuccessiveResult["steps"] = [];
  for (let i = 0; i < pcts.length; i++) {
    const p = pcts[i]!;
    const d = checkPct(p, `d${i}`);
    if (!d.ok) return d;
    factor *= 1 - p / 100;
    current = price * factor;
    steps.push({ pct: p, priceAfter: round2(current) });
  }
  const finalPrice = round2(price * factor);
  return ok({
    price: round2(price),
    savings: round2(price - finalPrice),
    finalPrice,
    effectivePct: (1 - factor) * 100,
    naiveSumPct: pcts.reduce((a, b) => a + b, 0),
    steps,
  });
}

/** Descuento real entre precio original y final. */
export function inverseDiscount(original: number, final: number): CalcResult<DiscountResult> {
  const c = checkPrice(original, "original");
  if (!c.ok) return c;
  if (original === 0) return fail("El precio original debe ser mayor que cero.", "original");
  const f = checkPrice(final, "final");
  if (!f.ok) return f;
  if (final > original) return fail("El precio final es mayor que el original: no hay descuento, sino un aumento.", "final");
  return ok({
    price: round2(original),
    savings: round2(original - final),
    finalPrice: round2(final),
    effectivePct: ((original - final) / original) * 100,
  });
}
