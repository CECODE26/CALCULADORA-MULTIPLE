interface Part {
  label: string;
  value: number;
  color: string;
  display: string;
}

/** Barra horizontal de proporciones (p. ej. capital vs. intereses). */
export function ProportionBar({ parts, label }: { parts: Part[]; label: string }) {
  const total = parts.reduce((a, p) => a + Math.max(0, p.value), 0);
  if (!(total > 0)) return null;
  return (
    <div style={{ marginTop: 16 }}>
      <div
        role="img"
        aria-label={`${label}: ${parts.map((p) => `${p.label} ${Math.round((p.value / total) * 100)} %`).join(", ")}`}
        style={{ display: "flex", height: 10, borderRadius: 999, overflow: "hidden", background: "var(--surface-3)" }}
      >
        {parts.map((p) => (
          <span key={p.label} style={{ width: `${(Math.max(0, p.value) / total) * 100}%`, background: p.color }} />
        ))}
      </div>
      <ul className="chart__legend" aria-hidden="true">
        {parts.map((p) => (
          <li key={p.label}>
            <span className="chart__swatch" style={{ background: p.color }} />
            {p.label}: {p.display} ({Math.round((Math.max(0, p.value) / total) * 100)} %)
          </li>
        ))}
      </ul>
    </div>
  );
}
