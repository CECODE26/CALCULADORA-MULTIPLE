import Link from "next/link";
import type { Category } from "@/config/categories";
import { toolsInCategory } from "@/tools/registry";
import { Icon } from "@/components/ui/Icon";

export function CategoryCard({ category }: { category: Category }) {
  const list = toolsInCategory(category.slug);
  return (
    <Link href={`/${category.slug}`} className="category-card">
      <span className="category-card__head">
        <span className="tool-card__icon">
          <Icon name={category.icon} size={20} />
        </span>
        <span>
          <span className="category-card__name" style={{ display: "block" }}>
            {category.name}
          </span>
          <span className="category-card__count">
            {list.length === 0 ? "Próximamente" : `${list.length} ${list.length === 1 ? "herramienta" : "herramientas"}`}
          </span>
        </span>
      </span>
      {list.length > 0 ? (
        <span className="category-card__tools">
          {list.slice(0, 4).map((t) => (
            <span key={t.slug} style={{ display: "block" }}>
              {t.name}
            </span>
          ))}
        </span>
      ) : null}
    </Link>
  );
}
