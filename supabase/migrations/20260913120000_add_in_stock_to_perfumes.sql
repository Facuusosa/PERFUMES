/*
# Agregar interruptor de stock por producto

1. Data Changes
- Nueva columna `in_stock` (boolean, default true) en `perfumes`.
- Todos los productos existentes quedan disponibles (true) por defecto.
2. Uso
- El panel de admin (`/admin`) prende/apaga este campo por producto.
- El sitio publico ordena los productos sin stock al final del catalogo y
  bloquea agregarlos al carrito (ver src/App.tsx).
*/

ALTER TABLE public.perfumes ADD COLUMN IF NOT EXISTS in_stock boolean NOT NULL DEFAULT true;
