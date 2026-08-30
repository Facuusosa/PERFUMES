# PRODUCT.md

## Qué es
Ecommerce de reventa de perfumes en Argentina. La dueña (nuestra clienta) compra y revende perfumes multimarca: árabes/inspirados, Natura, nicho. No fabrica nada, no controla fórmulas — vende originalidad, precio y confianza.

**Ampliación de categoría (confirmada 2026-08-20):** el catálogo dejó de ser solo árabe/inspirado.
La clienta también vende **brumas corporales y loción perfumada de marca original** (hoy:
Victoria's Secret — Coconut Passion, Love Spell, Love Spell Shimmer, Bare Vanilla, Pure
Seduction). No son Eau de Parfum ni réplica: son producto de marca real, formato mist/loción,
volumen distinto (250 ml / 236 ml vs. los 100 ml estándar del resto). Se marcan así en la
planilla maestra (`fotos-clienta/catalogo-productos.xlsx`, columna Producto y Descripción).
**Fuera del catálogo:** productos de otra categoría (ej. tratamiento capilar) que se cuelan
entre las fotos no se cargan sin criterio — se le arma su propia categoría en el sitio en vez
de forzarlos a "perfume" o inventarles notas olfativas que no tienen sentido.

**Categorías de producto (confirmado 2026-08-25):** el sitio distingue tres categorías de
nivel superior, ortogonales a la familia olfativa (que solo aplica a perfumes): **Perfumes**
(árabe/inspirado + nicho), **Combos** (hoy un solo producto: Karseell Maca Power — Repair Set,
kit de cuidado capilar de 2 piezas, $45.000 — es el producto que antes se dejaba afuera por no
ser perfume) y **Victoria's Secret** (las 5 brumas/loción ya descriptas arriba). Se eligen desde
un desplegable en "Colección" del nav, o desde tabs dentro de la sección de catálogo. Modelo de
datos: campo `category` en la tabla `perfumes` de Supabase (migración
`20260825000000_add_product_category.sql`), default `'Perfume'` para no romper lo existente.

## Quién lo usa
- **Administradora (la clienta):** no sabe de tecnología. Necesitaba cargar/editar producto,
  precio, stock y fotos ella sola, sin ayuda técnica — era el requisito no negociable del
  proyecto, resuelto originalmente con un panel Sanity Studio. **[RESUELTO 2026-08-27]** el
  panel de admin nuevo (`/admin`, ver `CLAUDE.md`) ya está en producción en
  `aygperfumes.com.ar/admin`: la clienta entra con su propio usuario y puede agregar, editar
  y borrar productos con foto, sin tocar código ni Supabase directamente. Probado de punta a
  punta antes de integrarse. El campo `stock` mencionado en este requisito **[DECIDIDO
  2026-08-30] no se agrega por ahora** — la clienta confirmó que maneja poco volumen y no
  tiene lugar físico para llevar un control granular por unidad, así que no aporta valor
  real todavía. No es un olvido ni queda pendiente; se retoma si el catálogo/volumen crece
  lo suficiente como para justificarlo.
- **Comprador final:** llega mayormente desde redes (Instagram/WhatsApp), compara precio y quiere sentir que el producto es original y que la compra es segura.

## Objetivo de conversión
Click en "agregar al carrito" → arma el pedido → **checkout por WhatsApp** (el código actual
arma un mensaje con el detalle del pedido y lo abre en WhatsApp; no hay Mercado Pago
integrado). **Decisión definitiva (Facu, 2026-08-26):** este es el flujo final, no un paso
intermedio — se descarta integrar cobro online a propósito para evitar los costos de Mercado
Pago (comisión por transacción). Pendiente: probar el flujo completo (mensaje armado, apertura
de WhatsApp) en mobile y desktop antes de dar el sitio por terminado.

## Estado del contenido (importante para Claude Code)
- Nombre de marca: **A&G Perfumes** (cambiado de "A&G Gisela" el 2026-08-26, a pedido de
  Facu — el sitio se va a llamar `aygperfumes`). Los socios siguen siendo Ariel y Gisela,
  solo cambió el nombre visible de marca/dominio, no la sociedad. Pendiente: incorporar un
  logo/isotipo (Facu pasó una referencia visual el 2026-08-26, todavía sin definir dónde va
  exactamente — favicon, header, o ambos).
- Fotos de producto: **ya son fotos reales** de los perfumes que vende la clienta
  (`public/images/perfumes/`), a diferencia del placeholder de stock que se usaba antes.
- Catálogo en Supabase/sitio real hoy: **56 perfumes + 1 combo** ya cargados (migraciones
  `20260824010000_load_full_catalog.sql`, `20260825000000_add_product_category.sql` y
  `20260826000000_add_ronda2_products.sql` — esta última es la "ronda 2": 11 perfumes nuevos
  que la clienta sumó a su catálogo de precios; ningún producto existente se tocó). Los 6
  productos originales (Yara Exclusive, Odyssey Limited, etc.) quedaron desde antes sin
  tocarse porque no aparecen en el catálogo real de precios de la clienta — ver nota en esa
  migración. Las categorías Natura/nicho mencionadas antes no están representadas. Los 11
  productos nuevos fueron verificados uno por uno contra Fragrantica.com (link por fila en
  el Excel maestro) — sin pendientes bloqueantes. "Vulcan" resultó ser "Vulcan Black Friday"
  (Fragrantica ID 119220, confirmado por Facu) y los precios de los 11 fueron confirmados
  por Facu como provistos por la propia clienta (aunque varios flyers traigan logo de un
  mayorista/reventedor, no el de A&G). Única nota menor sin bloquear: "Amber Oud Gold 999.9
  Dubai Edition" tiene notas reconstruidas por búsqueda (Fragrantica bloquea lectura directa,
  error 403) en vez de lectura confirmada de la ficha — buen solapamiento con el flyer, no
  100% exacto. Nota para no repetir: durante la carga se confundió por error "Amber Oud Gold
  999.9 Dubai Edition" (nuevo) con el ya existente "Amber Oud Gold Edition" — son dos
  productos reales distintos de Al Haramain, se corrigió antes de aplicar nada a producción.
- El código de `App.tsx` (`fallbackPerfumes`) solo trae un catálogo de emergencia mínimo (los 6
  productos originales) para cuando no hay conexión a Supabase — no refleja el catálogo real.
  No confundir ese fallback con lo que ve el comprador en producción.

## Stack (reemplazado el 2026-08-17 — ver `CLAUDE.md` para el detalle completo)
El stack Next.js + Sanity + Netlify + Mercado Pago descrito antes acá fue decisión validada
con números, pero se abandonó al traer el proyecto hecho en Bolt.new (repo
`Facuusosa/PERFUMES`). Stack real hoy: **Vite + React + TypeScript + Tailwind + Supabase**,
checkout por WhatsApp. El diseño y código anteriores quedan en la rama de git
`backup/diseno-cinematico-nextjs-sanity` por si se retoma algo. No se volvió a evaluar
hosting ni dominio bajo el stack nuevo — sigue pendiente.
