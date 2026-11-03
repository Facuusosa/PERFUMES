# Panel de administración para la clienta — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Darle a la clienta (dueña del negocio, sin conocimientos técnicos) una vista dentro del mismo sitio (`/admin`) donde puede cargar, editar y eliminar productos del catálogo — incluida la foto — sin tocar Supabase ni SQL, y cerrar el agujero de seguridad que hoy permite a cualquier visitante escribir la tabla `perfumes` sin login.

**Architecture:** Todo dentro de la misma SPA de Vite (sin router nuevo): `main.tsx` decide por `window.location.pathname` si monta la tienda (`App.tsx`) o el panel (`admin/AdminApp.tsx`). El panel usa Supabase Auth (un solo usuario, creado a mano, sin registro público) y Supabase Storage (bucket `product-images`) para las fotos. Las políticas RLS de `perfumes` y del bucket pasan de `anon` a `authenticated` únicamente, y el registro público de Supabase Auth se desactiva — las dos mitades del mismo cierre de seguridad.

**Tech Stack:** React 18 + TypeScript + Tailwind (ya instalados) + `@supabase/supabase-js` (ya instalado). Cero dependencias nuevas.

**Spec:** `docs/superpowers/specs/2026-08-25-panel-admin-clienta-design.md`

## Global Constraints

- Sin dependencias nuevas — todo con lo ya instalado (`@supabase/supabase-js`, React, Tailwind). No se agrega react-router ni ninguna librería de admin.
- Sin cuentas de usuario para el comprador final — eso no cambia en este plan.
- Productos con variantes quedan fuera de alcance — el formulario no los soporta.
- El proyecto no tiene suite de tests automatizados (no hay Vitest/Jest instalado) y este plan no la agrega, para no romper la consistencia del repo. Cada tarea reemplaza "escribir el test / verlo fallar / verlo pasar" por pasos de verificación manual concretos (navegador + Supabase SQL editor), listados explícitamente en cada tarea.
- Paleta y tipografía consistentes con el resto del sitio: fondo `#0b0b0a`, texto `#f2eee7`, acento `#c99558`, `font-serif` (Playfair Display) para títulos — así el panel se siente parte del mismo producto, aunque nadie externo lo vea.
- El `id` de un producto (primary key, usado por el carrito) se genera una sola vez al crear y nunca se regenera al editar el nombre.
- `family` y `notes` son columnas `NOT NULL` en `public.perfumes` — para categorías que no son "Perfume" se completan automáticamente con `subtitle`, sin mostrárselos a la clienta.

---

## Task 1: Cerrar el agujero de seguridad — RLS + Storage + Auth

**Files:**
- Create: `supabase/migrations/20260826000000_admin_panel_security.sql`

**Interfaces:**
- Produces: políticas RLS actualizadas en `public.perfumes` (INSERT/UPDATE/DELETE solo `authenticated`), bucket `product-images` con lectura pública y escritura solo `authenticated`. Las tareas 6 y 7 (Dashboard, ProductForm) asumen que este bucket ya existe con ese nombre exacto.

- [ ] **Step 1: Escribir la migración SQL**

```sql
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

INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
CREATE POLICY "Public can view product images" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated can upload product images" ON storage.objects;
CREATE POLICY "Authenticated can upload product images" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated can update product images" ON storage.objects;
CREATE POLICY "Authenticated can update product images" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'product-images') WITH CHECK (bucket_id = 'product-images');

DROP POLICY IF EXISTS "Authenticated can delete product images" ON storage.objects;
CREATE POLICY "Authenticated can delete product images" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'product-images');
```

- [ ] **Step 2: Aplicar la migración**

El repo no tiene `supabase/config.toml` — no hay Supabase CLI local configurada, así que las
9 migraciones previas de `supabase/migrations/` se aplicaron a mano. Mismo flujo acá: abrir el
SQL Editor del dashboard de Supabase, pegar el contenido completo del archivo del Step 1, y
ejecutarlo.

- [ ] **Step 3: Verificar las políticas por SQL**

Correr en el SQL Editor de Supabase:

```sql
select tablename, policyname, roles, cmd
from pg_policies
where tablename in ('perfumes', 'objects')
order by tablename, cmd;
```

