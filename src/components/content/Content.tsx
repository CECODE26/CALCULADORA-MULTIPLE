import type { ReactNode } from "react";

/** Bloque de fórmula legible (monoespaciada, con scroll propio si es larga). */
export function Formula({ children, label }: { children: string; label?: string }) {
  return (
    <pre className="formula" aria-label={label ?? "Fórmula"}>
      <code>{children}</code>
    </pre>
  );
}

/** Explicación de variables de una fórmula. */
export function Variables({ items }: { items: [string, ReactNode][] }) {
  return (
    <dl className="vars">
      {items.map(([k, v]) => (
        <div key={k}>
          <dt>{k}</dt>
          <dd>{v}</dd>
        </div>
      ))}
    </dl>
  );
}

export function Example({ children }: { children: ReactNode }) {
  return <div className="example">{children}</div>;
}

/** Aviso estándar para herramientas financieras. */
export function FinancialDisclaimer() {
  return (
    <>
      <p>
        <strong>Importante:</strong> los resultados son estimaciones con fines informativos y dependen de los datos que
        introduces. No constituyen asesoría financiera ni una oferta de crédito o inversión. Las entidades pueden
        aplicar comisiones, seguros, impuestos o métodos de cálculo distintos; confirma siempre las condiciones
        oficiales con tu entidad.
      </p>
    </>
  );
}

export function BusinessDisclaimer() {
  return (
    <p>
      <strong>Nota:</strong> los cálculos son orientativos y no sustituyen el asesoramiento contable o tributario.
      Verifica las tasas y obligaciones vigentes en tu país.
    </p>
  );
}
