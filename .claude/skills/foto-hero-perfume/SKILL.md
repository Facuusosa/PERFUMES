---
name: foto-hero-perfume
description: Use when the user wants a clean AI-generated hero photograph (no text) for a perfume in the A&G catalog, before any editorial intervention -- e.g. "generame la foto hero de X", "quiero la foto limpia de X". Looks up the real product data in the Supabase migrations, reuses or researches (Fragrantica/Parfumo) the full fact sheet and saves it in para-redes/perfumes/, locates the real product photo, and hands back a ready-to-paste ChatGPT prompt for the hero photo (product-accurate, editorial, no text yet). For adding notes/name/text over an already-approved hero photo, use the `intervenir-foto-perfume` skill instead.
---

# Foto hero de perfume (etapa 1 -- foto limpia, sin texto)

## Overview

Arma el prompt para pedirle a ChatGPT la fotografía de marketing LIMPIA
(sin texto) de un perfume del catálogo -- el "máster" sobre el que después
se hace la intervención editorial con la skill `intervenir-foto-perfume`.
Esta skill NO genera la foto (eso pasa en ChatGPT, fuera de este chat) --
arma el prompt, ubica la foto real a subir, y prepara la ficha técnica
completa para cuando llegue el momento de intervenirla.

## Cuándo NO usar

Si ya hay una foto hero aprobada y lo que falta es agregarle notas/nombre/
texto encima, usá la skill `intervenir-foto-perfume` en su lugar.

## Pasos

1. **Identificar el producto real.** Buscar el nombre en las migraciones de
   `supabase/migrations/` (grep, no adivinar) para sacar id, marca, precio,
   volumen, family y notes tal como están hoy en producción. Si hay más de
   un producto con nombre parecido, confirmar con el usuario cuál es antes
   de seguir -- mismo criterio que la skill `nuevo-producto`.

2. **Ubicar la foto real del producto** en
   `public/images/perfumes/<id>.{webp,png,jpg}`. Esa es la que el usuario
   sube a ChatGPT (nunca una foto genérica).

3. **Revisar si ya existe la ficha** en `para-redes/perfumes/<id>.md`.
   - Si existe, leerla y usarla directo -- no rebuscar en la web de nuevo.
   - Si no existe, investigar en Fragrantica/Parfumo (WebSearch -- Fragrantica
     devuelve 403 a fetch directo, así que hay que ir por búsqueda, no por
     WebFetch a la URL) lo que falte: notas completas de salida/corazón/
     fondo, familia olfativa, duración, proyección, estación recomendada,
     día/noche, y a qué perfume más caro imita ("dupe"/clon) si aplica.
     Marcar como "[sin confirmar]" cualquier campo que ninguna fuente
     respalde -- no inventar. Si dos fuentes se contradicen (ej. la marca
     oficial vs. un agregador), priorizar SIEMPRE la fuente oficial del
     fabricante para la pirámide de notas, y usar agregadores solo para lo
     que el fabricante no publica (duración, sillage, con qué se compara).
   - Guardar/actualizar `para-redes/perfumes/<id>.md` con la ficha completa
     (crear la carpeta si no existe). Formato de la ficha más abajo.

4. **Armar el prompt para ChatGPT**, con el nombre del perfume ya puesto:

   ~~~
   Dale, arrancamos con el protocolo. Primer perfume: <Nombre>, de <Marca>.

   Quiero crear fotografías de marketing para perfumes a partir de fotos
   reales de cada producto. No quiero que la IA rediseñe ni invente el
   perfume. Quiero conservar exactamente la botella, tapa, etiqueta,
   colores, proporciones y detalles del producto real.

   Busco fotografías que parezcan tomadas por un fotógrafo profesional, no
   renders ni imágenes evidentemente generadas por IA. La estética debe ser
   editorial, realista, elegante y natural: planos cercanos, luz lateral,
   sombras profundas pero naturales, fondos desenfocados, pocos elementos,
   sensación de fotografía editorial.

   No quiero: renders 3D, estética CGI, objetos flotando, decoración de
   más, frutas/pétalos porque sí, humo, partículas, brillos exagerados,
   escenarios imposibles, ni que se modifique el diseño del producto.

   Te subo ahora la foto real del producto. Analizala antes de generar
   nada: identificá botella, tapa, etiqueta, colores, materiales y
   proporciones que hay que mantener. No generes todavía -- primero
   proponeme 3 o 4 conceptos fotográficos distintos para este perfume,
   explicando la idea de cada uno.
   ~~~

5. **Entregar todo junto**: el prompt de arriba + la ruta exacta de la foto
   real a subir + aviso de que la ficha completa ya está guardada en
   `para-redes/perfumes/<id>.md` y lista para cuando se quiera intervenir
   la foto (con la skill `intervenir-foto-perfume`).

## Formato de la ficha (`para-redes/perfumes/<id>.md`)

~~~
PERFUME
Nombre:
Marca:
Concentración:
Contenido:
Año de lanzamiento:

PERFIL
Género:
Familia olfativa:
Inspiración / parecido:
Personalidad:
Momento recomendado:

NOTAS
Salida:
Corazón:
Fondo:

INFORMACIÓN COMERCIAL
Descripción:
Duración:
Proyección:
Estación:
Día/noche:

Precio en el sitio:
Fuentes: (links de Fragrantica/Parfumo usados)
~~~

## Notas

- La carpeta `para-redes/` está en `.gitignore` a propósito -- es material
  de marketing, no código del sitio, no se sube a GitHub.
- No confundir la ficha completa (esta skill, para redes) con las notas
  resumidas que muestra el sitio público (3 notas por bloque en Supabase) --
  son cosas distintas a propósito, ver `nuevo-producto`.
