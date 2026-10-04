"use client";

import { usePrefs } from "@/components/PreferencesProvider";
import { LineChart } from "@/components/charts/Chart";
import { DataTable } from "@/components/DataTable";
import type { CompoundYear } from "@/lib/calc/compound";

/** Gráfico + tabla anual de crecimiento (interés compuesto y ahorro). */
interface GrowthBreakdownProps {
  years: CompoundYear[];
  /** Capital al inicio (punto de partida del gráfico) */
  initial: number;
  title?: string;
}

export function GrowthBreakdown({ years, initial, title = "Evolución año a año" }: GrowthBreakdownProps) {
  const { money } = usePrefs();
  if (years.length === 0) return null;
  const label = (y: CompoundYear) => (y.months % 12 === 0 ? `Año ${y.year}` : `${y.months} meses`);
  const last = years[years.length - 1]!;
  return (
    <section className="calc__full" aria-label={title}>
      {years.length >= 1 ? (
        <LineChart
          title="Saldo frente a dinero aportado"
          description={`Al final del plazo el saldo es ${money(last.balance)}, de los cuales ${money(last.contributed)} son aportaciones.`}
          labels={["Inicio", ...years.map((y) => (y.months % 12 === 0 ? y.year : `${y.months}m`))]}
          series={[
            { name: "Saldo", color: "var(--chart-1)", values: [initial, ...years.map((y) => y.balance)], area: true },
            { name: "Aportado", color: "var(--chart-2)", values: [initial, ...years.map((y) => y.contributed)], dashed: true },
          ]}
        />
      ) : null}
      <div className="table-toolbar">
        <h2 style={{ fontSize: "1.15rem" }}>{title}</h2>
      </div>
      <DataTable
        caption={title}
        hideCaption
        scroll={years.length > 15}
        rowKey={(y) => y.year}
        rows={years}
        columns={[
          { key: "y", header: "Periodo", cell: (y) => label(y) },
          { key: "c", header: "Aportado acumulado", cell: (y) => money(y.contributed) },
          { key: "i", header: "Rendimiento acumulado", cell: (y) => money(y.interest) },
          { key: "b", header: "Saldo", cell: (y) => money(y.balance) },
        ]}
      />
    </section>
  );
}
