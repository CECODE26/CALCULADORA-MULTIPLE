import Link from "next/link";
import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/content/LegalPage";

export const metadata = pageMetadata({
  title: "Política de privacidad",
  description: `Cómo trata ${siteConfig.name} la información: los valores de las calculadoras no se almacenan ni se envían.`,
  path: "/privacidad",
});

export default function PrivacyPage() {
  return (
    <LegalPage title="Política de privacidad" path="/privacidad" draft>
      <h2>Responsable</h2>
      <p>[PENDIENTE: nombre o razón social del titular, domicilio y datos de contacto.]</p>

      <h2>Datos que introduces en las calculadoras</h2>
      <p>
        Los cálculos se realizan íntegramente en tu navegador. Los importes, tasas, metas, horarios y demás valores que
        introduces <strong>no se envían a nuestros servidores ni a terceros</strong> y no se guardan. Si usas la función
        «Copiar resumen» o «Compartir», el texto solo se comparte cuando tú lo decides.
      </p>

      <h2>Preferencias guardadas en tu dispositivo</h2>
      <p>
        Guardamos en el almacenamiento local de tu navegador: la moneda elegida, las últimas herramientas visitadas
        (solo su nombre) y tu decisión sobre cookies. Puedes borrarlos desde la configuración de tu navegador.
      </p>

      <h2>Analítica</h2>
      <p>
        Si está activada y la aceptas, usamos Google Analytics 4 para conocer de forma agregada qué herramientas se
        usan. Solo enviamos eventos como «se abrió la calculadora X» o «se completó un cálculo», sin ningún valor
        introducido. Desactivamos las señales de Google y la personalización de anuncios en Analytics.
      </p>

      <h2>Publicidad</h2>
      <p>
        El sitio puede mostrar anuncios de Google AdSense. Google y sus socios pueden usar cookies para mostrar
        anuncios según visitas anteriores. Consulta{" "}
        <a href="https://policies.google.com/technologies/ads" rel="noopener noreferrer" target="_blank">
          cómo usa Google los datos en publicidad
        </a>
        .
      </p>

      <h2>Registros del servidor</h2>
      <p>[PENDIENTE: describir los registros técnicos del servidor (IP, fecha, URL), su finalidad y plazo de conservación.]</p>

      <h2>Tus derechos</h2>
      <p>[PENDIENTE: derechos aplicables según la legislación de cada país (acceso, rectificación, supresión, etc.) y cómo ejercerlos.]</p>

      <p>
        Más información en la <Link href="/cookies">política de cookies</Link>.
      </p>
    </LegalPage>
  );
}
