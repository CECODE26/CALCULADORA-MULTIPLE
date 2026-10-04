"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { CurrencyInput } from "@/components/ui/CurrencyInput";
import { PercentageInput } from "@/components/ui/PercentageInput";
import { NumberInput } from "@/components/ui/NumberInput";
import { AffixSelect } from "@/components/ui/Select";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
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
import { projectSavings, savingsGoal } from "@/lib/calc/savings";
import type { TermUnit } from "@/lib/calc/rates";

const SLUG = "calculadora-ahorro";
type Mode = "have" | "need";
const INITIAL = { initial: "", monthly: "", rate: "", goal: "", saved: "", term: "" };

export function SavingsCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [mode, setMode] = useState<Mode>("have");
  const [termUnit, setTermUnit] = useState<TermUnit>("years");
  const { money, num } = usePrefs();
  // Rendimiento opcional: vacío = 0 %
  const rate = values.rate.trim() === "" ? 0 : nums.rate;
  // Ahorro inicial / actual opcional: vacío = 0
  const initial = values.initial.trim() === "" ? 0 : nums.initial;
  const saved = values.saved.trim() === "" ? 0 : nums.saved;

  const res = useMemo(
    () =>
      mode === "have"
        ? projectSavings({ initial, monthly: nums.monthly, ratePct: rate, term: nums.term, termUnit })
        : savingsGoal({ goal: nums.goal, current: saved, ratePct: rate, term: nums.term, termUnit }),
    [mode, nums, rate, initial, saved, termUnit],
  );
  useTrackCalculation(SLUG, mode, res.ok, signature + mode + termUnit);

  const projection = res.ok ? ("projection" in res.value ? res.value.projection : res.value) : null;
  const termText = `${num(nums.term)} ${termUnit === "years" ? (nums.term === 1 ? "año" : "años") : nums.term === 1 ? "mes" : "meses"}`;
  const general = generalError(res, ["initial", "monthly", "goal", "current", "saved", "rate", "term"]);

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="sv-data">
        <h2 id="sv-data" className="panel__title">
          Tu plan de ahorro
        </h2>
        <SegmentedControl
          label="¿Qué quieres calcular?"
          value={mode}
          onChange={setMode}
          options={[
            { value: "have", label: "¿Cuánto tendré?" },
            { value: "need", label: "¿Cuánto necesito ahorrar?" },
          ]}
        />
        <div className="fields">
          {mode === "have" ? (
            <>
              <CurrencyInput label="Ahorro inicial" optional value={values.initial} onChange={set("initial")} error={fieldError(res, "initial")} />
              <CurrencyInput label="Aporte mensual" value={values.monthly} onChange={set("monthly")} error={fieldError(res, "monthly")} />
            </>
          ) : (
            <>
              <CurrencyInput label="Objetivo de ahorro" value={values.goal} onChange={set("goal")} error={fieldError(res, "goal")} />
              <CurrencyInput label="Ahorro actual" optional value={values.saved} onChange={set("saved")} error={fieldError(res, "current")} />
            </>
          )}
          <NumberInput
            label="Plazo"
            value={values.term}
            onChange={set("term")}
            error={fieldError(res, "term")}
            endSlot={<AffixSelect label="Unidad del plazo" value={termUnit} options={termUnitOptions} onChange={setTermUnit} />}
          />
          <PercentageInput
            label="Rendimiento anual estimado"
            optional
            placeholder="0"
            value={values.rate}
            onChange={set("rate")}
            error={fieldError(res, "rate")}
            hint="Déjalo vacío si guardas el dinero sin intereses."
          />
        </div>
      </section>

      <div className="calc__result">
        {res.ok && projection ? (
          <>
            {"monthlyRequired" in res.value ? (
              <ResultCard
                label="Aporte mensual necesario"
                value={money(res.value.monthlyRequired)}
                note={
                  res.value.alreadyReached
                    ? "Ya alcanzas tu objetivo con lo que tienes ahorrado."
                    : `Durante ${termText} para reunir ${money(nums.goal)}.`
                }
                animationKey={mode}
              >
                <ResultBreakdown
                  rows={[
                    { label: "Total aportado", value: money(projection.totalContributed) },
                    { label: "Rendimiento estimado", value: money(projection.totalInterest) },
                    { label: "Total al final", value: money(projection.finalBalance), total: true },
                    ...(rate > 0
                      ? [{ label: "Aporte necesario sin rendimiento", value: money(res.value.monthlyWithoutReturn) }]
                      : []),
                  ]}
                />
              </ResultCard>
            ) : (
              <ResultCard label="Tendrás aproximadamente" value={money(projection.finalBalance)} note={`Al cabo de ${termText}.`} animationKey={mode}>
                <ResultBreakdown
                  rows={[
                    { label: "Total aportado", value: money(projection.totalContributed) },
                    { label: "Rendimiento estimado", value: money(projection.totalInterest) },
                    { label: "Total", value: money(projection.finalBalance), total: true },
                  ]}
                />
              </ResultCard>
            )}
            {rate > 0 ? (
              <p className="field__hint" style={{ marginTop: 12 }}>
                El rendimiento es una estimación con capitalización mensual y no está garantizado.
              </p>
            ) : null}
            <ShareResult
              toolSlug={SLUG}
              onReset={() => {
                reset();
                setTermUnit("years");
              }}
              getSummary={() =>
                "monthlyRequired" in res.value
                  ? `Para ahorrar ${money(nums.goal)} en ${termText} necesito apartar ${money(res.value.monthlyRequired)} al mes.`
                  : `Ahorrando ${money(nums.monthly)} al mes durante ${termText} tendré unos ${money(projection.finalBalance)}.`
              }
            />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-interes-compuesto" label="Simular con interés compuesto" />
            </div>
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Introduce los datos para ver tu plan.</ResultEmpty>
        )}
      </div>

      {projection && projection.years.length > 0 ? (
        <GrowthBreakdown
          years={projection.years}
          initial={mode === "have" ? (Number.isFinite(initial) ? initial : 0) : Number.isFinite(saved) ? saved : 0}
          title="Tu ahorro año a año"
        />
      ) : null}
    </div>
  );
}
