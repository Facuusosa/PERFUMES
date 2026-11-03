---
name: intervenir-foto-perfume
description: Use when the user has an already-approved hero photo of a perfume (from the A&G catalog or otherwise) and wants the ChatGPT prompt to add the editorial layer on top -- notes with arrows, product name, a real verified closing fact -- e.g. "intervení esta foto", "agregale el diseño/las notas a esta foto", "armá la versión con info de X". Rules validated across 3 real products (Confidential Private Gold, Odyssey Homme, Odyssey Go Mango) after several rounds of real failures. For generating the clean hero photo first, use the `foto-hero-perfume` skill instead.
---

# Intervención editorial de foto de perfume (etapa 2)

## Overview

Arma el prompt para pedirle a ChatGPT que agregue, sobre una foto hero YA
APROBADA (la foto limpia, sin texto), una capa editorial con el nombre del
perfume, 4 notas con flechas, y un dato de cierre real -- sin tocar la
fotografía en sí. Esta skill NO genera ni edita la imagen (eso pasa en
ChatGPT, fuera de este chat) -- arma el prompt con los datos reales del
producto, listo para copiar y pegar junto con la foto.

Funciona con cualquier foto hero ya aprobada, sea del catálogo de A&G o
no -- no depende de haber usado la skill `foto-hero-perfume` primero.

**Intención de esta pieza (no perderla de vista):** a diferencia de la
foto hero (donde el producto es protagonista), acá el objetivo es que la
INFORMACIÓN se lea primero y con total claridad -- el perfume queda en
segundo plano. El texto tiene que garantizar su propia legibilidad
(sombra de texto chica y sutil, pegada a cada letra) para leerse bien sin
importar qué zona de la foto tenga atrás, clara u oscura.

**Ojo con esta instrucción -- ya falló una vez:** nunca pedirlo con la
palabra "contraste" a secas ("más contraste", "corregí el contraste") --
el modelo lo interpretó como un filtro de contraste sobre TODA la foto
(sombras más duras, imagen "quemada"), violando la foto bloqueada. Hay
que ser explícito: es una sombra de texto local, pegada a cada letra,
como en un editor de imágenes -- nunca un ajuste de brillo/contraste/
saturación/tono de la fotografía en sí. Aclarar siempre las dos cosas por
separado: qué se le agrega al texto, y que la fotografía del producto no
se toca en absoluto.

## Cuándo NO usar

Si todavía no hay una foto hero aprobada (sin texto), usá primero la skill
`foto-hero-perfume` para generarla.

## Pasos

1. **Identificar el perfume y conseguir sus datos reales.**
   - Si el usuario menciona un producto del catálogo de A&G, buscarlo en
     `supabase/migrations/` (grep) para el nombre/marca exactos, y revisar
     si ya existe `para-redes/perfumes/<id>.md`. Si existe, usarla directo
     -- no rebuscar en la web de nuevo.
   - Si no existe la ficha (perfume nuevo, o foto que no vino de la skill
     `foto-hero-perfume`), investigar en Fragrantica/Parfumo (WebSearch --
     Fragrantica devuelve 403 a fetch directo, ir por búsqueda) las notas
     completas, familia olfativa, duración, proyección, estación, y a qué
     perfume más caro imita si aplica. Marcar "[sin confirmar]" lo que
     ninguna fuente respalde -- no inventar. Ante fuentes contradictorias,
     priorizar la fuente oficial del fabricante para las notas.
   - Guardar la ficha en `para-redes/perfumes/<id>.md` si no existía.

2. **Elegir 4 notas de la ficha, nunca más, nunca las categorías
   completas.** Seleccionar 4 que den buen spread entre apertura y fondo
   (ej. 2 de salida + 2 de fondo, o 1 de cada categoría + la más
   distintiva). Nunca mostrar las tres categorías completas con todas las
   notas -- satura la pieza y se ve como ficha técnica, no como
   intervención editorial.

