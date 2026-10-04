# Auditoría final (Fase 15) — 2026-10-04

Resultados obtenidos ejecutando las comprobaciones sobre el build de producción.

| Área | Comprobación | Resultado |
| --- | --- | --- |
| Tests | `npm test` (Vitest) | 10 archivos, 118 tests: todos pasan |
| Lint | `npm run lint` (Next core-web-vitals, jsx-a11y, React Compiler) | 0 errores, 0 avisos |
| Tipos | `npm run typecheck` | 0 errores |
| Build | `npm run build` | Correcto, sin avisos; 29 rutas estáticas + `/api/health` dinámica |
| Funcional | 24 escenarios en navegador real (todas las calculadoras, modos, errores, buscador, moneda) | 24/24 |
| Responsive | 22 URLs × 320/375/390/430/768/1280 px | Sin scroll horizontal ni NaN/Infinity/undefined/null visibles |
| SEO | Title, description, canonical, 1 H1, Open Graph en las 22 URLs del sitemap; enlaces internos; 404 | Sin problemas; titles y descriptions únicos |
| Accesibilidad | axe-core (WCAG 2.0/2.1 A-AA + buenas prácticas), modo claro y oscuro | 0 violaciones (2 corregidas durante la auditoría) |
| Teclado | Orden de tabulación, enlace «Saltar al contenido», foco visible, flechas en selectores | Correcto |
| Rendimiento | Móvil 390 px, red 4G lenta (150 ms, 1,6 Mbps) y CPU ×4 | LCP 0,58–0,76 s; CLS 0,000; ~165–180 KB de JS comprimido por herramienta |
| Analytics | Build de prueba con ID ficticio y peticiones interceptadas | 0 peticiones antes del consentimiento; 5 eventos correctos; ningún valor introducido enviado |
| AdSense | Build de prueba con ID ficticio | Sin anuncios antes del consentimiento; etiquetados «Publicidad»; 280 px reservados; siempre por debajo del resultado |
| Seguridad | `npm audit --omit=dev`; cabeceras; secretos | 0 vulnerabilidades en producción; CSP, HSTS, nosniff, X-Frame-Options, Referrer/Permissions-Policy; sin secretos en git |
| Docker / Nginx | Imagen construida y pila probada con TLS autofirmado | Healthcheck sano; HTTP→HTTPS; gzip; caché inmutable de estáticos; RSC con clave de caché propia |

## Problemas encontrados y corregidos durante el proyecto

* Scroll horizontal en móvil por la tabla dentro del grid y por `<fieldset>` (min-width implícito).
* Textos de gráficos ilegibles en móvil → los SVG ahora se dibujan al ancho real del contenedor.
* Selector de modos cortado en 320–390 px → etiquetas en dos líneas.
* `-0` en el punto de equilibrio con costos fijos 0.
* «54,02 %» partido en dos líneas → espacio de no separación.
* Evento `calculator_view` perdido en la primera página → cola de eventos hasta que GA se inicializa (solo con consentimiento).
* `listen [::]` en Nginx fallaba en redes Docker sin IPv6.
* Nginx habría cacheado páginas 1 año por el `s-maxage` de Next.js → límite de 10 min y purga en cada despliegue.
* `add_header` dentro de `location` anulaba HSTS → eliminado.
* OCSP stapling retirado (Let's Encrypt ya no ofrece OCSP).
* Home con herramientas duplicadas entre secciones.
* Bloques de fórmula con scroll no accesibles por teclado; landmark con nombre duplicado.

## Avisos conocidos (no bloqueantes)

* `npm audit` informa de una vulnerabilidad *high* en `braces` (ReDoS), dependencia **solo de desarrollo**
  a través de `eslint-config-next` → `fast-glob`. No forma parte de la imagen de producción. Revisar
  cuando Next.js publique una versión que la actualice.
* Los textos legales están marcados como **BORRADOR** y deben revisarse antes del lanzamiento.
* La CSP permite `'unsafe-inline'` en scripts (necesario para páginas estáticas de Next.js sin nonces).
