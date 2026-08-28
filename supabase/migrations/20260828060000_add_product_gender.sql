/*
# Agregar filtro de genero (Mujer/Hombre/Unisex) al catalogo

1. Contexto
- Nuevo filtro en el sitio: "Para quien" (Mujer / Hombre / Unisex), pedido por Facu
  2026-08-28. Los 57 productos existentes quedan sin este dato hasta que se investiguen
  uno por uno (Fragrantica) y se corra un UPDATE aparte.
- El panel de admin ya permite cargar este dato en productos nuevos (ProductForm.tsx),
  como campo opcional ("Sin especificar" si no se completa).

2. Data Changes
- Agrega la columna `gender` a `public.perfumes`, tipo texto libre (no un ENUM de Postgres)
  para no complicar futuros valores — la app ya limita las opciones a nivel de UI/tipos de
  TypeScript ('Mujer' | 'Hombre' | 'Unisex'). Default NULL: no se le inventa un genero a
  ningun producto existente.
*/

ALTER TABLE public.perfumes ADD COLUMN IF NOT EXISTS gender text;
