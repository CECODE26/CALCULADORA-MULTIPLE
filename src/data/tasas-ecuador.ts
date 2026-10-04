/**
 * Tasas de interés de créditos en Ecuador, por entidad y tipo de crédito.
 * Es la única fuente de datos del simulador por entidad.
 *
 * ORIGEN DE LOS DATOS
 * Las tasas por entidad son la tasa efectiva PROMEDIO ponderada por monto de
 * los créditos que cada entidad concedió en un mes, según el archivo oficial
 * del Banco Central del Ecuador con las operaciones activas por entidad
 * (tma_desde_200801.csv). No es una oferta: es lo que la entidad cobró en
 * promedio ese mes en cada segmento.
 *
 * CÓMO ACTUALIZAR (cada mes)
 * 1. Descarga el archivo del BCE y ejecuta:
 *      node scripts/actualizar-tasas-ecuador.mjs ruta/tma_desde_200801.csv
 *    Eso regenera src/data/tasas-ecuador-bce.json con el último mes.
 * 2. Actualiza `BCE_MAX_RATES` con las tasas máximas de ESE mismo mes.
 * 3. Corre `npm test`: comprueba que ningún promedio supere la máxima.
 *
 * Para añadir una entidad, agrégala con su RUC a src/data/entidades-ecuador.json
 * y vuelve a ejecutar el script. Una entidad sin productos no aparece.
 */
import bce from "./tasas-ecuador-bce.json";
import entities from "./entidades-ecuador.json";

/** Segmentos de crédito del BCE (tasas activas efectivas máximas). */
export type BceSegment =
  | "productivo-corporativo"
  | "productivo-empresarial"
  | "productivo-pymes"
  | "consumo"
  | "educativo"
  | "educativo-social"
  | "vivienda-interes-social-publico"
  | "inmobiliario"
  | "microcredito-minorista"
  | "microcredito-acumulacion-simple"
  | "microcredito-acumulacion-ampliada";

/** Agrupación que ve el usuario. */
export type LoanCategory = "consumo" | "vivienda" | "vivienda-social" | "microcredito" | "educativo" | "productivo";

export type LenderKind = "banco" | "cooperativa" | "publica";

export const LENDER_KIND_LABELS: Record<LenderKind, string> = {
  banco: "Bancos",
  cooperativa: "Cooperativas",
  publica: "Banca pública",
};

export interface LoanProduct {
  id: string;
  /** Nombre que ve el usuario, p. ej. "Crédito de consumo" */
  name: string;
  category: LoanCategory;
  segment: BceSegment;
  /** Tasa nominal anual en puntos (11,2 → 11.2), con pagos mensuales */
  nominalRate: number;
  /** Tasa efectiva anual en puntos */
  effectiveRate?: number;
  /** Plazo mínimo y máximo en meses, si se conocen */
  minMonths?: number;
  maxMonths?: number;
  minAmount?: number;
  maxAmount?: number;
  /** URL oficial de la fuente */
  source: string;
  /** Fecha de la tasa (AAAA-MM-DD) */
  asOf: string;
  /**
   * "promedio": tasa promedio de los créditos concedidos en el mes de `asOf`.
   * "vigente": tasa publicada por la entidad, vigente desde `asOf`.
   */
  asOfKind: "promedio" | "vigente";
  /** Número de operaciones en que se basa un promedio */
  operations?: number;
}

export interface Lender {
  id: string;
  name: string;
  kind: LenderKind;
  website: string;
  products: LoanProduct[];
}

export interface BceRate {
  label: string;
  /** Tasa activa efectiva máxima anual, en puntos */
  maxEffective: number;
}

/** Página del BCE con las tasas de interés y montos de operaciones activas. */
export const BCE_SOURCE = "https://contenido.bce.fin.ec/documentos/informacioneconomica/MonetarioFinanciero/ix_TasasInteres.html";

