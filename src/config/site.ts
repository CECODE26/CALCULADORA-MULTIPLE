/**
 * Configuración central del portal.
 *
 * Marca, dominio, idioma, moneda, Analytics y AdSense se definen AQUÍ
 * (a partir de variables de entorno). Ningún otro archivo debe escribir
 * el nombre de la marca o el dominio de forma literal.
 *
 * Nota: Next.js solo incrusta variables NEXT_PUBLIC_* cuando se leen de
 * forma literal (process.env.NEXT_PUBLIC_X), por eso no se usa un bucle.
 */

function clean(value: string | undefined, fallback = ""): string {
  const v = (value ?? "").trim();
  return v.length > 0 ? v : fallback;
}

const SITE_NAME = clean(process.env.NEXT_PUBLIC_SITE_NAME, "Calcúlalo");
const SITE_URL = clean(process.env.NEXT_PUBLIC_SITE_URL, "http://localhost:3000").replace(/\/+$/, "");
const SITE_DESCRIPTION = clean(
  process.env.NEXT_PUBLIC_SITE_DESCRIPTION,
  "Calculadoras gratuitas de finanzas, negocios, trabajo y matemáticas. Rápidas, claras y con la fórmula explicada.",
);
const DEFAULT_LOCALE = clean(process.env.NEXT_PUBLIC_DEFAULT_LOCALE, "es-EC");
const DEFAULT_CURRENCY = clean(process.env.NEXT_PUBLIC_DEFAULT_CURRENCY, "USD").toUpperCase();
const CONTACT_EMAIL = clean(process.env.NEXT_PUBLIC_CONTACT_EMAIL);
const GA_ID = clean(process.env.NEXT_PUBLIC_GA_ID);
const ADSENSE_CLIENT_ID = clean(process.env.NEXT_PUBLIC_ADSENSE_CLIENT_ID);
const ADS_ENABLED = clean(process.env.NEXT_PUBLIC_ADS_ENABLED) === "true";
const REQUIRE_CONSENT = clean(process.env.NEXT_PUBLIC_REQUIRE_CONSENT, "true") !== "false";
const GOOGLE_SITE_VERIFICATION = clean(process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION);
const CONSENT_PROVIDER = clean(process.env.NEXT_PUBLIC_CONSENT_PROVIDER, "google") === "own" ? "own" : "google";

/** Validaciones de formato para no inyectar valores arbitrarios en scripts. */
const GA_ID_PATTERN = /^G-[A-Z0-9]{4,20}$/;
const ADSENSE_PATTERN = /^ca-pub-\d{10,20}$/;

export const siteConfig = {
  name: SITE_NAME,
  url: SITE_URL,
  description: SITE_DESCRIPTION,
  /** Idioma del documento (atributo lang) */
  language: "es",
  defaultLocale: DEFAULT_LOCALE,
  defaultCurrency: DEFAULT_CURRENCY,
  contactEmail: CONTACT_EMAIL,
  googleSiteVerification: GOOGLE_SITE_VERIFICATION,
  analytics: {
    gaId: GA_ID_PATTERN.test(GA_ID) ? GA_ID : "",
    requireConsent: REQUIRE_CONSENT,
  },
  consent: {
    /**
     * Quién pide el consentimiento:
     *  - "google": el mensaje de «Privacidad y mensajes» de AdSense (CMP certificada
     *    por Google, obligatoria en EEE, Reino Unido y Suiza). Solo aplica con los
     *    anuncios activos, porque ese mensaje llega con el script de AdSense.
     *  - "own": el aviso de cookies propio del portal.
     */
    provider: CONSENT_PROVIDER as "google" | "own",
    usesGoogleCmp: CONSENT_PROVIDER === "google" && ADS_ENABLED && ADSENSE_PATTERN.test(ADSENSE_CLIENT_ID),
  },
  ads: {
    clientId: ADSENSE_PATTERN.test(ADSENSE_CLIENT_ID) ? ADSENSE_CLIENT_ID : "",
    /** Solo se muestran anuncios si el interruptor está activo Y hay un ID válido. */
    enabled: ADS_ENABLED && ADSENSE_PATTERN.test(ADSENSE_CLIENT_ID),
    slots: {
      toolInContent: clean(process.env.NEXT_PUBLIC_AD_SLOT_TOOL_IN_CONTENT),
      toolBottom: clean(process.env.NEXT_PUBLIC_AD_SLOT_TOOL_BOTTOM),
      listing: clean(process.env.NEXT_PUBLIC_AD_SLOT_LISTING),
    },
  },
} as const;

export type AdPlacement = keyof typeof siteConfig.ads.slots;

/** Construye una URL absoluta a partir de una ruta interna. */
export function absoluteUrl(path = "/"): string {
  if (path === "/" || path === "") return `${siteConfig.url}/`;
  return `${siteConfig.url}${path.startsWith("/") ? path : `/${path}`}`;
}
