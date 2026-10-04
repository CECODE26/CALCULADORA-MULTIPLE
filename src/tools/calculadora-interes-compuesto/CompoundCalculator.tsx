"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { AffixSelect, Select, type Option } from "@/components/ui/Select";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { Checkbox } from "@/components/ui/Checkbox";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { NextStep } from "@/components/calculator/NextStep";
import { GrowthBreakdown } from "@/components/calculator/GrowthBreakdown";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { termUnitOptions } from "@/components/calculator/options";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { compoundInterest, requiredContribution, type CompoundResult } from "@/lib/calc/compound";
import type { TermUnit } from "@/lib/calc/rates";

const SLUG = "calculadora-interes-compuesto";
type Mode = "project" | "goal";

const compoundOptions: Option<string>[] = [
  { value: "12", label: "Mensual" },
  { value: "365", label: "Diaria" },
  { value: "4", label: "Trimestral" },
  { value: "2", label: "Semestral" },
  { value: "1", label: "Anual" },
];
const contributionOptions: Option<string>[] = [
  { value: "12", label: "Mensual" },
  { value: "26", label: "Cada 2 semanas" },
  { value: "52", label: "Semanal" },
  { value: "4", label: "Trimestral" },
  { value: "2", label: "Semestral" },
  { value: "1", label: "Anual" },
];
const contributionNoun: Record<string, string> = {
  "12": "mensual",
  "26": "cada 2 semanas",
  "52": "semanal",
  "4": "trimestral",
  "2": "semestral",
  "1": "anual",
};

const INITIAL = { initial: "5000", contribution: "200", goal: "100000", rate: "7", term: "10" };

export function CompoundCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [mode, setMode] = useState<Mode>("project");
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const [compounds, setCompounds] = useState("12");
  const [contribFreq, setContribFreq] = useState("12");
  const [begin, setBegin] = useState(false);
  const { money, pct, num } = usePrefs();

  const common = {
    initial: nums.initial,
    ratePct: nums.rate,
    term: nums.term,
    termUnit,
    compoundsPerYear: Number(compounds),
    contributionsPerYear: Number(contribFreq),
    timing: begin ? ("begin" as const) : ("end" as const),
  };

  const project = useMemo(
    () => (mode === "project" ? compoundInterest({ ...common, contribution: nums.contribution }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, nums, termUnit, compounds, contribFreq, begin],
  );
  const goal = useMemo(
    () => (mode === "goal" ? requiredContribution({ ...common, goal: nums.goal }) : null),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [mode, nums, termUnit, compounds, contribFreq, begin],
  );
  const res = (mode === "project" ? project : goal)!;
  useTrackCalculation(SLUG, mode, res.ok, signature + mode + termUnit + compounds + contribFreq + begin);

  const projection: CompoundResult | null = res.ok ? ("projection" in res.value ? res.value.projection : res.value) : null;
  const freq = contributionNoun[contribFreq] ?? "";

  function resetAll() {
    reset();
    setTermUnit("years");
    setCompounds("12");
    setContribFreq("12");
    setBegin(false);
  }

  const fields = ["initial", "contribution", "goal", "rate", "term"];
  const general = generalError(res, fields);

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="ci-data">
        <h2 id="ci-data" className="panel__title">
          Datos de la inversión
        </h2>
        <SegmentedControl
          label="¿Qué quieres calcular?"
          value={mode}
          onChange={setMode}
          options={[
            { value: "project", label: "¿Cuánto tendré?" },
            { value: "goal", label: "Aporte para una meta" },
          ]}
        />
        <div className="fields">
          {mode === "goal" ? (
            <CurrencyInput label="Meta a alcanzar" value={values.goal} onChange={set("goal")} error={fieldError(res, "goal")} />
          ) : null}
          <CurrencyInput label="Capital inicial" value={values.initial} onChange={set("initial")} error={fieldError(res, "initial")} />
          {mode === "project" ? (
            <CurrencyInput
              label="Aportación periódica"
              optional
              value={values.contribution}
              onChange={set("contribution")}
              error={fieldError(res, "contribution")}
            />
          ) : null}
          <PercentageInput
            label="Tasa de interés anual"
            value={values.rate}
            onChange={set("rate")}
            error={fieldError(res, "rate")}
            hint="Tasa nominal anual estimada. No es un rendimiento garantizado."
          />
          <NumberInput
            label="Plazo"
            value={values.term}
            onChange={set("term")}
            error={fieldError(res, "term")}
            endSlot={<AffixSelect label="Unidad del plazo" value={termUnit} options={termUnitOptions} onChange={setTermUnit} />}
          />
          <div className="fields fields--2">
            <Select label="Capitalización" value={compounds} options={compoundOptions} onChange={setCompounds} />
            <Select label="Frecuencia de aportación" value={contribFreq} options={contributionOptions} onChange={setContribFreq} />
          </div>
          <Checkbox label="Aportar al inicio de cada periodo" checked={begin} onChange={setBegin} />
        </div>
      </section>

      <div className="calc__result">
        {res.ok && projection ? (
          <>
            {mode === "goal" && "requiredContribution" in res.value ? (
              <ResultCard
                label={`Aportación ${freq} necesaria`}
                value={res.value.alreadyReached ? money(0) : money(res.value.requiredContribution)}
                note={
                  res.value.alreadyReached
                    ? "Con tu capital inicial y la tasa indicada ya alcanzarías la meta sin aportar más."
                    : `Durante ${projection.contributionsCount} aportaciones para llegar a ${money(nums.goal)}.`
                }
                animationKey={mode}
              >
                <ResultBreakdown
                  rows={[
                    { label: "Total aportado", value: money(projection.totalContributed) },
                    { label: "Rendimiento estimado", value: money(projection.totalInterest) },
                    { label: "Saldo final estimado", value: money(projection.finalBalance), total: true },
                  ]}
                />
              </ResultCard>
            ) : (
              <ResultCard label="Saldo final estimado" value={money(projection.finalBalance)} animationKey={mode}>
                <ResultBreakdown
                  rows={[
                    { label: "Total aportado", value: money(projection.totalContributed) },
                    { label: "Rendimiento (intereses)", value: money(projection.totalInterest) },
                    {
                      label: "Crecimiento sobre lo aportado",
                      value: projection.growthPct === null ? "—" : pct(projection.growthPct, 2),
                    },
                    { label: "Tasa efectiva anual", value: pct(projection.effectiveAnnualRate * 100, 2) },
                  ]}
                />
              </ResultCard>
            )}
            <ShareResult
              toolSlug={SLUG}
              onReset={resetAll}
              getSummary={() =>
                [
                  mode === "goal" && "requiredContribution" in res.value
                    ? `Para llegar a ${money(nums.goal)} en ${num(nums.term)} ${termUnit === "years" ? "años" : "meses"}: aportación ${freq} de ${money(res.value.requiredContribution)}.`
                    : `Saldo final estimado: ${money(projection.finalBalance)} en ${num(nums.term)} ${termUnit === "years" ? "años" : "meses"}.`,
                  `Total aportado: ${money(projection.totalContributed)}`,
                  `Rendimiento estimado (${num(nums.rate)} % anual): ${money(projection.totalInterest)}`,
                  "Estimación no garantizada.",
                ].join("\n")
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-ahorro" label="Planificar ahorro mensual" />
            </div>
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Corrige los datos marcados para ver la proyección.</ResultEmpty>
        )}
      </div>

      {projection ? <GrowthBreakdown years={projection.years} initial={Number.isFinite(nums.initial) ? nums.initial : 0} /> : null}
    </div>
  );
}
