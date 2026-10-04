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
import { calculateTax, type TaxMode } from "@/lib/calc/tax";

const SLUG = "calculadora-iva";
/** Valores de acceso rápido. NO se asocian a ningún país: el usuario debe verificar la tasa vigente. */
const QUICK_RATES = ["5", "8", "10", "12", "15", "16", "18", "19", "21"];
const INITIAL = { amount: "100", rate: "" };

export function TaxCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [mode, setMode] = useState<TaxMode>("add");
  const { money, pct, num } = usePrefs();
  const res = useMemo(() => calculateTax(mode, nums.amount, nums.rate), [mode, nums]);
  useTrackCalculation(SLUG, mode, res.ok, signature + mode);
  const general = generalError(res, ["amount", "rate"]);
  const rateMissing = values.rate.trim() === "";

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="iva-data">
        <h2 id="iva-data" className="panel__title">
          Importe y tasa
        </h2>
        <SegmentedControl
          label="¿Qué quieres hacer?"
          value={mode}
          onChange={setMode}
          options={[
            { value: "add", label: "Agregar impuesto" },
            { value: "remove", label: "Quitar impuesto" },
            { value: "included", label: "Impuesto incluido" },
          ]}
        />
        <div className="fields">
          <CurrencyInput
            label={mode === "add" ? "Importe sin impuesto (base)" : "Importe con impuesto (total)"}
            value={values.amount}
            onChange={set("amount")}
            error={fieldError(res, "amount")}
          />
          <PercentageInput
            label="Tasa del impuesto"
            value={values.rate}
            onChange={set("rate")}
            error={rateMissing ? null : fieldError(res, "rate")}
            hint="Escribe la tasa vigente para tu caso. Verifícala en la fuente oficial de tu país."
          />
          <div>
            <p className="field__hint" id="quick-rates" style={{ marginBottom: 6 }}>
              Tasas habituales en distintos países (atajo, no indica la vigente):
            </p>
            <div className="chips" role="group" aria-labelledby="quick-rates">
              {QUICK_RATES.map((r) => (
                <button key={r} type="button" className="chip" aria-pressed={values.rate === r} onClick={() => set("rate")(r)}>
                  {r} %
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="calc__result">
        {res.ok ? (
          <>
            <ResultCard
              label={mode === "add" ? "Total con impuesto" : mode === "remove" ? "Base sin impuesto" : "Impuesto incluido en el precio"}
              value={money(mode === "add" ? res.value.total : mode === "remove" ? res.value.base : res.value.tax)}
              note={
                mode === "included"
                  ? `Con una tasa del ${num(nums.rate)} %, el impuesto representa el ${pct(res.value.shareOfTotalPct)} del precio final.`
                  : undefined
              }
              animationKey={mode}
            >
              <ResultBreakdown
                rows={[
                  { label: "Base imponible", value: money(res.value.base) },
                  { label: `Impuesto (${num(nums.rate)} %)`, value: money(res.value.tax) },
                  { label: "Total", value: money(res.value.total), total: true },
                ]}
              />
            </ResultCard>
            <ShareResult
              toolSlug={SLUG}
              onReset={reset}
              getSummary={() =>
                `Base: ${money(res.value.base)} · Impuesto (${num(nums.rate)} %): ${money(res.value.tax)} · Total: ${money(res.value.total)}`
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-precio-venta" label="Calcular precio de venta" />
            </div>
          </>
        ) : rateMissing ? (
          <ResultEmpty>Introduce la tasa del impuesto para ver el resultado.</ResultEmpty>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Corrige los datos marcados para ver el resultado.</ResultEmpty>
        )}
      </div>
    </div>
  );
}
