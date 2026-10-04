"use client";

import { siteConfig } from "@/config/site";
import { setConsent, thirdPartiesConfigured } from "./consent";

declare global {
  interface Window {
    googlefc?: { callbackQueue?: unknown[]; showRevocationMessage?: () => void };
  }
}

/**
 * Permite volver a mostrar el aviso para cambiar la decisión. Con la CMP de
 * Google abre su mensaje de revocación (solo aparece donde ese mensaje aplica,
 * como en EEE, Reino Unido y Suiza).
 */
function openPreferences() {
  if (!siteConfig.consent.usesGoogleCmp) {
    setConsent("unset");
    return;
  }
  const fc = (window.googlefc = window.googlefc || {});
  fc.callbackQueue = fc.callbackQueue || [];
  fc.callbackQueue.push(() => window.googlefc?.showRevocationMessage?.());
}

export function ConsentSettingsLink() {
  if (!thirdPartiesConfigured) return null;
  return (
    <button
      type="button"
      onClick={openPreferences}
      style={{ background: "none", border: 0, padding: 0, color: "inherit", cursor: "pointer", font: "inherit" }}
    >
      Preferencias de cookies
    </button>
  );
}
