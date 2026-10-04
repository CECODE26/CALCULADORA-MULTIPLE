# Arquitectura del portal

## 1. Arquitectura general

Un único proyecto Next.js (App Router) en un único repositorio y dominio. Todas las herramientas comparten
configuración, sistema de diseño, SEO, analítica, publicidad y despliegue.

```
Visitante ──HTTPS──► Nginx (TLS, gzip, caché, HSTS) ──► Next.js standalone (Node 22, solo lectura)
                                                          └── páginas HTML pre-generadas (SSG)
```

* Todas las páginas se generan en el build (SSG): HTML completo para buscadores, sin servidor de base de datos.
* Los cálculos se ejecutan en el navegador (componentes cliente). Ningún valor introducido sale del dispositivo.
* La lógica matemática vive en funciones puras (`src/lib/calc`) separadas de la interfaz y cubiertas por tests.

## 2. Stack definitivo

| Capa | Elección | Motivo |
| --- | --- | --- |
| Framework | Next.js 16 (App Router, Turbopack) | SSG + metadatos SEO nativos + sitemap/robots |
| Lenguaje | TypeScript estricto (`noUncheckedIndexedAccess`) | Fórmulas sin `undefined` inesperados |
| UI | React 19 + CSS propio con tokens | Sin librerías de UI ni de gráficos: JS mínimo |
| Gráficos | SVG propio (`LineChart`, `StackedBarChart`, `ProportionBar`) | < 3 kB frente a > 100 kB de una librería |
| Tests | Vitest | Rápido, sin configuración extra |
| Lint | ESLint 9 + `eslint-config-next` (core-web-vitals, jsx-a11y, React Compiler) | Calidad y accesibilidad |
| Despliegue | Docker + Nginx + Let's Encrypt (Certbot) | VPS propio, HTTPS automático |

Dependencias de producción: solo `next`, `react` y `react-dom`.

## 3. Estructura de carpetas

Ver README («Arquitectura»). Regla: **una herramienta = una entrada en el registro + una carpeta de ruta +
una carpeta en `src/tools` + un archivo de lógica en `src/lib/calc`**.

## 4. Sistema de diseño

