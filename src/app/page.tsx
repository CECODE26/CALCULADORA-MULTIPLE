import type { Metadata } from "next";
import Link from "next/link";
import { siteConfig, absoluteUrl } from "@/config/site";
import { categories } from "@/config/categories";
import { liveTools } from "@/tools/registry";
import { SearchTools } from "@/components/search/SearchTools";
import { CategoryCard } from "@/components/CategoryCard";
import { ToolCard } from "@/components/ToolCard";
import { RecentTools } from "@/components/RecentTools";
import { JsonLd } from "@/components/JsonLd";
import { Icon } from "@/components/ui/Icon";
import { websiteJsonLd } from "@/lib/seo";

export const metadata: Metadata = {
  title: { absolute: `${siteConfig.name}: calculadoras gratuitas de finanzas, negocios y trabajo` },
  description: siteConfig.description,
  alternates: { canonical: absoluteUrl("/") },
};

export default function HomePage() {
  const tools = liveTools();
  const popular = tools.filter((t) => t.popular);
  const featured = tools.filter((t) => t.featured);

  return (
    <div className="container">
      <section className="hero" aria-labelledby="hero-title">
        <span className="hero__eyebrow">Calculadoras gratuitas, sin registro</span>
        <h1 id="hero-title">Resuelve tus cálculos de dinero y trabajo en segundos</h1>
        <p className="hero__lead">
          Préstamos, ahorro, márgenes, precios, impuestos, porcentajes y horas. Resultados claros, con la fórmula
          explicada para que sepas de dónde sale cada número.
        </p>
        <SearchTools />
        <ul className="trust-list">
          <li>
            <Icon name="formula" size={18} /> Fórmulas visibles
          </li>
          <li>
            <Icon name="shield" size={18} /> Tus datos no salen de tu navegador
          </li>
          <li>
            <Icon name="bolt" size={18} /> Rápido en cualquier móvil
          </li>
        </ul>
      </section>

      <RecentTools />

      <section className="section" aria-labelledby="cats-title">
        <div className="section__head">
          <h2 id="cats-title">Categorías</h2>
        </div>
        <ul className="card-grid card-grid--4">
          {categories.map((c) => (
            <li key={c.slug}>
              <CategoryCard category={c} />
            </li>
          ))}
        </ul>
      </section>

      {popular.length > 0 ? (
        <section className="section" aria-labelledby="popular-title">
          <div className="section__head">
            <h2 id="popular-title">Herramientas populares</h2>
            <Link href="/herramientas">Ver todas</Link>
          </div>
          <ul className="card-grid card-grid--3">
            {popular.map((t) => (
              <li key={t.slug}>
                <ToolCard tool={{ slug: t.slug, name: t.name, description: t.lead, icon: t.icon }} />
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <section className="section">
          <p className="result-empty">Las primeras calculadoras se están preparando.</p>
        </section>
      )}

      {featured.length > 0 ? (
        <section className="section" aria-labelledby="featured-title">
          <div className="section__head">
            <h2 id="featured-title">Recomendadas para empezar</h2>
          </div>
          <ul className="card-grid card-grid--4">
            {featured.map((t) => (
              <li key={t.slug}>
                <ToolCard tool={{ slug: t.slug, name: t.name, icon: t.icon }} compact />
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <section className="section prose" aria-labelledby="about-title">
        <h2 id="about-title">Calculadoras pensadas para decisiones reales</h2>
        <p>
          Cada herramienta resuelve una pregunta concreta: cuánto pagarás por un crédito, qué precio poner a tu
          producto o cuántas horas trabajaste esta semana. Mostramos la fórmula, un ejemplo y los errores más comunes
          para que puedas comprobar el resultado por tu cuenta.
        </p>
        <p>
          Los cálculos se hacen en tu propio dispositivo: no guardamos ni enviamos los importes, tasas u horarios que
          introduces.
        </p>
      </section>

      <JsonLd data={websiteJsonLd()} />
    </div>
  );
}
