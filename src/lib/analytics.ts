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

/**
 * Eventos ocurridos antes de que GA esté inicializado (p. ej. la vista de
 * la primera página). Solo se envían si GA llega a cargarse, es decir,
 * con consentimiento; si no, se descartan con la página.
 */
const pending: [AnalyticsEvent, Record<string, ParamValue>][] = [];
const MAX_PENDING = 20;

export function track(event: AnalyticsEvent, params: Record<string, ParamValue | undefined> = {}): void {
  if (typeof window === "undefined") return;
  const clean = sanitizeParams(params);
  if (typeof window.gtag !== "function") {
    if (pending.length < MAX_PENDING) pending.push([event, clean]);
    return;
  }
  try {
    window.gtag("event", event, clean);
  } catch {
    // La analítica nunca debe romper la experiencia.
  }
}

/** Inicializa gtag (tras el consentimiento) y envía los eventos en cola. */
export function initGtag(gaId: string): void {
  if (typeof window === "undefined" || typeof window.gtag === "function") return;
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    // gtag.js exige el objeto `arguments` original
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer!.push(arguments);
  };
  window.gtag("js", new Date());
  window.gtag("config", gaId, { allow_google_signals: false, allow_ad_personalization_signals: false });
  for (const [event, params] of pending.splice(0)) window.gtag("event", event, params);
}
