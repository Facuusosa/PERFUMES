# ecommerce-perfumes

Ecommerce de reventa de perfumes multimarca (árabes/inspirados, Natura, nicho) en Argentina.
Contexto completo: @docs/PRODUCT.md y @docs/DESIGN.md

## Reglas duras (no negociables)
- Admin (la clienta) no es técnica. Todo lo que ella deba tocar (producto/precio/stock/fotos)
  vive en Sanity Studio (`/studio`), nunca en código a medida.
- Stack ya decidido y validado con números: Next.js + TypeScript + Tailwind + shadcn/ui,
  Sanity (free tier), Netlify (no Vercel — prohíbe uso comercial en plan gratis),
  Mercado Pago Checkout Pro. No reevaluar el stack.
- Nunca: gradiente purple→blue/pink, glassmorphism, cards genéricas con sombra,
  bounce/elastic easing, Inter como fuente, system-ui visible.
- Tipografía: Fraunces (display/serif) + Space Grotesk (UI). Paleta en @docs/DESIGN.md.
- El nombre de marca es **A&G (Ariel y Gisela)**, definido con la clienta (2026-08-14).
  Si más adelante piden cambiarlo, actualizar este archivo antes de asumir un nombre nuevo.
- Las fotos de producto son placeholder (stock, sin derechos) hasta definir qué pasa
  con las fotos generadas por IA de la clienta.

## Comandos
<!-- completado por /init una vez exista package.json -->
