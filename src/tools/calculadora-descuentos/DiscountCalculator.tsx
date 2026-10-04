"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Icon } from "@/components/ui/Icon";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { NextStep } from "@/components/calculator/NextStep";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { inverseDiscount, simpleDiscount, successiveDiscounts, type SuccessiveResult } from "@/lib/calc/discount";

const SLUG = "calculadora-descuentos";
type Mode = "simple" | "successive" | "inverse";
const MAX_DISCOUNTS = 5;
const INITIAL = { price: "", pct: "", original: "", final: "" };

export function DiscountCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [mode, setMode] = useState<Mode>("simple");
  const [steps, setSteps] = useState<string[]>(["", ""]);
  const { money, pct, parse } = usePrefs();

  const stepNums = useMemo(() => steps.map((s) => parse(s) ?? Number.NaN), [steps, parse]);
  const res = useMemo(() => {
    if (mode === "simple") return simpleDiscount(nums.price, nums.pct);
    if (mode === "successive") return successiveDiscounts(nums.price, stepNums);
    return inverseDiscount(nums.original, nums.final);
  }, [mode, nums, stepNums]);
  useTrackCalculation(SLUG, mode, res.ok, signature + mode + steps.join("|"));

  const successive = mode === "successive" && res.ok ? (res.value as SuccessiveResult) : null;
  const stepFields = steps.map((_, i) => `d${i}`);
  const general = generalError(res, ["price", "pct", "original", "final", ...stepFields]);

  function resetAll() {
    reset();
    setSteps(["", ""]);
  }

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="ds-data">
        <h2 id="ds-data" className="panel__title">
          Datos del descuento
        </h2>
        <SegmentedControl
          label="Tipo de cálculo"
          value={mode}
          onChange={setMode}
          options={[
            { value: "simple", label: "Simple" },
            { value: "successive", label: "Sucesivos" },
            { value: "inverse", label: "¿Qué % me descuentan?" },
          ]}
        />
        <div className="fields">
          {mode !== "inverse" ? (
            <CurrencyInput label="Precio original" value={values.price} onChange={set("price")} error={fieldError(res, "price")} />
          ) : null}
          {mode === "simple" ? (
            <PercentageInput label="Descuento" value={values.pct} onChange={set("pct")} error={fieldError(res, "pct")} />
          ) : null}
          {mode === "successive" ? (
            <>
              {steps.map((s, i) => (
                <div key={i} style={{ display: "flex", gap: 8, alignItems: "flex-end" }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <PercentageInput
                      label={`Descuento ${i + 1}`}
                      value={s}
                      onChange={(v) => setSteps((prev) => prev.map((p, j) => (j === i ? v : p)))}
                      error={fieldError(res, `d${i}`)}
                    />
                  </div>
                  {steps.length > 1 ? (
                    <button
                      type="button"
                      className="btn btn--ghost"
                      style={{ minWidth: 48, alignSelf: fieldError(res, `d${i}`) ? "center" : "flex-end" }}
                      aria-label={`Quitar descuento ${i + 1}`}
                      onClick={() => setSteps((prev) => prev.filter((_, j) => j !== i))}
                    >
                      <Icon name="close" size={18} />
                    </button>
                  ) : null}
                </div>
              ))}
              {steps.length < MAX_DISCOUNTS ? (
                <div>
                  <button type="button" className="btn btn--sm" onClick={() => setSteps((prev) => [...prev, ""])}>
                    <Icon name="plus" size={16} /> Añadir otro descuento
                  </button>
                </div>
              ) : null}
            </>
          ) : null}
          {mode === "inverse" ? (
            <>
              <CurrencyInput label="Precio original" value={values.original} onChange={set("original")} error={fieldError(res, "original")} />
              <CurrencyInput label="Precio que pagas" value={values.final} onChange={set("final")} error={fieldError(res, "final")} />
            </>
          ) : null}
        </div>
      </section>

      <div className="calc__result">
        {res.ok ? (
          <>
            {mode === "inverse" ? (
              <ResultCard label="Descuento real" value={pct(res.value.effectivePct)} animationKey={mode}>
                <ResultBreakdown
                  rows={[
                    { label: "Precio original", value: money(res.value.price) },
                    { label: "Ahorro", value: money(res.value.savings) },
                    { label: "Precio que pagas", value: money(res.value.finalPrice), total: true },
                  ]}
                />
              </ResultCard>
            ) : (
              <ResultCard label="Precio final" value={money(res.value.finalPrice)} animationKey={mode}>
                <ResultBreakdown
                  rows={[
                    { label: "Precio original", value: money(res.value.price) },
                    { label: "Ahorras", value: money(res.value.savings) },
                    { label: "Descuento efectivo", value: pct(res.value.effectivePct), total: true },
                  ]}
                />
                {successive && successive.steps.length > 1 ? (
                  <>
                    <ol className="result-card__note" style={{ paddingLeft: 20, marginTop: 12 }}>
                      {successive.steps.map((s, i) => (
                        <li key={i}>
                          −{pct(s.pct)} → {money(s.priceAfter)}
                        </li>
                      ))}
                    </ol>
                    <p className="result-card__note">
                      Los descuentos se aplican uno sobre otro: el descuento total es {pct(successive.effectivePct)}, no{" "}
                      {pct(successive.naiveSumPct)}.
                    </p>
                  </>
                ) : null}
              </ResultCard>
            )}
            <ShareResult
              toolSlug={SLUG}
              onReset={resetAll}
              getSummary={() =>
                `Precio original: ${money(res.value.price)} · Descuento efectivo: ${pct(res.value.effectivePct)}\nAhorro: ${money(res.value.savings)} · Precio final: ${money(res.value.finalPrice)}`
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-margen-ganancia" label="¿Cómo afecta a mi margen?" />
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
