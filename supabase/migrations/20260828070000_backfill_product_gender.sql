/*
# Cargar genero (Mujer/Hombre/Unisex) a los 56 productos existentes

1. Contexto
- Columna `gender` agregada en 20260828060000_add_product_gender.sql, sin poblar.
- Clasificacion investigada producto por producto contra Fragrantica.com (ficha oficial:
  "a fragrance for men" / "for women" / "for women and men"). Los 5 de Victoria's Secret
  se clasificaron como Mujer por ser la linea femenina de la marca (sin ficha en
  Fragrantica, no aplica). "Mayar Rosa" y "Yara Rosa" no tienen ficha propia bajo ese
  nombre comercial exacto en Fragrantica -- se infirieron como Mujer por notas olfativas
  identicas a la ficha oficial del producto base ("Mayar" y "Yara"), confirmado por Facu.
- Karseell Maca Power (Repair Set) queda sin tocar (NULL) -- es un kit de cuidado capilar,
  no un perfume, no le corresponde este dato.

2. Data Changes
- UPDATE de la columna `gender` para 56 de los 57 productos via FROM (VALUES ...).
*/

UPDATE public.perfumes AS p
SET gender = v.gender
FROM (VALUES
  ('afnan-9am-dive', 'Unisex'),
  ('afnan-9pm', 'Hombre'),
  ('afnan-9pm-elixir', 'Unisex'),
  ('afnan-9pm-night-out', 'Unisex'),
  ('afnan-9pm-pour-femme', 'Mujer'),
  ('afnan-9pm-rebel', 'Unisex'),
  ('alharamain-amber-oud-999-9-dubai-edition', 'Unisex'),
  ('alharamain-amber-oud-gold', 'Unisex'),
  ('alharamain-conception', 'Unisex'),
  ('armaf-club-de-nuit-oud', 'Unisex'),
  ('armaf-eter-arabian-sky', 'Unisex'),
  ('armaf-odyssey-candee', 'Mujer'),
  ('armaf-odyssey-go-mango', 'Unisex'),
  ('armaf-odyssey-homme', 'Hombre'),
  ('armaf-odyssey-mandarin-sky', 'Hombre'),
  ('armaf-odyssey-mandarin-sky-elixir', 'Unisex'),
  ('armaf-yum-yum', 'Mujer'),
  ('art-of-universe', 'Unisex'),
  ('french-avenue-veneno', 'Unisex'),
  ('french-avenue-vulcan', 'Hombre'),
  ('lattafa-angham', 'Unisex'),
  ('lattafa-angham-second-song', 'Mujer'),
  ('lattafa-badee-al-oud-sublime', 'Unisex'),
  ('lattafa-confidential-private-gold', 'Unisex'),
  ('lattafa-hayaati-florence', 'Mujer'),
  ('lattafa-hayaati-gold-elixir', 'Unisex'),
  ('lattafa-hayaati-original', 'Unisex'),
  ('lattafa-her-confession', 'Mujer'),
  ('lattafa-his-confession', 'Hombre'),
  ('lattafa-honor-glory-badee-al-oud', 'Unisex'),
  ('lattafa-jasoor', 'Unisex'),
  ('lattafa-khamrah', 'Unisex'),
  ('lattafa-mayar', 'Mujer'),
  ('lattafa-mayar-rosa', 'Mujer'),
  ('lattafa-musamam-white-intense', 'Unisex'),
  ('lattafa-pride-nebras', 'Unisex'),
  ('lattafa-the-kingdom', 'Hombre'),
  ('lattafa-victoria', 'Unisex'),
  ('lattafa-yara-candy', 'Mujer'),
  ('lattafa-yara-moi', 'Mujer'),
  ('lattafa-yara-rosa', 'Mujer'),
  ('lattafa-yara-tous', 'Mujer'),
  ('maison-alhambra-glacier-gold', 'Hombre'),
  ('maison-alhambra-salvo', 'Hombre'),
  ('now-women', 'Mujer'),
  ('qimmah-women', 'Mujer'),
  ('rasasi-hawas-diva-for-her', 'Mujer'),
  ('rasasi-hawas-for-him', 'Hombre'),
  ('rasasi-hawas-ice', 'Hombre'),
  ('rayhaan-tropical-vibe', 'Unisex'),
  ('victorias-secret-bare-vanilla', 'Mujer'),
  ('victorias-secret-coconut-passion', 'Mujer'),
  ('victorias-secret-love-spell', 'Mujer'),
  ('victorias-secret-love-spell-shimmer', 'Mujer'),
  ('victorias-secret-pure-seduction', 'Mujer'),
  ('yara-elixir', 'Mujer')
) AS v(id, gender)
WHERE p.id = v.id;
