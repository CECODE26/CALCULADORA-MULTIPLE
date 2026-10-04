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
 *
 * Carga del 2026-10-04: las cifras se obtuvieron con el buscador web a partir
 * de los documentos oficiales enlazados en `source` (el entorno de desarrollo
 * no podía descargar esos sitios directamente). Solo se cargaron tasas cuya
 * nominal y efectiva son coherentes entre sí y no superan la máxima vigente
 * del BCE. Conviene revisarlas contra el PDF oficial antes de cada publicación.
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
  /** Plazo mínimo y máximo en meses, si la entidad los publica */
  minMonths?: number;
  maxMonths?: number;
  minAmount?: number;
  maxAmount?: number;
  /** URL oficial de donde se tomó la tasa */
  source: string;
  /** Fecha de la tasa (AAAA-MM-DD) */
  asOf: string;
  /**
   * "vigente": la fuente indica desde cuándo rige la tasa (tarifario mensual).
   * "consultada": la fuente no tiene fecha; `asOf` es el día en que se consultó.
   */
  asOfKind: "vigente" | "consultada";
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
  asOf: "2026-10-01",
  source: "https://contenido.bce.fin.ec/documentos/Estadisticas/SectorMonFin/TasasInteres/Indice.htm",
  // Octubre 2026. Inmobiliario y microcrédito no se cargaron: no se pudo confirmar la cifra de este mes.
  rates: {
    "productivo-corporativo": { label: "Productivo corporativo", maxEffective: 7.89 },
    "productivo-empresarial": { label: "Productivo empresarial", maxEffective: 10.36 },
    "productivo-pymes": { label: "Productivo PYMES", maxEffective: 9.95 },
    consumo: { label: "Consumo", maxEffective: 16.77 },
    educativo: { label: "Educativo", maxEffective: 9.5 },
    "educativo-social": { label: "Educativo social", maxEffective: 7.5 },
    "vivienda-interes-social-publico": { label: "Vivienda de interés social y público", maxEffective: 4.99 },
  },
};

/**
 * Entidades incluidas. Las tasas se cargan solo desde fuentes oficiales
 * verificadas; mientras una entidad no tenga productos, no se muestra.
 */
const allLenders: Lender[] = [
  { id: "pichincha", name: "Banco Pichincha", kind: "banco", website: "https://www.pichincha.com/", products: [
      { id: "consumo", name: "Crédito de consumo (Preciso)", category: "consumo", segment: "consumo", nominalRate: 15.6, effectiveRate: 16.77, source: "https://www.pichincha.com/sites/default/files/documents/2026-08/tarifario-web-septiembre-2026.pdf", asOf: "2026-09-01", asOfKind: "vigente" },
      { id: "hipotecario", name: "Crédito hipotecario (Habitar)", category: "vivienda", segment: "inmobiliario", nominalRate: 8.89, effectiveRate: 9.26, source: "https://www.pichincha.com/sites/default/files/documents/2026-08/tarifario-web-septiembre-2026.pdf", asOf: "2026-09-01", asOfKind: "vigente" },
      { id: "vip-vis", name: "Vivienda de interés social y público", category: "vivienda-social", segment: "vivienda-interes-social-publico", nominalRate: 4.87, effectiveRate: 4.99, source: "https://www.pichincha.com/sites/default/files/documents/2026-08/tarifario-web-septiembre-2026.pdf", asOf: "2026-09-01", asOfKind: "vigente" },
      { id: "educativo", name: "Crédito educativo", category: "educativo", segment: "educativo", nominalRate: 9, effectiveRate: 9.38, source: "https://www.pichincha.com/sites/default/files/documents/2026-08/tarifario-web-septiembre-2026.pdf", asOf: "2026-09-01", asOfKind: "vigente" },
    ] },
  { id: "guayaquil", name: "Banco Guayaquil", kind: "banco", website: "https://www.bancoguayaquil.com/", products: [
      { id: "consumo", name: "Crédito de consumo", category: "consumo", segment: "consumo", nominalRate: 15.6, source: "https://ayuda.bancoguayaquil.com/hc/es/articles/47182703543700--Cu%C3%A1l-es-la-tasa-de-inter%C3%A9s-de-un-pr%C3%A9stamo", asOf: "2026-10-04", asOfKind: "consultada" },
    ] },
  { id: "pacifico", name: "Banco del Pacífico", kind: "banco", website: "https://www.bancodelpacifico.com/", products: [
      { id: "consumo", name: "Crédito de consumo", category: "consumo", segment: "consumo", nominalRate: 9.944, effectiveRate: 10.41, source: "https://www.bancodelpacifico.com/BancoPacifico/media/pdf/TranspInformacion/2026/Operaciones_Credito.pdf", asOf: "2026-10-04", asOfKind: "consultada" },
    ] },
  { id: "produbanco", name: "Produbanco", kind: "banco", website: "https://www.produbanco.com.ec/", products: [] },
  { id: "internacional", name: "Banco Internacional", kind: "banco", website: "https://www.bancointernacional.com.ec/", products: [
      { id: "consumo", name: "Crédito de consumo", category: "consumo", segment: "consumo", nominalRate: 15.6, effectiveRate: 16.77, source: "https://www.bancointernacional.com.ec/info-tarifarios/interes-credito/", asOf: "2026-10-04", asOfKind: "consultada" },
      { id: "hipotecario", name: "Crédito hipotecario", category: "vivienda", segment: "inmobiliario", nominalRate: 8.89, effectiveRate: 9.26, source: "https://www.bancointernacional.com.ec/info-tarifarios/interes-credito/", asOf: "2026-10-04", asOfKind: "consultada" },
    ] },
  { id: "bolivariano", name: "Banco Bolivariano", kind: "banco", website: "https://www.bolivariano.com/", products: [] },
  { id: "austro", name: "Banco del Austro", kind: "banco", website: "https://www.bancodelaustro.com/", products: [] },
  { id: "jep", name: "Cooperativa JEP", kind: "cooperativa", website: "https://www.coopjep.fin.ec/", products: [] },
  { id: "jardin-azuayo", name: "Cooperativa Jardín Azuayo", kind: "cooperativa", website: "https://www.jardinazuayo.fin.ec/", products: [] },
  { id: "policia-nacional", name: "Cooperativa Policía Nacional", kind: "cooperativa", website: "https://www.cpn.fin.ec/", products: [] },
  { id: "29-octubre", name: "Cooperativa 29 de Octubre", kind: "cooperativa", website: "https://www.29deoctubre.fin.ec/", products: [] },
  { id: "alianza-valle", name: "Cooperativa Alianza del Valle", kind: "cooperativa", website: "https://www.alianzadelvalle.fin.ec/", products: [] },
  { id: "biess", name: "BIESS", kind: "publica", website: "https://www.biess.fin.ec/", products: [
      { id: "vivienda-premier", name: "Hipotecario Vivienda Premier", category: "vivienda", segment: "inmobiliario", nominalRate: 2.99, effectiveRate: 3.03, maxMonths: 300, maxAmount: 50000, source: "https://www.biess.fin.ec/files/ley-transaparencia/tarifario/2026/tarifario/TARIFARIO_enero%202026-vf.pdf", asOf: "2026-01-27", asOfKind: "vigente" },
    ] },
];

export const lenders: readonly Lender[] = allLenders.filter((l) => l.products.length > 0);
