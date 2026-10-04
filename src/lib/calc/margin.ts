import { round2 } from "@/lib/number";
import { fail, isNum, MAX_AMOUNT, ok, type CalcResult } from "./types";

/**
 * Margen = Ganancia / Precio de venta
 * Markup = Ganancia / Costo
 */
export interface MarginResult {
  cost: number;
  price: number;
  profit: number;
  marginPct: number | null;
  markupPct: number | null;
}

function checkCost(cost: number, allowZero: boolean): CalcResult<true> {
  if (!isNum(cost)) return fail("Introduce el costo.", "cost");
  if (cost < 0) return fail("El costo no puede ser negativo.", "cost");
  if (!allowZero && cost === 0) return fail("El costo debe ser mayor que cero.", "cost");
  if (cost > MAX_AMOUNT) return fail("El costo es demasiado grande.", "cost");
  return ok(true);
}

function build(cost: number, price: number): MarginResult {
  const profit = price - cost;
  return {
    cost: round2(cost),
    price: round2(price),
    profit: round2(profit),
    marginPct: price > 0 ? (profit / price) * 100 : null,
    markupPct: cost > 0 ? (profit / cost) * 100 : null,
  };
}

/** Modo 1: costo + precio → ganancia, margen y markup. */
export function marginFromPrice(cost: number, price: number): CalcResult<MarginResult> {
  const c = checkCost(cost, true);
  if (!c.ok) return c;
  if (!isNum(price)) return fail("Introduce el precio de venta.", "price");
  if (price <= 0) return fail("El precio de venta debe ser mayor que cero.", "price");
  if (price > MAX_AMOUNT) return fail("El precio es demasiado grande.", "price");
  return ok(build(cost, price));
}

/** Modo 2: costo + margen deseado → precio necesario. P = C / (1 − m) */
export function priceFromMargin(cost: number, marginPct: number): CalcResult<MarginResult> {
  const c = checkCost(cost, false);
  if (!c.ok) return c;
  if (!isNum(marginPct)) return fail("Introduce el margen deseado.", "margin");
  if (marginPct < 0) return fail("El margen no puede ser negativo.", "margin");
  if (marginPct >= 100) return fail("El margen debe ser menor que 100 %: el margen se calcula sobre el precio de venta.", "margin");
  return ok(build(cost, cost / (1 - marginPct / 100)));
}

/** Modo 3: costo + markup → precio. P = C × (1 + k) */
export function priceFromMarkup(cost: number, markupPct: number): CalcResult<MarginResult> {
  const c = checkCost(cost, false);
  if (!c.ok) return c;
  if (!isNum(markupPct)) return fail("Introduce el markup.", "markup");
  if (markupPct < 0) return fail("El markup no puede ser negativo.", "markup");
  if (markupPct > 100000) return fail("El markup es demasiado alto.", "markup");
  return ok(build(cost, cost * (1 + markupPct / 100)));
}

/** Conversiones útiles: margen ↔ markup (en %). */
export const marginToMarkup = (m: number) => (m >= 100 ? null : (m / (100 - m)) * 100);
export const markupToMargin = (k: number) => (k <= -100 ? null : (k / (100 + k)) * 100);
