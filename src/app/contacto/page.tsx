import { siteConfig } from "@/config/site";
import { pageMetadata } from "@/lib/seo";
import { LegalPage } from "@/components/content/LegalPage";

export const metadata = pageMetadata({
  title: "Contacto",
  description: `Cómo contactar con ${siteConfig.name} para reportar errores, sugerir herramientas o consultas.`,
  path: "/contacto",
});

export default function ContactPage() {
  const email = siteConfig.contactEmail;
  return (
    <LegalPage title="Contacto" path="/contacto" lead="Reporta un error, sugiere una herramienta o haz una consulta.">
      {email ? (
        <p>
          Escríbenos a <a href={`mailto:${email}`}>{email}</a>. Respondemos lo antes posible.
        </p>
      ) : (
        <p className="review-note" role="note">
          PENDIENTE: configura NEXT_PUBLIC_CONTACT_EMAIL para mostrar el correo de contacto.
        </p>
      )}
      <h2>Para reportar un error en una calculadora</h2>
      <p>Indícanos la herramienta, los datos que introdujiste y el resultado que esperabas. Nos ayuda a revisarlo rápido.</p>
      <p>Por tu seguridad, no nos envíes datos personales ni financieros sensibles.</p>
    </LegalPage>
  );
}
