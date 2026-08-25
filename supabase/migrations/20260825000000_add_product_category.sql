/*
# Agregar categoria de producto (Perfume / Combo / Victoria's Secret)

1. Data Changes
- Agrega la columna `category` a `public.perfumes`, default 'Perfume' para no romper
  los productos existentes.
- Reclasifica los 5 productos Victoria's Secret ya cargados (brumas + locion) como
  category = 'Victoria''s Secret'.
- Carga el Karseell Maca Power Repair Set como category = 'Combo': es el producto de
  cuidado capilar que se habia dejado fuera del catalogo por no ser perfume (ver nota en
  20260824010000_load_full_catalog.sql). No se le inventan notas olfativas -- se describe
  como lo que es (mascarilla de colageno + aceite esencia).
2. Important Notes
- `category` es ortogonal a `family` (family sigue siendo la nota olfativa, solo aplica
  a los perfumes).
*/

ALTER TABLE public.perfumes ADD COLUMN IF NOT EXISTS category text NOT NULL DEFAULT 'Perfume';

UPDATE public.perfumes SET category = 'Victoria''s Secret'
WHERE id IN (
  'victorias-secret-coconut-passion',
  'victorias-secret-love-spell-shimmer',
  'victorias-secret-pure-seduction',
  'victorias-secret-bare-vanilla',
  'victorias-secret-love-spell'
);

INSERT INTO public.perfumes (id, name, subtitle, family, notes, price, volume, accent, image, description, category)
VALUES (
  'karseell-maca-power-repair-set',
  'Karseell Maca Power — Repair Set',
  'Cuidado capilar · reparacion profunda',
  'Cuidado capilar',
  'Mascarilla de colageno · aceite esencia de maca',
  45000,
  '500 ml + 50 ml',
  '#8a5a24',
  '/images/perfumes/karseell-maca-power-repair-set.png',
  'Set de 2 piezas para cabello seco y danado: mascarilla capilar con colageno (500 ml) y aceite esencia de maca (50 ml). Uso profesional, no es perfume.',
  'Combo'
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  subtitle = EXCLUDED.subtitle,
  family = EXCLUDED.family,
  notes = EXCLUDED.notes,
  price = EXCLUDED.price,
  volume = EXCLUDED.volume,
  accent = EXCLUDED.accent,
  image = EXCLUDED.image,
  description = EXCLUDED.description,
  category = EXCLUDED.category,
  updated_at = now();
