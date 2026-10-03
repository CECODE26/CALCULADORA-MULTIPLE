"use client";

import { NumberInput, type NumberInputProps } from "./NumberInput";

/** Campo de porcentaje: se introduce en puntos (15 = 15 %). */
export function PercentageInput(props: Omit<NumberInputProps, "suffix">) {
  return <NumberInput placeholder="0" {...props} suffix="%" />;
}
