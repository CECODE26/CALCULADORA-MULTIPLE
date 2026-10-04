"use client";

import { useMemo, useState } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { NumberInput } from "@/components/ui/NumberInput";
import { TimeInput } from "@/components/ui/TimeInput";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { ErrorMessage } from "@/components/ui/ErrorMessage";
import { ResultCard } from "@/components/calculator/ResultCard";
import { ResultBreakdown } from "@/components/calculator/ResultBreakdown";
import { ResultEmpty } from "@/components/calculator/ResultEmpty";
import { ShareResult } from "@/components/calculator/ShareResult";
import { fieldError, generalError } from "@/components/calculator/useFields";
import { useTrackCalculation } from "@/components/analytics/useTrackCalculation";
import { DataTable } from "@/components/DataTable";
import { shiftDuration, weeklyHours } from "@/lib/calc/hours";
import { formatDuration, formatHHMM } from "@/lib/format";

const SLUG = "calculadora-horas-trabajadas";
type Mode = "daily" | "weekly";
const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

interface DayState {
  enabled: boolean;
  start: string;
  end: string;
  brk: string;
}

const initialWeek = (): DayState[] =>
  DAYS.map((_, i) => ({ enabled: i < 5, start: "09:00", end: "18:00", brk: "60" }));

export function HoursCalculator() {
  const [mode, setMode] = useState<Mode>("daily");
  const [start, setStart] = useState("08:00");
  const [end, setEnd] = useState("17:00");
  const [brk, setBrk] = useState("60");
  const [week, setWeek] = useState<DayState[]>(initialWeek);
  const { parse, num } = usePrefs();

  const breakMin = (raw: string) => (raw.trim() === "" ? 0 : (parse(raw) ?? Number.NaN));

  const daily = useMemo(() => shiftDuration(start, end, breakMin(brk)), [start, end, brk]); // eslint-disable-line react-hooks/exhaustive-deps
  const weekly = useMemo(
    () => weeklyHours(week.map((d) => ({ enabled: d.enabled, start: d.start, end: d.end, breakMinutes: breakMin(d.brk) }))),
    [week], // eslint-disable-line react-hooks/exhaustive-deps
  );
  const res = mode === "daily" ? daily : weekly;
  useTrackCalculation(SLUG, mode, res.ok, JSON.stringify([mode, start, end, brk, week]));

  const dailyBreakError = fieldError(daily, "break");

  function updateDay(i: number, patch: Partial<DayState>) {
    setWeek((prev) => prev.map((d, j) => (j === i ? { ...d, ...patch } : d)));
  }

  function resetAll() {
    setStart("08:00");
    setEnd("17:00");
    setBrk("60");
    setWeek(initialWeek());
  }

  return (
    <div className="calc">
      <section className="panel calc__form" aria-labelledby="hr-data">
        <h2 id="hr-data" className="panel__title">
          Horario
        </h2>
        <SegmentedControl
          label="Modo"
          value={mode}
          onChange={setMode}
          options={[
            { value: "daily", label: "Un día" },
            { value: "weekly", label: "Semana" },
          ]}
        />
        {mode === "daily" ? (
          <div className="fields">
            <div className="fields fields--2">
              <TimeInput label="Hora de entrada" value={start} onChange={setStart} error={fieldError(daily, "start")} />
              <TimeInput label="Hora de salida" value={end} onChange={setEnd} error={fieldError(daily, "end")} />
            </div>
            <NumberInput label="Descanso" value={brk} onChange={setBrk} suffix="min" inputMode="numeric" optional error={dailyBreakError} />
          </div>
        ) : (
          <div className="stack">
            {week.map((d, i) => {
              const err = !weekly.ok && weekly.field?.startsWith(`day${i}-`) ? weekly.error : null;
              return (
                <fieldset
                  key={DAYS[i]}
                  style={{ border: "1px solid var(--border)", borderRadius: 10, padding: "8px 12px 12px", margin: 0, minWidth: 0 }}
                >
                  <legend style={{ padding: "0 4px" }}>
                    <label className="checkbox" style={{ minHeight: 32, padding: 0, fontWeight: 600 }}>
                      <input type="checkbox" checked={d.enabled} onChange={(e) => updateDay(i, { enabled: e.target.checked })} />
                      {DAYS[i]}
                    </label>
                  </legend>
                  {d.enabled ? (
                    <div className="day-grid">
                      <TimeInput compact label="Entrada" value={d.start} onChange={(v) => updateDay(i, { start: v })} />
                      <TimeInput compact label="Salida" value={d.end} onChange={(v) => updateDay(i, { end: v })} />
                      <div className="field">
                        <label className="field__hint" htmlFor={`brk-${i}`}>
                          Descanso (minutos)
                        </label>
                        <div className="field__control">
                          <input
                            id={`brk-${i}`}
                            className="field__input"
                            inputMode="numeric"
                            value={d.brk}
                            onChange={(e) => updateDay(i, { brk: e.target.value.replace(/[^\d]/g, "").slice(0, 4) })}
                          />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <p className="field__hint">Día libre</p>
                  )}
                  {err ? (
                    <p className="field__error" role="alert" style={{ marginTop: 8 }}>
                      {err}
                    </p>
                  ) : null}
                </fieldset>
              );
            })}
          </div>
        )}
      </section>

      <div className="calc__result">
        {mode === "daily" && daily.ok ? (
          <>
            <ResultCard
              label="Horas trabajadas"
              value={formatDuration(daily.value.minutes)}
              note={daily.value.crossesMidnight ? "Turno que cruza la medianoche: la salida es al día siguiente." : undefined}
              animationKey={mode}
            >
              <ResultBreakdown
                rows={[
                  { label: "Horas y minutos", value: `${daily.value.hours} h ${daily.value.remainderMinutes} min` },
                  { label: "Formato reloj", value: formatHHMM(daily.value.minutes) },
                  { label: "Horas decimales", value: num(daily.value.decimalHours, 2) },
                  { label: "Tiempo total (con descanso)", value: formatDuration(daily.value.grossMinutes) },
                ]}
              />
            </ResultCard>
            <ShareResult
              toolSlug={SLUG}
              onReset={resetAll}
              getSummary={() => `Jornada: ${formatDuration(daily.value.minutes)} (${num(daily.value.decimalHours, 2)} h decimales).`}
            />
          </>
        ) : null}
        {mode === "weekly" && weekly.ok ? (
          <>
            <ResultCard label="Total semanal" value={formatDuration(weekly.value.totalMinutes)} animationKey={mode}>
              <ResultBreakdown
                rows={[
                  { label: "Horas decimales", value: num(weekly.value.decimalHours, 2) },
                  { label: "Días trabajados", value: String(weekly.value.workedDays) },
                  { label: "Promedio por día trabajado", value: formatDuration(weekly.value.averageMinutes) },
                ]}
              />
            </ResultCard>
            <ShareResult
              toolSlug={SLUG}
              onReset={resetAll}
              getSummary={() =>
                `Total semanal: ${formatDuration(weekly.value.totalMinutes)} (${num(weekly.value.decimalHours, 2)} h) en ${weekly.value.workedDays} días.`
              }
            />
          </>
        ) : null}
        {!res.ok ? (
          generalError(res, ["start", "end", "break"]) && !(mode === "weekly" && res.field?.startsWith("day")) ? (
            <ErrorMessage>{res.error}</ErrorMessage>
          ) : (
            <ResultEmpty>Corrige los datos marcados para ver el total.</ResultEmpty>
          )
        ) : null}
      </div>

      {mode === "weekly" && weekly.ok ? (
        <div className="calc__full">
          <DataTable
            caption="Horas por día"
            rowKey={(_, i) => i}
            rows={DAYS.map((name, i) => ({ name, r: weekly.value.days[i] ?? null }))}
            columns={[
              { key: "d", header: "Día", cell: (x) => x.name, footer: "Total" },
              { key: "h", header: "Horas", cell: (x) => (x.r ? formatDuration(x.r.minutes) : "Libre"), footer: formatDuration(weekly.value.totalMinutes) },
              { key: "dec", header: "Decimal", cell: (x) => (x.r ? num(x.r.decimalHours, 2) : "—"), footer: num(weekly.value.decimalHours, 2) },
            ]}
          />
        </div>
      ) : null}
    </div>
  );
}
