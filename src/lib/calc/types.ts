/** Resultado de un cálculo: o bien un valor válido, o un error comprensible. */
export type CalcResult<T> = { ok: true; value: T } | { ok: false; error: string; field?: string };

export const ok = <T>(value: T): CalcResult<T> => ({ ok: true, value });
export const fail = <T = never>(error: string, field?: string): CalcResult<T> => ({ ok: false, error, field });

/** Límite superior razonable para importes (evita desbordes y valores absurdos). */
export const MAX_AMOUNT = 1e12;

export function isNum(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}
