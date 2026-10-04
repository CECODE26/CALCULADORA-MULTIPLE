"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { AffixSelect, Select } from "@/components/ui/Select";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { Icon } from "@/components/ui/Icon";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { NextStep } from "@/components/calculator/NextStep";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { frequencyAdjective, frequencyOptions, rateTypeOptions, termUnitOptions } from "@/components/calculator/options";
import { StackedBarChart } from "@/components/charts/Chart";
import { DataTable } from "@/components/DataTable";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { amortize, summarizeByYear, type AmortizationSystem } from "@/lib/calc/amortization";
import type { RateType, TermUnit } from "@/lib/calc/rates";
import { downloadCsv, toCsv } from "@/lib/csv";
import { round2 } from "@/lib/number";

const SLUG = "tabla-amortizacion";
const INITIAL = { principal: "", rate: "", term: "" };
const ROW_PREVIEW = 120;

export function AmortizationCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [rateType, setRateType] = useState<RateType>("nominal-annual");
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const [frequency, setFrequency] = useState("12");
  const [system, setSystem] = useState<AmortizationSystem>("french");
  const [showAll, setShowAll] = useState(false);
  const { money, pct } = usePrefs();
  const ppy = Number(frequency);

  const res = useMemo(
    () =>
      amortize({
        principal: nums.principal,
        ratePct: nums.rate,
        rateType,
        term: nums.term,
        termUnit,
        periodsPerYear: ppy,
        system,
      }),
    [nums, rateType, termUnit, ppy, system],
  );
  useTrackCalculation(SLUG, system, res.ok, signature + rateType + termUnit + frequency + system);

  const years = useMemo(() => (res.ok ? summarizeByYear(res.value.rows, ppy) : []), [res, ppy]);
  const adj = frequencyAdjective[frequency] ?? "";

  function resetAll() {
    reset();
    setRateType("nominal-annual");
    setTermUnit("years");
    setFrequency("12");
    setSystem("french");
    setShowAll(false);
  }

  function exportCsv() {
    if (!res.ok) return;
    const csv = toCsv(
      ["Cuota", "Pago", "Capital", "Interés", "Saldo"],
      res.value.rows.map((r) => [r.period, r.payment.toFixed(2), r.principal.toFixed(2), r.interest.toFixed(2), r.balance.toFixed(2)]),
    );
    downloadCsv("tabla-amortizacion.csv", csv);
  }

  const general = generalError(res, ["principal", "rate", "term"]);
  const rows = res.ok ? (showAll ? res.value.rows : res.value.rows.slice(0, ROW_PREVIEW)) : [];

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="amort-data">
        <h2 id="amort-data" className="panel__title">
          Datos del préstamo
        </h2>
        <SegmentedControl
          label="Sistema de amortización"
          value={system}
          onChange={setSystem}
          options={[
            { value: "french", label: "Cuota fija (francés)" },
            { value: "german", label: "Capital fijo (alemán)" },
          ]}
        />
        <div className="fields">
          <CurrencyInput label="Capital" value={values.principal} onChange={set("principal")} error={fieldError(res, "principal")} />
          <PercentageInput
            label="Tasa de interés"
            value={values.rate}
            onChange={set("rate")}
            error={fieldError(res, "rate")}
            endSlot={<AffixSelect label="Tipo de tasa" value={rateType} options={rateTypeOptions} onChange={setRateType} />}
          />
          <NumberInput
            label="Plazo"
            value={values.term}
            onChange={set("term")}
            error={fieldError(res, "term")}
            endSlot={<AffixSelect label="Unidad del plazo" value={termUnit} options={termUnitOptions} onChange={setTermUnit} />}
          />
          <Select label="Frecuencia de pago" value={frequency} options={frequencyOptions} onChange={setFrequency} />
        </div>
      </section>

      <div className="calc__result">
        {res.ok ? (
          <>
            <ResultCard
              label={system === "french" ? `Cuota ${adj}` : `Primera cuota ${adj}`}
              value={money(res.value.firstPayment)}
              note={
                system === "french"
                  ? `${res.value.periods} pagos iguales.`
                  : `Las cuotas bajan hasta ${money(res.value.lastPayment)} en el último pago (${res.value.periods} pagos).`
              }
              animationKey={system + frequency}
            >
              <ResultBreakdown
                rows={[
                  { label: "Capital", value: money(res.value.principal) },
                  { label: "Intereses totales", value: money(res.value.totalInterest) },
                  { label: "Total pagado", value: money(res.value.totalPaid), total: true },
                  { label: "Tasa por periodo", value: pct(res.value.periodicRate * 100, 4) },
                  { label: "Tasa efectiva anual", value: pct(res.value.effectiveAnnualRate * 100, 2) },
                ]}
              />
            </ResultCard>
            <ShareResult
              toolSlug={SLUG}
              onReset={resetAll}
              getSummary={() =>
                [
                  `Préstamo de ${money(res.value.principal)}, ${res.value.periods} pagos (${system === "french" ? "cuota fija" : "capital fijo"}).`,
                  `${system === "french" ? "Cuota" : "Primera cuota"}: ${money(res.value.firstPayment)}`,
                  `Intereses totales: ${money(res.value.totalInterest)}`,
                  `Total pagado: ${money(res.value.totalPaid)}`,
                ].join("\n")
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-prestamos" label="Comparar cuotas" />
              <NextStep from={SLUG} to="simulador-credito-ecuador" label="Simular con un banco de Ecuador" />
            </div>
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Introduce los datos para generar la tabla.</ResultEmpty>
        )}
      </div>

      {res.ok ? (
        <section className="calc__full" aria-labelledby="amort-table">
          {years.length > 1 ? (
            <StackedBarChart
              title="Capital e intereses pagados por año"
              description={`Gráfico de ${years.length} años. En los primeros años pesan más los intereses y al final, el capital.`}
              labels={years.map((y) => `Año ${y.year}`)}
              series={[
                { name: "Capital", color: "var(--chart-1)", values: years.map((y) => y.principal) },
                { name: "Intereses", color: "var(--chart-2)", values: years.map((y) => y.interest) },
              ]}
            />
          ) : null}
          <div className="table-toolbar">
            <h2 id="amort-table" style={{ fontSize: "1.15rem" }}>
              Tabla de amortización
            </h2>
            <button type="button" className="btn btn--sm" onClick={exportCsv}>
              <Icon name="table" size={16} /> Descargar CSV
            </button>
          </div>
          <DataTable
            caption={`Tabla de amortización de ${res.value.periods} pagos`}
            hideCaption
            scroll
            rowKey={(r) => r.period}
            rows={rows}
            columns={[
              { key: "n", header: "Cuota", cell: (r) => r.period, footer: "Total" },
              { key: "p", header: "Pago", cell: (r) => money(r.payment), footer: money(res.value.totalPaid) },
              { key: "c", header: "Capital", cell: (r) => money(r.principal), footer: money(round2(res.value.principal)) },
              { key: "i", header: "Interés", cell: (r) => money(r.interest), footer: money(res.value.totalInterest) },
              { key: "s", header: "Saldo", cell: (r) => money(r.balance) },
            ]}
          />
          {res.value.rows.length > ROW_PREVIEW && !showAll ? (
            <div className="btn-row" style={{ marginTop: 12 }}>
              <button type="button" className="btn btn--sm" onClick={() => setShowAll(true)}>
                Mostrar los {res.value.rows.length} pagos
              </button>
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
