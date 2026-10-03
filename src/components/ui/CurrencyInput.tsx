"use client";

import { usePrefs } from "@/components/PreferencesProvider";
import { NumberInput, type NumberInputProps } from "./NumberInput";

/** Campo de importe monetario con el símbolo de la moneda elegida. */
export function CurrencyInput(props: Omit<NumberInputProps, "prefix">) {
  const { currencySymbol } = usePrefs();
  return <NumberInput placeholder="0" {...props} prefix={currencySymbol} />;
}
