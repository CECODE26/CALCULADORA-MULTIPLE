import { categories } from "@/config/categories";
import { liveTools } from "@/tools/registry";
import { pageMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { ToolCard } from "@/components/ToolCard";
import { SearchTools } from "@/components/search/SearchTools";

export const metadata = pageMetadata({
  title: "Todas las calculadoras y herramientas gratuitas",
  description:
    "Todas nuestras calculadoras gratuitas: préstamos, amortización, interés compuesto, ahorro, margen, precio de venta, porcentajes, descuentos, horas e IVA.",
  path: "/herramientas",
});

export default function ToolsDirectoryPage() {
  const tools = liveTools();
  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: "Todas las herramientas", path: "/herramientas" },
        ]}
      />
      <header className="page-head">
        <h1>Todas las herramientas</h1>
        <p className="page-head__lead">Encuentra la calculadora que necesitas, organizada por tema.</p>
      </header>
      <SearchTools label="Buscar una herramienta" showSuggestions={false} />

      {categories.map((cat) => {
        const list = tools.filter((t) => t.category === cat.slug);
        if (list.length === 0) return null;
        return (
          <section key={cat.slug} className="section" aria-labelledby={`cat-${cat.slug}`}>
            <div className="section__head">
              <h2 id={`cat-${cat.slug}`}>{cat.name}</h2>
            </div>
            <ul className="card-grid card-grid--3">
              {list.map((t) => (
                <li key={t.slug}>
                  <ToolCard tool={{ slug: t.slug, name: t.name, description: t.lead, icon: t.icon }} />
                </li>
              ))}
            </ul>
          </section>
        );
      })}
      {tools.length === 0 ? <p className="result-empty section">Las primeras calculadoras se están preparando.</p> : null}
    </div>
  );
}
