/*
# Create the shared perfume catalog

1. New Tables
- `perfumes` stores the public products shown in the A&G Gisela storefront.
- `id` is a stable text identifier used by the shopping cart.
- `name`, `subtitle`, `family`, `notes`, `price`, `volume`, `accent`, `image`, and `description` describe each perfume.
- `created_at` and `updated_at` track catalog changes.
2. Security
- Row level security is enabled.
- The catalog is intentionally public because the storefront has no sign-in screen.
- Separate read, insert, update, and delete policies are provided for the anon and authenticated roles.
3. Important Notes
- The initial six products are examples and can be edited later.
- Prices are stored as whole Argentine pesos.
*/

CREATE TABLE IF NOT EXISTS public.perfumes (
  id text PRIMARY KEY,
  name text NOT NULL,
  subtitle text NOT NULL,
  family text NOT NULL,
  notes text NOT NULL,
  price integer NOT NULL CHECK (price >= 0),
  volume text NOT NULL DEFAULT '100 ml',
  accent text NOT NULL,
  image text NOT NULL,
  description text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.perfumes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read perfumes" ON public.perfumes;
CREATE POLICY "Public can read perfumes" ON public.perfumes FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "Public can insert perfumes" ON public.perfumes;
CREATE POLICY "Public can insert perfumes" ON public.perfumes FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update perfumes" ON public.perfumes;
CREATE POLICY "Public can update perfumes" ON public.perfumes FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete perfumes" ON public.perfumes;
CREATE POLICY "Public can delete perfumes" ON public.perfumes FOR DELETE TO anon, authenticated USING (true);

INSERT INTO public.perfumes (id, name, subtitle, family, notes, price, volume, accent, image, description)
VALUES
  ('yara-exclusive', 'Yara Exclusive', 'Intenso · envolvente', 'Oriental dulce', 'Ámbar · vainilla · sándalo', 45000, '100 ml', '#9b5b2a', '/images/perfumes/ChatGPT_Image_14_ago_2026,_01_08_54.png', 'Una estela cálida y sofisticada, con la profundidad del ámbar y un final suave de vainilla.'),
  ('yara-elixir', 'Yara Elixir', 'Floral · radiante', 'Floral oriental', 'Rosa · miel · almizcle', 48000, '100 ml', '#a84b5a', '/images/perfumes/ChatGPT_Image_14_ago_2026,_01_08_54.png', 'Dulce, femenino y luminoso. Una versión de Yara con más cuerpo y una presencia aterciopelada.'),
  ('qimmah-women', 'Qimmah For Women', 'Dulce · elegante', 'Amaderado dulce', 'Frutos rojos · jazmín · vainilla', 52000, '100 ml', '#466b5b', '/images/perfumes/ChatGPT_Image_14_ago_2026,_01_08_54.png', 'Una composición intensa que mezcla flores blancas, frutos jugosos y un fondo cremoso.'),
  ('art-of-universe', 'Art of Universe', 'Magnético · especiado', 'Amaderado especiado', 'Azafrán · cuero · maderas', 58000, '100 ml', '#304679', '/images/perfumes/ChatGPT_Image_14_ago_2026,_00_54_36.png', 'Un perfume de carácter, inspirado en la inmensidad del universo y el brillo de los metales.'),
  ('odyssey-limited', 'Odyssey Limited', 'Fresco · aventurero', 'Aromático fresco', 'Cítricos · lavanda · maderas', 42000, '100 ml', '#5d91aa', '/images/perfumes/ChatGPT_Image_14_ago_2026,_01_06_13.png', 'Frescura limpia y energía cítrica para acompañar todos los días con estilo.'),
  ('now-women', 'Now Women', 'Frutal · contemporáneo', 'Floral frutal', 'Pera · peonía · vainilla', 38000, '100 ml', '#b78686', '/images/perfumes/ChatGPT_Image_14_ago_2026,_01_08_54.png', 'Un aroma amable y moderno, con flores delicadas y una dulzura que queda cerca de la piel.')
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