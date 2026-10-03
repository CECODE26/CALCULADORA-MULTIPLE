"use client";

import { useEffect, useRef } from "react";
import { siteConfig, type AdPlacement } from "@/config/site";
import { canLoadThirdParties, useConsent } from "@/components/analytics/consent";

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

const SHOW_PLACEHOLDER = process.env.NODE_ENV !== "production";

/**
 * Espacio publicitario de AdSense.
 *
 * Reglas de diseño:
 *  - Nunca se coloca entre los campos y el resultado de una calculadora.
 *  - Siempre lleva la etiqueta "Publicidad" para no confundirse con contenido.
 *  - Reserva altura mínima para no provocar saltos de diseño (CLS).
 *  - No renderiza nada si la publicidad está desactivada, falta el ID del
 *    bloque o el usuario no dio su consentimiento (cuando se exige).
 *  - En desarrollo muestra un marcador para revisar la maquetación.
 */
export function AdSlot({ placement }: { placement: AdPlacement }) {
  const consent = useConsent();
  const slotId = siteConfig.ads.slots[placement];
  const active = siteConfig.ads.enabled && Boolean(slotId) && canLoadThirdParties(consent);
  const pushed = useRef(false);

  useEffect(() => {
    if (!active || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      // Un fallo del anuncio nunca debe afectar a la calculadora.
    }
  }, [active]);

  if (!active) {
    if (!SHOW_PLACEHOLDER) return null;
    return (
      <aside className="ad-slot" aria-label="Publicidad">
        <span className="ad-slot__label">Publicidad</span>
        <div className="ad-slot__box ad-slot__box--placeholder">Espacio reservado · {placement}</div>
      </aside>
    );
  }

  return (
    <aside className="ad-slot" aria-label="Publicidad">
      <span className="ad-slot__label">Publicidad</span>
      <ins
        className="adsbygoogle ad-slot__box"
        style={{ display: "block" }}
        data-ad-client={siteConfig.ads.clientId}
        data-ad-slot={slotId}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
