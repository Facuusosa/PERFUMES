# Hero + Preloader interactivo — variante cinemática (A&G)

## Contexto

El proyecto ecommerce-perfumes (marca A&G, ver `docs/PRODUCT.md`) está en fase de scaffold
Next.js + shadcn/ui. Existen 3 mockups HTML sueltos en `docs/design-variants/` hechos para
comparar dirección visual (cinemático, editorial, minimalista); ninguno está conectado a la
app real todavía. Se eligió **variante A (cinemático)** como dirección para el primer build
real: preloader + hero, siguiendo los mecanismos #1 y #2 de `docs/DESIGN.md` (referencia:
Ciao Energy / SKAALD).

Hay 6 fotos de producto generadas con ChatGPT en `fotos-clienta/`. Una (Yara Elixir,
`ChatGPT Image 14 ago 2026, 01_12_35.png`) tiene texto renderizado ilegible/espejado — se
descarta, no se usa en ningún lugar del sitio. Quedan 5 usables:

| Archivo | Producto | Fondo/glow |
|---|---|---|
| `..._00_54_36.png` | Armaf Odyssey | naranja–celeste |
| `..._01_06_13.png` | Lattafa Art of Universe | blanco → negro (viñeta) |
| `..._01_08_54.png` | Lattafa Yara Exclusive | negro con glow dorado/ámbar |
| `..._01_10_32.png` | Rave Now Women | rosa |
| `..._01_23_10.png` | Lattafa Qimmah | negro con glow verde/dorado |

## Objetivo

Primer hero + preloader real de la app, con la calidad de ejecución de las referencias de
`DESIGN.md` (Ciao Energy, SKAALD), usando las fotos ya disponibles como assets temporales
(sin fondo removido todavía — eso queda para una iteración posterior con `remove.bg` o
similar, ver `docs/PRODUCT.md`).

## Fuera de alcance

- Fondo transparente / remoción de fondo de las fotos (iteración futura).
- Secciones 4 y 5 (catálogo de listado/detalle) — tema aparte, no se toca en este build.
- Riel de navegación lateral (mecanismo #3 de DESIGN.md) — puede quedar como siguiente spec.
- Cualquier lógica de Sanity/CMS para las fotos — estas 5 son temporales, hardcodeadas.

## Diseño

### 1. Preloader (mecanismo #1 de DESIGN.md)

Pantalla negra, logo "A&G" y contador 0→100% en el centro, con más presencia que el mockup
original (tipografía más grande, mejor espaciado — punto ya señalado en el prompt que trajo
Facu de la extensión). Detrás del logo, crossfade lento entre **2 fotos con fondo
predominantemente oscuro** (Yara Exclusive y Qimmah — ambas ya tienen glow negro/dorado o
negro/verde, se funden mejor con "pantalla negra" que las de fondo claro). Las fotos quedan
atenuadas (opacity baja + el velo oscuro del punto 3) para no competir con el contador.
Fade a hero al llegar a 100%.

### 2. Hero (mecanismo #2 de DESIGN.md)

Foto de producto fija con zoom/parallax en scroll, ciclando entre las **3 fotos restantes**
(Odyssey, Art of Universe, Now Women) — auto-rotación lenta o atada a interacción, a definir
en el plan de implementación. Cada foto activa lleva el efecto de tilt del punto 4.

### 3. Tratamiento de color (paleta)

`DESIGN.md` dice hoy "único color de acento: ámbar", pensado para la interfaz (nav,
botones, líneas), no para fotografía de producto real — un frasco verde o rosa no se puede
volver ámbar sin mentir sobre el producto. Se separan los dos:

- **Interfaz** (nav, botones, tipografía, hover): sigue siendo 100% ámbar, sin cambios.
- **Fotos de producto en hero/preloader**: color real de la foto, con un velo oscuro sutil
  aplicado por CSS (gradiente o `mix-blend-mode`, no quemado en la imagen) para hundirlas en
  el mismo clima cinematográfico sin ocultar el color real del producto.
- **Grilla de catálogo** ("La selección"): sin velo — ahí el comprador necesita ver el color
  real para reconocer el producto frente a lo que vio en Instagram/WhatsApp.

Esto requiere modificar la sección de paleta de `DESIGN.md` para aclarar que la regla de
"único acento" aplica a la interfaz, no a la fotografía de producto (ver sección siguiente).

### 4. Interacción "3D" al mouse

`transform: perspective() rotateX() rotateY()` en CSS, atado a la posición del mouse sobre
la imagen activa del hero (y opcionalmente sobre las del preloader). Mismo efecto visual que
un tilt de Awwwards/Ciao Energy, sin WebGL. Se mantiene la regla de `DESIGN.md` de no usar
3D real-time — no aporta nada aquí que CSS no resuelva más liviano.

## Cambios a `docs/DESIGN.md`

Reescribir la línea de paleta para distinguir acento de interfaz vs. color real de producto
(ver punto 3). Se hace como parte de este trabajo, no en una spec aparte, porque nace
directamente de esta decisión.

## Criterio de aceptación / QA

- Scroll de corrido sin trabas, indicador (si ya existe riel) siempre correcto — n/a en este
  spec porque el riel queda fuera de alcance.
- Ninguna foto se ve recortada mal ni con bordes visibles del glow original al hacer tilt.
- **Screenshot loop obligatorio**: capturar el resultado con `/browse` y compararlo contra
  Ciao Energy / SKAALD (mecanismos #1 y #2). "Igualar la referencia" significa mismo nivel de
  pulido y de mecanismo (timing del loader, sensación del tilt, jerarquía tipográfica), no
  clonar el layout literal — DESIGN.md marca explícitamente evitar output "default de
  template" como anti-patrón, y clonar 1:1 un sitio de otro rubro cae en lo mismo.
- Responsive: preloader y hero se prueban en mobile/tablet/desktop (`/browse responsive`).

## Riesgos / decisiones abiertas

- La asignación de fotos a preloader (2) vs. hero (3) es una propuesta razonada (fondos
  oscuros al loader, resto al hero) — ajustable si al verlo armado no convence.
- Timing de auto-rotación del hero (cada cuánto cambia de foto) se define en el plan de
  implementación, no acá.
