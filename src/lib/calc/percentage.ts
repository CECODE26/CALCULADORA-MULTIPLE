import { fail, isNum, ok, type CalcResult } from "./types";

export type PercentageMode =
  | "of"
  | "whatPercent"
  | "increase"
  | "decrease"
  | "change"
  | "originalBeforeIncrease"
  | "originalBeforeDecrease";

export interface PercentageResult {
  value: number;
  /** "percent" si el resultado es un porcentaje */
  unit: "number" | "percent";
}

const LIMIT = 1e15;

function need(v: number, field: string, label: string): CalcResult<true> {
  if (!isNum(v)) return fail(`Introduce ${label}.`, field);
  if (Math.abs(v) > LIMIT) return fail("El número es demasiado grande.", field);
  return ok(true);
}

/**
 * a y b según el modo:
 *  of:                     a % de b
 *  whatPercent:            a es qué % de b
 *  increase / decrease:    b aumentado / reducido en a %
 *  change:                 de a a b
 *  originalBefore…:        b es el valor final tras un cambio de a %
 */
export function percentage(mode: PercentageMode, a: number, b: number): CalcResult<PercentageResult> {
  const labels: Record<PercentageMode, [string, string]> = {
    of: ["el porcentaje", "el número"],
    whatPercent: ["el valor", "el total"],
    increase: ["el porcentaje", "el valor inicial"],
    decrease: ["el porcentaje", "el valor inicial"],
    change: ["el valor inicial", "el valor final"],
    originalBeforeIncrease: ["el porcentaje", "el valor final"],
    originalBeforeDecrease: ["el porcentaje", "el valor final"],
  };
  const [la, lb] = labels[mode];
  const ca = need(a, "a", la);
  if (!ca.ok) return ca;
  const cb = need(b, "b", lb);
  if (!cb.ok) return cb;

  let value: number;
  let unit: PercentageResult["unit"] = "number";
  switch (mode) {
    case "of":
      value = (a / 100) * b;
      break;
    case "whatPercent":
      if (b === 0) return fail("El total no puede ser 0: no se puede dividir entre cero.", "b");
      value = (a / b) * 100;
      unit = "percent";
      break;
    case "increase":
      value = b * (1 + a / 100);
      break;
    case "decrease":
      if (a > 100) return fail("Una reducción no puede superar el 100 %.", "a");
      if (a < 0) return fail("Para un aumento, usa el modo «Aumentar».", "a");
      value = b * (1 - a / 100);
      break;
    case "change":
      if (a === 0) return fail("El valor inicial no puede ser 0: el cambio porcentual desde cero no está definido.", "a");
      value = ((b - a) / Math.abs(a)) * 100;
      unit = "percent";
      break;
    case "originalBeforeIncrease":
      if (a <= -100) return fail("El porcentaje debe ser mayor que −100 %.", "a");
      value = b / (1 + a / 100);
      break;
    case "originalBeforeDecrease":
      if (a >= 100) return fail("Con un descuento del 100 % o más no se puede recuperar el valor original.", "a");
      if (a < 0) return fail("El descuento no puede ser negativo.", "a");
      value = b / (1 - a / 100);
      break;
  }
  if (!isNum(value)) return fail("No se pudo calcular con estos valores.");
  return ok({ value: Object.is(value, -0) ? 0 : value, unit });
}
