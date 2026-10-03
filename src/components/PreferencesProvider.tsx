"use client";

import { createContext, useCallback, useContext, useMemo, useSyncExternalStore, type ReactNode } from "react";
import { siteConfig } from "@/config/site";
import { currencyOptions, getCurrencyOption } from "@/config/currencies";
import { STORAGE_KEYS, readStorage, writeStorage } from "@/lib/storage";
import { formatCurrency, formatNumber, formatPercent, groupSeparatorFor } from "@/lib/format";
import { parseLocaleNumber } from "@/lib/number";

const EVENT = "pref:currency-change";

function subscribe(cb: () => void) {
  window.addEventListener(EVENT, cb);
  window.addEventListener("storage", cb);
  return () => {
    window.removeEventListener(EVENT, cb);
    window.removeEventListener("storage", cb);
  };
}

function getSnapshot(): string {
  const stored = readStorage(STORAGE_KEYS.currency);
  return stored && currencyOptions.some((c) => c.code === stored) ? stored : siteConfig.defaultCurrency;
}

const getServerSnapshot = () => siteConfig.defaultCurrency;

export interface Preferences {
  currency: string;
  locale: string;
  setCurrency: (code: string) => void;
  money: (v: unknown, decimals?: number) => string;
  num: (v: unknown, maxDecimals?: number) => string;
  /** Formatea un porcentaje expresado en puntos (25 → "25 %") */
  pct: (v: unknown, maxDecimals?: number) => string;
  /** Interpreta un texto introducido según el locale actual */
  parse: (raw: string) => number | null;
  currencySymbol: string;
}

const PreferencesContext = createContext<Preferences | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const currency = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const option = getCurrencyOption(currency);
  const locale = currency === siteConfig.defaultCurrency ? siteConfig.defaultLocale : option.locale;

  const setCurrency = useCallback((code: string) => {
    if (!currencyOptions.some((c) => c.code === code)) return;
    writeStorage(STORAGE_KEYS.currency, code);
    window.dispatchEvent(new Event(EVENT));
  }, []);

  const value = useMemo<Preferences>(() => {
    const ctx = { locale, currency };
    const group = groupSeparatorFor(locale);
    let symbol = currency;
    try {
      symbol =
        new Intl.NumberFormat(locale, { style: "currency", currency, currencyDisplay: "narrowSymbol" })
          .formatToParts(0)
          .find((p) => p.type === "currency")?.value ?? currency;
    } catch {
      // moneda no soportada por el motor: se usa el código
    }
    return {
      currency,
      locale,
      setCurrency,
      money: (v, d = 2) => formatCurrency(v, ctx, d),
      num: (v, d = 2) => formatNumber(v, locale, d),
      pct: (v, d = 2) => formatPercent(v, locale, d),
      parse: (raw) => parseLocaleNumber(raw, group),
      currencySymbol: symbol,
    };
  }, [currency, locale, setCurrency]);

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePrefs(): Preferences {
  const ctx = useContext(PreferencesContext);
  if (!ctx) throw new Error("usePrefs debe usarse dentro de PreferencesProvider");
  return ctx;
}
