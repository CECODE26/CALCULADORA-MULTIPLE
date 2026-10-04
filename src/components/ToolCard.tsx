"use client";

import Link from "next/link";
import { Icon, type IconName } from "@/components/ui/Icon";
import { track } from "@/lib/analytics";

export interface ToolCardData {
  slug: string;
  name: string;
  description?: string;
  icon: IconName;
}

interface ToolCardProps {
  tool: ToolCardData;
  compact?: boolean;
  /** Si se indica, el clic se registra como related_tool_clicked */
  fromTool?: string;
  position?: number;
}

export function ToolCard({ tool, compact, fromTool, position }: ToolCardProps) {
  return (
    <Link
      href={`/${tool.slug}`}
      className={`tool-card${compact ? " tool-card--compact" : ""}`}
      onClick={
        fromTool
          ? () => track("related_tool_clicked", { from_tool: fromTool, to_tool: tool.slug, position })
          : undefined
      }
    >
      <span className="tool-card__icon">
        <Icon name={tool.icon} size={compact ? 18 : 20} />
      </span>
      <span>
        <span className="tool-card__title" style={{ display: "block" }}>
          {tool.name}
        </span>
        {!compact && tool.description ? <span className="tool-card__desc">{tool.description}</span> : null}
      </span>
    </Link>
  );
}
