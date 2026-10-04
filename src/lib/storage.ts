/**
 * Acceso seguro a localStorage. Solo guardamos preferencias no personales
 * (moneda elegida, herramientas visitadas, consentimiento). Nunca valores
 * introducidos en las calculadoras.
 */
export function readStorage(key: string): string | null {
  try {
    return typeof window === "undefined" ? null : window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writeStorage(key: string, value: string): void {
  try {
    window.localStorage.setItem(key, value);
  } catch {
    // modo privado o almacenamiento bloqueado
  }
}

export const STORAGE_KEYS = {
  currency: "pref:currency",
  recent: "pref:recent-tools",
  consent: "pref:consent",
} as const;

const RECENT_LIMIT = 6;

export function readRecentTools(): string[] {
  const raw = readStorage(STORAGE_KEYS.recent);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string" && /^[a-z0-9-]{1,60}$/.test(s)) : [];
  } catch {
    return [];
  }
}

export function pushRecentTool(slug: string): void {
  const list = [slug, ...readRecentTools().filter((s) => s !== slug)].slice(0, RECENT_LIMIT);
  writeStorage(STORAGE_KEYS.recent, JSON.stringify(list));
}
