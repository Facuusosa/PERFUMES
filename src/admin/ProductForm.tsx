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
