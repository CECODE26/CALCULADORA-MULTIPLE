"use client";

import { useId } from "react";

export interface Option<T extends string> {
  value: T;
  label: string;
}

interface SelectProps<T extends string> {
  label: string;
  value: T;
  options: readonly Option<T>[];
  onChange: (value: T) => void;
  hint?: string;
}

export function Select<T extends string>({ label, value, options, onChange, hint }: SelectProps<T>) {
  const id = useId();
  return (
    <div className="field">
      <label className="field__label" htmlFor={id}>
        {label}
      </label>
      <div className="field__control">
        <select
          id={id}
          className="field__select"
          value={value}
          onChange={(e) => onChange(e.target.value as T)}
          aria-describedby={hint ? `${id}-hint` : undefined}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
      {hint ? (
        <p className="field__hint" id={`${id}-hint`}>
          {hint}
        </p>
      ) : null}
    </div>
  );
}

/** Select compacto para usar como `endSlot` de un campo numérico. */
export function AffixSelect<T extends string>({
  label,
  value,
  options,
  onChange,
}: Omit<SelectProps<T>, "hint">) {
  return (
    <select
      className="field__affix-select"
      aria-label={label}
      value={value}
      onChange={(e) => onChange(e.target.value as T)}
    >
      {options.map((o) => (
        <option key={o.value} value={o.value}>
          {o.label}
        </option>
      ))}
    </select>
  );
}
