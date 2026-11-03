# Spec: páginas propias por producto (SEO + Google Shopping + previews rotas)

Estado: **planificado, no implementado**. Archivado 2026-09-24. No tocar código hasta que Facu lo apruebe explícitamente en una sesión de implementación.

## Contexto

A&G Perfumes (aygperfumes.com.ar) es una sola página web (SPA) sin rutas propias: `src/App.tsx`
arma todo en un componente, y cada perfume se ve en una ventana modal que se abre sobre la misma
URL. Esto bloquea dos cosas encontradas en la misma semana (sept. 2026):

1. **SEO** (auditoría 16/09, `project_seo-auditoria-2026-09-16` en memoria): Google recibe un
   `<div id="root"></div>` casi vacío al leer el sitio — no puede indexar productos individuales.
2. **Google Shopping** (hallazgo 24/09): exige una URL única por producto con precio/stock
   visibles sin depender de JavaScript. Hoy no existe esa URL.

Investigación adicional (24/09) encontró un tercer problema del mismo origen: los links a
perfumes compartidos por WhatsApp/Instagram no muestran vista previa (foto/nombre) porque esas
apps leen el HTML crudo sin ejecutar JavaScript, igual que Google.

## Decisión de arquitectura (tomada con Facu, 24/09)

Se evaluaron dos caminos con investigación antagónica (dos agentes, uno a favor de cada uno):

- **Migrar a un framework SSR completo (React Router v8, framework mode)**: soporte oficial GA de
  Cloudflare, comunidad enorme (Shopify). Pero: 3-5 días reales, sube Vite a v6+, riesgo real sobre
  carrito/checkout WhatsApp/panel admin (única fuente de ingresos), desproporcionado para un sitio
  con 2-3 visitas/día.
- **Una ruta nueva en el Worker de Cloudflare que ya existe, sin framework** (elegido): resuelve
  igual de completo el problema de hoy (URL única + contenido ya en el HTML + datos frescos de
  Supabase en cada visita), sin tocar nada del sitio actual. Además arregla las vistas previas
  rotas de WhatsApp/Instagram de yapa.

**Decisión: la ruta chica.** No es un parche — resuelve entero lo que se necesita hoy. Migrar a un
framework completo queda para el día que el sitio necesite routing/lógica de servidor de verdad
(hoy no es el caso). Ver `feedback_soluciones-completas-no-parches` en memoria — esto NO contradice
esa regla, la satisface con el tamaño correcto.

## Estado actual verificado (24/09/2026)

- `worker/index.ts` (5 líneas): solo reenvía todo a `env.ASSETS.fetch(request)`, sin lógica propia.
- `wrangler.toml`: sin ninguna ruta especial declarada, `not_found_handling = "single-page-application"`.
- `src/App.tsx:36-52`: tipo `Perfume` real — `id, name, subtitle, family, notes, price, volume,
  accent, image, description, variants?, category?, brand?, gender?, in_stock?`. El `id` ya es un
  slug legible (ej. `lattafa-angham`, `victorias-secret-bare-vanilla`).
- `index.html`: el bloque JSON-LD solo trae `Organization`. Los 6 productos viejos (precios
  desactualizados) se sacaron el 2026-11-02, sin esperar a esta spec: Google solo usa ese marcado
  en páginas de un solo producto.
- `public/sitemap.xml`: hoy es un archivo estático a mano con solo la home (creado 16/09).
- Supabase: tabla `perfumes`, clave pública (`anon key`) ya expuesta en el bundle del cliente —
  reusarla en el Worker no es una exposición nueva.

## Cambio propuesto

### 1. `wrangler.toml`
Agregar bajo `[assets]`:
```toml
run_worker_first = ["/producto/*"]
```
Esto hace que SOLO las URLs `/producto/algo` corran código del Worker; todo lo demás (home,
`/admin`, assets) sigue sirviéndose como archivo estático, exactamente igual que hoy.

### 2. Variables de entorno RUNTIME nuevas en Cloudflare (Settings, no Build)
`SUPABASE_URL` y `SUPABASE_ANON_KEY` — mismos valores que ya usa el cliente (`VITE_SUPABASE_URL`/
`VITE_SUPABASE_ANON_KEY`), pero sin el prefijo `VITE_` porque estas las lee el Worker en
ejecución, no Vite al compilar. Ver `project_migracion-cloudflare-2026-08-28` en memoria — ya hubo
un bug real por confundir build vars con runtime vars, probar explícitamente después del deploy.

### 3. `worker/index.ts` — nueva rama
Cuando la URL es `/producto/:id`:
1. Fetch directo a la API REST de Supabase (`${SUPABASE_URL}/rest/v1/perfumes?id=eq.${id}`) con
   la `anon key` en el header — sin agregar `@supabase/supabase-js` como dependencia del Worker,
   para mantenerlo mínimo (ya es filosofía del proyecto: worker mínimo).
