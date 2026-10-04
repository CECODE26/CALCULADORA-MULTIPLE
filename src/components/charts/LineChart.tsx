"use client";

import { usePrefs } from "@/components/PreferencesProvider";
import { useWidth } from "./useWidth";
import { compact, niceMax, niceMin, ticks } from "./scale";

export interface Series {
  name: string;
  color: string;
  values: number[];
  /** Relleno suave bajo la línea */
  area?: boolean;
  dashed?: boolean;
}

interface LineChartProps {
  title: string;
  /** Descripción textual del gráfico para lectores de pantalla */
  description: string;
  labels: (string | number)[];
  series: Series[];
  xLabel?: string;
  /** Punto destacado opcional (p. ej. punto de equilibrio) */
  marker?: { x: number; y: number; label: string };
  /** Valor numérico del eje X para cada etiqueta (por defecto, el índice) */
  height?: number;
}

const PAD = { top: 12, right: 12, bottom: 28, left: 52 };

/** Gráfico de líneas SVG ligero (sin librerías). */
export function LineChart({ title, description, labels, series, xLabel, marker, height = 260 }: LineChartProps) {
  const { locale } = usePrefs();
  const { ref, width: W } = useWidth<HTMLElement>();
  const H = height;
  const all = series.flatMap((s) => s.values).filter(Number.isFinite);
  if (labels.length < 2 || all.length === 0) return null;

  const yMax = niceMax(Math.max(...all, marker?.y ?? 0));
  const yMin = niceMin(Math.min(0, ...all));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const x = (i: number) => PAD.left + (i / (labels.length - 1)) * innerW;
  const y = (v: number) => PAD.top + innerH - ((v - yMin) / (yMax - yMin || 1)) * innerH;
  const yTicks = ticks(yMin, yMax, 4);
  const step = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(W / 70))));

  return (
    <figure className="chart" ref={ref}>
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. ${description}`} preserveAspectRatio="xMidYMid meet">
        {yTicks.map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" strokeWidth={1} />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
              {compact(t, locale)}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % step === 0 || i === labels.length - 1 ? (
            <text key={i} x={x(i)} y={H - 8} textAnchor="middle">
              {l}
            </text>
          ) : null,
        )}
        {series.map((s) => {
          const pts = s.values.map((v, i) => `${x(i).toFixed(1)},${y(Number.isFinite(v) ? v : 0).toFixed(1)}`);
          const d = `M${pts.join("L")}`;
          return (
            <g key={s.name}>
              {s.area ? (
                <path
                  d={`${d}L${x(s.values.length - 1).toFixed(1)},${y(Math.max(yMin, 0))}L${x(0)},${y(Math.max(yMin, 0))}Z`}
                  fill={s.color}
                  opacity={0.1}
                />
              ) : null}
              <path
                d={d}
                fill="none"
                stroke={s.color}
                strokeWidth={2.25}
                strokeLinejoin="round"
                strokeLinecap="round"
                strokeDasharray={s.dashed ? "6 5" : undefined}
              />
            </g>
          );
        })}
        {marker && Number.isFinite(marker.x) && Number.isFinite(marker.y) ? (
          <g>
            <line
              x1={x(marker.x)}
              x2={x(marker.x)}
              y1={PAD.top}
              y2={PAD.top + innerH}
              stroke="var(--text-subtle)"
              strokeDasharray="3 4"
            />
            <circle cx={x(marker.x)} cy={y(marker.y)} r={5} fill="var(--surface)" stroke="var(--text)" strokeWidth={2} />
            <text
              x={x(marker.x) + (marker.x > (labels.length - 1) * 0.7 ? -8 : 8)}
              y={PAD.top + 12}
              textAnchor={marker.x > (labels.length - 1) * 0.7 ? "end" : "start"}
              style={{ fill: "var(--text)", fontWeight: 600 }}
            >
              {marker.label}
            </text>
          </g>
        ) : null}
        {xLabel ? (
          <text x={W - PAD.right} y={H - 8} textAnchor="end" className="visually-hidden">
            {xLabel}
          </text>
        ) : null}
      </svg>
      <ul className="chart__legend" aria-hidden="true">
        {series.map((s) => (
          <li key={s.name}>
            <span className="chart__swatch" style={{ background: s.color }} />
            {s.name}
          </li>
        ))}
      </ul>
    </figure>
  );
}
