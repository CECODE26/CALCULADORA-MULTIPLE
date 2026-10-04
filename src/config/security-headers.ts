/**
 * Cabeceras de seguridad HTTP.
 *
 * La CSP permite los dominios de Google Analytics y AdSense. Se usa
 * 'unsafe-inline' en script-src porque Next.js inserta scripts en línea
 * para la hidratación de páginas estáticas (SSG); usar nonces obligaría a
 * renderizar todas las páginas de forma dinámica y perder caché.
 */
const GOOGLE_SCRIPT_HOSTS = [
  "https://www.googletagmanager.com",
  "https://pagead2.googlesyndication.com",
  "https://*.googlesyndication.com",
  "https://*.google.com",
  "https://*.gstatic.com",
  "https://*.doubleclick.net",
  "https://*.adtrafficquality.google",
];

const GOOGLE_CONNECT_HOSTS = [
  "https://*.google-analytics.com",
  "https://*.analytics.google.com",
  "https://www.googletagmanager.com",
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.adtrafficquality.google",
];

const GOOGLE_FRAME_HOSTS = [
  "https://*.googlesyndication.com",
  "https://*.doubleclick.net",
  "https://*.google.com",
  "https://*.adtrafficquality.google",
];

export function contentSecurityPolicy(isDev = process.env.NODE_ENV !== "production"): string {
  const directives: Record<string, string[]> = {
    "default-src": ["'self'"],
    "script-src": ["'self'", "'unsafe-inline'", ...(isDev ? ["'unsafe-eval'"] : []), ...GOOGLE_SCRIPT_HOSTS],
    "style-src": ["'self'", "'unsafe-inline'"],
    "img-src": ["'self'", "data:", "https:"],
    "font-src": ["'self'", "data:"],
    "connect-src": ["'self'", ...GOOGLE_CONNECT_HOSTS, ...(isDev ? ["ws:"] : [])],
    "frame-src": GOOGLE_FRAME_HOSTS,
    "object-src": ["'none'"],
    "base-uri": ["'self'"],
    "form-action": ["'self'"],
    "frame-ancestors": ["'none'"],
  };
  // Solo cuando el sitio se sirve por HTTPS (evita romper pruebas locales por HTTP).
  if (!isDev && (process.env.NEXT_PUBLIC_SITE_URL ?? "").startsWith("https://")) {
    directives["upgrade-insecure-requests"] = [];
  }
  return Object.entries(directives)
    .map(([k, v]) => (v.length ? `${k} ${v.join(" ")}` : k))
    .join("; ");
}

export function securityHeaders() {
  return [
    { key: "Content-Security-Policy", value: contentSecurityPolicy() },
    { key: "X-Content-Type-Options", value: "nosniff" },
    { key: "X-Frame-Options", value: "DENY" },
    { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
    {
      key: "Permissions-Policy",
      value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
    },
    { key: "Cross-Origin-Opener-Policy", value: "same-origin-allow-popups" },
  ];
}
