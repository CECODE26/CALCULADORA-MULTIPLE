"use client";

import Script from "next/script";
import { siteConfig } from "@/config/site";
import { canLoadThirdParties, useConsent } from "./consent";

/**
 * Carga Google Analytics 4 y AdSense solo si están configurados y,
 * cuando se exige consentimiento, solo después de aceptarlo.
 * Los IDs se validan con expresiones regulares en siteConfig.
 */
export function ThirdPartyScripts() {
  const consent = useConsent();
  if (!canLoadThirdParties(consent)) return null;
  const { gaId } = siteConfig.analytics;
  const { enabled: adsEnabled, clientId } = siteConfig.ads;

  return (
    <>
      {gaId ? (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga4-init" strategy="afterInteractive">
            {`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}window.gtag=gtag;gtag('js',new Date());gtag('config','${gaId}',{allow_google_signals:false,allow_ad_personalization_signals:false});`}
          </Script>
        </>
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
