import type { ReactNode } from "react";

export interface Column<Row> {
  key: string;
  header: string;
  cell: (row: Row, index: number) => ReactNode;
  footer?: ReactNode;
}

interface DataTableProps<Row> {
  caption: string;
  columns: Column<Row>[];
  rows: Row[];
  /** Limita la altura y añade scroll vertical (tablas largas) */
  scroll?: boolean;
  rowKey: (row: Row, index: number) => string | number;
  /** Ocultar visualmente el caption (sigue accesible) */
  hideCaption?: boolean;
}

/** Tabla accesible con scroll horizontal propio (no provoca scroll global). */
export function DataTable<Row>({ caption, columns, rows, scroll, rowKey, hideCaption }: DataTableProps<Row>) {
  const hasFooter = columns.some((c) => c.footer !== undefined);
  return (
    <div className={`table-wrap${scroll ? " table-scroll" : ""}`} tabIndex={0} role="region" aria-label={caption}>
      <table className="data-table">
        <caption className={hideCaption ? "visually-hidden" : undefined}>{caption}</caption>
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col">
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={rowKey(row, i)}>
              {columns.map((c, ci) =>
                ci === 0 ? (
                  <th key={c.key} scope="row" style={{ fontWeight: 500 }}>
                    {c.cell(row, i)}
                  </th>
                ) : (
                  <td key={c.key}>{c.cell(row, i)}</td>
                ),
              )}
            </tr>
          ))}
        </tbody>
        {hasFooter ? (
          <tfoot>
            <tr>
              {columns.map((c) => (
                <td key={c.key}>{c.footer ?? ""}</td>
              ))}
            </tr>
          </tfoot>
        ) : null}
      </table>
    </div>
  );
}
