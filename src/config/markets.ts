/**
 * Mercados (países) preparados para internacionalización futura.
 *
 * Política: NO se crean versiones regionales de una herramienta salvo que
 * exista una diferencia real (normativa, impuestos, moneda, fórmulas,
 * terminología o intención de búsqueda). Mientras `active` sea false, el
 * mercado no genera rutas ni etiquetas hreflang.
 *
 * Cuando se active un mercado, las rutas serán /{code}/{slug}
 * (p. ej. /mx/calculadora-iva) y la herramienta declarará en el registro
 * qué mercados tienen versión propia (campo `regional`).
 */
export type MarketCode = "ec" | "mx" | "co" | "pe" | "es" | "us";

export interface Market {
  code: MarketCode;
  name: string;
  /** Etiqueta hreflang */
  hreflang: string;
  /** Locale para formato numérico */
  locale: string;
  currency: string;
  active: boolean;
}

export const markets: readonly Market[] = [
  { code: "ec", name: "Ecuador", hreflang: "es-EC", locale: "es-EC", currency: "USD", active: false },
  { code: "mx", name: "México", hreflang: "es-MX", locale: "es-MX", currency: "MXN", active: false },
  { code: "co", name: "Colombia", hreflang: "es-CO", locale: "es-CO", currency: "COP", active: false },
  { code: "pe", name: "Perú", hreflang: "es-PE", locale: "es-PE", currency: "PEN", active: false },
  { code: "es", name: "España", hreflang: "es-ES", locale: "es-ES", currency: "EUR", active: false },
  { code: "us", name: "Estados Unidos", hreflang: "es-US", locale: "es-US", currency: "USD", active: false },
];

export function activeMarkets(): Market[] {
  return markets.filter((m) => m.active);
}
