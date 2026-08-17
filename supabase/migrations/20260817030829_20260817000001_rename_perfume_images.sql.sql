/*
# Rename perfume image paths to clean filenames

1. Data Changes
- All perfume image paths updated from ChatGPT_Image_* filenames to clean product-based names.
- Fixes broken images caused by commas/spaces in filenames that break URL resolution in the browser.
- Corrects swapped assignments from the previous migration.
*/

UPDATE public.perfumes
SET image = '/images/perfumes/yara-exclusive.png', updated_at = now()
WHERE id = 'yara-exclusive';

UPDATE public.perfumes
SET image = '/images/perfumes/yara-elixir.png', updated_at = now()
WHERE id = 'yara-elixir';

UPDATE public.perfumes
SET image = '/images/perfumes/qimmah-women.png', updated_at = now()
WHERE id = 'qimmah-women';

UPDATE public.perfumes
SET image = '/images/perfumes/art-of-universe.png', updated_at = now()
WHERE id = 'art-of-universe';

UPDATE public.perfumes
SET image = '/images/perfumes/odyssey-limited.png', updated_at = now()
WHERE id = 'odyssey-limited';

UPDATE public.perfumes
SET image = '/images/perfumes/now-women.png', updated_at = now()
WHERE id = 'now-women';
