/*
# Cambiar extension de fotos de .png a .webp

1. Contexto
- Las 57 fotos del catalogo pesaban 114 MB en total (PNG sin comprimir, ~2.5-2.9 MB
  cada una). Esto disparo el consumo de bandwidth de Netlify (20 creditos por GB) y
  fue parte de la causa por la que se agotaron los creditos del plan gratuito.
- Las fotos ya se reemplazaron en el repo por versiones .webp (misma resolucion,
  calidad 85%, sin perdida visible) que pesan ~12 MB en total (89.7% menos).
- Los archivos .png originales quedan respaldados en `assets-originales-fotos-perfumes/`
  (fuera de `public/`, no se sirven en el sitio) y en el historial de git.

2. Data Changes
- Actualiza la columna `image` de todos los productos que todavia apuntan a `.png`
  para que apunten al `.webp` equivalente. No toca ninguna otra columna ni fila que
  ya use `.webp`.
*/

UPDATE public.perfumes
SET image = REGEXP_REPLACE(image, '\.png$', '.webp')
WHERE image LIKE '%.png';
