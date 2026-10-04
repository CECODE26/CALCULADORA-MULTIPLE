"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { NumberInput } from "@/components/ui/NumberInput";
import { Select, type Option } from "@/components/ui/Select";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { NextStep } from "@/components/calculator/NextStep";
import { fieldError, generalError, useFields } from "@/components/calculator/useFields";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { percentage, type PercentageMode } from "@/lib/calc/percentage";

const SLUG = "calculadora-porcentajes";

const modes: Option<PercentageMode>[] = [
  { value: "of", label: "¿Cuánto es X % de Y?" },
  { value: "whatPercent", label: "¿Qué porcentaje es X de Y?" },
  { value: "increase", label: "Aumentar un valor en X %" },
  { value: "decrease", label: "Reducir un valor en X %" },
  { value: "change", label: "Cambio porcentual entre dos valores" },
  { value: "originalBeforeIncrease", label: "Valor original antes de un aumento" },
  { value: "originalBeforeDecrease", label: "Valor original antes de un descuento" },
];

const fieldLabels: Record<PercentageMode, [string, string, boolean]> = {
  // [etiqueta A, etiqueta B, A es porcentaje]
  of: ["Porcentaje", "Del número", true],
  whatPercent: ["Valor (X)", "Total (Y)", false],
  increase: ["Aumento", "Valor inicial", true],
  decrease: ["Reducción", "Valor inicial", true],
  change: ["Valor inicial", "Valor final", false],
  originalBeforeIncrease: ["Aumento aplicado", "Valor final (después del aumento)", true],
  originalBeforeDecrease: ["Descuento aplicado", "Valor final (después del descuento)", true],
};

const INITIAL = { a: "15", b: "200" };

export function PercentageCalculator() {
  const { values, set, nums, reset, signature } = useFields(INITIAL);
  const [mode, setMode] = useState<PercentageMode>("of");
  const { num } = usePrefs();
  const res = useMemo(() => percentage(mode, nums.a, nums.b), [mode, nums]);
  useTrackCalculation(SLUG, mode, res.ok, signature + mode);

  const [labelA, labelB, aIsPct] = fieldLabels[mode];
  const n = (v: number) => num(v, 4);

  function explain(value: number): { text: string; formula: string } {
    const a = nums.a;
    const b = nums.b;
    switch (mode) {
      case "of":
        return { text: `El ${n(a)} % de ${n(b)} es ${n(value)}.`, formula: `${n(a)} / 100 × ${n(b)} = ${n(value)}` };
      case "whatPercent":
        return { text: `${n(a)} es el ${n(value)} % de ${n(b)}.`, formula: `${n(a)} / ${n(b)} × 100 = ${n(value)} %` };
      case "increase":
        return {
          text: `${n(b)} aumentado un ${n(a)} % es ${n(value)} (sube ${n(value - b)}).`,
          formula: `${n(b)} × (1 + ${n(a)} / 100) = ${n(value)}`,
        };
      case "decrease":
        return {
          text: `${n(b)} reducido un ${n(a)} % es ${n(value)} (baja ${n(b - value)}).`,
          formula: `${n(b)} × (1 − ${n(a)} / 100) = ${n(value)}`,
        };
      case "change":
        return {
          text: `De ${n(a)} a ${n(b)} hay ${value >= 0 ? "un aumento" : "una disminución"} del ${n(Math.abs(value))} %.`,
          formula: `(${n(b)} − ${n(a)}) / |${n(a)}| × 100 = ${n(value)} %`,
        };
      case "originalBeforeIncrease":
        return {
          text: `Si tras aumentar un ${n(a)} % el valor es ${n(b)}, el valor original era ${n(value)}.`,
          formula: `${n(b)} / (1 + ${n(a)} / 100) = ${n(value)}`,
        };
      case "originalBeforeDecrease":
        return {
          text: `Si tras un descuento del ${n(a)} % el valor es ${n(b)}, el valor original era ${n(value)}.`,
          formula: `${n(b)} / (1 − ${n(a)} / 100) = ${n(value)}`,
        };
    }
  }

  const ex = res.ok ? explain(res.value.value) : null;
  const general = generalError(res, ["a", "b"]);

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="pc-data">
        <h2 id="pc-data" className="panel__title">
          Cálculo de porcentajes
        </h2>
        <div className="fields">
          <Select label="¿Qué quieres calcular?" value={mode} options={modes} onChange={setMode} />
          <div className="fields fields--2">
            <NumberInput
              label={labelA}
              value={values.a}
              onChange={set("a")}
              error={fieldError(res, "a")}
              suffix={aIsPct ? "%" : undefined}
              allowNegative
            />
            <NumberInput label={labelB} value={values.b} onChange={set("b")} error={fieldError(res, "b")} allowNegative />
          </div>
        </div>
      </section>

      <div className="calc__result">
        {res.ok && ex ? (
          <>
            <ResultCard
              label="Resultado"
              value={res.value.unit === "percent" ? `${n(res.value.value)} %` : n(res.value.value)}
              note={ex.text}
              animationKey={mode}
            >
              <pre className="formula" style={{ marginBottom: 0 }} tabIndex={0} aria-label="Operación">
                <code>{ex.formula}</code>
              </pre>
            </ResultCard>
            <ShareResult toolSlug={SLUG} onReset={reset} getSummary={() => `${ex.text}\n${ex.formula}`} />
            <div className="btn-row" style={{ marginTop: 12 }}>
              <NextStep from={SLUG} to="calculadora-descuentos" label="Calcular descuentos" />
            </div>
          </>
        ) : general ? (
          <ErrorMessage>{general}</ErrorMessage>
        ) : (
          <ResultEmpty>Corrige los datos marcados para ver el resultado.</ResultEmpty>
        )}
      </div>
    </div>
  );
}
