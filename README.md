# A&G Gisela — ecommerce de perfumes

Ecommerce de reventa de perfumes multimarca en Argentina. Ver `CLAUDE.md`, `docs/PRODUCT.md`
y `docs/DESIGN.md` para el contexto completo del proyecto.

## Stack
Vite + React + TypeScript + Tailwind + Supabase. Checkout por WhatsApp.

## Desarrollo

```bash
npm install
npm run dev
```

Variables de entorno (`.env`, no se comitea):

```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
```

Sin esas variables, la app usa un catálogo de respaldo embebido en `src/App.tsx`.

## Comandos
- `npm run dev` — servidor de desarrollo
- `npm run build` — build de producción
- `npm run lint` — ESLint
- `npm run typecheck` — chequeo de tipos
