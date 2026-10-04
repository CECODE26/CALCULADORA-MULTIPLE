/**
 * Conversión de tasas de interés a tasa por periodo.
 *
 * - Nominal anual (TNA, "anual capitalizable"): i_p = i / m
 * - Efectiva anual (TEA / EA): i_p = (1 + i)^(1/m) − 1
 * - Mensual efectiva: i_p = (1 + i_mes)^(12/m) − 1  (con m = 12 → i_mes)
 *
 * m = número de periodos de pago por año.
 */
export type RateType = "nominal-annual" | "effective-annual" | "monthly";

export const RATE_TYPE_LABELS: Record<RateType, string> = {
  "nominal-annual": "Anual nominal",
  "effective-annual": "Anual efectiva",
  monthly: "Mensual",
};

export function periodicRate(ratePct: number, type: RateType, periodsPerYear: number): number {
  const i = ratePct / 100;
  switch (type) {
    case "nominal-annual":
      return i / periodsPerYear;
    case "effective-annual":
      return Math.pow(1 + i, 1 / periodsPerYear) - 1;
    case "monthly":
      return periodsPerYear === 12 ? i : Math.pow(1 + i, 12 / periodsPerYear) - 1;
  }
}

/** Tasa efectiva anual equivalente (para mostrar al usuario). */
export function effectiveAnnualRate(periodic: number, periodsPerYear: number): number {
  return Math.pow(1 + periodic, periodsPerYear) - 1;
}

export type TermUnit = "months" | "years";

/** Convierte un plazo en número de periodos de pago. Devuelve null si no es entero. */
export function termToPeriods(term: number, unit: TermUnit, periodsPerYear: number): number | null {
  const n = unit === "years" ? term * periodsPerYear : (term * periodsPerYear) / 12;
  const rounded = Math.round(n);
  return Math.abs(n - rounded) < 1e-9 ? rounded : null;
}
