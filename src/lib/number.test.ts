import { describe, expect, it } from "vitest";
import { parseLocaleNumber, round, round2, safe } from "./number";

describe("parseLocaleNumber", () => {
  it("enteros y decimales simples", () => {
    expect(parseLocaleNumber("1500")).toBe(1500);
    expect(parseLocaleNumber("12,5")).toBe(12.5);
    expect(parseLocaleNumber("12.5")).toBe(12.5);
    expect(parseLocaleNumber("0,75")).toBe(0.75);
    expect(parseLocaleNumber(",5")).toBe(0.5);
  });

  it("separadores de miles según el locale", () => {
    // Locale con miles "." (es-EC/es-ES): 1.500 = mil quinientos
    expect(parseLocaleNumber("1.500", ".")).toBe(1500);
    expect(parseLocaleNumber("1,500", ".")).toBe(1.5);
    // Locale con miles "," (es-MX): 1,500 = mil quinientos
    expect(parseLocaleNumber("1,500", ",")).toBe(1500);
    expect(parseLocaleNumber("1.500", ",")).toBe(1.5);
  });

  it("ambos separadores: el último es decimal", () => {
    expect(parseLocaleNumber("1.234.567,89")).toBe(1234567.89);
    expect(parseLocaleNumber("1,234,567.89")).toBe(1234567.89);
    expect(parseLocaleNumber("10.000,5")).toBe(10000.5);
  });

  it("varias apariciones del mismo separador = miles", () => {
    expect(parseLocaleNumber("1.000.000")).toBe(1000000);
    expect(parseLocaleNumber("1,000,000")).toBe(1000000);
    expect(parseLocaleNumber("1.00.000")).toBeNull();
  });

  it("negativos, espacios y símbolos", () => {
    expect(parseLocaleNumber("-25")).toBe(-25);
    expect(parseLocaleNumber(" $ 2 500 ")).toBe(2500);
    expect(parseLocaleNumber("15%")).toBe(15);
  });

  it("entradas inválidas devuelven null", () => {
    expect(parseLocaleNumber("")).toBeNull();
    expect(parseLocaleNumber("-")).toBeNull();
    expect(parseLocaleNumber("abc")).toBeNull();
    expect(parseLocaleNumber("1e5")).toBeNull();
    expect(parseLocaleNumber("Infinity")).toBeNull();
    expect(parseLocaleNumber("NaN")).toBeNull();
    expect(parseLocaleNumber("1,2,3.4.5")).toBeNull();
    expect(parseLocaleNumber("--5")).toBeNull();
  });

  it("valores extremos siguen siendo finitos", () => {
    expect(parseLocaleNumber("9".repeat(400))).toBeNull();
    expect(parseLocaleNumber("999999999999")).toBe(999999999999);
  });
});

describe("round", () => {
  it("redondea correctamente casos binarios problemáticos", () => {
    expect(round2(1.005)).toBe(1.01);
    expect(round2(2.675)).toBe(2.68);
    expect(round2(-1.005)).toBe(-1.01);
    expect(round(1.23456, 3)).toBe(1.235);
  });
  it("nunca devuelve -0 ni valores no finitos", () => {
    expect(Object.is(round2(-0.001), 0)).toBe(true);
    expect(round2(Number.NaN)).toBe(0);
    expect(round2(Number.POSITIVE_INFINITY)).toBe(0);
    expect(safe(Number.NaN, 7)).toBe(7);
  });
});
