/*
# Cerrar acceso de escritura publico al catalogo + bucket de fotos de producto

1. Security
- Las politicas de INSERT/UPDATE/DELETE de public.perfumes pasaban de `anon` (cualquier
  visitante, sin login) a `authenticated` unicamente. SELECT sigue publico: la tienda no
  tiene login y el catalogo tiene que seguir siendo visible sin sesion.
- Se crea el bucket `product-images` (Supabase Storage) para las fotos que suba la clienta
  desde el panel: lectura publica (las fotos tienen que cargar en la tienda sin login),
  escritura (subir/borrar) restringida a `authenticated`.
2. Important Notes
- Esto NO alcanza por si solo: por default Supabase permite que cualquier visitante se cree
  una cuenta con supabase.auth.signUp() usando la anon key ya expuesta en el bundle, y esa
  cuenta tambien seria `authenticated`. Hay que desactivar el registro publico a mano desde
  el dashboard de Supabase (Authentication -> Providers -> Email -> desactivar "Allow new
  users to sign up") y crear el usuario de la clienta a mano (Authentication -> Add user).
  Esta migracion no puede hacer eso por SQL — queda como paso manual documentado en Task 1
  Step 4 de este plan.
*/

DROP POLICY IF EXISTS "Public can insert perfumes" ON public.perfumes;
CREATE POLICY "Authenticated can insert perfumes" ON public.perfumes FOR INSERT TO authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "Public can update perfumes" ON public.perfumes;
CREATE POLICY "Authenticated can update perfumes" ON public.perfumes FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public can delete perfumes" ON public.perfumes;
CREATE POLICY "Authenticated can delete perfumes" ON public.perfumes FOR DELETE TO authenticated USING (true);

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('product-images', 'product-images', true, 5242880, ARRAY['image/png', 'image/jpeg', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
CREATE POLICY "Authenticated can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
CREATE POLICY "Authenticated can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;
CREATE POLICY "Authenticated can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
