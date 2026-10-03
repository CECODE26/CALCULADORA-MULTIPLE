import type { ReactNode } from "react";
import { Breadcrumbs } from "@/components/layout/Breadcrumbs";

interface LegalPageProps {
  title: string;
  path: string;
  lead?: string;
  /** Marca el texto como borrador pendiente de revisión legal */
  draft?: boolean;
  children: ReactNode;
}

export function LegalPage({ title, path, lead, draft, children }: LegalPageProps) {
  return (
    <div className="container page">
      <Breadcrumbs
        items={[
          { name: "Inicio", path: "/" },
          { name: title, path },
        ]}
      />
      <header className="page-head">
        <h1>{title}</h1>
        {lead ? <p className="page-head__lead">{lead}</p> : null}
      </header>
      <article className="prose" style={{ marginTop: 0 }}>
        {draft ? (
          <p className="review-note" role="note">
            BORRADOR — Este texto es una plantilla orientativa y DEBE ser revisado por un profesional legal antes del
            lanzamiento, adaptándolo a la jurisdicción del titular del sitio y de los países a los que se dirige.
          </p>
        ) : null}
        {children}
      </article>
    </div>
  );
}