* Tokens en `src/styles/tokens.css`: superficie cálida (#f7f7f4), texto casi negro, **un único acento**
  verde profundo (#0b6b4d) y tonos de error/aviso. Todos los textos cumplen contraste WCAG AA.
* Modo oscuro automático con `prefers-color-scheme` (sin interruptor, sin JavaScript).
* Tipografía del sistema (cero descargas, cero CLS), números tabulares en resultados y tablas.
* Mobile-first: campos de 48 px, texto de 16 px en inputs (evita el zoom de iOS), tablas con scroll propio,
  sin scroll horizontal global (verificado a 320, 375, 390, 768 y 1280 px).
* Microinteracciones: aparición suave de resultados y errores (180–220 ms); todo se desactiva con
  `prefers-reduced-motion`.
* Componentes: `CalculatorLayout`, `NumberInput`, `CurrencyInput`, `PercentageInput`, `TimeInput`, `Select`,
  `AffixSelect`, `SegmentedControl`, `Checkbox`, `ResultCard`, `ResultBreakdown`, `ResultEmpty`,
  `ShareResult`, `NextStep`, `RelatedTools`, `GrowthBreakdown`, `DataTable`, `LineChart`, `StackedBarChart`,
  `ProportionBar`, `Breadcrumbs`, `AdSlot`, `ErrorMessage`, `SearchTools`, `ToolCard`, `CategoryCard`,
  `RecentTools`, `Disclosure`, `JsonLd`, `ConsentBanner`.

## 5. Arquitectura SEO

* URL semántica y plana por herramienta (`/calculadora-iva`), categorías (`/negocios`) y directorio (`/herramientas`).
* `title` (plantilla `%s | Marca`), `meta description`, H1 y canonical únicos por página — verificados por
  test (`src/tools/registry.test.ts`) y por auditoría del sitio construido.
* Open Graph y Twitter Card; imagen social generada en el build.
* Breadcrumbs visibles + `BreadcrumbList`; `WebApplication` (gratuita) en herramientas; `WebSite` en la home.
  No se usa `FAQPage`, `HowTo` ni valoraciones: no existen en la página y sería marcado engañoso.
* `sitemap.xml` (solo herramientas publicadas y categorías con contenido), `robots.txt` que bloquea
  entornos no productivos, 404 reales para rutas inexistentes.
* Contenido útil tras cada calculadora: qué calcula, cómo usarla, fórmula, variables, ejemplo, interpretación,
  errores frecuentes y enlaces contextuales.
* Enlazado interno por clusters (finanzas, negocios, matemáticas) definido en el registro y testeado.

### Internacionalización (preparada, no activada)

`src/config/markets.ts` define Ecuador, México, Colombia, Perú, España y EE. UU. con `active: false`.
Política: solo se crea `/{país}/{herramienta}` cuando hay una diferencia real (impuestos, normativa, moneda,
terminología o intención de búsqueda). Al declarar `regional` en una herramienta y activar el mercado,
`hreflang` se genera automáticamente (`src/lib/seo.ts`). Hoy no se emite hreflang porque no hay versiones regionales.

La moneda de los resultados la elige el usuario (pie de página) y se recuerda en su navegador; el formato
numérico se adapta (p. ej. `$1.234,50` en es-EC, `$1,234.50` en es-MX). Los campos aceptan coma o punto decimal.

## 6. Arquitectura de calculadoras

```
lib/calc/<x>.ts         función pura → CalcResult<T> = { ok: true, value } | { ok: false, error, field }
tools/<slug>/…Calculator.tsx   estado como texto → parse según locale → función pura → ResultCard
tools/<slug>/…Content.tsx      contenido explicativo (Server Component, sin JS en el cliente)
app/<slug>/page.tsx            CalculatorLayout + metadatos del registro
```

* Validación en la función pura con mensajes comprensibles asociados al campo.
* Formateadores que devuelven «—» ante cualquier valor no finito: nunca se muestra NaN/Infinity/undefined/null.
* Redondeo monetario a céntimos con ajuste en la última cuota (amortización) para que el saldo final sea 0.

## 7. Estrategia de Analytics

GA4 solo con consentimiento; eventos `calculator_view`, `calculation_completed`, `related_tool_clicked`,
`result_shared`, `search_used`. Lista blanca de parámetros categóricos; los dígitos se eliminan de los
términos de búsqueda. Los eventos anteriores a la carga de GA se encolan y solo se envían si se acepta.

## 8. Preparación de AdSense

`AdSlot` con etiqueta «Publicidad», altura reservada (CLS), sin renderizar nada si no hay ID, interruptor o
consentimiento. Ubicaciones lejos de botones y resultados. `ads.txt` automático. Desactivado por defecto.

## 9. Estrategia de despliegue

Docker multi-etapa (tests dentro del build), Nginx con TLS de Let's Encrypt, healthchecks, logs rotados,
despliegue con rollback automático si el healthcheck falla, backups de configuración y certificados.

## Estrategia de crecimiento

1. Lanzar las 11 herramientas actuales y enviar el sitemap a Search Console.
2. Tras 4–8 semanas, revisar por página: consultas, impresiones, CTR y posición media.
3. Señales para crear algo nuevo:
   * Consultas con impresiones pero sin herramienta específica (p. ej. «liquidación laboral Ecuador»).
   * Páginas en posiciones 8–20 con consultas informativas («cómo calcular margen de ganancia»): ampliar
     su contenido o crear una guía complementaria enlazada.
   * Consultas con país o impuesto concreto: candidata a versión regional (`/mx/calculadora-iva`).
4. Cada herramienta nueva sigue la misma plantilla y pasa `npm run check` antes de publicarse.
5. No se generan páginas masivas ni contenido automático.
