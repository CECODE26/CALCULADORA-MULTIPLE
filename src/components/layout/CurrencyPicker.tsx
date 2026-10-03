"use client";

import { useId } from "react";
import { currencyOptions } from "@/config/currencies";
import { usePrefs } from "@/components/PreferencesProvider";

/** Permite elegir la moneda con la que se muestran los importes. */
export function CurrencyPicker() {
  const { currency, setCurrency } = usePrefs();
  const id = useId();
  return (
    <div className="currency-picker">
      <label htmlFor={id}>Moneda</label>
      <select id={id} value={currency} onChange={(e) => setCurrency(e.target.value)}>
        {currencyOptions.map((c) => (
          <option key={c.code} value={c.code}>
            {c.label}
          </option>
        ))}
      </select>
    </div>
  );
}
