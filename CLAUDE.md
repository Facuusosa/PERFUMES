# ecommerce-perfumes (A&G Gisela)

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
  `App.tsx` si no hay variables de entorno configuradas. Carga de catálogo hoy es manual
  (migraciones SQL en `supabase/migrations/`), no hay panel de admin tipo Sanity Studio.
  Facu va a cargar el catálogo él mismo por ahora — la pregunta de "cómo carga producto
  la clienta sin ayuda técnica" (el requisito no negociable original) queda abierta,
  no resuelta por este reemplazo.
- **Checkout por WhatsApp** (arma el mensaje con el pedido y el precio, no hay Mercado Pago
  integrado en este código). Revisar con Facu si esto es definitivo o intermedio.
- Sin hosting configurado todavía en este repo (la decisión anterior era Netlify).

## Contradicciones con `docs/DESIGN.md` heredado (a resolver, no ignorar)
El código trae **Inter + Playfair Display** y colores propios (`#0b0b0a`, acento `#c99558`),
mientras que `DESIGN.md` decía "nunca Inter" y Fraunces + Space Grotesk. `docs/DESIGN.md` ya
se actualizó para describir el estado real; si en algún momento se quiere volver a la
tipografía/paleta anterior, es una decisión a tomar con Facu, no a aplicar de oficio.

- El nombre de marca es **A&G (Ariel y Gisela)** — en este código aparece como "A&G Gisela".
  Si cambia, actualizar este archivo antes de asumir un nombre nuevo.
- Las fotos de producto (`public/images/perfumes/`) ya son de los perfumes reales que la
  clienta vende (no placeholders de stock genérico como antes).

## Comandos
- `npm run dev` — servidor de desarrollo (Vite)
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run typecheck` — chequeo de tipos sin emitir
