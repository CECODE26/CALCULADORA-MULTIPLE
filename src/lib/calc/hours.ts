import { round2 } from "@/lib/number";
import { fail, ok, type CalcResult } from "./types";

const DAY = 24 * 60;

/** "HH:MM" (24 h) → minutos desde medianoche, o null si no es válido. */
export function parseTime(value: string): number | null {
  const m = /^(\d{1,2}):(\d{2})$/.exec(value.trim());
  if (!m) return null;
  const h = Number(m[1]);
  const min = Number(m[2]);
  if (h > 23 || min > 59) return null;
  return h * 60 + min;
}

export interface ShiftResult {
  /** Minutos trabajados (descontado el descanso) */
  minutes: number;
  /** Minutos totales entre entrada y salida */
  grossMinutes: number;
  hours: number;
  remainderMinutes: number;
  decimalHours: number;
  crossesMidnight: boolean;
}

/** Jornada diaria. Si la salida es anterior a la entrada, el turno cruza la medianoche. */
export function shiftDuration(start: string, end: string, breakMinutes: number): CalcResult<ShiftResult> {
  const s = parseTime(start);
  if (s === null) return fail("Introduce una hora de entrada válida (HH:MM).", "start");
  const e = parseTime(end);
  if (e === null) return fail("Introduce una hora de salida válida (HH:MM).", "end");
  if (!Number.isFinite(breakMinutes)) return fail("Introduce los minutos de descanso (0 si no hubo).", "break");
  const brk = breakMinutes;
  if (brk < 0) return fail("El descanso no puede ser negativo.", "break");
  if (s === e) return fail("La entrada y la salida son iguales. Revisa las horas.", "end");
  const crossesMidnight = e < s;
  const gross = crossesMidnight ? e + DAY - s : e - s;
  if (brk >= gross) return fail("El descanso es igual o mayor que la jornada.", "break");
  const minutes = Math.round(gross - brk);
  return ok({
    minutes,
    grossMinutes: gross,
    hours: Math.floor(minutes / 60),
    remainderMinutes: minutes % 60,
    decimalHours: round2(minutes / 60),
    crossesMidnight,
  });
}

export interface DayInput {
  enabled: boolean;
  start: string;
  end: string;
  breakMinutes: number;
}

export interface WeekResult {
  days: (ShiftResult | null)[];
  totalMinutes: number;
  workedDays: number;
  averageMinutes: number;
  decimalHours: number;
  /** Índice del primer día con error y su mensaje */
  error?: { day: number; message: string; field?: string };
}

export function weeklyHours(days: DayInput[]): CalcResult<WeekResult> {
  const results: (ShiftResult | null)[] = [];
  let total = 0;
  let worked = 0;
  for (let i = 0; i < days.length; i++) {
    const d = days[i]!;
    if (!d.enabled) {
      results.push(null);
      continue;
    }
    const r = shiftDuration(d.start, d.end, d.breakMinutes);
    if (!r.ok) return fail(r.error, `day${i}-${r.field ?? ""}`);
    results.push(r.value);
    total += r.value.minutes;
    worked++;
  }
  if (worked === 0) return fail("Activa al menos un día trabajado.", "days");
  return ok({
    days: results,
    totalMinutes: total,
    workedDays: worked,
    averageMinutes: Math.round(total / worked),
    decimalHours: round2(total / 60),
  });
}
