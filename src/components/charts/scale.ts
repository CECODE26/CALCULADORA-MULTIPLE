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

/** Formato corto para ejes: 1,2 k · 3,4 M (consistente en todos los locales). */
export function compact(value: number, locale: string): string {
  if (!Number.isFinite(value)) return "";
  const abs = Math.abs(value);
  const fmt = (v: number) => new Intl.NumberFormat(locale, { maximumFractionDigits: 1 }).format(v);
  if (abs >= 1e9) return `${fmt(value / 1e9)} mil M`;
  if (abs >= 1e6) return `${fmt(value / 1e6)} M`;
  if (abs >= 1e3) return `${fmt(value / 1e3)} k`;
  return fmt(value);
}
