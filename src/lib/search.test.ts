import { describe, expect, it } from "vitest";
import { normalize, searchTools } from "./search";
import { tools } from "@/tools/registry";

const first = (q: string) => searchTools(q, tools)[0]?.tool.slug;

describe("buscador", () => {
  it("normaliza tildes y mayúsculas", () => {
    expect(normalize("Préstamo HIPOTECARIO")).toBe("prestamo hipotecario");
  });

  it.each([
    ["préstamo", "calculadora-prestamos"],
    ["crédito", "calculadora-prestamos"],
    ["cuota mensual", "calculadora-prestamos"],
    ["amortización", "tabla-amortizacion"],
    ["interes compuesto", "calculadora-interes-compuesto"],
    ["ahorro", "calculadora-ahorro"],
    ["ganancia", "calculadora-margen-ganancia"],
    ["margen", "calculadora-margen-ganancia"],
    ["markup", "calculadora-margen-ganancia"],
    ["precio de venta", "calculadora-precio-venta"],
    ["punto de equilibrio", "calculadora-punto-equilibrio"],
    ["porcentaje", "calculadora-porcentajes"],
    ["%", "calculadora-porcentajes"],
    ["descuento", "calculadora-descuentos"],
    ["rebaja", "calculadora-descuentos"],
    ["IVA", "calculadora-iva"],
    ["igv", "calculadora-iva"],
    ["horas", "calculadora-horas-trabajadas"],
    ["turno nocturno", "calculadora-horas-trabajadas"],
  ])("«%s» → %s", (q, slug) => {
    expect(first(q)).toBe(slug);
  });

  it("tolera erratas leves", () => {
    expect(first("prestamso")).toBe("calculadora-prestamos");
    expect(first("descuentoz")).toBe("calculadora-descuentos");
  });

  it("consultas vacías o sin coincidencias", () => {
    expect(searchTools("", tools)).toEqual([]);
    expect(searchTools("   ", tools)).toEqual([]);
    expect(searchTools("zzzqqq", tools)).toEqual([]);
  });
});