3. **Elegir el dato de cierre** -- UN dato real y verificado, nunca una
   frase sensorial ni descriptiva inventada. En este orden de preferencia:
   a. A qué perfume caro imita, **solo** si está confirmado con certeza
      por una fuente (ej. Confidential Private Gold / Kirke de Tiziana
      Terenzi).
   b. Duración + para qué estación o momento sirve (ej. "Larga duración.
      Ideal para primavera y verano.").
   c. 2-3 palabras sueltas de personalidad, separadas por "·".
   **Nunca repetir la misma fórmula de frase entre productos distintos**
   -- el error real ya cometido fue usar "[adjetivo] al principio, cálido
   al final" en tres perfumes seguidos; se notó de inmediato como
   plantilla con el adjetivo cambiado. Revisar qué cierre se usó en los
   perfumes ya hechos (otros archivos en `para-redes/perfumes/`) para no
   repetir el mismo tipo de dato dos veces seguidas si hay otra opción
   disponible.
   **Decisión ya tomada y confirmada (no reabrir sin que el usuario lo
   pida explícitamente):** se evaluó agregar un cuarto tipo, "descripción
   olfativa editorial" (ej. "Como morder un mango maduro, sobre un fondo
   cálido de vainilla y ámbar"), comparándolo lado a lado con el tipo (b)
   sobre el mismo perfume real (Odyssey Go Mango). El usuario vio ambas
   variantes y eligió (b) explícitamente ("comentarios de ese tipo, más
   reales, más cerca para el usuario"). Quedan solo los tipos a/b/c.

4. **Líneas y flechas: siempre rectas, finas y editoriales.** Nunca
   curvas, manuscritas ni geométricas gruesas -- esto no varía según la
   personalidad del perfume (se probó variar el tratamiento entre
   productos y en la práctica todas las intervenciones que funcionaron
   bien terminaron con línea recta fina, incluso en perfumes dulces). El
   texto de las notas sí puede tener tipografía con cierta personalidad;
   la línea en sí siempre limpia y recta.

5. **Elegir el color del texto según el fondo REAL de esa foto puntual --
   nunca asumir blanco por defecto.** Mirar la foto antes de armar el
   prompt: fondo oscuro -> texto claro (blanco o dorado tenue); fondo
   claro (telas claras, mármol blanco, fondos plateados/pastel, etc.) ->
   texto oscuro (negro o gris carbón, a tono con el producto). Esto falló
   una vez con Odyssey Homme sobre una foto de tela satén clara: el texto
   blanco por defecto quedó casi invisible contra el fondo. Cada foto
   nueva puede tener un fondo distinto -- este paso se repite siempre, no
   se asume el color usado en la intervención anterior de otro perfume.

6. **Armar el prompt**, rellenando la plantilla de abajo con los datos
   reales y el color de texto elegido en el paso anterior. Si el usuario
   pide más de un diseño para comparar, aclarar siempre que las entregue
   como **imágenes separadas, no un collage** -- por defecto ChatGPT las
   junta lado a lado en una sola imagen si no se lo aclarás.

## Reglas duras (por qué existen, no son estilo)

- **Foto bloqueada, siempre como primer bloque del prompt.** Sin un
  párrafo muy explícito de "no regenerar/reconstruir/reinterpretar", el
  modelo tiende a recrear toda la escena en vez de agregar una capa
  encima -- causó 2 fallos reales (fondo y luz cambiados) antes de fijar
  esta regla.
- **Las flechas apuntan a puntos CLARAMENTE distintos y bien separados
  del producto.** Dos flechas juntas casi al mismo punto ya falló una vez
  (Odyssey Homme, primera intervención) -- se ve amontonado justo donde
  más importa.
- **Jerarquía de tamaños fija: nombre > notas > cierre.** El nombre va en
  tamaño intermedio -- ni tan chico que se pierda, ni tan grande que
  ocupe toda la parte superior (los dos extremos ya se probaron y
  fallaron). Tipografía fina/serif elegante, nunca geométrica ancha tipo
  gimnasio/tech -- rompe la coherencia con el resto del catálogo. Las
  notas van pequeñas pero claramente legibles. El cierre va más chico que
  las notas, pero con contraste suficiente para leerse -- ya falló una
  vez por quedar tan chico/bajo contraste que era casi invisible.
- **Nunca agregar**: categorización completa salida/corazón/fondo,
  párrafo largo de descripción, círculo de sensaciones. Ya se probaron y
  sobran -- la pieza se satura y pierde la sensación de intervención a
  mano.
- **Todo el texto en español**, salvo el nombre del producto (ya viene en
  el envase). Nada inventado -- si un dato no está en la ficha o no está
  verificado, no se menciona.
- **El color del texto se elige según el fondo real de cada foto, nunca
  blanco por defecto.** Ya falló una vez (Odyssey Homme sobre fondo de
  tela satén clara): texto blanco sobre fondo claro queda casi invisible.
  Mirar la foto antes de armar el prompt y decidir claro u oscuro.
- **Identidad visual bloqueada una vez aprobada.** Cuando una pieza de un
  perfume queda aprobada, se convierte en referencia maestra para ese
  mismo perfume: las siguientes variantes tienen que conservar
  exactamente la fotografía, la composición, la posición de las notas,
  las flechas, la jerarquía y el estilo general -- solo se cambia lo que
  el usuario pida explícitamente (ej. "cambiá solo el cierre"), nunca se
  regenera ni reinterpreta el resto por iniciativa propia.

## Plantilla del prompt

~~~
REGLA ABSOLUTA — FOTO BLOQUEADA:
Te adjunto la foto hero original de <Nombre> (<Marca>). Usála como imagen
base EXACTA. No la regeneres, no la reinterpretes, no la reconstruyas, no
la "mejores". El producto, la botella, la caja, la iluminación, las
sombras, el fondo, la textura, la perspectiva, el encuadre y la
composición tienen que quedar EXACTAMENTE iguales a la imagen que te subo.

Sobre esa foto (sin tocarla), agregá SOLO esto:

Todo el texto (nombre, notas, cierre) va en <color oscuro (negro/gris
carbón) / color claro (blanco/dorado tenue)> -- elegido porque el fondo
de esta foto puntual es <claro/oscuro> ahí donde va cada bloque de texto.

1. El nombre del perfume ("<MARCA>" / "<NOMBRE>") en tamaño intermedio,
notorio pero sin ocupar toda la parte superior. Tipografía fina/serif
elegante, nunca geométrica ancha tipo gimnasio.

2. 4 notas con flechas finas, RECTAS y editoriales (nunca curvas,
manuscritas ni geométricas gruesas), cada una apuntando a un punto
CLARAMENTE distinto del producto, bien separadas entre sí:
<Nota 1> (<sensación>)
<Nota 2> (<sensación>)
<Nota 3> (<sensación>)
<Nota 4> (<sensación>)

3. Un cierre chico y discreto, con este dato real (no lo cambies ni lo
reemplaces por una frase inventada):
"<dato real: duración/estación, o inspiración confirmada, o 2-3 palabras
de personalidad>"

Orden de importancia visual: 1° nombre, 2° notas, 3° cierre.

Cada letra de texto lleva una sombra de texto chica y sutil pegada a
ella (como en un editor de imágenes), para que se lea bien sin importar
si queda sobre una zona clara u oscura de la foto. Esto es una propiedad
del texto únicamente -- el brillo, contraste, saturación y tono de la
fotografía del producto no se tocan en absoluto, quedan exactamente
iguales a la foto original.

Todo en español salvo el nombre del producto. Nada inventado.
~~~

## Notas

- La carpeta `para-redes/` está en `.gitignore` a propósito -- es material
  de marketing, no código del sitio, no se sube a GitHub.
- Ejemplos ya resueltos para referencia de estilo:
  `para-redes/perfumes/lattafa-confidential-private-gold.md`,
  `para-redes/perfumes/armaf-odyssey-homme.md`,
  `para-redes/perfumes/armaf-odyssey-go-mango.md`.
