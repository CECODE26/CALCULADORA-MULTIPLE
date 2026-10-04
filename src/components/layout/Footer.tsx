import Link from "next/link";
import { siteConfig } from "@/config/site";
import { categories } from "@/config/categories";
import { toolsInCategory, toolPath } from "@/tools/registry";
import { CurrencyPicker } from "./CurrencyPicker";
import { ConsentSettingsLink } from "@/components/analytics/ConsentSettingsLink";

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="container site-footer__grid">
        {categories.map((cat) => {
          const list = toolsInCategory(cat.slug).filter((t) => t.category === cat.slug);
          return (
            <div key={cat.slug}>
              <h2>
                <Link href={`/${cat.slug}`}>{cat.name}</Link>
              </h2>
              <ul>
                {list.length === 0 ? <li>Próximamente</li> : null}
                {list.map((t) => (
                  <li key={t.slug}>
                    <Link href={toolPath(t.slug)}>{t.name}</Link>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}
        <div>
          <h2>{siteConfig.name}</h2>
          <ul>
            <li>
              <Link href="/herramientas">Todas las herramientas</Link>
            </li>
            <li>
              <Link href="/acerca-de">Acerca de</Link>
            </li>
            <li>
              <Link href="/contacto">Contacto</Link>
            </li>
            <li>
              <Link href="/privacidad">Privacidad</Link>
            </li>
            <li>
              <Link href="/cookies">Cookies</Link>
            </li>
            <li>
              <Link href="/terminos">Términos de uso</Link>
            </li>
            <li>
              <ConsentSettingsLink />
            </li>
          </ul>
        </div>
      </div>
      <div className="container site-footer__bottom">
        <span>
          © {year} {siteConfig.name}. Los resultados son estimaciones informativas y no constituyen asesoría
          financiera, legal ni tributaria.
        </span>
        <CurrencyPicker />
      </div>
    </footer>
  );
}
