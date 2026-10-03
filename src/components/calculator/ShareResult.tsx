"use client";

import { useEffect, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { siteConfig, absoluteUrl } from "@/config/site";

interface ShareResultProps {
  toolSlug: string;
  /** Devuelve el resumen en texto plano (solo se usa si el usuario lo pide) */
  getSummary: () => string;
  onReset?: () => void;
}

/**
 * Copiar o compartir el resumen. Los valores NUNCA se colocan en la URL:
 * el enlace compartido apunta a la calculadora vacía y el texto solo sale
 * del dispositivo si el usuario decide compartirlo.
 */
export function ShareResult({ toolSlug, getSummary, onReset }: ShareResultProps) {
  const [status, setStatus] = useState<string | null>(null);
  const [canShare, setCanShare] = useState(false);

  useEffect(() => {
    // navigator.share solo existe en el cliente; se comprueba tras montar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCanShare(typeof navigator !== "undefined" && typeof navigator.share === "function");
  }, []);

  useEffect(() => {
    if (!status) return;
    const t = window.setTimeout(() => setStatus(null), 2500);
    return () => window.clearTimeout(t);
  }, [status]);

  const text = () => `${getSummary()}\n\nCalculado con ${siteConfig.name}: ${absoluteUrl(`/${toolSlug}`)}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(text());
      setStatus("Resumen copiado");
      track("result_shared", { tool_slug: toolSlug, method: "copy" });
    } catch {
      setStatus("No se pudo copiar");
    }
  }

  async function share() {
    try {
      await navigator.share({ title: siteConfig.name, text: text() });
      track("result_shared", { tool_slug: toolSlug, method: "native" });
    } catch {
      // El usuario canceló: no es un error.
    }
  }

  return (
    <div className="share">
      <button type="button" className="btn btn--sm" onClick={copy}>
        <Icon name="copy" size={16} /> Copiar resumen
      </button>
      {canShare ? (
        <button type="button" className="btn btn--sm" onClick={share}>
          <Icon name="share" size={16} /> Compartir
        </button>
      ) : null}
      {onReset ? (
        <button type="button" className="btn btn--sm btn--ghost" onClick={onReset}>
          <Icon name="refresh" size={16} /> Volver a calcular
        </button>
      ) : null}
      <span className="share__status" role="status" aria-live="polite">
        {status}
      </span>
    </div>
  );
}
