import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { categories, getCategory } from "@/config/categories";
import { toolsInCategory } from "@/tools/registry";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToolCard } from "@/components/ToolCard";
import { CategoryCard } from "@/components/CategoryCard";
import { AdSlot } from "@/components/ads/AdSlot";

export const dynamicParams = false;

export function generateStaticParams() {
  return categories.map((c) => ({ category: c.slug }));
}

type Props = { params: Promise<{ category: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) return {};
  return pageMetadata({
    title: cat.title,
    description: cat.description,
    path: `/${cat.slug}`,
    // Una categoría sin herramientas publicadas sería contenido escaso
    noindex: toolsInCategory(cat.slug).length === 0,
  });
}

export default async function CategoryPage({ params }: Props) {
  const { category } = await params;
  const cat = getCategory(category);
  if (!cat) notFound();
  const list = toolsInCategory(cat.slug);
  const others = categories.filter((c) => c.slug !== cat.slug);

  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: cat.name, path: `/${cat.slug}` },
        ]}
      />
      <header className="page-head">
        <h1>{cat.name}</h1>
        <p className="page-head__lead">{cat.intro}</p>
      </header>

      {list.length > 0 ? (
        <ul className="card-grid card-grid--3">
          {list.map((t) => (
            <li key={t.slug}>
              <ToolCard tool={{ slug: t.slug, name: t.name, description: t.lead, icon: t.icon }} />
            </li>
          ))}
        </ul>
      ) : (
        <p className="result-empty">Estamos preparando las herramientas de esta categoría.</p>
      )}

      <section className="section" aria-labelledby="other-cats">
        <h2 id="other-cats">Otras categorías</h2>
        <ul className="card-grid card-grid--3">
          {others.map((c) => (
            <li key={c.slug}>
              <CategoryCard category={c} />
            </li>
          ))}
        </ul>
      </section>

      <AdSlot placement="listing" />
    </div>
  );
}
