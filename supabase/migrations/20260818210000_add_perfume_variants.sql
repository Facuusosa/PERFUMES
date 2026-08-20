/*
# Add product variants support

1. Changes
- Adds a nullable `variants` jsonb column to `public.perfumes`.
- Each element: { "id": text, "name": text, "notes": text, "image": text }.
- NULL or an empty array means the product has a single variant, using the
  product's own `name`, `notes`, and `image` (fully backward compatible).
2. Notes
- Price and family stay shared across all variants of a product (confirmed
  with the client 2026-08-18) — only name, notes, and image vary per variant.
- Existing rows are untouched: the column defaults to NULL.
*/

ALTER TABLE public.perfumes
  ADD COLUMN IF NOT EXISTS variants jsonb;
