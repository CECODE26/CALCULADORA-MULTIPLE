import Link from "next/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/content/LegalPage";

export const metadata = pageMetadata({
  title: "Acerca de",
  description: `Qué es ${siteConfig.name}, cómo construimos nuestras calculadoras y cómo verificamos las fórmulas.`,
  path: "/acerca-de",
});

export default function AboutPage() {
  return (
    <LegalPage title={`Acerca de ${siteConfig.name}`} path="/acerca-de" draft>
      <p>
        {siteConfig.name} es un portal de calculadoras y herramientas gratuitas para resolver cálculos cotidianos de
        finanzas personales, negocios, trabajo y matemáticas.
      </p>
      <h2>Cómo trabajamos</h2>
      <ul>
        <li>Cada calculadora muestra la fórmula que utiliza y un ejemplo resuelto.</li>
        <li>Las fórmulas se verifican con pruebas automáticas que incluyen casos límite y redondeos.</li>
        <li>Diferenciamos claramente las estimaciones de los datos oficiales: no publicamos tasas de impuestos o de interés como si fueran vigentes.</li>
        <li>Los cálculos se realizan en tu navegador; no almacenamos los valores que introduces.</li>
      </ul>
      <h2>Qué no somos</h2>
      <p>
        No somos una entidad financiera ni ofrecemos asesoría financiera, legal o tributaria. Los resultados son
        orientativos y deben contrastarse con las condiciones oficiales de cada entidad u organismo.
      </p>
      <p>
        ¿Encontraste un error o echas en falta una herramienta? <Link href="/contacto">Escríbenos</Link>.
      </p>
      {/* PENDIENTE: añadir quién está detrás del proyecto (persona o empresa) y su experiencia. */}
    </LegalPage>
  );
}
