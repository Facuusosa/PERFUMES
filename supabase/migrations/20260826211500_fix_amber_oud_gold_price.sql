/*
# Corregir precio y volumen de Amber Oud Gold Edition (Al Haramain)

1. Data Changes
- Actualiza el precio de 'alharamain-amber-oud-gold' de $120.000 a $110.000.
- Actualiza el volumen de '100 ml' a '120 ml'.
2. Why
- Facu confirmo el precio correcto viendo el frasco/foto real (2026-08-26). No es un
  producto nuevo -- se habia confundido momentaneamente con una foto nueva que en
  realidad es este mismo producto, ya cargado desde 20260824010000_load_full_catalog.sql.
  No confundir con 'alharamain-amber-oud-999-9-dubai-edition' (Dubai Edition, $110.000
  tambien pero frasco distinto, con textura de cuero, 75 ml) -- son dos productos reales
  distintos que casualmente ahora comparten el mismo precio.
- El volumen tambien estaba mal: la propia foto ya cargada del producto (y la nueva que
  mando Facu) dicen "GOLD EDITION 120 ml" impreso en la caja, pero el campo `volume` decia
  "100 ml" -- inconsistencia encontrada al comparar la foto real contra la ficha del sitio,
  no reportada por Facu, corregida de una vez ya que se estaba tocando esta fila.
*/

UPDATE public.perfumes SET
  price = 110000,
  volume = '120 ml',
  updated_at = now()
WHERE id = 'alharamain-amber-oud-gold';
