import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/content/LegalPage";

export const metadata = pageMetadata({
  title: "Términos de uso",
  description: `Condiciones de uso de las calculadoras y herramientas de ${siteConfig.name}.`,
  path: "/terminos",
});

export default function TermsPage() {
  return (
    <LegalPage title="Términos de uso" path="/terminos" draft>
      <h2>Uso de las herramientas</h2>
      <p>
        Las calculadoras de {siteConfig.name} son gratuitas y ofrecen resultados estimados con fines informativos y
        educativos. Dependen de los datos introducidos y de supuestos simplificados que se explican en cada página.
      </p>
      <h2>Sin asesoría profesional</h2>
      <p>
        Los resultados no constituyen asesoría financiera, de inversión, legal, laboral ni tributaria, ni una oferta
        de ningún producto. Antes de tomar decisiones, contrasta la información con fuentes oficiales o con un
        profesional.
      </p>
      <h2>Exactitud</h2>
      <p>
        Trabajamos para que las fórmulas sean correctas y las verificamos con pruebas, pero no garantizamos la
        ausencia de errores. Si detectas uno, te agradeceremos que nos lo comuniques.
      </p>
      <h2>Legislación aplicable</h2>
      <p>[PENDIENTE: legislación y jurisdicción aplicables, datos del titular.]</p>
    </LegalPage>
  );
}
