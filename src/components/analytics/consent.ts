"use client";

import { useSyncExternalStore } from "react";
import { siteConfig } from "@/config/site";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";

export type ConsentState = "granted" | "denied" | "unset";
const EVENT = "pref:consent-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): ConsentState {
  const v = readStorage(STORAGE_KEYS.consent);
  return v === "granted" || v === "denied" ? v : "unset";
}

export function useConsent(): ConsentState {
  // En el servidor se asume "unset": nada de terceros se renderiza en HTML estático.
  return useSyncExternalStore(subscribe, getSnapshot, () => "unset");
}

export function setConsent(state: ConsentState) {
  writeStorage(STORAGE_KEYS.consent, state);
  window.dispatchEvent(new Event(EVENT));
}

/** ¿Hay algún servicio de terceros configurado que requiera aviso? */
export const thirdPartiesConfigured = Boolean(siteConfig.analytics.gaId || siteConfig.ads.enabled);

/** ¿Muestra el portal su propio aviso de cookies? (no, si lo gestiona la CMP de Google) */
export const usesOwnBanner = thirdPartiesConfigured && siteConfig.analytics.requireConsent && !siteConfig.consent.usesGoogleCmp;

/**
 * ¿Se pueden cargar servicios de terceros con el consentimiento actual?
 * Con la CMP de Google se cargan siempre: el script de AdSense trae el mensaje
 * de consentimiento para EEE/UK/Suiza y el modo de consentimiento de Google
 * mantiene Analytics sin cookies allí hasta que el visitante acepta.
 */
export function canLoadThirdParties(consent: ConsentState): boolean {
  return siteConfig.consent.usesGoogleCmp || !siteConfig.analytics.requireConsent || consent === "granted";
}
