import { isFiniteNumber } from "./number";

/**
 * Formateadores de presentación. Si el valor no es finito, devuelven "—"
 * para que jamás se muestre NaN, Infinity, undefined o null.
 */
export const EMPTY = "—";

const cache = new Map<string, Intl.NumberFormat>();
function nf(locale: string, options: Intl.NumberFormatOptions): Intl.NumberFormat {
  const key = `${locale}|${JSON.stringify(options)}`;
  let f = cache.get(key);
  if (!f) {
    try {
      f = new Intl.NumberFormat(locale, options);
    } catch {
      f = new Intl.NumberFormat("es", options);
    }
    cache.set(key, f);
  }
  return f;
}

export interface FormatContext {
  locale: string;
  currency: string;
}

export function formatCurrency(value: unknown, ctx: FormatContext, decimals = 2): string {
  if (!isFiniteNumber(value)) return EMPTY;
  return nf(ctx.locale, {
    style: "currency",
    currency: ctx.currency,
    currencyDisplay: "narrowSymbol",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(normalizeZero(value));
}

export function formatNumber(value: unknown, locale: string, maxDecimals = 2, minDecimals = 0): string {
  if (!isFiniteNumber(value)) return EMPTY;
  return nf(locale, { minimumFractionDigits: minDecimals, maximumFractionDigits: maxDecimals }).format(
    normalizeZero(value),
  );
}

/** Formatea una proporción (0.25) o un porcentaje (25) según `isRatio`. */
export function formatPercent(value: unknown, locale: string, maxDecimals = 2, isRatio = false): string {
  if (!isFiniteNumber(value)) return EMPTY;
  const pct = isRatio ? value * 100 : value;
  return `${nf(locale, { maximumFractionDigits: maxDecimals }).format(normalizeZero(pct))}\u00a0%`;
}

function normalizeZero(v: number): number {
  // Evita "-0,00" por redondeos de valores muy cercanos a cero.
  return Math.abs(v) < 0.005 ? 0 : v;
}

/** Separador de miles del locale (para interpretar entradas). */
export function groupSeparatorFor(locale: string): "," | "." {
  try {
    const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5);
    const decimal = parts.find((p) => p.type === "decimal")?.value;
    return decimal === "," ? "." : ",";
  } catch {
    return ",";
  }
}

/** Minutos totales → "7 h 30 min" */
export function formatDuration(totalMinutes: unknown): string {
  if (!isFiniteNumber(totalMinutes)) return EMPTY;
  const sign = totalMinutes < 0 ? "-" : "";
  const abs = Math.round(Math.abs(totalMinutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${sign}${h} h ${String(m).padStart(2, "0")} min`;
}

/** Minutos totales → "07:30" */
export function formatHHMM(totalMinutes: unknown): string {
  if (!isFiniteNumber(totalMinutes)) return EMPTY;
  const abs = Math.round(Math.abs(totalMinutes));
  const h = Math.floor(abs / 60);
  const m = abs % 60;
  return `${totalMinutes < 0 ? "-" : ""}${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`;
}
