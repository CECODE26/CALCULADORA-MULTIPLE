import { relatedTools } from "@/tools/registry";
import { ToolCard } from "@/components/ToolCard";

interface RelatedToolsProps {
  slug: string;
  title?: string;
  limit?: number;
  compact?: boolean;
}

/** Enlazado interno contextual: "También puede interesarte". */
export function RelatedTools({ slug, title = "También puede interesarte", limit = 4, compact }: RelatedToolsProps) {
  const list = relatedTools(slug, limit);
  if (list.length === 0) return null;
  return (
    <nav className="related" aria-label={title}>
      <h2 className="related__title">{title}</h2>
      <ul className={`card-grid${compact ? " card-grid--4" : ""}`}>
        {list.map((t, i) => (
          <li key={t.slug}>
            <ToolCard
              tool={{ slug: t.slug, name: t.name, description: t.lead, icon: t.icon }}
              compact={compact}
              fromTool={slug}
              position={i + 1}
            />
          </li>
        ))}
      </ul>
    </nav>
  );
}
