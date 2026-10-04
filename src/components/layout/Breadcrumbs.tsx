import Link from "next/link";
import { JsonLd } from "@/components/JsonLd";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Ruta de navegación" className="breadcrumbs">
      <ol>
        {items.map((c, i) => {
          const last = i === items.length - 1;
          return (
            <li key={c.path}>
              {last ? <span aria-current="page">{c.name}</span> : <Link href={c.path}>{c.name}</Link>}
            </li>
          );
        })}
      </ol>
      <JsonLd data={breadcrumbJsonLd(items)} />
    </nav>
  );
}
