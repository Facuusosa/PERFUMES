---
name: limpiar
description: Detecta archivos huérfanos, temporales o duplicados (build artifacts, prototipos ya migrados, imports muertos, assets sin referenciar, docs obsoletos) y pide confirmación antes de borrar nada. Invocar manualmente con /limpiar.
disable-model-invocation: true
---

Escaneá el proyecto en estas categorías, SIN borrar ni mover nada todavía:

1. **Build artifacts fuera de .gitignore**: `dist/` (build de Vite) o `.wrangler/`
   (caché local de Cloudflare Wrangler) que estén trackeados por git (no
   deberían estarlo). Verificar con `git ls-files` contra el contenido real de
   esas carpetas.

2. **Restos del stack viejo (Next.js + Sanity, reemplazado por completo el
   2026-08-17 por el proyecto Vite+React+Supabase actual)**: a diferencia de
   una migración incremental, acá NO hay equivalente React que buscar — el
   reemplazo fue total. Cualquier archivo que solo tenga sentido bajo el stack
   viejo es candidato directo a archivar/borrar: cualquier archivo suelto con
   imports de `next`, `@sanity/*`, o rutas tipo `app/`/`pages/`. `docs/archive/`
   ya está resuelto, no contarlo como hallazgo.

3. **Imports/exports muertos**: correr `npx knip` (detector estándar de
   archivos, exports y dependencias no usadas en proyectos TS/JS — no viene
   instalado en este repo, ver `Health Stack` de `CLAUDE.md`) y resumir su
   output, filtrando `.agents/` y `.claude/` (skills, no son código del sitio).
   Falsos positivos conocidos, no reportarlos: `worker/index.ts` (es el `main` de
   `wrangler.toml`), `scripts/*.mjs` (se corren a mano), `exceljs` (lo usa la skill
   `nuevo-producto`) y `sharp` (lo usa `scripts/optimize-images.mjs`). Si falla o
   no está disponible, hacer un fallback con `npx eslint . --ext .ts,.tsx`
   buscando reglas de unused-vars/imports.

4. **Assets sin referenciar**: listar todo bajo `public/images/perfumes/`, y
   para cada archivo buscar su nombre **sin extensión** (las migraciones viejas
   dicen `.png` y los archivos son `.webp`) en `src/App.tsx`/`src/admin/*` y en
   la columna `image` de la tabla `perfumes` **de producción**, leída con la clave
   pública de `.env`: Gisela carga productos desde `/admin` sin migración, así que
   las migraciones solas dan falsos positivos. Si una foto sobra porque su
   producto no está en producción, confirmar si la baja fue a propósito antes de
   borrarla. Revisar también el camino inverso: rutas del código que apuntan a
   fotos que no existen (en producción responden HTML con código 200, sin error).

5. **Docs de planificación obsoletos**: revisar `docs/*.md` — un doc es
   candidato SOLO si su contenido está evidentemente superado (ej. un doc de
   setup una vez que todos sus pasos ya se ejecutaron Y quedaron reflejados en
   `CLAUDE.md`). `PRODUCT.md` y `DESIGN.md` son fuente de verdad del proyecto
   — nunca sugerir borrarlos, como mucho archivarlos si se reemplazan por una
   versión más nueva explícita.

El aviso del hook de archivos sin trackear no es una lista de basura: antes de
proponer borrar algo de ahí, revisar si hay que guardarlo en git.

## Formato del reporte (obligatorio antes de pedir confirmación)

Agrupá los hallazgos por categoría en una tabla:

| Archivo | Categoría | Evidencia | Confianza | Acción sugerida |
|---|---|---|---|---|

- Confianza "alta" = evidencia directa (ej. sin ninguna referencia encontrada).
- Confianza "baja" = señalalo pero aclará explícitamente la incertidumbre.
- Acción sugerida por defecto es "mover a docs/archive/" para documentación,
  y "borrar" solo para build artifacts que de por sí son regenerables.

Después de mostrar la tabla completa, PARÁ y preguntá explícitamente qué filas
confirmar. No uses ninguna herramienta de escritura/borrado hasta tener
confirmación explícita fila por fila o por categoría. Nunca borres archivos
de "confianza baja" sin que el usuario lo pida en esa misma respuesta.
