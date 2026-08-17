/*
# Correct perfume image assignments

1. Data Changes
- Odyssey Limited uses the orange and light-blue Odyssey image.
- Art of Universe uses the blue Art of Universe image.
- Yara Exclusive keeps the amber Yara image.
2. Important Notes
- This corrects the public catalog data without removing any products or customer data.
- The remaining products keep the available image placeholders until their own cutout photos are added.
*/

UPDATE public.perfumes
SET image = '/images/perfumes/ChatGPT_Image_14_ago_2026,_00_54_36.png', updated_at = now()
WHERE id = 'odyssey-limited';

UPDATE public.perfumes
SET image = '/images/perfumes/ChatGPT_Image_14_ago_2026,_01_06_13.png', updated_at = now()
WHERE id = 'art-of-universe';

UPDATE public.perfumes
SET image = '/images/perfumes/ChatGPT_Image_14_ago_2026,_01_08_54.png', updated_at = now()
WHERE id = 'yara-exclusive';