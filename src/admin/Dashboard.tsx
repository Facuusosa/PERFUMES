// src/admin/Dashboard.tsx
import { useEffect, useMemo, useState } from 'react';
import { Search, X } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import type { Perfume, ProductCategory } from '../App';
import ProductForm from './ProductForm';

const formatPrice = (price: number) =>
  new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(price);

const categoryTabs: Array<ProductCategory | 'Todas'> = ['Todas', 'Perfume', 'Combo', "Victoria's Secret"];

function Dashboard({ onLogout }: { onLogout: () => void }) {
  const [products, setProducts] = useState<Perfume[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [editingProduct, setEditingProduct] = useState<Perfume | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<ProductCategory | 'Todas'>('Todas');
  const [brandFilter, setBrandFilter] = useState('Todas');

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

  const brandOptions = useMemo(
    () =>
      Array.from(new Set(products.map((product) => product.brand).filter((brand): brand is string => Boolean(brand))))
        .sort((a, b) => a.localeCompare(b)),
    [products]
  );

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();
    return products.filter((product) => {
      if (categoryFilter !== 'Todas' && (product.category ?? 'Perfume') !== categoryFilter) return false;
      if (brandFilter !== 'Todas' && product.brand !== brandFilter) return false;
      if (query && !product.name.toLowerCase().includes(query)) return false;
      return true;
    });
  }, [products, search, categoryFilter, brandFilter]);

  const hasActiveFilters = search.trim() !== '' || categoryFilter !== 'Todas' || brandFilter !== 'Todas';

  const clearFilters = () => {
    setSearch('');
    setCategoryFilter('Todas');
    setBrandFilter('Todas');
  };

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
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="font-serif text-3xl">Catálogo — A&G</h1>
            <p className="mt-1 text-sm text-white/50">
              {loading ? 'Cargando…' : `${products.length} ${products.length === 1 ? 'producto' : 'productos'} en total`}
            </p>
          </div>
          <button onClick={onLogout} className="shrink-0 text-xs uppercase tracking-wide text-white/50 hover:text-white">
            Cerrar sesión
          </button>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap gap-2">
            {categoryTabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setCategoryFilter(tab)}
                className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-wide transition ${
                  categoryFilter === tab
                    ? 'border-[#c99558] bg-[#c99558] text-black'
                    : 'border-white/15 text-white/60 hover:border-white/30 hover:text-white'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <button onClick={() => setIsCreating(true)} className="shrink-0 rounded-full bg-[#c99558] px-5 py-2.5 text-xs font-semibold uppercase tracking-wide text-black hover:bg-[#dba86c]">
            + Agregar producto
          </button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Buscar por nombre..."
              className="w-full rounded-lg border border-white/15 bg-black/30 py-2.5 pl-10 pr-4 text-sm outline-none focus:border-[#c99558]"
            />
          </div>
          {brandOptions.length > 0 && (
            <select
              value={brandFilter}
              onChange={(event) => setBrandFilter(event.target.value)}
              className="rounded-lg border border-white/15 bg-black/30 px-4 py-2.5 text-sm text-white/80 outline-none focus:border-[#c99558]"
            >
              <option value="Todas" className="bg-[#1a1a18] text-white">Todas las marcas</option>
              {brandOptions.map((brand) => (
                <option key={brand} value={brand} className="bg-[#1a1a18] text-white">{brand}</option>
              ))}
            </select>
          )}
          {hasActiveFilters && (
            <button onClick={clearFilters} className="flex items-center gap-1 text-xs uppercase tracking-wide text-white/50 hover:text-white">
              <X className="h-3.5 w-3.5" />
              Limpiar
            </button>
          )}
        </div>

        {!loading && !loadError && (
          <p className="mt-4 text-xs uppercase tracking-wide text-white/40">
            Mostrando {filteredProducts.length} de {products.length}
          </p>
        )}

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
        ) : filteredProducts.length === 0 ? (
          <div className="mt-8 rounded-2xl border border-white/10 bg-white/[0.02] p-10 text-center">
            <p className="text-white/60">Ningún producto coincide con esos filtros.</p>
            <button
              onClick={clearFilters}
              className="mt-4 rounded-full border border-white/20 px-4 py-2 text-xs uppercase tracking-wide hover:bg-white/10"
            >
              Limpiar filtros
            </button>
          </div>
        ) : (
          <div className="mt-4 -mx-5 overflow-x-auto px-5 md:mx-0 md:px-0">
          <table className="w-full min-w-[640px] border-collapse text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wide text-white/40">
                <th className="pb-3">Foto</th>
                <th className="pb-3">Nombre</th>
                <th className="pb-3">Marca</th>
                <th className="pb-3">Categoría</th>
                <th className="pb-3 text-right">Precio</th>
                <th className="pb-3"></th>
              </tr>
            </thead>
            <tbody>
              {filteredProducts.map((product) => (
                <tr key={product.id} className="border-b border-white/5 transition hover:bg-white/[0.03]">
                  <td className="py-3">
                    <img src={product.image} alt={product.name} className="h-12 w-12 object-contain" />
                  </td>
                  <td className="py-3">{product.name}</td>
                  <td className="py-3 text-white/60">{product.brand ?? '—'}</td>
                  <td className="py-3 text-white/60">{product.category ?? 'Perfume'}</td>
                  <td className="py-3 text-right">{formatPrice(product.price)}</td>
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
          </div>
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
