import type { IconName } from "@/components/ui/Icon";

export type CategorySlug = "finanzas" | "negocios" | "trabajo" | "matematicas";

export interface Category {
  slug: CategorySlug;
  name: string;
  /** Título SEO de la página de categoría */
  title: string;
  description: string;
  /** Texto introductorio visible en la página de categoría */
  intro: string;
  icon: IconName;
}

export const categories: readonly Category[] = [
  {
    slug: "finanzas",
    name: "Finanzas personales",
    title: "Calculadoras financieras: préstamos, ahorro e intereses",
    description:
      "Calcula la cuota de un préstamo, genera tu tabla de amortización, proyecta tu ahorro y simula el interés compuesto. Gratis y con fórmulas explicadas.",
    intro:
      "Herramientas para entender cuánto cuesta un crédito, cuánto crecerá tu dinero y cuánto necesitas ahorrar. Todas muestran la fórmula utilizada para que puedas verificar el resultado.",
    icon: "wallet",
  },
  {
    slug: "negocios",
    name: "Negocios y ventas",
    title: "Calculadoras para negocios: margen, precios e IVA",
    description:
      "Calcula margen de ganancia, precio de venta, punto de equilibrio, descuentos e impuestos para tu negocio. Gratis, rápido y sin registro.",
    intro:
      "Para emprendedores, comercios y vendedores en línea: fija precios con margen real, calcula impuestos y descubre cuántas unidades necesitas vender para cubrir costos.",
    icon: "briefcase",
  },
  {
    slug: "trabajo",
    name: "Trabajo",
    title: "Calculadoras de trabajo: horas trabajadas y jornadas",
    description:
      "Suma horas trabajadas por día o por semana, incluidos turnos nocturnos que cruzan la medianoche. Resultado en horas, minutos y formato decimal.",
    intro: "Herramientas para controlar jornadas, turnos y tiempos de trabajo de forma sencilla.",
    icon: "clock",
  },
  {
    slug: "matematicas",
    name: "Matemáticas",
    title: "Calculadoras matemáticas: porcentajes y descuentos",
    description:
      "Calcula porcentajes, aumentos, reducciones, variaciones porcentuales y descuentos sucesivos con la explicación paso a paso.",
    intro: "Cálculos cotidianos resueltos al instante y con la operación explicada.",
    icon: "percent",
  },
];

export function getCategory(slug: string): Category | undefined {
  return categories.find((c) => c.slug === slug);
}
