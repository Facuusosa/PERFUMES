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
  Pendiente menor: el campo `stock` no está en el formulario todavía (decisión de producto
  sin tomar, no un olvido).
- **Checkout por WhatsApp** (arma el mensaje con el pedido y el precio, no hay Mercado Pago
  integrado en este código). Revisar con Facu si esto es definitivo o intermedio.
- **Hosting: Cloudflare Workers (static assets), migrado desde Netlify el 2026-08-28.**
  Netlify pausó el sitio completo (503) al superar los 300 créditos/mes de su plan free —
  causa real: 15 deploys individuales en el mes (225 créditos) + fotos de catálogo sin
  comprimir (107 créditos de bandwidth). En vez de pagar Netlify, se migró a Cloudflare
  (dominio ya estaba delegado ahí, ver `docs/PRODUCT.md`), que no tiene ese mecanismo de
  "créditos que agotan y pausan todo" — plan gratis, ancho de banda sin límite publicado,
  500 builds/mes (vs. los ~15-20/mes que veníamos gastando). `netlify.toml` queda en el
  repo sin usarse (histórico); el deploy real es `wrangler.toml` + `worker/index.ts`
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
  causa del bandwidth alto). Backup de los PNG originales en
  `assets-originales-fotos-perfumes/` (gitignored, no se sube). Script reutilizable para
  optimizar fotos nuevas: `node scripts/optimize-images.mjs <origen> <destino>`. Al subir
  fotos nuevas al catálogo, pasarlas por ese script antes de comitear — el panel de admin
  (`ProductForm.tsx`) todavía NO comprime automáticamente lo que sube la clienta.

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

## Comandos
- `npm run dev` — servidor de desarrollo (Vite)
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run typecheck` — chequeo de tipos sin emitir

## Health Stack
- typecheck: npm run typecheck
- lint: npm run lint
- test: (no hay framework de testing instalado — decisión explícita, ver memoria del proyecto)
- deadcode: (no hay knip instalado)
- shell: (no hay scripts .sh en el repo)
