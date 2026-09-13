# ecommerce-perfumes (A&G Perfumes)

Ecommerce de reventa de perfumes multimarca en Argentina.
Contexto completo: @docs/PRODUCT.md y @docs/DESIGN.md

## Historia del stack (leer antes de asumir algo del código viejo)
Hasta el 2026-08-17 el proyecto era Next.js + Sanity + shadcn/ui, con un diseño cinemático
a medida (preloader, hero con Light Rays, parallax). El 2026-08-17 se reemplazó por completo
por el resultado de un proyecto hecho en **Bolt.new** (repo `Facuusosa/PERFUMES`), decisión
tomada explícitamente por Facu sabiendo que pisaba el stack anterior. El diseño y código
viejo quedan preservados en la rama `backup/diseno-cinematico-nextjs-sanity` por si se
retoma algo de ahí (Light Rays, tipografía Fraunces/Space Grotesk, mecanismos de DESIGN.md).

## Stack actual (real, verificado en package.json — no reevaluar sin discutirlo primero)
- **Vite + React 18 + TypeScript**, todo en una sola página (`src/App.tsx`).
- **Tailwind** (config propia, sin shadcn/ui).
- **Supabase** como backend: tabla `perfumes`, con fallback embebido en el propio
  `App.tsx` si no hay variables de entorno configuradas. El catálogo inicial se cargó por
  migraciones SQL (`supabase/migrations/`), pero **desde el 2026-08-27 ya existe un panel
  de admin real en `/admin`** (`src/admin/`: `Login.tsx`, `Dashboard.tsx`, `ProductForm.tsx`,
  `AdminApp.tsx`), en producción en `aygperfumes.com.ar/admin`. Login con Supabase Auth
  (registro público desactivado a propósito, cuenta de la clienta creada a mano), permite
  alta/edición/baja de productos con foto (sube a Supabase Storage), con RLS restringido a
  usuarios autenticados (`supabase/migrations/20260826010000_admin_panel_security.sql`).
  Resuelve el requisito no negociable original ("cómo carga producto la clienta sin ayuda
  técnica"). Probado de punta a punta (crear/editar/borrar) antes de integrarse a `master`.
  El campo `stock` **[DECIDIDO 2026-08-30] no se agrega por ahora** — la clienta maneja poco
  volumen y no tiene lugar físico para un control granular por unidad; se retoma si el
  catálogo crece. Ver `docs/PRODUCT.md`.
- **Checkout por WhatsApp** (arma el mensaje con el pedido y el precio, no hay Mercado Pago
  integrado en este código). Revisar con Facu si esto es definitivo o intermedio.
- **Hosting: Cloudflare Workers (static assets), migrado desde Netlify el 2026-08-28.**
  Netlify pausó el sitio completo (503) al superar los 300 créditos/mes de su plan free —
  causa real: 15 deploys individuales en el mes (225 créditos) + fotos de catálogo sin
  comprimir (107 créditos de bandwidth). En vez de pagar Netlify, se migró a Cloudflare
  (dominio ya estaba delegado ahí, ver `docs/PRODUCT.md`), que no tiene ese mecanismo de
  "créditos que agotan y pausan todo" — plan gratis, ancho de banda sin límite publicado,
  500 builds/mes (vs. los ~15-20/mes que veníamos gastando). `netlify.toml` se sacó del
  repo el 2026-08-30 (ya no se usa); el deploy real es `wrangler.toml` + `worker/index.ts`
  (Worker mínimo que sirve `dist/` como static assets, `not_found_handling =
  "single-page-application"` resuelve el routing de SPA). **Ojo con las variables de
  entorno en Cloudflare: hay dos secciones distintas y es fácil confundirlas** — "Runtime
  variables and secrets" (Settings, solo las ve el Worker en ejecución) vs. "Build
  variables and secrets" (Settings → Build, las que Vite necesita en `npm run build` para
  embeber `import.meta.env.VITE_*`). `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` tienen
  que estar cargadas en la sección de **Build**, si no el sitio cae al catálogo de
  fallback local sin avisar (no tira error, simplemente no llama a Supabase). No evaluar
  Vercel para este proyecto: su plan gratuito prohíbe ecommerce/checkout explícitamente
  (Acceptable Use Policy, verificado 2026-08-23).
- **Fotos de catálogo: WebP, no PNG.** Las 57 fotos originales (PNG sin comprimir, 114 MB
  en total) se convirtieron a WebP calidad 85 (12 MB, -89.7%, sin pérdida visual — eran la
  causa del bandwidth alto). El backup local de esos PNG (`assets-originales-fotos-perfumes/`)
  se borró del disco el 2026-08-30 por ocupar 114 MB de más sin aportar nada: los 57 PNG ya
  quedaron a salvo para siempre en el historial de git (verificado archivo por archivo antes
  de borrar) — si hace falta alguno, se recupera con `git log --all --diff-filter=A -- '*nombre*.png'`
  y `git show <commit>:<path> > archivo.png`. No recrear esa carpeta como "backup" — es
  redundante. Script reutilizable para optimizar fotos nuevas:
  `node scripts/optimize-images.mjs <origen> <destino>`. Al subir fotos nuevas al catálogo,
  pasarlas por ese script antes de comitear — el panel de admin (`ProductForm.tsx`) todavía
  NO comprime automáticamente lo que sube la clienta.
  **Distinto es `fotos-clienta/FOTOS-FINALES/` (115 MB, gitignored) — NO tocar/borrar.**
  Aunque comparte nombre de archivo con el catálogo ya optimizado, son los PNG con fondo
  transparente sin comprimir (confirmado por Facu 2026-08-30) — el archivo fuente de mejor
  calidad para reutilizar en flyers/redes/rediseños. No tiene respaldo en git (esa carpeta
  siempre estuvo en `.gitignore`), a diferencia del backup ya borrado arriba.

