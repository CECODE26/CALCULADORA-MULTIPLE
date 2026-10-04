"use client";

import { useId, type ReactNode } from "react";
import { usePrefs } from "@/components/PreferencesProvider";
import { Icon } from "./Icon";

export interface NumberInputProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  /** Mensaje de error del campo (se muestra y marca el campo como inválido) */
  error?: string | null;
  hint?: ReactNode;
  prefix?: ReactNode;
  suffix?: ReactNode;
  /** Control adicional pegado al final (p. ej. un select de unidad) */
  endSlot?: ReactNode;
  optional?: boolean;
  placeholder?: string;
  /** "decimal" muestra teclado numérico con separador en móviles */
  inputMode?: "decimal" | "numeric";
  allowNegative?: boolean;
  name?: string;
  id?: string;
}

/** Elimina caracteres que nunca forman parte de un número. */
function sanitize(raw: string, allowNegative: boolean): string {
  const cleaned = raw.replace(allowNegative ? /[^\d.,\s-]/g : /[^\d.,\s]/g, "");
  return cleaned.slice(0, 24);
}

export function NumberInput({
  label,
  value,
  onChange,
  error,
  hint,
  prefix,
  suffix,
  endSlot,
  optional,
  placeholder,
  inputMode = "decimal",
  allowNegative = false,
  name,
  id,
}: NumberInputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const hintId = `${inputId}-hint`;
  const errorId = `${inputId}-error`;
  const { parse, num } = usePrefs();

  // Muestra cómo se interpretó el número cuando lleva separadores (evita ambigüedad 1.500 / 1,5)
  const parsed = parse(value);
  const showInterpretation = !error && parsed !== null && /[.,]/.test(value) && Math.abs(parsed) >= 1000;

  const describedBy = [hint || showInterpretation ? hintId : null, error ? errorId : null].filter(Boolean).join(" ");

  return (
    <div className="field">
      <label className="field__label" htmlFor={inputId}>
        {label}
        {optional ? <span className="field__optional"> (opcional)</span> : null}
      </label>
      <div className="field__control" data-invalid={error ? "true" : undefined}>
        {prefix ? (
          <span className="field__affix field__affix--start" aria-hidden="true">
            {prefix}
          </span>
        ) : null}
        <input
          id={inputId}
          name={name}
          className="field__input"
          type="text"
          inputMode={inputMode}
          autoComplete="off"
          spellCheck={false}
          enterKeyHint="done"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(sanitize(e.target.value, allowNegative))}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy || undefined}
        />
        {suffix ? (
          <span className="field__affix field__affix--end" aria-hidden="true">
            {suffix}
          </span>
        ) : null}
        {endSlot}
      </div>
      {hint || showInterpretation ? (
        <p className="field__hint" id={hintId}>
          {hint}
          {hint && showInterpretation ? " · " : null}
          {showInterpretation ? <>Se interpreta como {num(parsed, 4)}</> : null}
        </p>
      ) : null}
      {error ? (
        <p className="field__error" id={errorId} role="alert">
          <Icon name="alert" size={16} />
          {error}
        </p>
      ) : null}
    </div>
  );
}
