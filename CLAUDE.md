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
- **Hosting: Netlify, decisión cerrada** (ya hay `netlify.toml` en el repo, deploy real
  pendiente de ejecutar). No evaluar Vercel para este proyecto: su plan gratuito prohíbe
  ecommerce/checkout explícitamente (Acceptable Use Policy, verificado 2026-08-23), habría
  que pagar el plan Pro (USD 20/mes). Netlify sí permite ecommerce en su plan free.

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
