# DESIGN.md

> **2026-08-17 — reemplazo de stack y diseño.** Todo lo de abajo (paleta, tipografía,
> mecanismos, referencias SKAALD/Nothin') describía el diseño cinemático a medida sobre
> Next.js + Sanity. Ese proyecto se reemplazó por completo por el resultado de Bolt.new
> (repo `Facuusosa/PERFUMES`), que trae su propia paleta y tipografía (ver abajo). El diseño
> viejo completo queda preservado en la rama de git `backup/diseno-cinematico-nextjs-sanity`.
> Esta sección vieja se deja como referencia histórica por si se retoma algo puntual
> (por ejemplo Light Rays), pero **no describe el estado actual del código**.

## Paleta y tipografía actuales (verificado en `tailwind.config.js` / `index.css`)
- Fondo principal `#0b0b0a`, texto `#f2eee7`, acento ámbar `#c99558` — en la misma familia
  cálida que la paleta anterior, aunque no son los mismos valores exactos.
- Cada perfume tiene su propio color de acento en el catálogo (`accent` por producto en
  `App.tsx`), mismo espíritu que la regla vieja de "no tocar el color real del producto".
- Tipografía: **Inter** (UI/cuerpo) + **Playfair Display** (serif/display, clase `.font-serif`).
  Contradice la regla vieja "nunca Inter, Fraunces + Space Grotesk", pero Facu confirmó
  explícitamente (2026-08-17) que la deja así por ahora — no es un olvido, es decisión
  tomada. Si más adelante se quiere retomar Fraunces/Space Grotesk, es un pedido nuevo.
- El modal de detalle de producto abre/cierra con un rebote (`cubic-bezier(.34, 1.56, .64, 1)`
  en `bubble-in`/`bubble-out`, `src/index.css`). Contradice la regla vieja "nunca
  bounce/elastic easing", pero también fue confirmado como intencional (2026-08-17).
- Ambos hallazgos están silenciados en `.impeccable/config.json` (`ignoreValues`) para que
  el hook de diseño no los vuelva a marcar.

## Pendiente de decidir con Facu
- Si vale la pena traer el mecanismo de Light Rays del hero viejo (rama de backup) a esta base.
- Hosting y dominio: no se volvieron a evaluar bajo el stack Vite/Supabase.

---

Diseño anterior completo (Next.js + Sanity, paleta Fraunces/Space Grotesk, referencias
SKAALD/Nothin', mecanismos, panel Sanity) archivado en `docs/DESIGN-HISTORICO.md` y en la
rama de git `backup/diseno-cinematico-nextjs-sanity` — leer solo si se retoma algo de ahí.