Expected: `perfumes` tiene una policy `SELECT` con roles `{anon,authenticated}`, y policies
`INSERT`/`UPDATE`/`DELETE` con roles `{authenticated}` únicamente (sin `anon`). `objects`
tiene una policy `SELECT` con `{anon,authenticated}` y `INSERT`/`UPDATE`/`DELETE` con
`{authenticated}`, todas con `bucket_id = 'product-images'` en la condición.

- [ ] **Step 4: Pasos manuales en el dashboard de Supabase (fuera de SQL, obligatorios)**

1. Authentication → Providers → Email → desactivar "Allow new users to sign up". Verificar
   que quedó apagado (recargar la página de configuración y confirmarlo).
2. Authentication → Users → Add user → crear el usuario de la clienta con email y contraseña
   temporal. Guardar esas credenciales fuera del repo (no committear contraseñas).
3. Storage → confirmar que el bucket `product-images` aparece en la lista y figura como
   público.

- [ ] **Step 5: Commit**

```bash
git add supabase/migrations/20260826000000_admin_panel_security.sql
git commit -m "fix: restringir escritura del catalogo y fotos a usuarios autenticados"
```

---

## Task 2: Redirect SPA en Netlify

**Files:**
- Modify: `netlify.toml`

**Interfaces:**
- Produces: cualquier ruta (`/admin` incluida) resuelve a `index.html` en producción con
  status 200, para que el router manual de `main.tsx` (Task 4) decida qué montar.

- [ ] **Step 1: Agregar el redirect**

Reemplazar el contenido completo de `netlify.toml`:

```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

- [ ] **Step 2: Verificar sintaxis con un build local**

Run: `npm run build`
Expected: build termina sin errores (el cambio es solo de configuración de Netlify, no afecta
el build de Vite; esto solo confirma que no se rompió nada al tocar el archivo).

- [ ] **Step 3: Commit**

```bash
git add netlify.toml
git commit -m "fix: agregar redirect SPA para que /admin no de 404 en Netlify"
```

---

## Task 3: Cliente Supabase compartido + tipos exportados

**Files:**
- Create: `src/lib/supabaseClient.ts`
- Modify: `src/App.tsx:18-19` (import), `src/App.tsx:67-69` (reemplazar por import), `src/App.tsx:20-42` (agregar `export` a los tipos)

**Interfaces:**
- Produces: `supabase` (instancia única de `SupabaseClient | null`) exportada desde
  `src/lib/supabaseClient.ts`; tipos `Variant`, `ProductCategory`, `Perfume` exportados desde
  `src/App.tsx`. Las tareas 4-7 importan ambos desde acá — es la única instancia de Supabase
  en toda la app.

- [ ] **Step 1: Crear el cliente compartido**

```ts
// src/lib/supabaseClient.ts
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
```

- [ ] **Step 2: Actualizar `App.tsx` para usar el cliente compartido y exportar los tipos**

En `src/App.tsx:18`, reemplazar:
```ts
import { createClient } from '@supabase/supabase-js';
```
por:
```ts
import { supabase } from './lib/supabaseClient';
```

En `src/App.tsx:20-42`, agregar `export` delante de los tres `type`:
```ts
export type Variant = {
  id: string;
  name: string;
  notes: string;
  image: string;
};

export type ProductCategory = 'Perfume' | 'Combo' | "Victoria's Secret";

export type Perfume = {
  id: string;
  name: string;
  subtitle: string;
  family: string;
  notes: string;
  price: number;
  volume: string;
  accent: string;
  image: string;
  description: string;
  variants?: Variant[] | null;
  category?: ProductCategory;
};
```

En `src/App.tsx:67-69`, eliminar estas líneas (ya no se crea el cliente acá, se importa):
```ts
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;
```

- [ ] **Step 3: Verificar tipos y build**

Run: `npm run typecheck`
Expected: sin errores.

Run: `npm run dev`, abrir `http://localhost:5173/` en el navegador.
Expected: la tienda carga igual que antes (mismo catálogo, mismos precios) — este refactor no
cambia comportamiento visible.

