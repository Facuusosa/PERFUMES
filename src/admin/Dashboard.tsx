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
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Perfume | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const loadProducts = async () => {
    if (!supabase) return;
    setLoading(true);
    const { data, error } = await supabase.from('perfumes').select('*').order('created_at');
    if (error) {
      setLoadError('No se pudo cargar el catálogo. Probá de nuevo.');
      setLoading(false);
      return;
    }
    setLoadError(null);
    setProducts((data as Perfume[]) ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async (product: Perfume) => {
    if (!supabase) return;
    const imagePath = product.image.split('/product-images/')[1];
    const { error: deleteError } = await supabase.from('perfumes').delete().eq('id', product.id);
    if (deleteError) {
      setActionError('No se pudo eliminar el producto. Probá de nuevo.');
      return;
    }
    if (imagePath) {
      const { error: storageError } = await supabase.storage.from('product-images').remove([imagePath]);
      if (storageError) console.error('No se pudo eliminar la foto del storage:', storageError);
    }
    setActionError(null);
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
        ) : loadError ? (
          <div className="mt-8 rounded-2xl border border-red-500/30 bg-red-500/5 p-6 text-center">
            <p className="text-red-300">{loadError}</p>
            <button
              onClick={() => loadProducts()}
              className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide hover:bg-white/10"
            >
              Reintentar
            </button>
          </div>
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
                    <button
                      onClick={() => {
                        setActionError(null);
                        setDeletingId(product.id);
                      }}
                      className="text-xs uppercase text-red-400 hover:text-red-300"
                    >
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
            {actionError && <p className="mt-3 text-sm text-red-400">{actionError}</p>}
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
