# Portal de calculadoras gratuitas

Un único proyecto web (Next.js + TypeScript) con calculadoras de finanzas, negocios, trabajo y matemáticas,
pensado para crecer con tráfico orgánico, medirse con Google Analytics 4 y monetizarse con Google AdSense
sin perjudicar la experiencia del usuario.

> La marca («Calcúlalo») y el dominio son provisionales. Se cambian desde un único lugar: las variables de
> entorno leídas en [`src/config/site.ts`](src/config/site.ts).

## Índice

1. [Instalación local](#1-instalación-local)
2. [Requisitos](#2-requisitos)
3. [Variables de entorno](#3-variables-de-entorno)
4. [Desarrollo](#4-desarrollo)
5. [Tests](#5-tests)
6. [Build](#6-build)
7. [Docker](#7-docker)
8. [Despliegue en VPS](#8-despliegue-en-vps)
9. [DNS](#9-dns)
10. [HTTPS](#10-https)
11. [Actualización](#11-actualización)
12. [Backup](#12-backup)
13. [Rollback](#13-rollback)
14. [Google Analytics 4](#14-google-analytics-4)
15. [Google Search Console](#15-google-search-console)
16. [Google AdSense](#16-google-adsense)
17. [Arquitectura](#arquitectura)
18. [Añadir una herramienta nueva](#añadir-una-herramienta-nueva)

---

## 1. Instalación local

```bash
git clone <url-del-repositorio> calculadora-multiple
cd calculadora-multiple
cp .env.example .env      # ajusta los valores si lo necesitas
npm ci
npm run dev               # http://localhost:3000
```

## 2. Requisitos

| Herramienta | Versión |
| --- | --- |
| Node.js | 22 LTS (mínimo 20.9; ver `.nvmrc`) |
| npm | 10 o superior |
| Docker + Docker Compose v2 | Solo para despliegue |

No se necesita base de datos: la aplicación no almacena datos de usuarios.

## 3. Variables de entorno

Todas están documentadas en [`.env.example`](.env.example). Las `NEXT_PUBLIC_*` se **incrustan en el build**:
si cambias alguna, vuelve a construir (`npm run build` o `deploy.sh`).

| Concepto | Variable | Por defecto |
| --- | --- | --- |
| SITE_NAME | `NEXT_PUBLIC_SITE_NAME` | `Calcúlalo` |
| SITE_URL | `NEXT_PUBLIC_SITE_URL` | `http://localhost:3000` |
| SITE_DESCRIPTION | `NEXT_PUBLIC_SITE_DESCRIPTION` | texto genérico |
| DEFAULT_LOCALE | `NEXT_PUBLIC_DEFAULT_LOCALE` | `es-EC` |
| DEFAULT_CURRENCY | `NEXT_PUBLIC_DEFAULT_CURRENCY` | `USD` |
| CONTACT_EMAIL | `NEXT_PUBLIC_CONTACT_EMAIL` | vacío (la página de contacto muestra un aviso) |
| GA_ID | `NEXT_PUBLIC_GA_ID` | vacío = Analytics desactivado |
| ADSENSE_CLIENT_ID | `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | vacío = sin anuncios |
| Interruptor de anuncios | `NEXT_PUBLIC_ADS_ENABLED` | `false` |
| Bloques de anuncio | `NEXT_PUBLIC_AD_SLOT_TOOL_IN_CONTENT`, `NEXT_PUBLIC_AD_SLOT_TOOL_BOTTOM`, `NEXT_PUBLIC_AD_SLOT_LISTING` | vacíos |
| Consentimiento obligatorio | `NEXT_PUBLIC_REQUIRE_CONSENT` | `true` |
| Verificación Search Console | `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` | vacío |
| Dominio para Nginx | `DOMAIN` | — (solo VPS) |
| Correo Let's Encrypt | `LETSENCRYPT_EMAIL` | — (solo VPS) |

Seguridad: los IDs de GA y AdSense se validan con expresiones regulares antes de usarse. El archivo `.env`
está en `.gitignore`; nunca lo subas al repositorio.

Mientras `NEXT_PUBLIC_SITE_URL` no sea `https://` (o contenga `localhost`/`staging`), `robots.txt` bloquea
la indexación para evitar que se indexe un entorno de pruebas.

## 4. Desarrollo

```bash
npm run dev         # servidor de desarrollo
npm run typecheck   # TypeScript
npm run lint        # ESLint (reglas de Next.js, accesibilidad jsx-a11y y React Compiler)
npm run check       # typecheck + lint + tests + build (lo mismo que debe pasar antes de desplegar)
```

En desarrollo, los espacios publicitarios se muestran como marcadores rayados para revisar la maquetación.

## 5. Tests

```bash
npm test            # Vitest, una sola ejecución
npm run test:watch
```

Hay pruebas matemáticas para todas las calculadoras (`src/lib/calc/*.test.ts`): casos normales, cero,
decimales, valores extremos, entradas inválidas, divisiones por cero, redondeos y negativos. También se
verifica el parseo de números escritos por personas, los formatos (nunca `NaN`, `Infinity`, `undefined` ni
`null`), el buscador, la privacidad de la analítica y la integridad SEO del registro de herramientas.

El build de Docker ejecuta los tests: si una fórmula se rompe, la imagen no se construye.

## 6. Build

```bash
npm run build       # genera .next/ (salida "standalone" para Docker)
npm start           # sirve el build en http://localhost:3000
```

Todas las páginas son estáticas (SSG); solo `/api/health` es dinámica.

## 7. Docker

* `Dockerfile`: multi-etapa, Node 22 Alpine, usuario sin privilegios, `HEALTHCHECK` contra `/api/health`.
* `docker-compose.yml`: servicios `app` (no expuesto a Internet, sistema de archivos de solo lectura),
  `nginx` (puertos 80/443) y `certbot` (renovación automática). Logs con rotación (`10m × 5`).

```bash
docker compose build app
docker compose up -d
docker compose ps
docker compose logs -f app nginx
```

## 8. Despliegue en VPS

Probado con Ubuntu 22.04/24.04 o Debian 12. Pasos (una sola vez):

```bash
# 1. Docker
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER   # vuelve a iniciar sesión

# 2. Cortafuegos: solo SSH, HTTP y HTTPS
sudo ufw allow OpenSSH && sudo ufw allow 80/tcp && sudo ufw allow 443/tcp && sudo ufw enable

# 3. Código y configuración
git clone <url-del-repositorio> /opt/calculadora && cd /opt/calculadora
cp .env.example .env && chmod 600 .env
nano .env   # NEXT_PUBLIC_SITE_URL=https://tudominio.com, DOMAIN=tudominio.com, LETSENCRYPT_EMAIL=…

# 4. DNS apuntando al VPS (sección 9) y luego HTTPS (sección 10)
./deploy/scripts/init-letsencrypt.sh
```

Recomendado: acceso SSH solo con clave, actualizaciones automáticas de seguridad (`unattended-upgrades`)
y un usuario sin privilegios para desplegar.

## 9. DNS

En tu proveedor de dominio crea:

| Tipo | Nombre | Valor |
| --- | --- | --- |
| A | `@` | IP pública del VPS |
| A | `www` | IP pública del VPS |
| AAAA | `@` y `www` | IPv6 del VPS (solo si tiene) |

Comprueba la propagación con `dig +short tudominio.com` antes de solicitar el certificado.

## 10. HTTPS

`deploy/scripts/init-letsencrypt.sh` obtiene el certificado de Let's Encrypt para `DOMAIN` y `www.DOMAIN`
(usa `STAGING=1` para una prueba sin límites de emisión). Después:

* `certbot` intenta renovar cada 12 h y Nginx se recarga cada 24 h.
* Nginx redirige HTTP → HTTPS y `www` → dominio canónico, envía HSTS, comprime con gzip y cachea
  `/_next/static` (1 año, inmutable) y las páginas (10 min).
* Configuración en `deploy/nginx/` (plantilla con `${DOMAIN}` procesada al arrancar).

## 11. Actualización

```bash
cd /opt/calculadora
./deploy/scripts/deploy.sh          # rama main (o: deploy.sh otra-rama)
```

El script: hace `git pull`, construye una imagen etiquetada con el commit (ejecutando los tests), la
arranca, espera el healthcheck, vacía la caché de páginas de Nginx y conserva las 5 últimas imágenes.
**Si la nueva versión no queda sana, vuelve sola a la anterior.**

## 12. Backup

La aplicación no guarda datos de usuarios; lo que hay que proteger es la configuración:

```bash
./deploy/scripts/backup.sh
```

Genera `deploy/backups/backup-FECHA.tar.gz` con `.env`, certificados, historial de versiones y commit
activo (conserva 14). Contiene secretos: cópialo cifrado fuera del servidor. Ejemplo de cron diario:

```cron
30 3 * * * cd /opt/calculadora && ./deploy/scripts/backup.sh >> /var/log/calculadora-backup.log 2>&1
```

Restaurar: extrae el archivo, copia `env` a `.env` y, si hace falta, restaura los certificados en el
volumen `calculadora_certbot-etc` (`tar xzf letsencrypt.tar.gz -C /etc` dentro de un contenedor con el volumen montado).

## 13. Rollback

```bash
./deploy/scripts/rollback.sh          # vuelve a la versión anterior
./deploy/scripts/rollback.sh a1b2c3d  # o a un commit concreto (de las 5 imágenes conservadas)
cat deploy/.release-history           # versiones desplegadas
```

## 14. Google Analytics 4

1. Crea una propiedad GA4 y un flujo web; copia el ID de medición (`G-XXXXXXXXXX`).
2. Ponlo en `NEXT_PUBLIC_GA_ID` y despliega.
3. GA solo se carga tras aceptar el aviso de cookies (si `NEXT_PUBLIC_REQUIRE_CONSENT=true`).
   Se desactivan las señales de Google y la personalización de anuncios.

Eventos personalizados (regístralos como dimensiones personalizadas en GA4 si quieres segmentar):

| Evento | Parámetros | Cuándo |
| --- | --- | --- |
| `calculator_view` | `tool_slug`, `tool_category` | Se abre una calculadora |
| `calculation_completed` | `tool_slug`, `mode` | Primer resultado válido tras editar datos (una vez por modo) |
| `related_tool_clicked` | `from_tool`, `to_tool`, `position` o `placement` | Clic en una herramienta relacionada |
| `result_shared` | `tool_slug`, `method` (`copy`/`native`) | Se copia o comparte el resumen |
| `search_used` | `search_term` (sin dígitos), `selected_tool`, `results_count` | Se elige un resultado del buscador |

**Privacidad:** `src/lib/analytics.ts` filtra los parámetros con una lista blanca. Nunca se envían montos,
tasas, metas, salarios, horarios ni valores introducidos (hay tests que lo verifican).

## 15. Google Search Console

1. Añade una propiedad de tipo **Dominio** (verificación por registro DNS TXT, recomendada) o de tipo
   **Prefijo de URL** (puedes usar `NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION` con el código de la meta etiqueta).
2. Envía el sitemap: `https://tudominio.com/sitemap.xml`.
3. Comprueba `https://tudominio.com/robots.txt` (debe permitir el rastreo y enlazar el sitemap).
4. Usa «Inspección de URLs» para solicitar la indexación de las calculadoras principales.
5. A las pocas semanas, revisa en **Rendimiento**: consultas, impresiones, CTR y posición por página.
   Estos datos deciden las próximas herramientas y contenidos (ver «Estrategia de crecimiento» en
   [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)).

## 16. Google AdSense

Los anuncios están **desactivados** hasta que proporciones datos reales.

1. Solicita AdSense con el dominio en producción (las páginas legales deben estar revisadas).
2. Cuando te aprueben, define `NEXT_PUBLIC_ADSENSE_CLIENT_ID=ca-pub-…`.
3. Crea bloques de anuncios «display adaptables» y copia su `data-ad-slot` en
   `NEXT_PUBLIC_AD_SLOT_TOOL_IN_CONTENT`, `NEXT_PUBLIC_AD_SLOT_TOOL_BOTTOM` y `NEXT_PUBLIC_AD_SLOT_LISTING`.
4. Activa `NEXT_PUBLIC_ADS_ENABLED=true` y despliega. `/ads.txt` se genera automáticamente con tu ID.
5. **EEE, Reino Unido y Suiza:** Google exige una CMP certificada (TCF). Activa «Privacidad y mensajes» en
   AdSense antes de servir anuncios a esas regiones y actualiza la política de cookies.

Ubicaciones (componente `AdSlot`): dentro del contenido explicativo, al final de cada herramienta y al
final de las páginas de categoría. Nunca entre los campos y el resultado; siempre con la etiqueta
«Publicidad» y altura reservada para evitar saltos de diseño (CLS).

---

## Arquitectura

Resumen (detalle en [`docs/ARQUITECTURA.md`](docs/ARQUITECTURA.md)):

```
src/
  app/                    Rutas (App Router). Una carpeta por herramienta: /calculadora-prestamos, …
    [category]/           /finanzas, /negocios, /trabajo, /matematicas (SSG)
    herramientas/         Directorio de todas las herramientas
    sitemap.ts robots.ts manifest.ts opengraph-image.tsx ads.txt/ api/health/
  config/                 site.ts (configuración central), categorías, mercados, monedas, cabeceras
  tools/registry.ts       Registro único: metadatos SEO, buscador, enlazado interno, sitemap
  tools/<slug>/           Calculadora (cliente) + contenido explicativo (servidor) de cada herramienta
  lib/calc/               Lógica matemática pura y testeada (sin React)
  lib/                    Formatos, parseo numérico, buscador, analítica, SEO, almacenamiento local
  components/             Sistema de componentes reutilizables (ver docs)
  styles/                 Tokens de diseño, base, layout y componentes (CSS sin dependencias)
deploy/                   Nginx, scripts de despliegue, backup y rollback
```

## Añadir una herramienta nueva

1. Lógica pura + tests en `src/lib/calc/<nombre>.ts` (devuelve `CalcResult`, nunca `NaN`/`Infinity`).
2. Entrada en `src/tools/registry.ts` (slug, title ≤ 62 caracteres, description 110–170, H1, keywords,
   categoría, relacionadas). Usa `live: false` mientras esté en preparación.
3. `src/tools/<slug>/<Nombre>Calculator.tsx` (cliente) y `<Nombre>Content.tsx` (servidor).
4. `src/app/<slug>/page.tsx` con `CalculatorLayout` y `toolMetadata(slug)`.
5. `npm run check`. El sitemap, el buscador, las categorías y el enlazado se actualizan solos.
