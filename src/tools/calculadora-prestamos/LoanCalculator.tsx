"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { AffixSelect } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { NextStep } from "@/components/calculator/NextStep";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { rateTypeOptions, termUnitOptions } from "@/components/calculator/options";
import { ProportionBar } from "@/components/charts/ProportionBar";
import { DataTable } from "@/components/DataTable";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { calculateLoan } from "@/lib/calc/loan";
import type { RateType, TermUnit } from "@/lib/calc/rates";

const SLUG = "calculadora-prestamos";
const INITIAL = { principal: "", rate: "", term: "" };

export function LoanCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [rateType, setRateType] = useState<RateType>("nominal-annual");
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const { money, pct, num } = usePrefs();

  const res = useMemo(
    () => calculateLoan({ principal: nums.principal, ratePct: nums.rate, rateType, term: nums.term, termUnit }),
    [nums, rateType, termUnit],
  );
  useTrackCalculation(SLUG, "standard", res.ok, signature + rateType + termUnit);

  function resetAll() {
    reset();
    setRateType("nominal-annual");
    setTermUnit("years");
  }

  const general = generalError(res, ["principal", "rate", "term"]);

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="loan-data">
        <h2 id="loan-data" className="panel__title">
          Datos del préstamo
        </h2>
        <div className="fields">
          <CurrencyInput label="Monto del préstamo" value={values.principal} onChange={set("principal")} error={fieldError(res, "principal")} />
          <PercentageInput
            label="Tasa de interés"
            value={values.rate}
            onChange={set("rate")}
            error={fieldError(res, "rate")}
            hint="Usa la tasa que figura en tu oferta de crédito."
            endSlot={<AffixSelect label="Tipo de tasa" value={rateType} options={rateTypeOptions} onChange={setRateType} />}
          />
          <NumberInput
            label="Plazo"
            value={values.term}
            onChange={set("term")}
            error={fieldError(res, "term")}
            endSlot={<AffixSelect label="Unidad del plazo" value={termUnit} options={termUnitOptions} onChange={setTermUnit} />}
          />
        </div>
      </section>

      <div className="calc__result">
        {res.ok ? (
          <>
            <ResultCard
              label="Cuota mensual"
              value={money(res.value.payment)}
              note={`Durante ${res.value.months} ${res.value.months === 1 ? "mes" : "meses"}, con cuota fija (sistema francés).`}
              animationKey={rateType + termUnit}
            >
              <ResultBreakdown
                rows={[
                  { label: "Capital prestado", value: money(res.value.principal) },
                  { label: "Intereses totales", value: money(res.value.totalInterest) },
                  { label: "Total a pagar", value: money(res.value.totalPaid), total: true },
                  { label: "Tasa mensual aplicada", value: pct(res.value.monthlyRate * 100, 4) },
                  { label: "Tasa efectiva anual equivalente", value: pct(res.value.effectiveAnnualRate * 100, 2) },
                ]}
              />
              <ProportionBar
                label="Composición del total pagado"
                parts={[
                  { label: "Capital", value: res.value.principal, color: "var(--chart-1)", display: money(res.value.principal) },
                  { label: "Intereses", value: res.value.totalInterest, color: "var(--chart-2)", display: money(res.value.totalInterest) },
                ]}
              />
              {Math.abs(res.value.lastPayment - res.value.payment) >= 0.01 ? (
                <p className="result-card__note">
                  La última cuota es de {money(res.value.lastPayment)} por el ajuste de redondeo de céntimos.
                </p>
              ) : null}
            </ResultCard>
            <ShareResult
              toolSlug={SLUG}
              onReset={resetAll}
              getSummary={() =>
                [
                  `Préstamo de ${money(res.value.principal)} a ${res.value.months} meses (tasa ${num(nums.rate)} % ${rateTypeOptions.find((o) => o.value === rateType)?.label}).`,
                  `Cuota mensual: ${money(res.value.payment)}`,
                  `Intereses totales: ${money(res.value.totalInterest)}`,
                  `Total a pagar: ${money(res.value.totalPaid)}`,
                ].join("\n")
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="tabla-amortizacion" label="Ver tabla de amortización completa" />
              <NextStep from={SLUG} to="simulador-credito-ecuador" label="Simular con un banco de Ecuador" />
            </div>
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Introduce los datos para ver la cuota.</ResultEmpty>
        )}
      </div>

      {res.ok && res.value.years.length > 0 ? (
        <section className="calc__full" aria-labelledby="loan-years">
          <div className="table-toolbar">
            <h2 id="loan-years" style={{ fontSize: "1.15rem" }}>
              Resumen por año
            </h2>
          </div>
          <DataTable
            caption="Pagos agrupados por año"
            hideCaption
            rowKey={(r) => r.year}
            rows={res.value.years}
            columns={[
              { key: "y", header: "Año", cell: (r) => r.year, footer: "Total" },
              { key: "p", header: "Pagado", cell: (r) => money(r.paid), footer: money(res.value.totalPaid) },
              { key: "c", header: "Capital", cell: (r) => money(r.principal), footer: money(res.value.principal) },
              { key: "i", header: "Intereses", cell: (r) => money(r.interest), footer: money(res.value.totalInterest) },
              { key: "b", header: "Saldo al final", cell: (r) => money(r.balance) },
            ]}
          />
        </section>
      ) : null}
    </div>
  );
}
