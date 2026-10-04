/**
 * Tasas de interés referenciales de créditos en Ecuador, por entidad y tipo
 * de crédito. Es la única fuente de datos del simulador por entidad.
 *
 * CÓMO ACTUALIZAR
 * - Cada producto lleva la tasa NOMINAL anual tal como la publica la entidad
 *   (en Ecuador las entidades publican la nominal y la efectiva; si solo hay
 *   efectiva, ponla en `effectiveRate` y calcula la nominal con
 *   `effectiveToNominal` de src/lib/calc/lender.ts).
 * - `source` debe ser la URL oficial (página o PDF de tasas de la entidad) y
 *   `asOf` la fecha de vigencia que indica esa fuente (AAAA-MM-DD).
 * - Las tasas máximas del BCE (`BCE_MAX_RATES`) cambian cada mes: actualiza
 *   `asOf`, `source` y las cifras con el boletín vigente.
 * - Los tests (src/data/tasas-ecuador.test.ts) comprueban que ninguna tasa
 *   efectiva supere la máxima del BCE de su segmento y que cada producto
 *   tenga fuente y fecha.
 *
 * Una entidad sin productos no aparece en el simulador.
 */

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

/** Agrupación que ve el usuario (para comparar entre entidades). */
export type LoanCategory = "consumo" | "vivienda" | "vivienda-social" | "automotriz" | "microcredito" | "educativo" | "productivo";

export const CATEGORY_LABELS: Record<LoanCategory, string> = {
  consumo: "Crédito de consumo",
  vivienda: "Crédito hipotecario",
  "vivienda-social": "Vivienda de interés social o público",
  automotriz: "Crédito automotriz",
  microcredito: "Microcrédito",
  educativo: "Crédito educativo",
  productivo: "Crédito productivo",
};

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
  /** Tasa efectiva anual publicada por la entidad, si la publica */
  effectiveRate?: number;
  minMonths: number;
  maxMonths: number;
  minAmount?: number;
  maxAmount?: number;
  /** URL oficial de donde se tomó la tasa */
  source: string;
  /** Fecha de vigencia de la tasa (AAAA-MM-DD) */
  asOf: string;
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

export const BCE_MAX_RATES: {
  /** Mes de vigencia (AAAA-MM-DD, primer día del mes) */
  asOf: string;
  source: string;
  rates: Partial<Record<BceSegment, BceRate>>;
} = {
  asOf: "",
  source: "https://www.bce.fin.ec/",
  // Pendiente: cargar el boletín vigente de tasas máximas del BCE.
  rates: {},
};

/**
 * Entidades incluidas. Las tasas se cargan solo desde fuentes oficiales
 * verificadas; mientras una entidad no tenga productos, no se muestra.
 */
const allLenders: Lender[] = [
  { id: "pichincha", name: "Banco Pichincha", kind: "banco", website: "https://www.pichincha.com/", products: [] },
  { id: "guayaquil", name: "Banco Guayaquil", kind: "banco", website: "https://www.bancoguayaquil.com/", products: [] },
  { id: "pacifico", name: "Banco del Pacífico", kind: "banco", website: "https://www.bancodelpacifico.com/", products: [] },
  { id: "produbanco", name: "Produbanco", kind: "banco", website: "https://www.produbanco.com.ec/", products: [] },
  { id: "internacional", name: "Banco Internacional", kind: "banco", website: "https://www.bancointernacional.com.ec/", products: [] },
  { id: "bolivariano", name: "Banco Bolivariano", kind: "banco", website: "https://www.bolivariano.com/", products: [] },
  { id: "austro", name: "Banco del Austro", kind: "banco", website: "https://www.bancodelaustro.com/", products: [] },
  { id: "jep", name: "Cooperativa JEP", kind: "cooperativa", website: "https://www.coopjep.fin.ec/", products: [] },
  { id: "jardin-azuayo", name: "Cooperativa Jardín Azuayo", kind: "cooperativa", website: "https://www.jardinazuayo.fin.ec/", products: [] },
  { id: "policia-nacional", name: "Cooperativa Policía Nacional", kind: "cooperativa", website: "https://www.cpn.fin.ec/", products: [] },
  { id: "29-octubre", name: "Cooperativa 29 de Octubre", kind: "cooperativa", website: "https://www.29deoctubre.fin.ec/", products: [] },
  { id: "alianza-valle", name: "Cooperativa Alianza del Valle", kind: "cooperativa", website: "https://www.alianzadelvalle.fin.ec/", products: [] },
  { id: "biess", name: "BIESS", kind: "publica", website: "https://www.biess.fin.ec/", products: [] },
];

export const lenders: readonly Lender[] = allLenders.filter((l) => l.products.length > 0);
