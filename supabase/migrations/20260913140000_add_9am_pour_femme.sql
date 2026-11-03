/*
# Alta de "9am Pour Femme" (Afnan)

1. Data Changes
- Agrega el perfume '9am Pour Femme' (Afnan), pendiente desde 2026-08-29 (ver memoria
  del proyecto `project_pendiente-9am-pour-femme`). No es un reemplazo ni una correccion
  de 'afnan-9pm-pour-femme' (ya existente, sigue intacto) -- son dos productos reales
  distintos de la misma linea Afnan: 9am es botella rosa con tapa dorada, 9pm es botella
  purpura con tapa plateada.
2. Fuente
- Notas verificadas contra Afnan oficial: us.afnan.com/products/9-am-pour-femme.
  Top: mandarina, pomelo, bergamota. Corazon: grosella negra, frambuesa.
  Fondo: almizcle, naranja, ambar.
- Precio ($70.000) y foto confirmados por la clienta el 2026-09-13. Foto ya optimizada
  a WebP y commiteada en public/images/perfumes/afnan-9am-pour-femme.webp.
- accent calculado con el mismo metodo que usa el panel de admin (promedio de los
  pixeles opacos de la foto real, ver src/admin/ProductForm.tsx `processImage`).
*/

INSERT INTO public.perfumes (id, name, subtitle, family, notes, price, volume, accent, image, description, brand, gender)
VALUES
  ('afnan-9am-pour-femme', '9am Pour Femme', 'Cítrico · frutal', 'Frutal oriental', 'Mandarina · frambuesa · ámbar', 70000, '100 ml', '#d0685f', '/images/perfumes/afnan-9am-pour-femme.webp', 'Cítrico y frutal, con mandarina, pomelo y bergamota en la apertura, corazón de grosella negra y frambuesa, fondo de almizcle, naranja y ámbar.', 'Afnan', 'Mujer')
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
  brand = EXCLUDED.brand,
  gender = EXCLUDED.gender,
  updated_at = now();
