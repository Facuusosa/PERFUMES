# PRODUCT.md

## Qué es
Ecommerce de reventa de perfumes en Argentina. La dueña (nuestra clienta) compra y revende perfumes multimarca: árabes/inspirados, Natura, nicho. No fabrica nada, no controla fórmulas — vende originalidad, precio y confianza.

## Quién lo usa
- **Administradora (la clienta):** no sabe de tecnología. Necesitaba cargar/editar producto,
  precio, stock y fotos ella sola, sin ayuda técnica — era el requisito no negociable del
  proyecto, resuelto originalmente con un panel Sanity Studio. **Pendiente desde el reemplazo
  de stack del 2026-08-17:** el código actual (Vite + Supabase) no trae ningún panel de admin;
  el catálogo se carga por migraciones SQL a mano. Por ahora Facu va a cargar el catálogo él
  mismo, pero la pregunta de fondo (cómo carga la clienta sin ayuda técnica) sigue sin
  resolverse y hay que retomarla antes de que esto quede en manos de ella.
- **Comprador final:** llega mayormente desde redes (Instagram/WhatsApp), compara precio y quiere sentir que el producto es original y que la compra es segura.

## Objetivo de conversión
Click en "agregar al carrito" → arma el pedido → **checkout por WhatsApp** (el código actual
arma un mensaje con el detalle del pedido y lo abre en WhatsApp; no hay Mercado Pago
integrado). Revisar con la clienta/Facu si esto es el flujo definitivo o un paso intermedio
hasta integrar cobro online.

## Estado del contenido (importante para Claude Code)
- Nombre de marca: **A&G (Ariel y Gisela)** — definido con la clienta (2026-08-14). En el
  código actual aparece como "A&G Gisela". Provisional: si más adelante prefiere otro nombre,
  se re-evalúa y se avisa antes de asumirlo en código.
- Fotos de producto: **ya son fotos reales** de los perfumes que vende la clienta
  (`public/images/perfumes/`), a diferencia del placeholder de stock que se usaba antes.
- Catálogo actual (desde las migraciones de Supabase): Yara Exclusive, Yara Elixir, Qimmah
  For Women, Art of Universe, Odyssey Limited, Now Women — todos perfumes árabes/inspirados.
  Las categorías Natura/nicho mencionadas antes no están representadas en el catálogo actual.

## Stack (reemplazado el 2026-08-17 — ver `CLAUDE.md` para el detalle completo)
El stack Next.js + Sanity + Netlify + Mercado Pago descrito antes acá fue decisión validada
con números, pero se abandonó al traer el proyecto hecho en Bolt.new (repo
`Facuusosa/PERFUMES`). Stack real hoy: **Vite + React + TypeScript + Tailwind + Supabase**,
checkout por WhatsApp. El diseño y código anteriores quedan en la rama de git
`backup/diseno-cinematico-nextjs-sanity` por si se retoma algo. No se volvió a evaluar
hosting ni dominio bajo el stack nuevo — sigue pendiente.
