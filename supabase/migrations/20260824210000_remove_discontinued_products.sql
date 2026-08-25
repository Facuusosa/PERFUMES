/*
# Sacar del catalogo los productos que ya no tienen foto real

1. Data Changes
- Borra Yara Exclusive y Odyssey Limited Edition de la tabla perfumes.
2. Important Notes
- Facu confirmo 2026-08-24: no aparecen en el catalogo real de precios de la
  clienta (7 capturas revisadas) y ya no tienen foto en fotos-clienta/FOTOS-FINALES/.
  El catalogo del sitio tiene que coincidir 1 a 1 con las fotos disponibles.
*/

DELETE FROM public.perfumes WHERE id IN ('yara-exclusive', 'odyssey-limited');