2. Si no existe ese `id` → responder 404 real (no la SPA).
3. Si existe → armar un HTML standalone (sin React, un template de texto) con:
   - `<title>`, meta description
   - `og:title`, `og:description`, `og:image` (URL absoluta a la foto real), `og:url`
   - `twitter:card`, `twitter:title`, `twitter:image`
   - JSON-LD `Product` real: nombre, imagen, descripción/notas, `offers` con precio real y
     `availability` según `in_stock` (`InStock` / `OutOfStock`)
   - Contenido visible: foto, nombre, precio, notas, un botón de WhatsApp directo (mismo formato
     de mensaje que ya arma `App.tsx` para el checkout) y un link "Ver todo el catálogo" que manda
     a la home
4. Escapar todo texto que venga de Supabase antes de insertarlo en el HTML (nombre, notas) —
   por seguridad, aunque hoy solo Gisela carga contenido desde `/admin`.

### 4. `index.html` — limpieza
Ya hecha el 2026-11-02: los productos salieron del JSON-LD de `index.html`. Queda solo agregar el
JSON-LD real de cada página `/producto/:id`.

### 5. `public/sitemap.xml` → dinámico
Mover el sitemap al mismo patrón: una ruta `/sitemap.xml` en el Worker (agregarla a
`run_worker_first`) que consulte Supabase y liste la home + todas las URLs `/producto/:id` de
productos con `in_stock = true`. Así se actualiza solo cuando Gisela agrega/saca productos, sin
que Facu tenga que regenerarlo a mano (mismo problema que ya se identificó con el sitemap estático
actual).

### 6. Catálogo de Google Shopping (separado, no bloqueante)
Un script nuevo (mismo estilo que `scripts/optimize-images.mjs`) que lea Supabase y genere el feed
de productos que pide Google Merchant Center (XML con id/title/price/availability/image_link/link
— el `link` de cada producto apunta a su `/producto/:id` real). Se sube a mano a Merchant Center al
principio; automatizarlo queda fuera de este spec.

## Qué NO cambia

`src/App.tsx` (catálogo, carrito, modal, filtros), el checkout por WhatsApp, el panel `/admin`,
el login de Gisela — cero líneas tocadas. El visitante normal que navega el sitio no nota ninguna
diferencia.

## Out of scope (explícitamente, no meter de prepo)

- Migrar el sitio a un framework SSR completo (React Router, Next.js, Vike) — evaluado y
  descartado por ahora, ver "Decisión de arquitectura" arriba.
- Automatizar el envío del feed a Google Merchant Center.
- Cambiar el modal actual por navegación a `/producto/:id` para el visitante normal — la página
  nueva es solo para Google/compartir, el catálogo sigue funcionando en modal como hoy.
- Botón de "compartir" dentro del modal (podría sumarse después, no es parte de este spec).

## Acceptance criteria

1. `curl https://aygperfumes.com.ar/producto/lattafa-angham` (sin ejecutar JavaScript) devuelve
   HTML con el nombre, precio y foto reales del producto.
2. Un `id` que no existe en Supabase devuelve HTTP 404.
3. La herramienta de depuración de Open Graph de Meta/WhatsApp muestra foto y título al pegar un
   link `/producto/:id`.
4. `/sitemap.xml` lista todas las URLs de productos con `in_stock = true`, sin mantenimiento manual.
5. El sitio principal (home, catálogo, carrito, checkout WhatsApp, `/admin`) funciona exactamente
   igual que antes del cambio — verificado a mano después del deploy.
6. Google Search Console, en "Inspección de URLs", puede leer correctamente al menos 3 URLs de
   producto distintas.

## Plan de pruebas

| Capa | Qué probar |
| --- | --- |
| Directa (curl) | HTML de 3-4 productos distintos, uno con `in_stock = false`, uno con `id` inválido (404) |
| Producción real | Depurador de Open Graph de Meta con un link `/producto/:id` real |
| Regresión | Carrito, checkout WhatsApp, login y alta de producto en `/admin`, en celular real |
| Google | Enviar 1-2 URLs de producto a "Inspección de URLs" en Search Console |

## Rollback

Es un cambio aditivo — no modifica nada existente. Si algo sale mal, revertir el commit del
Worker/`wrangler.toml` deja el sitio exactamente como está hoy, sin efecto en el resto.

## Esfuerzo estimado

| Parte | Estimado |
| --- | --- |
| Ruta `/producto/:id` + meta tags + JSON-LD | ~medio día |
| Sitemap dinámico | ~1-2 horas |
| Pruebas (curl + Open Graph + regresión en celu real) | ~1 hora |
| Feed de Google Shopping (aparte, no bloqueante) | ~medio día |
| **Total** | **1-2 días reales**, sin contar el feed de Shopping |

## Referencias de memoria del proyecto

`project_seo-auditoria-2026-09-16`, `project_plan-crecimiento-marca-2026-09-23`,
`project_migracion-cloudflare-2026-08-28`, `feedback_soluciones-completas-no-parches`,
`feedback_siempre-probar-en-mobile`.
