import Link from "next/link";
import type { Metadata } from "next";
import { SearchTools } from "@/components/search/SearchTools";

export const metadata: Metadata = {
  title: "Página no encontrada",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  return (
    <div className="container page">
      <header className="page-head">
        <h1>No encontramos esta página</h1>
        <p className="page-head__lead">
          Puede que el enlace haya cambiado. Busca la herramienta que necesitas o vuelve al{" "}
          <Link href="/">inicio</Link>.
        </p>
      </header>
      <SearchTools />
    </div>
  );
}
