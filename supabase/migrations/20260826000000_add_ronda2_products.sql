/*
# Ronda 2: agregar 11 perfumes nuevos que la clienta sumo a su catalogo de precios

1. Data Changes
- Agrega 11 perfumes nuevos (Excel fotos-clienta/catalogo-productos.xlsx, filas ID 47-57):
  Confidential Private Gold, Vulcan Black Friday, Victoria, Jasoor, Glacier Gold,
  Eter Arabian Sky, Veneno, Angham Second Song, Hawas Diva For Her, Bade'e Al Oud
  (Honor & Glory), y Amber Oud Gold 999.9 Dubai Edition.
- Ningun producto existente se toca en esta migracion (ver Important Notes).
- Todas las notas olfativas fueron verificadas contra Fragrantica.com (link en columna
  Fuente del Excel). Para 5 de los 11 (Confidential Private Gold, Victoria, Glacier Gold,
  Eter Arabian Sky, Veneno) las notas del flyer de venta de la clienta NO coincidian con la
  ficha real del perfume -- se cargaron las notas oficiales de Fragrantica, no las del
  flyer (decision de Facu, 2026-08-26). Jasoor, Angham Second Song y Hawas Diva For Her
  coincidian parcialmente (se completaron con la version oficial de Fragrantica).

2. Important Notes
- CORRECCION durante esta misma sesion: se habia confundido "Amber Oud Gold 999.9 Dubai
  Edition" (frasco con textura de cuero, Extrait de Parfum, con atomizador de viaje) con
  el ya existente "Amber Oud Gold Edition" (frasco liso, 120ml, ya cargado desde
  20260824010000). Son DOS productos reales y distintos de Al Haramain. Se revirtio por
  error cualquier cambio sobre 'alharamain-amber-oud-gold' (ese producto sigue exactamente
  como estaba) y se cargo el nuevo aparte con id 'alharamain-amber-oud-999-9-dubai-edition'.
- 'french-avenue-vulcan' es "Vulcan Black Friday" (Fragrantica ID 119220, confirmado por
  Facu con el link exacto el 2026-08-26) -- notas y fuente actualizadas, Fuente verificada
  = Si. Ya no esta pendiente.
- 'lattafa-angham-second-song' NO es lo mismo que 'lattafa-angham' (ya existente): son
  dos fragancias distintas de Lattafa con nombre parecido, confirmado en Fragrantica.
- 'rasasi-hawas-diva-for-her' NO es lo mismo que 'rasasi-hawas-ice' ni 'rasasi-hawas-for-him'
  (ya existentes): variante distinta, confirmado en Fragrantica.
- 'lattafa-honor-glory-badee-al-oud' NO es lo mismo que 'lattafa-badee-al-oud-sublime'
  (ya existente): fragancias distintas de Lattafa con nombre parecido, confirmado en
  Fragrantica.
- category no se toca: queda en el default 'Perfume' para los 11 productos nuevos.
- PRECIOS: los 11 flyers (aunque varios traen logo de un mayorista/reventedor y no el de
  A&G) fueron provistos por la propia clienta a Facu -- confirmado por Facu el 2026-08-26.
  No estan pendientes de confirmar, son la fuente real de precio de la clienta.
*/

