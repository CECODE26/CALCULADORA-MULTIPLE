import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/content/LegalPage";
import { ConsentSettingsLink } from "@/components/analytics/ConsentSettingsLink";

export const metadata = pageMetadata({
  title: "Política de cookies",
  description: `Qué cookies y almacenamiento local utiliza ${siteConfig.name} y cómo cambiar tus preferencias.`,
  path: "/cookies",
});

export default function CookiesPage() {
  return (
    <LegalPage title="Política de cookies" path="/cookies" draft>
      <h2>Almacenamiento técnico (siempre activo)</h2>
      <p>
        Usamos el almacenamiento local del navegador para recordar la moneda elegida, las herramientas usadas
        recientemente y tu decisión sobre cookies. No contiene datos personales ni valores de las calculadoras.
      </p>
      <h2>Cookies de medición (opcionales)</h2>
      <p>Google Analytics 4 (cookies _ga, _ga_*), solo si las aceptas. Sirven para medir de forma agregada el uso del sitio.</p>
      <h2>Cookies publicitarias (opcionales)</h2>
      <p>Google AdSense y sus socios, cuando la publicidad esté activa y según tu consentimiento.</p>
      <p>
        [PENDIENTE: antes de mostrar anuncios a usuarios del Espacio Económico Europeo, Reino Unido o Suiza, configurar
        una plataforma de gestión de consentimiento certificada por Google (por ejemplo, «Privacidad y mensajes» de
        AdSense) y actualizar esta sección.]
      </p>
      <h2>Cambiar tus preferencias</h2>
      <p>
        <ConsentSettingsLink />
      </p>
      <p>También puedes eliminar las cookies desde la configuración de tu navegador.</p>
    </LegalPage>
  );
}
