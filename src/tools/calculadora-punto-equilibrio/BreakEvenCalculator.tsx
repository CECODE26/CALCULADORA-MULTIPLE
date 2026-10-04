"use client";

import { useMemo } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { NextStep } from "@/components/calculator/NextStep";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { LineChart } from "@/components/charts/Chart";
import { compact } from "@/components/charts/scale";
import { breakEven, breakEvenSeries, simulateSales } from "@/lib/calc/breakeven";

const SLUG = "calculadora-punto-equilibrio";
const INITIAL = { fixed: "5000", price: "25", variable: "15", units: "600" };
const POINTS = 24;

export function BreakEvenCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const { money, num, pct, locale } = usePrefs();
  const input = { fixedCosts: nums.fixed, unitPrice: nums.price, unitVariableCost: nums.variable };

  const res = useMemo(
    () => breakEven({ fixedCosts: nums.fixed, unitPrice: nums.price, unitVariableCost: nums.variable }),
    [nums],
  );
  const sim = useMemo(
    () =>
      res.ok
        ? simulateSales({ fixedCosts: nums.fixed, unitPrice: nums.price, unitVariableCost: nums.variable }, nums.units)
        : null,
    [res, nums],
  );
  useTrackCalculation(SLUG, "standard", res.ok, signature);

  const chart = useMemo(() => {
    if (!res.ok) return null;
    const simUnits = sim && sim.ok ? sim.value.units : 0;
    const max = Math.max(res.value.unitsExact * 2, simUnits * 1.15, 10);
    return { max, ...breakEvenSeries(input, max, POINTS) };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [res, sim]);

  const general = generalError(res, ["fixed", "price", "variable"]);

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="be-data">
        <h2 id="be-data" className="panel__title">
          Datos del negocio
        </h2>
        <div className="fields">
          <CurrencyInput
            label="Costos fijos del periodo"
            value={values.fixed}
            onChange={set("fixed")}
            error={fieldError(res, "fixed")}
            hint="Alquiler, sueldos, servicios… lo que pagas vendas o no (por ejemplo, al mes)."
          />
          <CurrencyInput label="Precio de venta por unidad" value={values.price} onChange={set("price")} error={fieldError(res, "price")} />
          <CurrencyInput
            label="Costo variable por unidad"
            value={values.variable}
            onChange={set("variable")}
            error={fieldError(res, "variable")}
            hint="Materia prima, comisión, envío… lo que cuesta producir y vender cada unidad."
          />
        </div>
      </section>

      <div className="calc__result">
        {res.ok ? (
          <>
            <ResultCard
              label="Punto de equilibrio"
              value={`${num(res.value.units, 0)} ${res.value.units === 1 ? "unidad" : "unidades"}`}
              note={
                res.value.units === 0
                  ? "Sin costos fijos, cualquier venta genera ganancia."
                  : `Equivale a ${money(res.value.sales)} en ventas.${
                      res.value.unitsExact % 1 > 1e-9 ? ` (Exactamente ${num(res.value.unitsExact, 2)} unidades; se redondea hacia arriba.)` : ""
                    }`
              }
            >
              <ResultBreakdown
                rows={[
                  { label: "Margen de contribución por unidad", value: money(res.value.contributionMargin) },
                  { label: "Margen de contribución (%)", value: pct(res.value.contributionMarginPct, 2) },
                  { label: "Ventas necesarias", value: money(res.value.salesExact), total: true },
                ]}
              />
            </ResultCard>

            <section className="panel" style={{ marginTop: 16 }} aria-labelledby="be-sim">
              <h3 id="be-sim" className="panel__title" style={{ marginBottom: 12 }}>
                Simulador: si vendo…
              </h3>
              <NumberInput
                label="Unidades vendidas"
                inputMode="numeric"
                value={values.units}
                onChange={set("units")}
                error={sim && !sim.ok ? sim.error : null}
                suffix="unidades"
              />
              {sim && sim.ok ? (
                <ResultBreakdown
                  rows={[
                    { label: "Ingresos", value: money(sim.value.revenue) },
                    { label: "Costos totales", value: money(sim.value.totalCosts) },
                    {
                      label: sim.value.profit >= 0 ? "Utilidad" : "Pérdida",
                      value: (
                        <span style={{ color: sim.value.profit < 0 ? "var(--danger)" : "var(--accent)" }}>{money(sim.value.profit)}</span>
                      ),
                      total: true,
                    },
                  ]}
                />
              ) : null}
            </section>

            <ShareResult
              toolSlug={SLUG}
              onReset={reset}
              getSummary={() =>
                [
                  `Punto de equilibrio: ${num(res.value.units, 0)} unidades (${money(res.value.sales)} en ventas).`,
                  `Margen de contribución: ${money(res.value.contributionMargin)} por unidad (${pct(res.value.contributionMarginPct, 1)}).`,
                ].join("\n")
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-precio-venta" label="Revisar mi precio de venta" />
            </div>
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Corrige los datos marcados para ver el punto de equilibrio.</ResultEmpty>
        )}
      </div>

      {res.ok && chart ? (
        <div className="calc__full">
          <LineChart
            title="Ingresos frente a costos totales"
            description={`Las líneas se cruzan en ${num(res.value.unitsExact, 0)} unidades: por debajo hay pérdida y por encima, utilidad.`}
            labels={chart.units.map((u) => compact(u, locale))}
            series={[
              { name: "Ingresos", color: "var(--chart-1)", values: chart.revenue },
              { name: "Costos totales", color: "var(--chart-2)", values: chart.costs },
            ]}
            marker={
              res.value.unitsExact > 0
                ? {
                    x: (res.value.unitsExact / chart.max) * POINTS,
                    y: res.value.salesExact,
                    label: `Equilibrio: ${num(res.value.units, 0)} u.`,
                  }
                : undefined
            }
          />
        </div>
      ) : null}
    </div>
  );
}
