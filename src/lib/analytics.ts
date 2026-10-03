/**
 * Analítica (Google Analytics 4) con privacidad por diseño.
 *
 * Solo se envían parámetros de una lista blanca y con valores
 * categóricos (slug de herramienta, modo, posición…). NUNCA se envían
 * montos, tasas, metas, horarios ni ningún valor introducido por el
 * usuario. Los valores numéricos se descartan automáticamente salvo los
 * parámetros explícitamente permitidos como enteros pequeños.
 */
export type AnalyticsEvent =
  | "calculator_view"
  | "calculation_completed"
  | "related_tool_clicked"
  | "result_shared"
  | "search_used";

type ParamValue = string | number | boolean;

const STRING_PARAMS = new Set([
  "tool_slug",
  "tool_category",
  "mode",
  "from_tool",
  "to_tool",
  "placement",
  "method",
  "search_term",
  "selected_tool",
]);
const SMALL_INT_PARAMS = new Set(["position", "results_count"]);

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/** Limpia un término de búsqueda: sin dígitos (podrían ser montos), corto. */
export function sanitizeSearchTerm(term: string): string {
  return term
    .toLowerCase()
    .replace(/[0-9]/g, "")
    .replace(/[^\p{L}\s%-]/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 40);
}

export function sanitizeParams(params: Record<string, ParamValue | undefined>): Record<string, ParamValue> {
  const out: Record<string, ParamValue> = {};
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined) continue;
    if (STRING_PARAMS.has(key) && typeof value === "string") {
      const v = key === "search_term" ? sanitizeSearchTerm(value) : value.replace(/[^a-z0-9_-]/gi, "").slice(0, 60);
      if (v) out[key] = v;
    } else if (SMALL_INT_PARAMS.has(key) && typeof value === "number" && Number.isInteger(value) && value >= 0 && value < 100) {
      out[key] = value;
    }
  }
  return out;
}

export function track(event: AnalyticsEvent, params: Record<string, ParamValue | undefined> = {}): void {
  if (typeof window === "undefined" || typeof window.gtag !== "function") return;
  try {
    window.gtag("event", event, sanitizeParams(params));
  } catch {
    // La analítica nunca debe romper la experiencia.
  }
}
