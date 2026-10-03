/**
 * Utilidades numéricas seguras. Ningún resultado mostrado al usuario debe
 * ser NaN, Infinity, undefined o null.
 */

export function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

/** Redondeo a n decimales evitando errores binarios típicos (1.005 → 1.01). */
export function round(value: number, decimals = 2): number {
  if (!Number.isFinite(value)) return 0;
  const factor = 10 ** decimals;
  const r = Math.round((value + Number.EPSILON * Math.sign(value)) * factor) / factor;
  return Object.is(r, -0) ? 0 : r;
}

export const round2 = (v: number) => round(v, 2);

/** Garantiza un número finito; si no lo es devuelve el valor alternativo. */
export function safe(value: number, fallback = 0): number {
  return Number.isFinite(value) ? value : fallback;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

/**
 * Interpreta un número escrito por una persona. Acepta coma o punto como
 * separador decimal y separadores de miles. Devuelve null si no es válido.
 *
 * Reglas:
 *  - Si aparecen "," y ".", el último que aparece es el separador decimal.
 *  - Si aparece solo uno de ellos varias veces, son separadores de miles.
 *  - Si aparece solo uno, una vez: es decimal, salvo que sea el separador
 *    de miles del locale y vaya seguido de exactamente 3 dígitos.
 */
export function parseLocaleNumber(input: string, groupSeparator: "," | "." = ","): number | null {
  if (typeof input !== "string") return null;
  let s = input.trim().replace(/[\s  $€%]/g, "").replace(/^\+/, "");
  if (s === "" || s === "-") return null;
  if (!/^-?[\d.,]+$/.test(s)) return null;

  const negative = s.startsWith("-");
  if (negative) s = s.slice(1);

  const lastComma = s.lastIndexOf(",");
  const lastDot = s.lastIndexOf(".");
  let normalized: string;

  if (lastComma !== -1 && lastDot !== -1) {
    const decimalSep = lastComma > lastDot ? "," : ".";
    const groupSep = decimalSep === "," ? "." : ",";
    const [intPart, ...rest] = s.split(decimalSep);
    if (rest.length !== 1) return null;
    normalized = `${intPart!.split(groupSep).join("")}.${rest[0]}`;
    if (rest[0]!.includes(groupSep)) return null;
  } else if (lastComma !== -1 || lastDot !== -1) {
    const sep = lastComma !== -1 ? "," : ".";
    const parts = s.split(sep);
    if (parts.length > 2) {
      // Varias apariciones → miles. Cada grupo después del primero debe tener 3 dígitos.
      if (parts.slice(1).some((p) => p.length !== 3)) return null;
      normalized = parts.join("");
    } else {
      const decimals = parts[1] ?? "";
      if (sep === groupSeparator && decimals.length === 3 && parts[0] !== "" && parts[0] !== "0") {
        normalized = parts.join("");
      } else {
        normalized = `${parts[0] || "0"}.${decimals}`;
      }
    }
  } else {
    normalized = s;
  }

  if (normalized.endsWith(".")) normalized = normalized.slice(0, -1);
  if (!/^\d+(\.\d+)?$/.test(normalized)) return null;
  const n = Number(normalized);
  if (!Number.isFinite(n)) return null;
  return negative ? -n : n;
}
