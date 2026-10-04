"use client";

import Script from "next/script";
import { useEffect } from "react";
import { initGtag } from "@/lib/analytics";
import { siteConfig } from "@/config/site";
import { canLoadThirdParties, useConsent } from "./consent";

/**
 * Carga Google Analytics 4 y AdSense solo si están configurados y,
 * cuando se exige consentimiento, solo después de aceptarlo.
 * Los IDs se validan con expresiones regulares en siteConfig.
 */
export function ThirdPartyScripts() {
  const consent = useConsent();
  const allowed = canLoadThirdParties(consent);
  const { gaId } = siteConfig.analytics;
  const { enabled: adsEnabled, clientId } = siteConfig.ads;

  useEffect(() => {
    if (allowed && gaId) initGtag(gaId);
  }, [allowed, gaId]);

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
