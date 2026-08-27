/*
# Agregar columna `brand` real y poblarla para los 57 productos existentes

1. Data Changes
- Agrega la columna `brand` a `public.perfumes` (default '' para no romper filas existentes).
- Puebla `brand` para los 57 productos activos (56 perfumes + 1 combo) usando la columna
  "Marca" del Excel maestro (fotos-clienta/catalogo-productos.xlsx, hoja "Catálogo A&G"),
  que es la fuente real -- no se infiere por prefijo del id (es fragil: "Lattafa Pride" no
  siempre tiene "pride" en el id, ej. 'art-of-universe', 'lattafa-musamam-white-intense').
2. Why
- El marquee del hero (src/App.tsx) tenia texto hardcodeado con los 6 productos del diseño
  viejo (pre-catalogo real). Este cambio permite generarlo dinamicamente a partir de las
  marcas reales del catalogo (Array.from(new Set(perfumes.map(p => p.brand)))), asi no
  necesita tocarse a mano cada vez que se carga un producto nuevo de una marca ya existente.
3. Important Notes
- Conteo verificado 1 a 1 contra el Excel: Lattafa (22), Armaf (8), Afnan (6), Victoria's
  Secret (5), Al Haramain (3), Lattafa Pride (3), Rasasi (3), French Avenue (2), Maison
  Alhambra (2), Karseell (1), RAVE (1), Rayhaan (1) = 57.
- Karseell Maca Power Repair Set tiene SKU distinto en el Excel ('karseell-combo-repair')
  que en la base real ('karseell-maca-power-repair-set') -- mapeado a mano por nombre de
  producto, brand = 'Karseell' de todos modos.
*/

ALTER TABLE public.perfumes ADD COLUMN IF NOT EXISTS brand text NOT NULL DEFAULT '';

UPDATE public.perfumes SET brand = 'Afnan' WHERE id IN (
    'afnan-9am-dive',
    'afnan-9pm',
    'afnan-9pm-elixir',
    'afnan-9pm-night-out',
    'afnan-9pm-pour-femme',
    'afnan-9pm-rebel'
);

UPDATE public.perfumes SET brand = 'Al Haramain' WHERE id IN (
    'alharamain-amber-oud-999-9-dubai-edition',
    'alharamain-amber-oud-gold',
    'alharamain-conception'
);

UPDATE public.perfumes SET brand = 'Armaf' WHERE id IN (
    'armaf-club-de-nuit-oud',
    'armaf-eter-arabian-sky',
    'armaf-odyssey-candee',
    'armaf-odyssey-go-mango',
    'armaf-odyssey-homme',
    'armaf-odyssey-mandarin-sky',
    'armaf-odyssey-mandarin-sky-elixir',
    'armaf-yum-yum'
);

UPDATE public.perfumes SET brand = 'French Avenue' WHERE id IN (
    'french-avenue-veneno',
    'french-avenue-vulcan'
);

UPDATE public.perfumes SET brand = 'Karseell' WHERE id IN (
    'karseell-maca-power-repair-set'
);

UPDATE public.perfumes SET brand = 'Lattafa' WHERE id IN (
    'lattafa-angham',
    'lattafa-angham-second-song',
    'lattafa-badee-al-oud-sublime',
    'lattafa-confidential-private-gold',
    'lattafa-hayaati-florence',
    'lattafa-hayaati-gold-elixir',
    'lattafa-hayaati-original',
    'lattafa-her-confession',
    'lattafa-his-confession',
    'lattafa-honor-glory-badee-al-oud',
    'lattafa-jasoor',
    'lattafa-khamrah',
    'lattafa-mayar',
    'lattafa-mayar-rosa',
    'lattafa-the-kingdom',
    'lattafa-victoria',
    'lattafa-yara-candy',
    'lattafa-yara-moi',
    'lattafa-yara-rosa',
    'lattafa-yara-tous',
    'qimmah-women',
    'yara-elixir'
);

UPDATE public.perfumes SET brand = 'Lattafa Pride' WHERE id IN (
    'art-of-universe',
    'lattafa-musamam-white-intense',
    'lattafa-pride-nebras'
);

UPDATE public.perfumes SET brand = 'Maison Alhambra' WHERE id IN (
    'maison-alhambra-glacier-gold',
    'maison-alhambra-salvo'
);

UPDATE public.perfumes SET brand = 'RAVE' WHERE id IN (
    'now-women'
);

UPDATE public.perfumes SET brand = 'Rasasi' WHERE id IN (
    'rasasi-hawas-diva-for-her',
    'rasasi-hawas-for-him',
    'rasasi-hawas-ice'
);

UPDATE public.perfumes SET brand = 'Rayhaan' WHERE id IN (
    'rayhaan-tropical-vibe'
);

UPDATE public.perfumes SET brand = 'Victoria''s Secret' WHERE id IN (
    'victorias-secret-bare-vanilla',
    'victorias-secret-coconut-passion',
    'victorias-secret-love-spell',
    'victorias-secret-love-spell-shimmer',
    'victorias-secret-pure-seduction'
);