## Arquitectura del código (cómo están conectados los archivos)
- **No hay router.** `src/main.tsx` decide entre dos apps totalmente separadas según el
  pathname: `/admin` (o subruta) monta `AdminApp`, cualquier otra ruta monta `App` (el sitio
  público). Solo el sitio público llama a `initAnalytics()` — el panel de admin nunca manda
  eventos a PostHog/Clarity. Dentro de cada app la navegación es por anchors (`#coleccion`,
  `#historia`) con `scrollIntoView`, no hay páginas ni rutas internas.
- **`src/App.tsx` es un único componente** que concentra todo el sitio público: catálogo,
  filtros (categoría/familia/género/precio/búsqueda), paginación, modal de producto, carrito y
  checkout. Todo el estado vive en `useState`/`useMemo` locales a ese componente — no hay
  Context ni store global. Al montar, un `useEffect` pisa el array `fallbackPerfumes`
  (catálogo de emergencia embebido arriba del componente) con lo que devuelva Supabase; si
  `supabase` es `null` o la query falla, el sitio se queda con ese fallback sin avisar.
- **Checkout:** el carrito nunca toca ningún backend. `whatsappCartLink` arma un link
  `https://wa.me/...?text=...` con el pedido codificado en la URL; el botón de "finalizar
  compra" es un `<a href>` normal a ese link (nunca `window.open()` — ver
  `feedback`/`project_checkout-whatsapp-definitivo` en memoria del proyecto, un bug viejo
  truncaba el mensaje al usar `&` sin escapar).
- **`src/lib/supabaseClient.ts`** exporta `supabase` como `null` cuando faltan
  `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY`. Todo código que lo importa (`App.tsx`,
  `src/admin/*`) tiene que chequear ese `null` antes de usarlo.
- **`src/lib/analytics.ts`** inicializa PostHog y Microsoft Clarity juntos en una sola función
  (`initAnalytics`), con los IDs de proyecto hardcodeados (son claves públicas de tracking, no
  secretos — no hace falta moverlos a `.env`).
- **Panel de admin (`src/admin/`)**, app React separada montada por `main.tsx`: `Login.tsx`
  (Supabase Auth, registro público desactivado) → `AdminApp.tsx` (gatea todo según haya sesión
  de Supabase o no) → `Dashboard.tsx` (lista y borra productos) → `ProductForm.tsx` (alta y
  edición, sube la foto directo a Supabase Storage sin comprimir — por eso existe
  `scripts/optimize-images.mjs` para pasarlas a mano antes de subirlas al catálogo por SQL).
- **`supabase/migrations/`** es la fuente de verdad del schema Y del catálogo: son migraciones
  SQL con `INSERT` de productos reales, no hay seeds separados del schema. Antes de asumir qué
  campos tiene un producto, revisar la migración más reciente que toque la tabla `perfumes`,
  no solo el `type Perfume` de `App.tsx` (pueden estar desincronizados).

## Riesgos conocidos de los planes gratis del stack (revisar si algo "deja de andar")
- **Supabase se pausa solo tras 7 días sin recibir ninguna petición a su API.** Si el sitio
  alguna vez queda caído más de 2-3 días por cualquier motivo, chequear también el estado
  del proyecto en Supabase (Settings → General) antes de asumir que el único problema es
  el hosting.
- **Supabase Storage: 1 GB de límite gratis.** El panel de admin sube fotos sin comprimir
  ahí — no es un problema con el volumen actual (57 productos), pero puede acercarse si el
  catálogo crece mucho. Ver `scripts/optimize-images.mjs` para comprimir manualmente.
- Detalle completo y por qué se investigó esto: ver memoria del proyecto
  `feedback_vigilar-limites-free-tier-proveedores`.

## Contradicciones con `docs/DESIGN.md` heredado (a resolver, no ignorar)
El código trae **Inter + Playfair Display** y colores propios (`#0b0b0a`, acento `#c99558`),
mientras que `DESIGN.md` decía "nunca Inter" y Fraunces + Space Grotesk. `docs/DESIGN.md` ya
se actualizó para describir el estado real; si en algún momento se quiere volver a la
tipografía/paleta anterior, es una decisión a tomar con Facu, no a aplicar de oficio.

- El nombre de marca es **A&G Perfumes** (cambiado de "A&G Gisela" el 2026-08-26, a pedido
  de Facu — el sitio se va a llamar `aygperfumes`). Los socios siguen siendo Ariel y Gisela;
  solo cambió el nombre visible de marca/dominio.
- Las fotos de producto (`public/images/perfumes/`) ya son de los perfumes reales que la
  clienta vende (no placeholders de stock genérico como antes).

## Health Stack
- typecheck: npm run typecheck
- lint: npm run lint
- test: (no hay framework de testing instalado — decisión explícita, ver memoria del proyecto)
- deadcode: (no hay knip instalado)
- shell: (no hay scripts .sh en el repo)
