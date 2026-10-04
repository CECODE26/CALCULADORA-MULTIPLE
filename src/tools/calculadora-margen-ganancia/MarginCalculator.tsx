"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { NextStep } from "@/components/calculator/NextStep";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { marginFromPrice, priceFromMargin, priceFromMarkup } from "@/lib/calc/margin";

const SLUG = "calculadora-margen-ganancia";
type Mode = "price" | "margin" | "markup";
const INITIAL = { cost: "", price: "", margin: "", markup: "" };

export function MarginCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [mode, setMode] = useState<Mode>("price");
  const { money, pct } = usePrefs();

  const res = useMemo(() => {
    if (mode === "price") return marginFromPrice(nums.cost, nums.price);
    if (mode === "margin") return priceFromMargin(nums.cost, nums.margin);
    return priceFromMarkup(nums.cost, nums.markup);
  }, [mode, nums]);
  useTrackCalculation(SLUG, mode, res.ok, signature + mode);
  const general = generalError(res, ["cost", "price", "margin", "markup"]);

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="mg-data">
        <h2 id="mg-data" className="panel__title">
          Datos del producto
        </h2>
        <SegmentedControl
          label="¿Qué datos tienes?"
          value={mode}
          onChange={setMode}
          options={[
            { value: "price", label: "Costo y precio" },
            { value: "margin", label: "Costo y margen" },
            { value: "markup", label: "Costo y markup" },
          ]}
        />
        <div className="fields">
          <CurrencyInput label="Costo unitario" value={values.cost} onChange={set("cost")} error={fieldError(res, "cost")} />
          {mode === "price" ? (
            <CurrencyInput label="Precio de venta" value={values.price} onChange={set("price")} error={fieldError(res, "price")} />
          ) : null}
          {mode === "margin" ? (
            <PercentageInput
              label="Margen deseado"
              value={values.margin}
              onChange={set("margin")}
              error={fieldError(res, "margin")}
              hint="Porcentaje de ganancia sobre el precio de venta."
            />
          ) : null}
          {mode === "markup" ? (
            <PercentageInput
              label="Markup (recargo sobre el costo)"
              value={values.markup}
              onChange={set("markup")}
              error={fieldError(res, "markup")}
              hint="Porcentaje que se suma al costo."
            />
          ) : null}
        </div>
      </section>

      <div className="calc__result">
        {res.ok ? (
          <>
            {mode === "price" ? (
              <ResultCard
                label="Margen de ganancia"
                value={res.value.marginPct === null ? "—" : pct(res.value.marginPct)}
                tone={res.value.profit < 0 ? "negative" : "default"}
                note={res.value.profit < 0 ? "Estás vendiendo por debajo del costo." : undefined}
                animationKey={mode}
              >
                <ResultBreakdown
                  rows={[
                    { label: "Ganancia por unidad", value: money(res.value.profit) },
                    { label: "Margen (sobre el precio)", value: res.value.marginPct === null ? "—" : pct(res.value.marginPct) },
                    { label: "Markup (sobre el costo)", value: res.value.markupPct === null ? "No aplica (costo 0)" : pct(res.value.markupPct) },
                  ]}
                />
              </ResultCard>
            ) : (
              <ResultCard label="Precio de venta necesario" value={money(res.value.price)} animationKey={mode}>
                <ResultBreakdown
                  rows={[
                    { label: "Ganancia por unidad", value: money(res.value.profit) },
                    { label: "Margen equivalente", value: res.value.marginPct === null ? "—" : pct(res.value.marginPct) },
                    { label: "Markup equivalente", value: res.value.markupPct === null ? "—" : pct(res.value.markupPct) },
                  ]}
                />
              </ResultCard>
            )}
            {res.value.marginPct !== null && res.value.markupPct !== null && res.value.profit > 0 ? (
              <p className="field__hint" style={{ marginTop: 12 }}>
                Margen y markup no son lo mismo: la misma ganancia de {money(res.value.profit)} es un{" "}
                {pct(res.value.marginPct, 1)} del precio, pero un {pct(res.value.markupPct, 1)} del costo.
              </p>
            ) : null}
            <ShareResult
              toolSlug={SLUG}
              onReset={reset}
              getSummary={() =>
                [
                  `Costo: ${money(res.value.cost)} · Precio: ${money(res.value.price)}`,
                  `Ganancia: ${money(res.value.profit)}`,
                  `Margen: ${res.value.marginPct === null ? "—" : pct(res.value.marginPct)} · Markup: ${res.value.markupPct === null ? "—" : pct(res.value.markupPct)}`,
                ].join("\n")
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-precio-venta" label="Incluir comisiones e impuestos" />
            </div>
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Introduce los datos para ver el resultado.</ResultEmpty>
        )}
      </div>
    </div>
  );
}
