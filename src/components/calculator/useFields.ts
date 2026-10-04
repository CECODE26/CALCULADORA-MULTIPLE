"use client";

import { useCallback, useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";

/**
 * Estado de formulario como texto (lo que escribe el usuario) + valores
 * numéricos interpretados según el locale. Un campo vacío o inválido se
 * interpreta como NaN, y las funciones de cálculo lo rechazan con un
 * mensaje claro.
 */
export function useFields<K extends string>(initial: Record<K, string>) {
  const [values, setValues] = useState(initial);
  const { parse } = usePrefs();

  const set = useCallback((key: K) => (v: string) => setValues((prev) => ({ ...prev, [key]: v })), []);
  const reset = useCallback(() => setValues(initial), [initial]);

  const nums = useMemo(() => {
    const out = {} as Record<K, number>;
    for (const k of Object.keys(values) as K[]) out[k] = parse(values[k]) ?? Number.NaN;
    return out;
  }, [values, parse]);

  /** Firma estable de los valores (solo para detectar cambios; nunca se envía). */
  const signature = useMemo(() => JSON.stringify(values), [values]);

  return { values, set, reset, nums, signature, setValues };
}

/** Devuelve el error de un campo concreto a partir del resultado del cálculo. */
export function fieldError(res: { ok: boolean; field?: string; error?: string }, field: string): string | null {
  return !res.ok && res.field === field ? (res.error ?? null) : null;
}

/** Error general (no asociado a un campo visible). */
export function generalError(res: { ok: boolean; field?: string; error?: string }, fields: string[]): string | null {
  return !res.ok && (!res.field || !fields.includes(res.field)) ? (res.error ?? null) : null;
}