INSERT INTO public.perfumes (id, name, subtitle, family, notes, price, volume, accent, image, description)
VALUES
  ('lattafa-confidential-private-gold', 'Confidential Private Gold', 'Frutal · floral', 'Floral chipre', 'Durazno · muguete · vainilla', 54000, '100 ml', '#c9a227', '/images/perfumes/lattafa-confidential-private-gold.png', 'Frutal y floral, con durazno, maracuyá y frambuesa en la apertura, un corazón de muguete y un fondo de vainilla, pachulí y sándalo.'),
  ('french-avenue-vulcan', 'Vulcan Black Friday', 'Cuero · especiado', 'Amaderado especiado', 'Azafrán · cuero · pachulí', 86000, '100 ml', '#8b1a1a', '/images/perfumes/french-avenue-vulcan.png', 'Oscuro y magnético, con azafrán, manzana y canela en la apertura, corazón de cuero y rosa, fondo de pachulí, musgo y almizcle.'),
  ('lattafa-victoria', 'Victoria', 'Gourmand · cítrico', 'Gourmand cítrico', 'Limón merengue · neroli · vainilla', 70000, '100 ml', '#2d4f7c', '/images/perfumes/lattafa-victoria.png', 'Un gourmand cítrico ligero: apertura de limón tipo lemon pie, corazón de neroli y un fondo suave de vainilla.'),
  ('lattafa-jasoor', 'Jasoor', 'Amaderado · especiado', 'Amaderado especiado', 'Manzana · tabaco · cuero', 54000, '100 ml', '#b8860b', '/images/perfumes/lattafa-jasoor.png', 'Intenso y masculino, con manzana, cardamomo y bergamota en la apertura, corazón de tabaco y lavanda, fondo de cuero y vetiver.'),
  ('maison-alhambra-glacier-gold', 'Glacier Gold', 'Oriental · especiado', 'Oriental especiado', 'Menta · canela · vainilla', 59000, '100 ml', '#d4a017', '/images/perfumes/maison-alhambra-glacier-gold.png', 'Cálido y especiado, con menta, bergamota y lavanda en la apertura, corazón de canela y azahar, fondo de vainilla, ámbar y sándalo.'),
  ('armaf-eter-arabian-sky', 'Éter Arabian Sky', 'Oriental · gourmand', 'Oriental gourmand', 'Piña · caramelo · cuero', 110000, '100 ml', '#2a8c8c', '/images/perfumes/armaf-eter-arabian-sky.png', 'Cítrico y envolvente, con piña, pomelo y bergamota en la apertura, corazón de caramelo y lavanda, fondo amaderado de cedro y cuero.'),
  ('french-avenue-veneno', 'Veneno', 'Ahumado · especiado', 'Amaderado ahumado', 'Manzana · tabaco · vainilla bourbon', 92000, '100 ml', '#4a3418', '/images/perfumes/french-avenue-veneno.png', 'Ahumado y envolvente, con manzana y canela en la apertura, corazón de tabaco y musgo, fondo de vainilla bourbon.'),
  ('lattafa-angham-second-song', 'Angham Second Song', 'Floral · frutal', 'Floral frutal', 'Flor de peral · peonía · vainilla', 70000, '100 ml', '#c17a6f', '/images/perfumes/lattafa-angham-second-song.png', 'Floral y frutal, con flor de peral y bergamota en la apertura, corazón de peonía y azahar, fondo de vainilla y almizcle.'),
  ('rasasi-hawas-diva-for-her', 'Hawas Diva For Her', 'Frutal · floral', 'Frutal floral ambarado', 'Frutos rojos · rosa · vainilla', 82000, '100 ml', '#a3245f', '/images/perfumes/rasasi-hawas-diva-for-her.png', 'Frutal y floral, con frutos rojos, ruibarbo y lychee en la apertura, corazón de rosa e incienso, fondo de vainilla y almizcle.'),
  ('lattafa-honor-glory-badee-al-oud', 'Bade''e Al Oud (Honor & Glory)', 'Gourmand · amaderado', 'Gourmand amaderado', 'Piña · cúrcuma · sándalo', 60000, '100 ml', '#c2a878', '/images/perfumes/lattafa-honor-glory-badee-al-oud.png', 'Gourmand y amaderado, con piña y crema brûlée en la apertura, corazón especiado de cúrcuma y pimienta negra, fondo de oud y sándalo.'),
  ('alharamain-amber-oud-999-9-dubai-edition', 'Amber Oud Gold 999.9 Dubai Edition', 'Cítrico · amaderado', 'Amaderado oriental', 'Naranja · caramelo · cedro', 110000, '75 ml', '#8a5a2b', '/images/perfumes/alharamain-amber-oud-999-9-dubai-edition.png', 'Cítrico y goloso en la apertura, con naranja, bergamota y pera que dan paso a un corazón de caramelo, melón y cardamomo sobre un fondo amaderado de cedro, ámbar y vainilla.')
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
  updated_at = now();
