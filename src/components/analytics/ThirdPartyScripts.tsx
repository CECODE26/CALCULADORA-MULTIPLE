"use client";

import Script from "next/script";
import { useEffect } from "react";
import { initGtag } from "@/lib/analytics";
import { siteConfig } from "@/config/site";
import { canLoadThirdParties, useConsent } from "./consent";

/**
 * Carga Google Analytics 4 y AdSense solo si están configurados y,
 * cuando se exige consentimiento con el aviso propio, solo después de
 * aceptarlo. Con la CMP de Google se cargan siempre y el consentimiento
 * lo gestionan el mensaje de Google y el modo de consentimiento.
 * Los IDs se validan con expresiones regulares en siteConfig.
 */
export function ThirdPartyScripts() {
  const consent = useConsent();
  const allowed = canLoadThirdParties(consent);
  const { gaId } = siteConfig.analytics;
  const { enabled: adsEnabled, clientId } = siteConfig.ads;
  const { usesGoogleCmp } = siteConfig.consent;

  useEffect(() => {
    if (allowed && gaId) initGtag(gaId, { consentMode: usesGoogleCmp });
  }, [allowed, gaId, usesGoogleCmp]);

  if (!allowed) return null;

  return (
    <>
      {gaId ? (
        <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
      ) : null}
      {adsEnabled ? (
        <Script
          id="adsense"
          src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
          strategy="lazyOnload"
          crossOrigin="anonymous"
        />
      ) : null}
    </>
  );
}
