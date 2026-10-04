"use client";

import { useEffect, useRef, useState } from "react";

/** Mide el ancho del contenedor para dibujar el SVG a escala 1:1 (texto legible en móvil). */
export function useWidth<T extends HTMLElement>(fallback = 640) {
  const ref = useRef<T>(null);
  const [width, setWidth] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const ro = new ResizeObserver((entries) => {
      const w = Math.round(entries[0]?.contentRect.width ?? fallback);
      if (w > 0) setWidth(Math.max(280, Math.min(w, 960)));
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, [fallback]);
  return { ref, width };
}
