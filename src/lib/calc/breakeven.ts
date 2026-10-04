import { round2 } from "@/lib/number";
import { fail, isNum, MAX_AMOUNT, ok, type CalcResult } from "./types";

export interface BreakEvenInput {
  fixedCosts: number;
  unitPrice: number;
  unitVariableCost: number;
}

export interface BreakEvenResult {
  contributionMargin: number;
  contributionMarginPct: number;
  /** Unidades exactas (puede tener decimales) */
  unitsExact: number;
  /** Unidades enteras necesarias (redondeo hacia arriba) */
  units: number;
  salesExact: number;
  /** Ventas con las unidades enteras */
  sales: number;
}

/** Punto de equilibrio: Q = Costos fijos / (Precio − Costo variable unitario) */
export function breakEven({ fixedCosts, unitPrice, unitVariableCost }: BreakEvenInput): CalcResult<BreakEvenResult> {
  if (!isNum(fixedCosts)) return fail("Introduce los costos fijos (pueden ser 0).", "fixed");
  if (fixedCosts < 0) return fail("Los costos fijos no pueden ser negativos.", "fixed");
  if (fixedCosts > MAX_AMOUNT) return fail("Los costos fijos son demasiado grandes.", "fixed");
  if (!isNum(unitPrice)) return fail("Introduce el precio de venta por unidad.", "price");
  if (unitPrice <= 0) return fail("El precio de venta debe ser mayor que cero.", "price");
  if (unitPrice > MAX_AMOUNT) return fail("El precio es demasiado grande.", "price");
  if (!isNum(unitVariableCost)) return fail("Introduce el costo variable por unidad (puede ser 0).", "variable");
  if (unitVariableCost < 0) return fail("El costo variable no puede ser negativo.", "variable");
  if (unitVariableCost > MAX_AMOUNT) return fail("El costo variable es demasiado grande.", "variable");

  const cm = unitPrice - unitVariableCost;
  if (cm <= 0) {
    return fail(
      "El precio no cubre el costo variable de cada unidad: cada venta genera pérdida y nunca se alcanza el equilibrio. Sube el precio o reduce el costo variable.",
      "variable",
    );
  }
  const unitsExact = fixedCosts / cm;
  const units = Math.max(0, Math.ceil(unitsExact - 1e-9)) + 0;
  return ok({
    contributionMargin: round2(cm),
    contributionMarginPct: (cm / unitPrice) * 100,
    unitsExact,
    units,
    salesExact: round2(unitsExact * unitPrice),
    sales: round2(units * unitPrice),
  });
}

export interface SimulationResult {
  units: number;
  revenue: number;
  variableCosts: number;
  totalCosts: number;
  profit: number;
}

/** "Si vendo X unidades": ingresos, costos y utilidad. */
export function simulateSales(input: BreakEvenInput, units: number): CalcResult<SimulationResult> {
  if (!isNum(units)) return fail("Introduce cuántas unidades venderías.", "units");
  if (units < 0) return fail("Las unidades no pueden ser negativas.", "units");
  if (units > 1e9) return fail("Son demasiadas unidades.", "units");
  const { fixedCosts, unitPrice, unitVariableCost } = input;
  if (![fixedCosts, unitPrice, unitVariableCost].every(isNum)) return fail("Completa primero los datos del negocio.");
  const revenue = units * unitPrice;
  const variableCosts = units * unitVariableCost;
  const totalCosts = fixedCosts + variableCosts;
  return ok({
    units,
    revenue: round2(revenue),
    variableCosts: round2(variableCosts),
    totalCosts: round2(totalCosts),
    profit: round2(revenue - totalCosts),
  });
}

/** Puntos para el gráfico ingresos vs. costos totales. */
export function breakEvenSeries(input: BreakEvenInput, maxUnits: number, points = 24) {
  const max = Math.max(1, maxUnits);
  const step = max / points;
  const xs = Array.from({ length: points + 1 }, (_, i) => i * step);
  return {
    units: xs,
    revenue: xs.map((x) => x * input.unitPrice),
    costs: xs.map((x) => input.fixedCosts + x * input.unitVariableCost),
  };
}
