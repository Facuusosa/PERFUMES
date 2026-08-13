# PRODUCT.md

## Qué es
Ecommerce de reventa de perfumes en Argentina. La dueña (nuestra clienta) compra y revende perfumes multimarca: árabes/inspirados, Natura, nicho. No fabrica nada, no controla fórmulas — vende originalidad, precio y confianza.

## Quién lo usa
- **Administradora (la clienta):** no sabe de tecnología. Necesita cargar/editar producto, precio, stock y fotos ella sola, sin ayuda técnica. Este es el requisito no negociable del proyecto — se resuelve con un panel Sanity Studio, no con código a medida para el admin.
- **Comprador final:** llega mayormente desde redes (Instagram/WhatsApp), compara precio y quiere sentir que el producto es original y que la compra es segura.

## Objetivo de conversión
Click en "comprar" → checkout con Mercado Pago. Sin fricción, sin registro obligatorio.

## Estado del contenido (importante para Claude Code)
- Nombre de marca: **placeholder "Perfumes"** — no está definido, cambiar antes de producción.
- Fotos de producto: **no hay fotos reales todavía**, se usan Unsplash/Pexels como placeholder. Swap obligatorio antes de lanzar (derechos de autor).
- Categorías: árabes/inspirados, Natura, nicho.

## Stack decidido (con motivo)
- **Next.js + TypeScript + Tailwind + shadcn/ui** — control total del frontend, sin heredar el look de un builder de IA.
- **Sanity (CMS)** — resuelve el panel de carga simple para la clienta sin construir auth/CRUD/storage desde cero. Plan free (10.000 documentos) alcanza de sobra.
- **Netlify** — hosting. Se eligió sobre Vercel Hobby porque Vercel prohíbe uso comercial en el plan gratis (obliga a Pro, USD 20/mes); Netlify sí permite ecommerce en su free tier.
- **Mercado Pago Checkout Pro** — pagos. Comisión ~4,84% real (3,99% + IVA), aplica en cualquier plataforma.
- **Dominio .com.ar** — vía NIC Argentina, ~AR$8.500/año (verificar valor vigente en nic.ar).

Costo recurrente fijo: prácticamente $0/mes.
