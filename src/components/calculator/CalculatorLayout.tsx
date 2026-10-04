import type { ReactNode } from "react";
import { getTool } from "@/tools/registry";
import { toolCrumbs, toolJsonLd } from "@/lib/seo";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";
import { JsonLd } from "@/components/JsonLd";
import { AdSlot } from "@/components/ads/AdSlot";
import { RelatedTools } from "./RelatedTools";
import { ToolTracker } from "./ToolTracker";

interface CalculatorLayoutProps {
  slug: string;
  /** La calculadora interactiva (componente cliente) */
  calculator: ReactNode;
  /** Contenido explicativo (servidor) */
  children: ReactNode;
  /** Nota de confianza bajo el contenido (p. ej. aviso financiero) */
  disclaimer?: ReactNode;
}

/**
 * Plantilla común de todas las herramientas. Orden de prioridad visual:
 * calculadora → resultado → (atajos relacionados) → explicación → publicidad.
 * La publicidad nunca aparece entre los campos y el resultado: el primer
 * bloque solo puede ir dentro del contenido explicativo (lo inserta cada
 * contenido con <AdSlot placement="toolInContent" />) y el segundo al final.
 */
export function CalculatorLayout({ slug, calculator, children, disclaimer }: CalculatorLayoutProps) {
  const tool = getTool(slug);
  return (
    <div className="container page">
      <Breadcrumbs items={toolCrumbs(tool)} />
      <header className="page-head">
        <h1>{tool.h1}</h1>
        <p className="page-head__lead">{tool.lead}</p>
      </header>

      {calculator}

      <RelatedTools slug={slug} compact />

      <article className="prose">
        {children}
        {disclaimer ? <aside className="disclaimer">{disclaimer}</aside> : null}
      </article>

      <RelatedTools slug={slug} title="Herramientas relacionadas" limit={6} />

      <AdSlot placement="toolBottom" />

      <JsonLd data={toolJsonLd(tool)} />
      <ToolTracker slug={tool.slug} category={tool.category} />
    </div>
  );
}
