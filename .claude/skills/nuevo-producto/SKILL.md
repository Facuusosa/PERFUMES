---
name: nuevo-producto
description: Use when adding a new product to the ecommerce-perfumes / A&G Perfumes catalog by writing a Supabase SQL migration, AND when the client (Gisela) already added or edited a product herself from the /admin panel and it needs to be verified/absorbed into "our" catalog (real photo in the repo, notes checked against a real source, row added to fotos-clienta/catalogo-productos.xlsx). Covers photo optimization to WebP, migration format, every static list a product must also appear in (marquee, storySlides, JSON-LD), the family/macroFamily filter check, the Excel master sheet columns, and past mistakes (merging distinct products, uncompressed photos, missing vignette, leaving a default accent color unchanged, notes typed with dots instead of proper separators, pointing the `image` field at a file that isn't deployed yet).
---

# Nuevo producto al catalogo

## Overview

Checklist para que un producto nuevo quede bien integrado al catalogo de
A&G Perfumes. Hay dos caminos de entrada distintos, con pasos en comun:

- **Facu lo carga por codigo** (migracion SQL en `supabase/migrations/`) -- ver
  "Camino A" abajo.
- **Gisela lo carga sola desde `/admin`** -- el panel ya arma la fila en
  Supabase con color de acento automatico (calculado de la foto), notas
  formateadas solas, y la foto comprimida antes de subir (resuelto
  2026-09-13). Pero el panel **no** verifica que las notas sean verdaderas,
  **no** deja la foto en el repo (queda en Supabase Storage), y **no** la
  suma al Excel maestro -- eso lo completa Claude cuando Facu le pide
  procesar el aviso. Ver "Camino B" abajo.

Junta pasos que hoy viven dispersos en la memoria del proyecto y se olvidan
seguido -- sobre todo el paso 5 del Camino A (lugares donde el producto
tambien aparece fuera de la tabla de Supabase).

## Camino B: la clienta ya lo cargo desde /admin

Se dispara cuando el hook `check-catalog-updates.cjs` avisa (al abrir sesion)
que Gisela agrego o edito un producto, y Facu pide procesarlo.

1. **Verificar las notas y la fuente real.** Buscar el producto en
   Fragrantica (marca + nombre) y comparar contra lo que ella tipeo. Si
   coincide, seguir. Si no se encuentra o no coincide, no inventar ni
   corregir a ciegas -- anotarlo en la hoja "Pendientes de revision" del
   Excel (ver paso 4) y avisarle a Facu, sin bloquear el producto en el
   sitio (ya esta visible, eso no se toca).

2. **Bajar la foto real de Supabase Storage y comprimirla al repo:**
   ```
   node scripts/optimize-images.mjs <carpeta-con-el-original> public/images/perfumes
   ```
   Guardarla como `<id-del-producto>.webp` (mismo id que la fila en
   Supabase) para que el nombre de archivo matchee.

3. **Orden obligatorio al cambiar el campo `image` -- no invertirlo.**
   Primero commitear + pushear el `.webp` nuevo y confirmar que el deploy
   terminó, RECIEN DESPUES actualizar `image` en Supabase para que apunte a
   `/images/perfumes/<id>.webp`. Si se invierte el orden, la foto se rompe en
   el sitio real hasta que termine el deploy (paso ya pisado una vez, ver
   tabla de errores).

4. **Agregar la fila al Excel** (`fotos-clienta/catalogo-productos.xlsx`,
   hoja "Catálogo A&G"). Columnas reales: `ID, SKU, Estado, Fuente
   verificada, Marca, Producto, Familia, Subtítulo, Notas, Precio (ARS),
   Volumen, Acento, Archivo de foto, Descripción, Fuente`. En `Estado` usar
   algo que distinga que la cargó la clienta, ej. "Cargado por Gisela desde
   /admin". Si las notas no se pudieron verificar (paso 1), agregar tambien
   una fila en la hoja "Pendientes de revision" (columnas: `SKU, Producto,
   Tipo de aviso, Detalle`) en vez de forzar "Sí" en Fuente verificada.
   Para leer/escribir el archivo real, usar `exceljs` (ya instalado como
   devDependency 2026-09-13 -- se evito la libreria `xlsx`/SheetJS a
   proposito por tener vulnerabilidades de seguridad conocidas sin parche en
   npm).

5. **Correr los mismos chequeos del Camino A que apliquen**: `family` contra
   `getMacroFamily` (paso 4 de abajo), y si el producto amerita aparecer en
   marquee/storySlides/JSON-LD (paso 5 de abajo) -- normalmente no hace
   falta para una carga suelta de la clienta, son secciones curadas a mano.

## Camino A: Facu lo carga por codigo

1. **Confirmar que es un producto nuevo, no uno existente con nombre parecido.**
   No fusionar por "se parece a X" sin preguntarle antes al usuario. Ya paso un
   error real: "Amber Oud Gold Edition" y "Amber Oud Gold 999.9 Dubai Edition"
   son dos productos distintos de Al Haramain, no el mismo con precio corregido.

2. **Optimizar la foto a WebP:**
   ```
   node scripts/optimize-images.mjs <carpeta-origen> public/images/perfumes
   ```
   - Calidad 85, no PNG (hay un hook en este repo que bloquea escribir `.png`
     ahi -- si aparece bloqueado, es este chequeo funcionando, no un bug).
   - El fondo tiene que tener vignette/halo de luz, no negro plano recortado.
     Un fondo negro plano se ve como un recuadro cortado en la tarjeta del
     catalogo -- no se arregla con CSS ni color de acento, hay que regenerar
     la foto.

3. **Escribir la migracion SQL** en `supabase/migrations/YYYYMMDDHHMMSS_descripcion.sql`.
   Incluir `brand`, `category` (default `'Perfume'`), `gender`, `family`. Ver una
   migracion reciente como referencia de estilo, ej.
   `supabase/migrations/20260828060000_add_product_gender.sql`.

4. **Verificar que `family` matchee `getMacroFamily`** en `src/App.tsx`. Si el
   valor no encaja con ninguna regla de esa funcion, el filtro de familia
   olfativa del sitio va a clasificar mal el producto (o no mostrarlo donde
   corresponde) sin tirar ningun error visible.

5. **Actualizar todo lugar donde un producto tambien aparece** -- la fila en
   Supabase no alcanza:
   - Marquee (franja de texto corrido)
   - `storySlides`
   - JSON-LD estructurado (SEO)
   - Cualquier otra lista estatica de productos en `src/App.tsx`

6. **Aplicar la migracion** y confirmar en el sitio: el producto aparece con
   la categoria, el genero y la familia correctos, y con foto WebP sin cortes.

## Errores ya cometidos (no repetir)

| Error | Que paso |
|---|---|
| Fusionar productos parecidos sin confirmar | Casi se pisa "Amber Oud Gold Edition" con "...999.9 Dubai Edition" -- son productos distintos |
| `family` sin chequear contra `getMacroFamily` | El producto quedaba mal clasificado en el filtro del sitio, sin error visible |
| Foto sin vignette | Se veia como recuadro cortado en la tarjeta de catalogo |
| Subir PNG sin comprimir | Fotos pesadas (114MB en 57 fotos) hicieron que Netlify pausara el sitio entero por limite de banda |
| Color de acento default sin cambiar (carga desde /admin) | 4 productos de Gisela quedaron con el mismo fondo dorado -- resuelto 2026-09-13 calculando el color de la foto automaticamente |
| Notas escritas con puntos pegados sin espacio (carga desde /admin) | El signo "·" que pedia el formulario no esta en un teclado normal -- resuelto 2026-09-13 aceptando comas y armando el formato solo |
| Cambiar el campo `image` a una ruta que todavia no esta deployada | La foto se rompe en el sitio real hasta que termine el deploy -- pasa primero el commit+push, recien despues el UPDATE en Supabase |
