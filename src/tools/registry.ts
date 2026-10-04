import type { CategorySlug } from "@/config/categories";
import type { MarketCode } from "@/config/markets";
import type { IconName } from "@/components/ui/Icon";
import { lenders } from "@/data/tasas-ecuador";

/**
 * Registro central de herramientas.
 *
 * Es la única fuente de verdad para: rutas, metadatos SEO, buscador,
 * categorías, enlazado interno, sitemap y analítica. Añadir una
 * herramienta nueva = añadir una entrada aquí + su carpeta de ruta.
 */
export interface ToolEntry {
  slug: string;
  /** Nombre corto para tarjetas y menús */
  name: string;
  /** <title> único (la marca se añade con la plantilla del layout) */
  title: string;
  /** Meta description única */
  description: string;
  /** H1 único */
  h1: string;
  /** Texto bajo el H1 */
  lead: string;
  /** Categoría principal (breadcrumbs) */
  category: CategorySlug;
  /** Otras categorías donde también se lista */
  alsoIn?: CategorySlug[];
  icon: IconName;
  /** Términos y sinónimos para el buscador (sin necesidad de tildes) */
  keywords: string[];
  /** Herramientas relacionadas, en orden de relevancia */
  related: string[];
  /** Destacada en la home (máximo ~6) */
  popular?: boolean;
  /** Publicada: si es false no aparece en navegación, buscador ni sitemap */
  live: boolean;
  /** Versiones regionales reales (activa hreflang). Vacío por ahora. */
  regional?: Partial<Record<MarketCode, string>>;
  /** Fecha de última revisión del contenido (sitemap lastmod) */
  updated: string;
}

