---
name: limpiar
description: Detecta archivos huérfanos, temporales o duplicados (build artifacts, prototipos ya migrados, imports muertos, assets sin referenciar, docs obsoletos) y pide confirmación antes de borrar nada. Invocar manualmente con /limpiar.
disable-model-invocation: true
---

Escaneá el proyecto en estas categorías, SIN borrar ni mover nada todavía:

1. **Build artifacts fuera de .gitignore**: `.next/`, `out/`, `.netlify/`, `.sanity/`
   que estén trackeados por git (no deberían estarlo). Verificar con
   `git ls-files` contra el contenido real de esas carpetas.

2. **Prototipos ya migrados**: `docs/playground-estilos.html` — buscar en
   `components/` y `app/` los mismos identificadores/clases que aparecen en el
   playground (`#canvas3d`, `.magnetic-btn`, `#rail`, `.reveal-line`, `#loader`,
   `#cursor`). Si TODOS los mecanismos del playground tienen su equivalente
   React funcionando, marcarlo como candidato a archivar (nunca a borrar
   directamente — sugerir mover a `docs/archive/`).

3. **Imports/exports muertos**: correr `npx knip` (detector estándar para
   proyectos Next.js/TS de archivos, exports y dependencias no usadas) y
   resumir su output. Si `knip` no está disponible o falla, hacer un fallback
   con `npx eslint . --ext .ts,.tsx` buscando reglas de unused-vars/imports.

4. **Assets sin referenciar**: listar todo bajo `public/`, y para cada archivo
   buscar con Grep si su nombre aparece en `app/`, `components/`, o en el
   schema de Sanity. Lo que no aparece en ningún lado es candidato.

5. **Docs de planificación obsoletos**: revisar `docs/*.md` — un doc es
   candidato SOLO si su contenido está evidentemente superado (ej.
   `SETUP-CLAUDE-CODE.md` una vez que todos sus pasos ya se ejecutaron Y
   quedaron reflejados en `CLAUDE.md`). `PRODUCT.md` y `DESIGN.md` son fuente
   de verdad del proyecto — nunca sugerir borrarlos, como mucho archivarlos
   si se reemplazan por una versión más nueva explícita.

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
