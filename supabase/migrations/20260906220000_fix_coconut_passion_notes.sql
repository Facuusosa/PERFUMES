/*
# Corregir notas inventadas de Victoria's Secret Coconut Passion

1. Data Changes
- `notes` y `description` traian "mora" y "ambar azucarado", que no aparecen en
  ninguna variante oficial de Coconut Passion (original, Shimmer, Sunkissed, Noir,
  Brulee) verificada contra Fragrantica. Probablemente se cargaron desde un flyer
  de mayorista en vez de la fuente oficial.
2. Important Notes -- hallazgo de auditoria de catalogo (2026-09-06)
- Notas oficiales confirmadas (Fragrantica): coco, vainilla, manzanilla, aloe vera,
  lirio del valle. Se usan las 3 mas representativas para mantener el formato de
  3 notas del resto del catalogo.
- Sigue siendo bruma corporal (fragrance mist), no Eau de Parfum -- eso no cambia.
*/

UPDATE public.perfumes SET
  notes = 'Coco · vainilla · manzanilla',
  description = 'Tropical y cremoso, con leche de coco que se funde en un fondo suave de vainilla, manzanilla y aloe vera. Es bruma corporal (fragrance mist), no Eau de Parfum — producto de marca original, no árabe/inspirado como el resto del catálogo.',
  updated_at = now()
WHERE id = 'victorias-secret-coconut-passion';