- [ ] **Step 4: Commit**

```bash
git add src/lib/supabaseClient.ts src/App.tsx
git commit -m "refactor: extraer cliente supabase compartido y exportar tipos de producto"
```

---

## Task 4: Ruta `/admin` + sesión + Login

**Files:**
- Create: `src/admin/AdminApp.tsx`
- Create: `src/admin/Login.tsx`
- Modify: `src/main.tsx`

**Interfaces:**
- Consumes: `supabase` de `src/lib/supabaseClient.ts` (Task 3).
- Produces: `AdminApp` (default export, sin props) — monta `Login` sin sesión o `Dashboard`
  (Task 6) con sesión. `Login` (default export, sin props) — llama
  `supabase.auth.signInWithPassword({ email, password })`.

- [ ] **Step 1: Routing en `main.tsx`**

Reemplazar `src/main.tsx` completo:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import AdminApp from './admin/AdminApp.tsx';
import './index.css';

const isAdminRoute = window.location.pathname.startsWith('/admin');

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    {isAdminRoute ? <AdminApp /> : <App />}
  </StrictMode>
);
```

- [ ] **Step 2: Crear `Login.tsx`**

```tsx
// src/admin/Login.tsx
import { useState, type FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setLoading(true);
    setError(null);
    const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (signInError) setError('Usuario o contraseña incorrectos.');
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] px-5 text-[#f2eee7]">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141210] p-8">
        <h1 className="font-serif text-3xl">Panel A&G</h1>
        <p className="mt-2 text-sm text-white/50">Ingresá con tu usuario para cargar productos.</p>
        <label className="mt-6 block text-xs uppercase tracking-wide text-white/50">Email</label>
        <input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
        <label className="mt-4 block text-xs uppercase tracking-wide text-white/50">Contraseña</label>
        <input type="password" required value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
        {error && <p className="mt-4 text-sm text-red-400">{error}</p>}
        <button type="submit" disabled={loading} className="mt-6 w-full rounded-full bg-[#c99558] py-3 text-sm font-semibold uppercase tracking-wide text-black transition hover:bg-[#dba86c] disabled:opacity-50">
          {loading ? 'Ingresando...' : 'Ingresar'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

- [ ] **Step 3: Crear `AdminApp.tsx`**

```tsx
// src/admin/AdminApp.tsx
import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabaseClient';
import Login from './Login';

function AdminApp() {
  const [session, setSession] = useState<Session | null>(null);
  const [checkingSession, setCheckingSession] = useState(true);

  useEffect(() => {
    if (!supabase) {
      setCheckingSession(false);
      return;
    }
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setCheckingSession(false);
    });
    const { data: listener } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
    });
    return () => listener.subscription.unsubscribe();
  }, []);

  if (!supabase) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] p-6 text-center text-[#f2eee7]">
        Falta configurar Supabase (variables de entorno VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY).
      </div>
    );
  }

  if (checkingSession) {
    return <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] text-[#f2eee7]">Cargando...</div>;
  }

  if (!session) {
    return <Login />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] text-[#f2eee7]">
      Sesión iniciada. Panel en construcción (Task 6).
    </div>
  );
}

export default AdminApp;
```

(El placeholder de "Panel en construcción" se reemplaza por `<Dashboard />` en la Task 6 —
queda acá solo para poder verificar el flujo de login de punta a punta en esta tarea.)

- [ ] **Step 4: Verificar en el navegador**

Run: `npm run dev`, abrir `http://localhost:5173/admin`.
Expected: se ve el formulario de login (fondo oscuro, "Panel A&G").

Probar con credenciales incorrectas (cualquier email/contraseña inventados).
Expected: mensaje "Usuario o contraseña incorrectos."

Probar con el usuario creado en Task 1 Step 4.
Expected: mensaje "Sesión iniciada. Panel en construcción (Task 6)."

Confirmar que `http://localhost:5173/` (sin `/admin`) sigue mostrando la tienda normal.

- [ ] **Step 5: Commit**

```bash
git add src/main.tsx src/admin/AdminApp.tsx src/admin/Login.tsx
git commit -m "feat: ruta /admin con login por Supabase Auth, sin registro publico"
```

---

## Task 5: Formulario de alta/edición de producto

**Files:**
- Create: `src/admin/ProductForm.tsx`

**Interfaces:**
- Consumes: `supabase` de `src/lib/supabaseClient.ts`; tipos `Perfume`, `ProductCategory` de
  `src/App.tsx` (Task 3).
- Produces: `ProductForm` (default export) con props
  `{ product: Perfume | null; onDone: () => void; onCancel: () => void }`. `product === null`
  es modo alta; `product` con datos es modo edición. La Task 6 (Dashboard) monta este
  componente y le pasa esas tres props.

- [ ] **Step 1: Crear `ProductForm.tsx`**

```tsx
// src/admin/ProductForm.tsx
import { useState, type ChangeEvent, type FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Perfume, ProductCategory } from '../App';

const categoryOptions: ProductCategory[] = ['Perfume', 'Combo', "Victoria's Secret"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

type FormState = {
  name: string;
  subtitle: string;
  category: ProductCategory;
  family: string;
  notes: string;
  price: string;
  volume: string;
  description: string;
  accent: string;
};

function emptyForm(): FormState {
  return { name: '', subtitle: '', category: 'Perfume', family: '', notes: '', price: '', volume: '100 ml', description: '', accent: '#c99558' };
}

function fromProduct(product: Perfume): FormState {
  return {
    name: product.name,
    subtitle: product.subtitle,
    category: product.category ?? 'Perfume',
    family: product.family,
    notes: product.notes,
    price: String(product.price),
    volume: product.volume,
    description: product.description,
    accent: product.accent,
  };
}

type Props = { product: Perfume | null; onDone: () => void; onCancel: () => void };

function ProductForm({ product, onDone, onCancel }: Props) {
  const [form, setForm] = useState<FormState>(product ? fromProduct(product) : emptyForm());
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(product?.image ?? null);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const isPerfume = form.category === 'Perfume';

  const handleImageChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('El archivo tiene que ser una imagen.');
      return;
    }
    if (file.size > MAX_IMAGE_BYTES) {
      setError('La foto pesa más de 5MB, probá con una más liviana.');
      return;
    }
    setError(null);
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const uploadImage = async (id: string): Promise<string> => {
    if (!supabase || !imageFile) throw new Error('Falta la foto.');
    const extension = imageFile.name.split('.').pop() ?? 'png';
    const path = `${id}-${Date.now()}.${extension}`;
    const { error: uploadError } = await supabase.storage.from('product-images').upload(path, imageFile, { upsert: true });
    if (uploadError) throw uploadError;
    const { data } = supabase.storage.from('product-images').getPublicUrl(path);
    return data.publicUrl;
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!supabase) return;
    setError(null);

    if (!form.name.trim()) {
      setError('Falta el nombre.');
      return;
    }
    const priceNumber = Number(form.price);
    if (!priceNumber || priceNumber <= 0) {
      setError('El precio tiene que ser mayor a cero.');
      return;
    }
    if (!product && !imageFile) {
      setError('Falta la foto.');
      return;
    }

    setSaving(true);
    try {
      const family = isPerfume ? form.family.trim() : form.subtitle.trim();
      const notes = isPerfume ? form.notes.trim() : form.subtitle.trim();

      if (!product) {
        const baseId = slugify(form.name);
        if (!baseId) throw new Error('El nombre no genera un identificador válido, probá con otro.');
        const { data: existing } = await supabase.from('perfumes').select('id').eq('id', baseId).maybeSingle();
        if (existing) throw new Error('Ya existe un producto con ese nombre. Ajustá el nombre e intentá de nuevo.');

        const imageUrl = await uploadImage(baseId);
        const { error: insertError } = await supabase.from('perfumes').insert({
          id: baseId,
          name: form.name.trim(),
          subtitle: form.subtitle.trim(),
          category: form.category,
          family,
          notes,
          price: priceNumber,
          volume: form.volume.trim(),
          description: form.description.trim(),
          accent: form.accent,
          image: imageUrl,
        });
        if (insertError) throw insertError;
      } else {
        const imageUrl = imageFile ? await uploadImage(product.id) : product.image;
        const { error: updateError } = await supabase
          .from('perfumes')
          .update({
            name: form.name.trim(),
            subtitle: form.subtitle.trim(),
            category: form.category,
            family,
            notes,
            price: priceNumber,
            volume: form.volume.trim(),
            description: form.description.trim(),
            accent: form.accent,
            image: imageUrl,
          })
          .eq('id', product.id);
        if (updateError) throw updateError;
      }
      onDone();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar. Probá de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0b0b0a] px-5 py-10 text-[#f2eee7] md:px-12">
      <div className="mx-auto max-w-3xl">
        <h1 className="font-serif text-3xl">{product ? 'Editar producto' : 'Agregar producto'}</h1>
        <form onSubmit={handleSubmit} className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wide text-white/50">Nombre</label>
            <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">Subtítulo</label>
            <input required value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">Categoría</label>
            <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ProductCategory })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]">
              {categoryOptions.map((option) => (
                <option key={option} value={option}>{option}</option>
              ))}
            </select>
          </div>
          {isPerfume && (
            <>
              <div>
                <label className="block text-xs uppercase tracking-wide text-white/50">Familia olfativa</label>
                <input required={isPerfume} value={form.family} onChange={(event) => setForm({ ...form, family: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wide text-white/50">Notas</label>
                <input required={isPerfume} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
              </div>
            </>
          )}
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">Precio (ARS)</label>
            <input required type="number" min="1" value={form.price} onChange={(event) => setForm({ ...form, price: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">Volumen</label>
            <input required value={form.volume} onChange={(event) => setForm({ ...form, volume: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
          </div>
          <div className="md:col-span-2">
            <label className="block text-xs uppercase tracking-wide text-white/50">Descripción</label>
            <textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">Color de acento</label>
            <p className="mt-1 text-xs text-white/40">Elegí el tono que más se parece al frasco.</p>
            <input type="color" value={form.accent} onChange={(event) => setForm({ ...form, accent: event.target.value })} className="mt-2 h-11 w-20 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-white/50">Foto</label>
            <input type="file" accept="image/*" onChange={handleImageChange} className="mt-1 w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:uppercase file:text-white" />
          </div>
          <div className="md:col-span-2">
            <p className="text-xs uppercase tracking-wide text-white/50">Vista previa de la tarjeta</p>
            <div className="relative mt-2 flex h-56 w-full max-w-xs items-center justify-center overflow-hidden rounded-xl p-6" style={{ background: `linear-gradient(145deg, ${form.accent}, #151515 120%)` }}>
              {imagePreview ? <img src={imagePreview} alt="Vista previa" className="h-full w-full object-contain" /> : <span className="text-xs text-white/40">Sin foto todavía</span>}
            </div>
          </div>
          {error && <p className="text-sm text-red-400 md:col-span-2">{error}</p>}
          <div className="flex gap-3 md:col-span-2">
            <button type="submit" disabled={saving} className="rounded-full bg-[#c99558] px-6 py-3 text-xs font-semibold uppercase tracking-wide text-black transition hover:bg-[#dba86c] disabled:opacity-50">
              {saving ? 'Guardando...' : 'Guardar'}
            </button>
            <button type="button" onClick={onCancel} className="rounded-full border border-white/20 px-6 py-3 text-xs uppercase tracking-wide text-white/70 hover:text-white">
              Cancelar
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ProductForm;
```

- [ ] **Step 2: Verificar tipos**

Run: `npm run typecheck`
Expected: sin errores. (La verificación funcional en navegador de este formulario se hace en
la Task 6, cuando el Dashboard ya puede montarlo.)

- [ ] **Step 3: Commit**

```bash
git add src/admin/ProductForm.tsx
git commit -m "feat: formulario de alta/edicion de producto para el panel"
```

---

## Task 6: Dashboard — lista + alta + edición + baja (delivery completo)

**Files:**
- Create: `src/admin/Dashboard.tsx`
- Modify: `src/admin/AdminApp.tsx:37-41` (reemplazar el placeholder por `<Dashboard />`)

**Interfaces:**
- Consumes: `supabase` de `src/lib/supabaseClient.ts`; `Perfume` de `src/App.tsx`; `ProductForm`
  de `src/admin/ProductForm.tsx` (Task 5).
- Produces: `Dashboard` (default export) con prop `{ onLogout: () => void }`.

- [ ] **Step 1: Crear `Dashboard.tsx`**

```tsx
// src/admin/Dashboard.tsx
import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Perfume } from '../App';
import ProductForm from './ProductForm';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState<Perfume | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data } = await supabase.from('perfumes').select('*').order('created_at');
    setProducts((data as Perfume[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (product: Perfume) => {
    if (!supabase) return;
    const imagePath = product.image.split('/product-images/')[1];
    await supabase.from('perfumes').delete().eq('id', product.id);
    if (imagePath) await supabase.storage.from('product-images').remove([imagePath]);
    setDeletingId(null);
    loadProducts();
  };

  if (isCreating || editingProduct) {
    return (
      <ProductForm
        product={editingProduct}
        onDone={() => {
          setIsCreating(false);
          setEditingProduct(null);
          loadProducts();
        }}
        onCancel={() => {
          setIsCreating(false);
          setEditingProduct(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#0b0b0a] px-5 py-10 text-[#f2eee7] md:px-12">
      <div className="mx-auto max-w-5xl">
        <div className="flex items-center justify-between">
          <h1 className="font-serif text-3xl">Catálogo — A&G</h1>
          <button onClick={onLogout} className="text-xs uppercase tracking-wide text-white/50 hover:text-white">
            Cerrar sesión
          </button>
        </div>
        <button onClick={() => setIsCreating(true)} className="mt-6 rounded-full bg-[#c99558] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-[#dba86c]">
          + Agregar producto
        </button>
        {loading ? (
          <p className="mt-8 text-white/50">Cargando...</p>
        ) : (
          <table className="mt-8 w-full border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="pb-3">Foto</th>
                <th className="pb-3">Nombre</th>
                <th className="pb-3">Categoría</th>
                <th className="pb-3">Precio</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {products.map((product) => (
                <tr key={product.id} className="border-b border-white/5">
                  <td className="py-3">
                    <img src={product.image} alt={product.name} className="h-12 w-12 object-contain" />
                  </td>
                  <td className="py-3">{product.name}</td>
                  <td className="py-3 text-white/60">{product.category ?? 'Perfume'}</td>
                  <td className="py-3">{formatPrice(product.price)}</td>
                  <td className="py-3 text-right">
                    <button onClick={() => setEditingProduct(product)} className="mr-4 text-xs uppercase text-white/60 hover:text-white">
                      Editar
                    </button>
                    <button onClick={() => setDeletingId(product.id)} className="text-xs uppercase text-red-400 hover:text-red-300">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-5">
          <div className="w-full max-w-sm rounded-2xl border border-white/10 bg-[#141210] p-6">
            <p>¿Seguro que querés eliminar {products.find((product) => product.id === deletingId)?.name}? No se puede deshacer.</p>
            <div className="mt-6 flex justify-end gap-3">
              <button onClick={() => setDeletingId(null)} className="rounded-full border border-white/20 px-4 py-2 text-xs uppercase">
                Cancelar
              </button>
              <button
                onClick={() => {
                  const product = products.find((item) => item.id === deletingId);
                  if (product) handleDelete(product);
                }}
                className="rounded-full bg-red-500 px-4 py-2 text-xs uppercase text-black"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
```

- [ ] **Step 2: Integrar en `AdminApp.tsx`**

En `src/admin/AdminApp.tsx`, agregar el import:
```ts
import Dashboard from './Dashboard';
```

Y reemplazar el bloque placeholder final:
```tsx
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#0b0b0a] text-[#f2eee7]">
      Sesión iniciada. Panel en construcción (Task 6).
    </div>
  );
```
por:
```tsx
  return <Dashboard onLogout={() => supabase?.auth.signOut()} />;
```

(Se usa `supabase?.` en vez de `supabase.` acá: aunque ya se verificó `supabase` no-null más
arriba en el componente, este callback se define para ejecutarse en un momento futuro
—al hacer click—, y TypeScript no siempre preserva ese narrowing dentro de una función que se
pasa como prop. `?.` evita un posible error de "Object is possibly null" en el typecheck sin
cambiar el comportamiento real.)

- [ ] **Step 3: Verificación funcional completa en el navegador**

Run: `npm run dev`, entrar a `http://localhost:5173/admin`, loguearse con el usuario de Task 1.

1. **Lista:** confirmar que aparecen los ~46 productos reales del catálogo con foto, nombre,
   categoría y precio correctos.
2. **Crear (Perfume):** click en "+ Agregar producto", categoría "Perfume", completar todos
   los campos incluida familia/notas, elegir un color, subir una foto de prueba, guardar.
   Expected: vuelve a la lista y el producto nuevo aparece. Abrir `http://localhost:5173/`
   (la tienda) y confirmar que el producto se ve en el catálogo público con el mismo diseño
   de tarjeta que el resto (degradé del color elegido, foto, precio).
3. **Crear (Combo o Victoria's Secret):** repetir con otra categoría — confirmar que los
   campos "Familia olfativa" y "Notas" NO aparecen en el formulario.
4. **Nombre duplicado:** intentar crear un producto con un nombre que genere el mismo `id`
   que uno existente. Expected: mensaje de error, no se crea un duplicado.
5. **Editar:** click en "Editar" sobre el producto de prueba creado en el paso 2, cambiar el
   precio, guardar sin tocar la foto. Expected: el precio se actualiza en la lista y en la
   tienda; la foto sigue siendo la misma.
6. **Eliminar:** click en "Eliminar" sobre el producto de prueba, confirmar en el modal.
   Expected: desaparece de la lista y de la tienda. Confirmar en Supabase Storage
   (Storage → product-images) que el archivo de esa foto ya no está.
7. **Seguridad:** cerrar sesión, abrir la consola del navegador en `http://localhost:5173/`
   (la tienda, sin sesión) y correr (reemplazando por la URL/key reales del proyecto):
   ```js
   const { createClient } = await import('https://esm.sh/@supabase/supabase-js@2');
   const anon = createClient('<VITE_SUPABASE_URL>', '<VITE_SUPABASE_ANON_KEY>');
   const { error } = await anon.from('perfumes').delete().eq('id', 'yara-exclusive');
   console.log(error);
   ```
   Expected: `error` no es `null` (la operación es rechazada por RLS) y el producto sigue
   existiendo.

- [ ] **Step 4: Commit**

```bash
git add src/admin/Dashboard.tsx src/admin/AdminApp.tsx
git commit -m "feat: dashboard del panel con alta, edicion y baja de productos"
```

---

## Task 7: Cierre — lint completo y checklist final

**Files:** ninguno nuevo — solo verificación.

- [ ] **Step 1: Lint y typecheck de todo el proyecto**

Run: `npm run lint`
Expected: sin errores nuevos (los que ya existían antes de este plan, si los hay, no son
responsabilidad de este plan).

Run: `npm run typecheck`
Expected: sin errores.

Run: `npm run build`
Expected: build de producción termina sin errores.

- [ ] **Step 2: Checklist de verificación manual final**

- [ ] `http://localhost:5173/` sigue funcionando exactamente igual que antes de este plan
      (catálogo, carrito, WhatsApp) — este plan no debería haber cambiado nada visible ahí.
- [ ] `http://localhost:5173/admin` pide login y no se puede saltear.
- [ ] No existe ninguna pantalla ni link de "registrarse" en `/admin`.
- [ ] El flujo completo (crear, editar, eliminar) fue probado en la Task 6 y funcionó.
- [ ] Las credenciales de la clienta fueron entregadas fuera del repositorio (no están en
      ningún archivo commiteado).
- [ ] Pendiente para después del deploy a Netlify (no verificable en local): entrar a la URL
      de producción `/admin` directamente (no navegando desde `/`) y confirmar que no da 404 —
      valida el redirect de la Task 2 en el entorno real.

- [ ] **Step 3: Commit final (si algún ajuste quedó pendiente de las verificaciones anteriores)**

Si todas las verificaciones pasaron sin cambios de código, no hay nada que commitear en este
paso — el plan queda cerrado en el commit de la Task 6.
