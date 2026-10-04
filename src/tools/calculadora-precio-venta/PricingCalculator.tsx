"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { NextStep } from "@/components/calculator/NextStep";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { ProportionBar } from "@/components/charts/ProportionBar";
import { calculatePrice } from "@/lib/calc/pricing";

const SLUG = "calculadora-precio-venta";
type Mode = "simple" | "advanced";
const INITIAL = { cost: "", shipping: "", packaging: "", other: "", commission: "", margin: "", tax: "" };

/** Campo opcional vacío = 0 */
const opt = (raw: string, n: number) => (raw.trim() === "" ? 0 : n);

export function PricingCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [mode, setMode] = useState<Mode>("simple");
  const [onFinal, setOnFinal] = useState(false);
  const { money, pct } = usePrefs();
  const advanced = mode === "advanced";

  const res = useMemo(
    () =>
      calculatePrice(
        advanced
          ? {
              cost: nums.cost,
              shipping: opt(values.shipping, nums.shipping),
              packaging: opt(values.packaging, nums.packaging),
              other: opt(values.other, nums.other),
              commissionPct: opt(values.commission, nums.commission),
              marginPct: nums.margin,
              taxPct: opt(values.tax, nums.tax),
              commissionOnFinalPrice: onFinal,
            }
          : { cost: nums.cost, marginPct: nums.margin },
      ),
    [advanced, nums, values, onFinal],
  );
  useTrackCalculation(SLUG, mode, res.ok, signature + mode + onFinal);
  const hasTax = advanced && res.ok && res.value.tax > 0;
  const general = generalError(res, ["cost", "shipping", "packaging", "other", "commission", "margin", "tax"]);

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="pv-data">
        <h2 id="pv-data" className="panel__title">
          Costos y objetivo
        </h2>
        <SegmentedControl
          label="Modo de cálculo"
          value={mode}
          onChange={setMode}
          options={[
            { value: "simple", label: "Simple" },
            { value: "advanced", label: "Avanzado" },
          ]}
        />
        <div className="fields">
          <CurrencyInput label="Costo del producto" value={values.cost} onChange={set("cost")} error={fieldError(res, "cost")} />
          {advanced ? (
            <div className="fields fields--2">
              <CurrencyInput label="Transporte / envío" optional value={values.shipping} onChange={set("shipping")} error={fieldError(res, "shipping")} />
              <CurrencyInput label="Empaque" optional value={values.packaging} onChange={set("packaging")} error={fieldError(res, "packaging")} />
              <CurrencyInput label="Otros gastos por unidad" optional value={values.other} onChange={set("other")} error={fieldError(res, "other")} />
              <PercentageInput
                label="Comisión de venta"
                optional
                value={values.commission}
                onChange={set("commission")}
                error={fieldError(res, "commission")}
              />
            </div>
          ) : null}
          <PercentageInput
            label="Margen de ganancia deseado"
            value={values.margin}
            onChange={set("margin")}
            error={fieldError(res, "margin")}
            hint="Sobre el precio de venta sin impuesto."
          />
          {advanced ? (
            <>
              <PercentageInput
                label="Impuesto sobre la venta (IVA, IGV…)"
                optional
                value={values.tax}
                onChange={set("tax")}
                error={fieldError(res, "tax")}
                hint="Escribe la tasa vigente en tu país. No aplicamos ninguna por defecto."
              />
              <Checkbox label="La comisión se cobra sobre el precio con impuesto" checked={onFinal} onChange={setOnFinal} />
            </>
          ) : null}
        </div>
      </section>

      <div className="calc__result">
        {res.ok ? (
          <>
            <ResultCard
              label={hasTax ? "Precio final (con impuesto)" : "Precio de venta"}
              value={money(res.value.finalPrice)}
              animationKey={mode}
            >
              <ResultBreakdown
                rows={[
                  { label: "Costo real por unidad", value: money(res.value.realCost) },
                  ...(advanced ? [{ label: "Comisión", value: money(res.value.commission) }] : []),
                  { label: "Ganancia", value: money(res.value.profit) },
                  { label: "Precio antes de impuestos", value: money(res.value.priceBeforeTax), total: true },
                  ...(advanced ? [{ label: "Impuesto", value: money(res.value.tax) }] : []),
                  ...(advanced ? [{ label: "Precio final", value: money(res.value.finalPrice), total: true }] : []),
                  { label: "Markup sobre el costo", value: res.value.markupPct === null ? "—" : pct(res.value.markupPct, 1) },
                ]}
              />
              <ProportionBar
                label="Composición del precio antes de impuestos"
                parts={[
                  { label: "Costo", value: res.value.realCost, color: "var(--chart-3)", display: money(res.value.realCost) },
                  ...(res.value.commission > 0
                    ? [{ label: "Comisión", value: res.value.commission, color: "var(--chart-2)", display: money(res.value.commission) }]
                    : []),
                  { label: "Ganancia", value: res.value.profit, color: "var(--chart-1)", display: money(res.value.profit) },
                ]}
              />
            </ResultCard>
            <ShareResult
              toolSlug={SLUG}
              onReset={() => {
                reset();
                setOnFinal(false);
              }}
              getSummary={() =>
                [
                  `Costo real: ${money(res.value.realCost)}`,
                  `Precio antes de impuestos: ${money(res.value.priceBeforeTax)}`,
                  advanced ? `Impuesto: ${money(res.value.tax)} · Comisión: ${money(res.value.commission)}` : "",
                  `Precio final: ${money(res.value.finalPrice)} · Ganancia: ${money(res.value.profit)}`,
                ]
                  .filter(Boolean)
                  .join("\n")
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-punto-equilibrio" label="¿Cuántas unidades debo vender?" />
            </div>
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Introduce los datos para ver el precio.</ResultEmpty>
        )}
      </div>
    </div>
  );
}
