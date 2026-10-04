"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics";
import { pushRecentTool } from "@/lib/storage";

/** Registra la vista de la calculadora y la guarda en "recientes" (solo el slug). */
export function ToolTracker({ slug, category }: { slug: string; category: string }) {
  useEffect(() => {
    pushRecentTool(slug);
    track("calculator_view", { tool_slug: slug, tool_category: category });
  }, [slug, category]);
  return null;
}
