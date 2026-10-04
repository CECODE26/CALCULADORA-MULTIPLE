import { round2 } from "@/lib/number";
import { fail, isNum, MAX_AMOUNT, ok, type CalcResult } from "./types";

export interface PricingInput {
  cost: number;
  shipping?: number;
  packaging?: number;
  other?: number;
  /** Comisión de la plataforma / medio de pago, % del precio */
  commissionPct?: number;
  /** Margen de ganancia deseado, % del precio sin impuesto */
  marginPct: number;
  /** Impuesto sobre la venta, % (lo define el usuario) */
  taxPct?: number;
  /** true si la plataforma cobra la comisión sobre el precio con impuesto */
  commissionOnFinalPrice?: boolean;
}

export interface PricingResult {
  realCost: number;
  priceBeforeTax: number;
  commission: number;
  profit: number;
  tax: number;
  finalPrice: number;
  /** Lo que recibes después de comisión (sin contar el impuesto que debes declarar) */
  netReceived: number;
  markupPct: number | null;
}

/**
 * Precio antes de impuesto P tal que:  P − comisión − costo real = margen × P
 *   comisión sobre P:          P = Costo / (1 − c − m)
 *   comisión sobre P·(1 + t):  P = Costo / (1 − c·(1 + t) − m)
 */
export function calculatePrice(input: PricingInput): CalcResult<PricingResult> {
  const parts: [number | undefined, string, string][] = [
    [input.cost, "cost", "el costo del producto"],
    [input.shipping, "shipping", "el transporte"],
    [input.packaging, "packaging", "el empaque"],
    [input.other, "other", "otros gastos"],
  ];
  let realCost = 0;
  for (const [v, field, name] of parts) {
    const value = v ?? 0;
    if (!isNum(value)) return fail(`Revisa ${name}.`, field);
    if (value < 0) return fail(`El valor de ${name} no puede ser negativo.`, field);
    if (value > MAX_AMOUNT) return fail(`El valor de ${name} es demasiado grande.`, field);
    realCost += value;
  }
  if (realCost <= 0) return fail("Introduce el costo del producto.", "cost");

  const c = (input.commissionPct ?? 0) / 100;
  const m = input.marginPct / 100;
  const t = (input.taxPct ?? 0) / 100;
  if (!isNum(c) || c < 0 || c >= 1) return fail("La comisión debe estar entre 0 y 99,99 %.", "commission");
  if (!isNum(m)) return fail("Introduce el margen deseado.", "margin");
  if (m < 0 || m >= 1) return fail("El margen debe estar entre 0 y 99,99 %.", "margin");
  if (!isNum(t) || t < 0 || t > 1) return fail("El impuesto debe estar entre 0 y 100 %.", "tax");

  const commissionBase = input.commissionOnFinalPrice ? 1 + t : 1;
  const denominator = 1 - c * commissionBase - m;
  if (denominator <= 0.0001) {
    return fail("La comisión y el margen juntos son demasiado altos: no existe un precio que los cubra. Reduce alguno de los dos.", "margin");
  }

  const price = realCost / denominator;
  const commission = c * price * commissionBase;
  const tax = t * price;
  return ok({
    realCost: round2(realCost),
    priceBeforeTax: round2(price),
    commission: round2(commission),
    profit: round2(m * price),
    tax: round2(tax),
    finalPrice: round2(price + tax),
    netReceived: round2(price - commission),
    markupPct: ((m * price) / realCost) * 100,
  });
}
