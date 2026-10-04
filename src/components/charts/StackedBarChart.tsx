"use client";

import { usePrefs } from "@/components/PreferencesProvider";
import { useWidth } from "./useWidth";
import { compact, niceMax, ticks } from "./scale";

export interface BarSeries {
  name: string;
  color: string;
  values: number[];
}

interface StackedBarChartProps {
  title: string;
  description: string;
  labels: (string | number)[];
  series: BarSeries[];
  height?: number;
}

const PAD = { top: 12, right: 8, bottom: 28, left: 52 };

/** Barras apiladas SVG (valores no negativos). */
export function StackedBarChart({ title, description, labels, series, height = 240 }: StackedBarChartProps) {
  const { locale } = usePrefs();
  const { ref, width: W } = useWidth<HTMLElement>();
  const H = height;
  if (labels.length === 0) return null;
  const totals = labels.map((_, i) => series.reduce((acc, s) => acc + Math.max(0, s.values[i] ?? 0), 0));
  const yMax = niceMax(Math.max(...totals));
  const innerW = W - PAD.left - PAD.right;
  const innerH = H - PAD.top - PAD.bottom;
  const band = innerW / labels.length;
  const barW = Math.max(2, Math.min(36, band * 0.68));
  const y = (v: number) => PAD.top + innerH - (v / yMax) * innerH;
  const step = Math.max(1, Math.ceil(labels.length / Math.max(3, Math.floor(W / 64))));

  return (
    <figure className="chart" ref={ref}>
      <figcaption>{title}</figcaption>
      <svg viewBox={`0 0 ${W} ${H}`} role="img" aria-label={`${title}. ${description}`}>
        {ticks(0, yMax, 4).map((t) => (
          <g key={t}>
            <line x1={PAD.left} x2={W - PAD.right} y1={y(t)} y2={y(t)} stroke="var(--chart-grid)" />
            <text x={PAD.left - 8} y={y(t) + 4} textAnchor="end">
              {compact(t, locale)}
            </text>
          </g>
        ))}
        {labels.map((l, i) => {
          let acc = 0;
          const cx = PAD.left + band * i + band / 2;
          return (
            <g key={i}>
              {series.map((s) => {
                const v = Math.max(0, s.values[i] ?? 0);
                const top = y(acc + v);
                const h = y(acc) - top;
                acc += v;
                return h > 0 ? <rect key={s.name} x={cx - barW / 2} y={top} width={barW} height={h} fill={s.color} rx={1.5} /> : null;
              })}
              {i % step === 0 || i === labels.length - 1 ? (
                <text x={cx} y={H - 8} textAnchor="middle">
                  {l}
                </text>
              ) : null}
            </g>
          );
        })}
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