export const tools: readonly ToolEntry[] = [
  {
    slug: "calculadora-prestamos",
    name: "Calculadora de préstamos",
    title: "Calculadora de préstamos: cuota mensual e intereses",
    description:
      "Calcula la cuota mensual de un préstamo o crédito, el total de intereses y el total a pagar. Admite tasa nominal, efectiva o mensual y plazo en meses o años.",
    h1: "Calculadora de préstamos",
    lead: "Calcula la cuota fija de tu préstamo, cuánto pagarás de intereses y el costo total del crédito.",
    category: "finanzas",
    icon: "bank",
    keywords: [
      "prestamo", "prestamos", "credito", "creditos", "cuota", "cuota mensual", "letra", "mensualidad",
      "financiamiento", "hipoteca", "credito hipotecario", "credito de consumo", "deuda", "pagos mensuales",
      "simulador de credito", "simulador de prestamo", "intereses del prestamo", "auto", "carro", "coche",
    ],
    related: ["tabla-amortizacion", "simulador-credito-ecuador", "calculadora-interes-compuesto", "calculadora-ahorro", "calculadora-porcentajes"],
    popular: true,
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "tabla-amortizacion",
    name: "Tabla de amortización",
    title: "Tabla de amortización: sistema francés y alemán",
    description:
      "Genera la tabla de amortización completa de un préstamo: cuota, capital, interés y saldo de cada periodo. Sistema francés o alemán, pagos mensuales, trimestrales y más.",
    h1: "Tabla de amortización",
    lead: "Obtén el detalle de cada pago de tu préstamo: cuánto va a capital, cuánto a intereses y el saldo pendiente.",
    category: "finanzas",
    icon: "table",
    keywords: [
      "amortizacion", "tabla de amortizacion", "cuadro de amortizacion", "calendario de pagos", "plan de pagos",
      "saldo", "capital", "sistema frances", "sistema aleman", "cuota fija", "abonos", "prestamo", "credito",
    ],
    related: ["calculadora-prestamos", "simulador-credito-ecuador", "calculadora-interes-compuesto", "calculadora-ahorro"],
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "simulador-credito-ecuador",
    name: "Simulador de crédito en Ecuador",
    title: "Simulador de crédito en Ecuador: bancos y cooperativas",
    description:
      "Simula un crédito con la tasa promedio de un banco o cooperativa de Ecuador según el BCE: cuota mensual, tabla de amortización y comparación entre entidades.",
    h1: "Simulador de crédito por banco y cooperativa en Ecuador",
    lead: "Elige la entidad y el tipo de crédito, y obtén la cuota y la tabla de amortización con la tasa promedio que cobra, según el Banco Central.",
    category: "finanzas",
    icon: "bank",
    keywords: [
      "simulador de credito", "simulador de prestamo", "ecuador", "banco", "cooperativa", "tasa de interes",
      "pichincha", "banco pichincha", "guayaquil", "pacifico", "produbanco", "internacional", "bolivariano", "austro",
      "jep", "jardin azuayo", "biess", "credito de consumo", "credito hipotecario", "microcredito", "credito automotriz",
      "tabla de amortizacion", "cuota mensual",
    ],
    related: ["calculadora-prestamos", "tabla-amortizacion", "calculadora-interes-compuesto"],
    // Se publica sola cuando el archivo de tasas tiene al menos una entidad con datos verificados
    live: lenders.length > 0,
    updated: "2026-10-04",
  },
  {
    slug: "calculadora-interes-compuesto",
    name: "Calculadora de interés compuesto",
    title: "Calculadora de interés compuesto con aportaciones",
    description:
      "Calcula cuánto crecerá tu inversión con interés compuesto y aportaciones periódicas, o cuánto debes aportar para alcanzar una meta. Con tabla anual y gráfico.",
    h1: "Calculadora de interés compuesto",
    lead: "Proyecta el crecimiento de tu dinero con capitalización y aportaciones periódicas, o calcula la aportación necesaria para una meta.",
    category: "finanzas",
    icon: "trending",
    keywords: [
      "interes compuesto", "inversion", "invertir", "rendimiento", "capitalizacion", "rentabilidad",
      "crecimiento", "aportaciones", "aportes", "valor futuro", "meta", "jubilacion", "retiro", "plazo fijo",
      "deposito", "intereses", "ganancia inversion",
    ],
    related: ["calculadora-ahorro", "calculadora-prestamos", "tabla-amortizacion", "calculadora-porcentajes"],
    popular: true,
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "calculadora-ahorro",
    name: "Calculadora de ahorro",
    title: "Calculadora de ahorro: cuánto tendrás y cuánto ahorrar",
    description:
      "Calcula cuánto dinero tendrás ahorrando cada mes o cuánto necesitas ahorrar para alcanzar una meta en un plazo determinado, con rendimiento opcional.",
    h1: "Calculadora de ahorro",
    lead: "Descubre cuánto reunirás con tu ahorro mensual o cuánto debes apartar cada mes para llegar a tu meta.",
    category: "finanzas",
    icon: "piggy",
    keywords: [
      "ahorro", "ahorrar", "ahorro mensual", "meta de ahorro", "objetivo", "fondo de emergencia",
      "cuanto ahorrar", "plan de ahorro", "guardar dinero", "alcancia", "vacaciones", "entrada casa",
    ],
    related: ["calculadora-interes-compuesto", "calculadora-prestamos", "calculadora-porcentajes"],
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "calculadora-margen-ganancia",
    name: "Calculadora de margen de ganancia",
    title: "Calculadora de margen de ganancia y markup",
    description:
      "Calcula la ganancia, el margen y el markup a partir del costo y el precio de venta, o el precio necesario para lograr un margen. Explicación de margen vs. markup.",
    h1: "Calculadora de margen de ganancia",
    lead: "Calcula tu ganancia, margen y markup, o el precio que necesitas para obtener el margen que buscas.",
    category: "negocios",
    icon: "chart",
    keywords: [
      "margen", "margen de ganancia", "margen de utilidad", "markup", "mark up", "recargo", "ganancia",
      "utilidad", "rentabilidad", "beneficio", "margen bruto", "porcentaje de ganancia",
    ],
    related: ["calculadora-precio-venta", "calculadora-punto-equilibrio", "calculadora-descuentos", "calculadora-iva"],
    popular: true,
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "calculadora-precio-venta",
    name: "Calculadora de precio de venta",
    title: "Calculadora de precio de venta con comisión e impuestos",
    description:
      "Calcula el precio de venta de un producto a partir del costo, gastos de envío y empaque, comisión de la plataforma, margen deseado e impuesto configurable.",
    h1: "Calculadora de precio de venta",
    lead: "Fija un precio que cubra todos tus costos, comisiones e impuestos y te deje el margen que buscas.",
    category: "negocios",
    icon: "tag",
    keywords: [
      "precio de venta", "precio", "fijar precio", "poner precio", "cuanto cobrar", "costo", "comision",
      "marketplace", "envio", "empaque", "precio final", "emprendimiento", "producto",
    ],
    related: ["calculadora-margen-ganancia", "calculadora-punto-equilibrio", "calculadora-iva", "calculadora-descuentos"],
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "calculadora-punto-equilibrio",
    name: "Calculadora de punto de equilibrio",
    title: "Calculadora de punto de equilibrio en unidades y ventas",
    description:
      "Calcula el punto de equilibrio de tu negocio: unidades y ventas necesarias para cubrir costos fijos. Incluye margen de contribución, simulador de ventas y gráfico.",
    h1: "Calculadora de punto de equilibrio",
    lead: "Descubre cuántas unidades debes vender para cubrir tus costos y simula tu utilidad con distintos volúmenes de venta.",
    category: "negocios",
    icon: "scale",
    keywords: [
      "punto de equilibrio", "break even", "breakeven", "costos fijos", "costo variable", "margen de contribucion",
      "unidades", "ventas necesarias", "utilidad", "perdida", "rentabilidad negocio",
    ],
    related: ["calculadora-margen-ganancia", "calculadora-precio-venta", "calculadora-iva"],
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "calculadora-porcentajes",
    name: "Calculadora de porcentajes",
    title: "Calculadora de porcentajes: aumentos, rebajas y variación",
    description:
      "Calcula el porcentaje de un número, qué porcentaje es un valor de otro, aumentos, reducciones, cambio porcentual y valor original. Con explicación de cada operación.",
    h1: "Calculadora de porcentajes",
    lead: "Resuelve cualquier cálculo de porcentajes y entiende la operación paso a paso.",
    category: "matematicas",
    icon: "percent",
    keywords: [
      "porcentaje", "porcentajes", "por ciento", "%", "tanto por ciento", "regla de tres", "aumento",
      "incremento", "reduccion", "variacion porcentual", "cambio porcentual", "diferencia porcentual",
    ],
    related: ["calculadora-descuentos", "calculadora-iva", "calculadora-margen-ganancia"],
    popular: true,
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "calculadora-descuentos",
    name: "Calculadora de descuentos",
    title: "Calculadora de descuentos y descuentos sucesivos",
    description:
      "Calcula el precio final y el ahorro de un descuento, el descuento efectivo de descuentos sucesivos (20% + 10%) o el porcentaje real de descuento entre dos precios.",
    h1: "Calculadora de descuentos",
    lead: "Calcula cuánto pagarás, cuánto ahorras y el descuento real cuando se combinan varias rebajas.",
    category: "matematicas",
    alsoIn: ["negocios"],
    icon: "discount",
    keywords: [
      "descuento", "descuentos", "rebaja", "oferta", "promocion", "precio final", "ahorro", "black friday",
      "liquidacion", "descuento sucesivo", "porcentaje de descuento", "2x1",
    ],
    related: ["calculadora-porcentajes", "calculadora-margen-ganancia", "calculadora-precio-venta", "calculadora-iva"],
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "calculadora-horas-trabajadas",
    name: "Calculadora de horas trabajadas",
    title: "Calculadora de horas trabajadas por día y por semana",
    description:
      "Suma las horas trabajadas con hora de entrada, salida y descanso. Soporta turnos nocturnos que cruzan la medianoche y muestra horas, minutos y horas decimales.",
    h1: "Calculadora de horas trabajadas",
    lead: "Calcula tu jornada diaria o el total semanal de horas, incluso en turnos que pasan la medianoche.",
    category: "trabajo",
    icon: "clock",
    keywords: [
      "horas", "horas trabajadas", "jornada", "turno", "turno nocturno", "horario", "entrada", "salida",
      "horas extra", "control horario", "sumar horas", "horas decimales", "semana laboral", "timesheet",
    ],
    related: ["calculadora-porcentajes", "calculadora-ahorro"],
    popular: true,
    live: true,
    updated: "2026-10-03",
  },
  {
    slug: "calculadora-iva",
    name: "Calculadora de IVA",
    title: "Calculadora de IVA e impuestos: agregar o quitar impuesto",
    description:
      "Agrega o quita el IVA (u otro impuesto) a un precio con la tasa que indiques. Obtén base imponible, impuesto y total al instante.",
    h1: "Calculadora de IVA e impuestos",
    lead: "Agrega el impuesto a un precio, extráelo de un total o descubre cuánto impuesto incluye un precio.",
    category: "negocios",
    icon: "receipt",
    keywords: [
      "iva", "impuesto", "impuestos", "igv", "iva incluido", "sin iva", "con iva", "base imponible",
      "quitar iva", "agregar iva", "sumar iva", "desglosar iva", "factura", "tax", "sales tax", "itbis", "iva 15",
    ],
    related: ["calculadora-precio-venta", "calculadora-margen-ganancia", "calculadora-descuentos", "calculadora-porcentajes"],
    popular: true,
    live: true,
    updated: "2026-10-03",
  },
];

export function toolPath(slug: string): string {
  return `/${slug}`;
}

export function liveTools(): ToolEntry[] {
  return tools.filter((t) => t.live);
}

export function getTool(slug: string): ToolEntry {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Herramienta no registrada: ${slug}`);
  return tool;
}

export function findTool(slug: string): ToolEntry | undefined {
  return tools.find((t) => t.slug === slug && t.live);
}

export function toolsInCategory(category: CategorySlug): ToolEntry[] {
  return liveTools().filter((t) => t.category === category || t.alsoIn?.includes(category));
}

export function relatedTools(slug: string, limit = 4): ToolEntry[] {
  const tool = getTool(slug);
  return tool.related
    .map((s) => findTool(s))
    .filter((t): t is ToolEntry => Boolean(t))
    .slice(0, limit);
}
