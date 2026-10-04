"use client";

import Link from "next/link";
import { siteConfig } from "@/config/site";
import { setConsent, thirdPartiesConfigured, useConsent } from "./consent";

/**
 * Aviso de cookies no intrusivo: no bloquea la página y ofrece
 * "Aceptar" y "Rechazar" con el mismo peso visual (sin dark patterns).
 */
export function ConsentBanner() {
  const consent = useConsent();
  if (!thirdPartiesConfigured || !siteConfig.analytics.requireConsent || consent !== "unset") return null;

  return (
    <section className="consent" aria-label="Aviso de cookies">
      <p>
        Usamos cookies de medición{siteConfig.ads.enabled ? " y publicidad" : ""} solo si las aceptas. Los valores
        que introduces en las calculadoras nunca se envían. <Link href="/cookies">Más información</Link>.
      </p>
      <div className="btn-row">
        <button type="button" className="btn btn--sm" onClick={() => setConsent("denied")}>
          Rechazar
        </button>
        <button type="button" className="btn btn--sm" onClick={() => setConsent("granted")}>
          Aceptar
        </button>
      </div>
    </section>
  );
}
