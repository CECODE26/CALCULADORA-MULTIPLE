"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { categories } from "@/config/categories";
import { Icon } from "@/components/ui/Icon";
import { Brand } from "./Brand";

const navItems = [
  ...categories.map((c) => ({ href: `/${c.slug}`, label: c.name.split(" ")[0]!, icon: c.icon })),
  { href: "/herramientas", label: "Todas", icon: "grid" as const },
];

export function Header() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [lastPath, setLastPath] = useState(pathname);

  // Cierra el menú móvil al navegar
  if (pathname !== lastPath) {
    setLastPath(pathname);
    setOpen(false);
  }

  return (
    <header className="site-header">
      <div className="container site-header__inner">
        <Brand />
        <nav className="site-nav" aria-label="Principal">
          <ul className="site-nav__links">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className="site-nav__link"
                  aria-current={pathname === item.href ? "page" : undefined}
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
          <button
            type="button"
            className="menu-toggle"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? "Cerrar menú" : "Abrir menú"}
            onClick={() => setOpen((v) => !v)}
          >
            <Icon name={open ? "close" : "menu"} size={22} />
          </button>
        </nav>
      </div>
      {open ? (
        <div className="mobile-menu" id="mobile-menu">
          <ul className="container">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href} aria-current={pathname === item.href ? "page" : undefined}>
                  <Icon name={item.icon} size={20} />
                  {item.href === "/herramientas" ? "Todas las herramientas" : categories.find((c) => `/${c.slug}` === item.href)?.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
}
