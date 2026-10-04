"use client";

import { useId } from "react";
import type { Option } from "./Select";

interface SegmentedControlProps<T extends string> {
  /** Nombre accesible del grupo */
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  wrap?: boolean;
}

/** Selector de modalidad accesible (radiogroup nativo con estilo segmentado). */
export function SegmentedControl<T extends string>({ label, value, options, onChange, wrap }: SegmentedControlProps<T>) {
  const name = useId();
  return (
    <fieldset className={`segmented${wrap ? " segmented--wrap" : ""}`} style={{ border: 0 }}>
      <legend className="visually-hidden">{label}</legend>
      {options.map((o) => (
        <label key={o.value} className="segmented__option">
          <input
            type="radio"
            name={name}
            value={o.value}
            checked={value === o.value}
            onChange={() => onChange(o.value)}
          />
          <span>{o.label}</span>
        </label>
      ))}
    </fieldset>
  );
}
