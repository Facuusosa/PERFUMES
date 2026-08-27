import { useEffect, useState, type ChangeEvent, type FormEvent } from 'react';
import { supabase } from '../lib/supabaseClient';
import type { Perfume, ProductCategory } from '../App';

const categoryOptions: ProductCategory[] = ['Perfume', 'Combo', "Victoria's Secret"];
const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

function isPostgresError(value: unknown): value is { code?: string; message?: string } {
  return typeof value === 'object' && value !== null && ('code' in value || 'message' in value);
}

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
  brand: string;
  family: string;
  notes: string;
  price: string;
  volume: string;
  description: string;
  accent: string;
};

function emptyForm(): FormState {
  return { name: '', subtitle: '', category: 'Perfume', brand: '', family: '', notes: '', price: '', volume: '100 ml', description: '', accent: '#c99558' };
}

function fromProduct(product: Perfume): FormState {
  return {
    name: product.name,
    subtitle: product.subtitle,
    category: product.category ?? 'Perfume',
    brand: product.brand ?? '',
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
  const [familyOptions, setFamilyOptions] = useState<string[]>([]);
  const [brandOptions, setBrandOptions] = useState<string[]>([]);
  const [isNewBrand, setIsNewBrand] = useState(false);

  const isPerfume = form.category === 'Perfume';

  useEffect(() => {
    if (!supabase) return;
    supabase
      .from('perfumes')
      .select('family')
      .then(({ data, error: familyError }) => {
        if (familyError || !data) return;
        const values = Array.from(
          new Set(
            data
              .map((row) => (row as { family: string }).family)
              .filter((value): value is string => Boolean(value && value.trim()))
          )
        ).sort((a, b) => a.localeCompare(b));
        setFamilyOptions(values);
      });
    supabase
      .from('perfumes')
      .select('brand')
      .then(({ data, error: brandError }) => {
        if (brandError || !data) return;
        const values = Array.from(
          new Set(
            data
              .map((row) => (row as { brand: string }).brand)
              .filter((value): value is string => Boolean(value && value.trim()))
          )
        ).sort((a, b) => a.localeCompare(b));
        setBrandOptions(values);
      });
  }, []);

  const brandSelectOptions =
    form.brand && !brandOptions.includes(form.brand)
      ? [...brandOptions, form.brand].sort((a, b) => a.localeCompare(b))
      : brandOptions;

  const familySelectOptions =
    form.family && !familyOptions.includes(form.family)
      ? [...familyOptions, form.family].sort((a, b) => a.localeCompare(b))
      : familyOptions;

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
    if (!form.brand.trim()) {
      setError('Falta la marca.');
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
          brand: form.brand.trim(),
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
            brand: form.brand.trim(),
            family,
            notes,
            price: priceNumber,
            volume: form.volume.trim(),
            description: form.description.trim(),
            accent: form.accent,
            image: imageUrl,
            updated_at: new Date().toISOString(),
          })
          .eq('id', product.id);
        if (updateError) throw updateError;
      }
      onDone();
    } catch (submitError) {
      if (isPostgresError(submitError) && submitError.code === '23505') {
        setError('Ya existe un producto con esos datos.');
      } else if (isPostgresError(submitError) && submitError.code === '42501') {
        setError('No tenés permiso para hacer esto. Iniciá sesión de nuevo.');
      } else {
        setError(submitError instanceof Error ? submitError.message : 'No se pudo guardar. Probá de nuevo.');
      }
    } finally {
      setSaving(false);
    }
  };

  const previewFamily = form.family || (isPerfume ? 'Familia olfativa' : form.category);
  const previewNotes = (isPerfume ? form.notes : form.subtitle) || 'Así se ven las notas acá';

  return (
    <div className="min-h-screen bg-[#0b0b0a] px-5 py-10 text-[#f2eee7] md:px-12">
      <div className="mx-auto max-w-5xl">
        <h1 className="font-serif text-3xl">{product ? 'Editar producto' : 'Agregar producto'}</h1>
        <p className="mt-2 max-w-lg text-sm text-white/50">Completá los datos de la izquierda. A la derecha vas a ver, en vivo, cómo le va a quedar la tarjeta al comprador.</p>
        <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_400px] lg:items-start">
          <form onSubmit={handleSubmit} className="grid gap-5 md:grid-cols-2">
            <p className="text-xs uppercase tracking-wide text-[#c99558] md:col-span-2">Datos básicos</p>
            <div className="md:col-span-2">
              <label className="block text-xs uppercase tracking-wide text-white/50">Nombre</label>
              <input required value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-white/50">Subtítulo</label>
              <p className="mt-1 text-xs text-white/40">Una frase corta, ej. "Dulce · floral".</p>
              <input required value={form.subtitle} onChange={(event) => setForm({ ...form, subtitle: event.target.value })} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-white/50">Categoría</label>
              <select value={form.category} onChange={(event) => setForm({ ...form, category: event.target.value as ProductCategory })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]">
                {categoryOptions.map((option) => (
                  <option key={option} value={option} className="bg-[#1a1a18] text-white">{option}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-white/50">Marca</label>
              {brandOptions.length > 0 && !isNewBrand ? (
                <select
                  required
                  value={form.brand}
                  onChange={(event) => setForm({ ...form, brand: event.target.value })}
                  className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]"
                >
                  <option value="" className="bg-[#1a1a18] text-white">Elegí una marca</option>
                  {brandSelectOptions.map((option) => (
                    <option key={option} value={option} className="bg-[#1a1a18] text-white">{option}</option>
                  ))}
                </select>
              ) : (
                <input required autoFocus={isNewBrand} placeholder="Nombre de la marca" value={form.brand} onChange={(event) => setForm({ ...form, brand: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
              )}
              {brandOptions.length > 0 && (
                <button
                  type="button"
                  onClick={() => {
                    setIsNewBrand((current) => !current);
                    setForm({ ...form, brand: '' });
                  }}
                  className="mt-2 text-xs uppercase tracking-wide text-white/50 hover:text-white"
                >
                  {isNewBrand ? 'Elegir de la lista' : '+ Es una marca nueva'}
                </button>
              )}
            </div>
            {isPerfume && (
              <>
                <p className="text-xs uppercase tracking-wide text-[#c99558] md:col-span-2">Aroma</p>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-white/50">Familia olfativa</label>
                  {familyOptions.length > 0 ? (
                    <select
                      required={isPerfume}
                      value={form.family}
                      onChange={(event) => setForm({ ...form, family: event.target.value })}
                      className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]"
                    >
                      <option value="" className="bg-[#1a1a18] text-white">Elegí una familia</option>
                      {familySelectOptions.map((option) => (
                        <option key={option} value={option} className="bg-[#1a1a18] text-white">{option}</option>
                      ))}
                    </select>
                  ) : (
                    <input required={isPerfume} value={form.family} onChange={(event) => setForm({ ...form, family: event.target.value })} className="mt-1 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
                  )}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wide text-white/50">Notas</label>
                  <p className="mt-1 text-xs text-white/40">Separadas por "·", ej. "Canela · dátiles · vainilla".</p>
                  <input required={isPerfume} value={form.notes} onChange={(event) => setForm({ ...form, notes: event.target.value })} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
                </div>
              </>
            )}
            <p className="text-xs uppercase tracking-wide text-[#c99558] md:col-span-2">Precio y presentación</p>
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
              <p className="mt-1 text-xs text-white/40">Lo que va a leer el comprador en la ficha del producto (no en la tarjeta chica).</p>
              <textarea required rows={3} value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} className="mt-2 w-full rounded-lg border border-white/15 bg-black/30 px-4 py-3 text-sm outline-none focus:border-[#c99558]" />
            </div>
            <p className="text-xs uppercase tracking-wide text-[#c99558] md:col-span-2">Imagen y color</p>
            <div>
              <label className="block text-xs uppercase tracking-wide text-white/50">Color de acento</label>
              <p className="mt-1 text-xs text-white/40">Elegí el tono que más se parece al frasco.</p>
              <input type="color" value={form.accent} onChange={(event) => setForm({ ...form, accent: event.target.value })} className="mt-2 h-11 w-20 cursor-pointer rounded-lg border border-white/15 bg-transparent" />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-white/50">Foto</label>
              <p className="mt-1 text-xs text-white/40">Fondo negro, igual que el resto del catálogo.</p>
              <input type="file" accept="image/*" onChange={handleImageChange} className="mt-2 w-full text-sm text-white/70 file:mr-4 file:rounded-full file:border-0 file:bg-white/10 file:px-4 file:py-2 file:text-xs file:uppercase file:text-white" />
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

          <div className="lg:sticky lg:top-10">
            <p className="text-xs uppercase tracking-wide text-white/50">Así lo va a ver el comprador</p>
            <article className="relative mt-3 w-full overflow-hidden text-white" style={{ background: `linear-gradient(165deg, ${form.accent}, #151515 85%)` }}>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_75%_20%,rgba(255,255,255,.18),transparent_35%)]" />
              <div className="relative z-10 p-6">
                <div className="flex h-52 items-center justify-center">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Vista previa" className="h-full w-full object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,.55)]" />
                  ) : (
                    <span className="px-4 text-center text-xs text-white/50">Subí una foto para verla acá</span>
                  )}
                </div>
                <p className="mt-5 text-[10px] uppercase tracking-[0.25em] text-white/70">{previewFamily}</p>
                <h3 className="mt-2 font-serif text-3xl leading-none tracking-[-0.04em]">{form.name || 'Nombre del producto'}</h3>
                <p className="mt-2 text-sm text-white/70">{form.subtitle || 'Subtítulo'}</p>
                <p className="mt-4 text-sm leading-6 text-white/85">{form.description || 'Acá va a aparecer la descripción que escribas más abajo.'}</p>
                <div className="my-5 border-y border-white/20 py-4 text-xs">
                  <div className="flex justify-between gap-4"><span className="shrink-0 text-white/60">Notas</span><span className="text-right text-white/90">{previewNotes}</span></div>
                  <div className="mt-3 flex justify-between"><span className="text-white/60">Tamaño</span><span className="text-white/90">{form.volume || '—'}</span></div>
                  <div className="mt-3 flex justify-between"><span className="text-white/60">Marca</span><span className="text-white/90">{form.brand || '—'}</span></div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xl">{form.price ? formatPrice(Number(form.price)) : '$ 0'}</span>
                  <span className="rounded-full bg-white px-5 py-2.5 text-[10px] font-bold uppercase tracking-[0.18em] text-black">Agregar al carrito</span>
                </div>
              </div>
            </article>
            <p className="mt-3 text-xs leading-5 text-white/40">Esta tarjeta se actualiza sola a medida que completás los campos de la izquierda — es exactamente lo que va a aparecer en el catálogo del sitio.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductForm;
