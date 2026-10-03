import type { ReactNode } from "react";

export interface BreakdownRow {
  label: ReactNode;
  value: ReactNode;
  total?: boolean;
}

/** Lista de valores secundarios del resultado (lista de definición). */
export function ResultBreakdown({ rows, label }: { rows: BreakdownRow[]; label?: string }) {
  return (
    <dl className="breakdown" aria-label={label}>
      {rows.map((r, i) => (
        <div key={i} className={`breakdown__row${r.total ? " breakdown__row--total" : ""}`}>
          <dt>{r.label}</dt>
          <dd>{r.value}</dd>
        </div>
      ))}
    </dl>
  );
}
