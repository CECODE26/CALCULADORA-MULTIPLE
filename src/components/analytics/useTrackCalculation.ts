"use client";

import { useEffect, useRef } from "react";
import { track } from "@/lib/analytics";

/**
 * Envía `calculation_completed` como máximo una vez por modo, cuando el
 * usuario ha modificado algún dato y el resultado es válido durante 1,5 s.
 * Solo se envían el slug y el modo: nunca los valores introducidos.
 */
export function useTrackCalculation(toolSlug: string, mode: string, valid: boolean, signature: string) {
  const sent = useRef(new Set<string>());
  const initial = useRef(signature);

  useEffect(() => {
    if (!valid || signature === initial.current || sent.current.has(mode)) return;
    const t = window.setTimeout(() => {
      sent.current.add(mode);
      track("calculation_completed", { tool_slug: toolSlug, mode });
    }, 1500);
    return () => window.clearTimeout(t);
  }, [toolSlug, mode, valid, signature]);
}
