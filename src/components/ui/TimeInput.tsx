"use client";

import { useId } from "react";
import { Icon } from "./Icon";

interface TimeInputProps {
  label: string;
  value: string;
  onChange: (v: string) => void;
  error?: string | null;
  compact?: boolean;
}

/** Hora en formato 24 h con el selector nativo del dispositivo. */
export function TimeInput({ label, value, onChange, error, compact }: TimeInputProps) {
  const id = useId();
  if (value === "") error = null;
  return (
    <div className="field">
      <label className={compact ? "field__hint" : "field__label"} htmlFor={id}>
        {label}
      </label>
      <div className="field__control" data-invalid={error ? "true" : undefined}>
        <input
          id={id}
          className="field__input"
          type="time"
          step={60}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={error ? `${id}-err` : undefined}
        />
      </div>
      {error ? (
        <p className="field__error" id={`${id}-err`} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
