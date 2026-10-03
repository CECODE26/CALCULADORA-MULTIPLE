/** Utilidades de escala para gráficos SVG sin dependencias. */
export function niceMax(value: number): number {
  if (!Number.isFinite(value) || value <= 0) return 1;
  const exp = Math.floor(Math.log10(value));
  const base = 10 ** exp;
  const f = value / base;
  const nice = f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10;
  return nice * base;
}

export function niceMin(value: number): number {
  if (!Number.isFinite(value) || value >= 0) return 0;
  return -niceMax(-value);
}

export function ticks(min: number, max: number, count = 4): number[] {
  const step = (max - min) / count;
  return Array.from({ length: count + 1 }, (_, i) => min + step * i);
}

/** Formato corto para ejes: 1.2 k, 3.4 M */
export function compact(value: number, locale: string): string {
  if (!Number.isFinite(value)) return "";
  try {
    return new Intl.NumberFormat(locale, { notation: "compact", maximumFractionDigits: 1 }).format(value);
  } catch {
    return String(Math.round(value));
  }
}
