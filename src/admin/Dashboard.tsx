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
