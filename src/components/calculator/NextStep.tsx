"use client";

import Link from "next/link";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";
import { findTool } from "@/tools/registry";

interface NextStepProps {
  from: string;
  to: string;
  label: string;
}

/** Enlace contextual a la siguiente herramienta lógica tras un resultado. */
export function NextStep({ from, to, label }: NextStepProps) {
  if (!findTool(to)) return null;
  return (
    <Link
      href={`/${to}`}
      className="btn btn--sm"
      onClick={() => track("related_tool_clicked", { from_tool: from, to_tool: to, placement: "result" })}
    >
      {label} <Icon name="arrowRight" size={16} />
    </Link>
  );
}
