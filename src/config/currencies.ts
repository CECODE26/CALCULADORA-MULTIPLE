import { siteConfig } from "./site";

/** Monedas que el usuario puede elegir para el formato de resultados. */
export interface CurrencyOption {
  code: string;
  label: string;
  /** Locale usado para separar miles y decimales */
  locale: string;
}

export const currencyOptions: readonly CurrencyOption[] = [
  { code: "USD", label: "Dólar (USD)", locale: "es-EC" },
  { code: "MXN", label: "Peso mexicano (MXN)", locale: "es-MX" },
  { code: "COP", label: "Peso colombiano (COP)", locale: "es-CO" },
  { code: "PEN", label: "Sol (PEN)", locale: "es-PE" },
  { code: "EUR", label: "Euro (EUR)", locale: "es-ES" },
  { code: "ARS", label: "Peso argentino (ARS)", locale: "es-AR" },
  { code: "CLP", label: "Peso chileno (CLP)", locale: "es-CL" },
];

export function getCurrencyOption(code: string): CurrencyOption {
  return (
    currencyOptions.find((c) => c.code === code) ?? {
      code: siteConfig.defaultCurrency,
      label: siteConfig.defaultCurrency,
      locale: siteConfig.defaultLocale,
    }
  );
}