export const BCE_MAX_RATES: {
  /** Mes de vigencia (AAAA-MM-DD, primer día del mes) */
  asOf: string;
  source: string;
  rates: Partial<Record<BceSegment, BceRate>>;
} = {
  // Agosto 2026, el mismo mes de los promedios. Coinciden con la tasa más alta
  // registrada en cada segmento en el archivo de operaciones del BCE.
  asOf: "2026-08-01",
  source: "https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Tasas-Interes-Agosto2026.pdf",
  rates: {
    "productivo-corporativo": { label: "Productivo corporativo", maxEffective: 7.86 },
    "productivo-empresarial": { label: "Productivo empresarial", maxEffective: 10.21 },
    "productivo-pymes": { label: "Productivo PYMES", maxEffective: 10.35 },
    consumo: { label: "Consumo", maxEffective: 16.77 },
    educativo: { label: "Educativo", maxEffective: 9.5 },
    "vivienda-interes-social-publico": { label: "Vivienda de interés social y público", maxEffective: 4.99 },
    inmobiliario: { label: "Inmobiliario", maxEffective: 9.4 },
    "microcredito-minorista": { label: "Microcrédito minorista", maxEffective: 28.23 },
    "microcredito-acumulacion-simple": { label: "Microcrédito de acumulación simple", maxEffective: 24.89 },
    "microcredito-acumulacion-ampliada": { label: "Microcrédito de acumulación ampliada", maxEffective: 22.05 },
  },
};

/** Cómo se presenta cada segmento del archivo del BCE en el simulador. */
const PRODUCTS: { id: string; name: string; category: LoanCategory; segment: BceSegment; from: string[] }[] = [
  { id: "consumo", name: "Crédito de consumo", category: "consumo", segment: "consumo", from: ["CONSUMO"] },
  { id: "inmobiliario", name: "Crédito hipotecario", category: "vivienda", segment: "inmobiliario", from: ["INMOBILIARIO"] },
  {
    id: "vivienda-social",
    name: "Vivienda de interés social y público",
    category: "vivienda-social",
    segment: "vivienda-interes-social-publico",
    from: ["VIVIENDA DE INTERÉS PÚBLICO", "VIVIENDA DE INTERÉS SOCIAL"],
  },
  { id: "educativo", name: "Crédito educativo", category: "educativo", segment: "educativo", from: ["EDUCATIVO"] },
  { id: "micro-minorista", name: "Microcrédito minorista", category: "microcredito", segment: "microcredito-minorista", from: ["MICROCRÉDITO MINORISTA"] },
  {
    id: "micro-simple",
    name: "Microcrédito de acumulación simple",
    category: "microcredito",
    segment: "microcredito-acumulacion-simple",
    from: ["MICROCRÉDITO DE ACUMULACIÓN SIMPLE"],
  },
  {
    id: "micro-ampliada",
    name: "Microcrédito de acumulación ampliada",
    category: "microcredito",
    segment: "microcredito-acumulacion-ampliada",
    from: ["MICROCRÉDITO DE ACUMULACIÓN AMPLIADA"],
  },
  { id: "pymes", name: "Crédito productivo PYMES", category: "productivo", segment: "productivo-pymes", from: ["PRODUCTIVO PYMES"] },
];

/** Un promedio con pocas operaciones no es representativo y no se muestra. */
const MIN_OPERATIONS = 10;
const MIN_AMOUNT = 100_000;

type SegmentStats = { effectiveRate: number; operations: number; amount: number };

/** Tasa nominal anual (pagos mensuales) equivalente a una efectiva anual, redondeada a 2 decimales. */
function nominalFromEffective(effectivePct: number): number {
  return Math.round((Math.pow(1 + effectivePct / 100, 1 / 12) - 1) * 12 * 10000) / 100;
}

function buildProducts(stats: Record<string, SegmentStats>): LoanProduct[] {
  const products: LoanProduct[] = [];
  for (const p of PRODUCTS) {
    const parts = p.from.map((s) => stats[s]).filter((s): s is SegmentStats => Boolean(s));
    const amount = parts.reduce((t, s) => t + s.amount, 0);
    const operations = parts.reduce((t, s) => t + s.operations, 0);
    if (operations < MIN_OPERATIONS || amount < MIN_AMOUNT) continue;
    const effective = Math.round((parts.reduce((t, s) => t + s.effectiveRate * s.amount, 0) / amount) * 100) / 100;
    products.push({
      id: p.id,
      name: p.name,
      category: p.category,
      segment: p.segment,
      nominalRate: nominalFromEffective(effective),
      effectiveRate: effective,
      source: BCE_SOURCE,
      asOf: `${bce.month}-01`,
      asOfKind: "promedio",
      operations,
    });
  }
  return products;
}

const bceLenders = bce.lenders as Record<string, Record<string, SegmentStats>>;

const allLenders: Lender[] = entities.map((e) => ({
  id: e.id,
  name: e.name,
  kind: e.kind as LenderKind,
  website: e.website,
  products: buildProducts(bceLenders[e.id] ?? {}),
}));

export const lenders: readonly Lender[] = allLenders.filter((l) => l.products.length > 0);
