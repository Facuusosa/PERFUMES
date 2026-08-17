# DESIGN.md

> **2026-08-17 — reemplazo de stack y diseño.** Todo lo de abajo (paleta, tipografía,
> mecanismos, referencias SKAALD/Nothin') describía el diseño cinemático a medida sobre
> Next.js + Sanity. Ese proyecto se reemplazó por completo por el resultado de Bolt.new
> (repo `Facuusosa/PERFUMES`), que trae su propia paleta y tipografía (ver abajo). El diseño
> viejo completo queda preservado en la rama de git `backup/diseno-cinematico-nextjs-sanity`.
> Esta sección vieja se deja como referencia histórica por si se retoma algo puntual
> (por ejemplo Light Rays), pero **no describe el estado actual del código**.

## Paleta y tipografía actuales (verificado en `tailwind.config.js` / `index.css`)
- Fondo principal `#0b0b0a`, texto `#f2eee7`, acento ámbar `#c99558` — en la misma familia
  cálida que la paleta anterior, aunque no son los mismos valores exactos.
- Cada perfume tiene su propio color de acento en el catálogo (`accent` por producto en
  `App.tsx`), mismo espíritu que la regla vieja de "no tocar el color real del producto".
- Tipografía: **Inter** (UI/cuerpo) + **Playfair Display** (serif/display, clase `.font-serif`).
  Esto contradice la regla vieja "nunca Inter, Fraunces + Space Grotesk" — queda así hasta
  que se decida explícitamente volver a cambiarlo.

## Pendiente de decidir con Facu
- Si se retoma la tipografía Fraunces/Space Grotesk sobre este nuevo código, o se deja Inter/Playfair.
- Si vale la pena traer el mecanismo de Light Rays del hero viejo (rama de backup) a esta base.
- Hosting y dominio: no se volvieron a evaluar bajo el stack Vite/Supabase.

---

## Diseño anterior (Next.js + Sanity, hasta 2026-08-17 — histórico, ver rama de backup)

### Paleta (grounded en algo real, no inventada)
Sacada de tono de vidrio/ámbar de frasco de perfume, no de un generador de paletas.

- `--bg: #0b0a08` — negro cálido (nunca #000 puro)
- `--bg-2: #141210` — superficie secundaria
- `--fg: #f3ede4` — texto principal, hueso
- `--fg-muted: #a89e8f` — texto secundario
- `--accent: #b5652d` — ámbar, único color de acento **de la interfaz** (nav, botones,
  líneas, hover, focus). No aplica a la fotografía de producto: cada perfume tiene su color
  real (vidrio verde, rosa, dorado...) y se muestra tal cual — cambiarle el color al
  producto rompe la confianza que busca `PRODUCT.md`. En hero/preloader las fotos llevan un
  velo oscuro sutil (CSS, no quemado en la imagen) para convivir con el clima
  cinematográfico sin perder el color real; en la grilla de catálogo van sin velo.

### Tipografía
- Display/editorial: **Fraunces** (serif, itálica en momentos clave)
- UI/cuerpo: **Space Grotesk**
- Nunca Inter. Nunca system-ui como default visible.

### Nunca (anti-patrones, explícitos)
- Gradiente purple→blue o purple→pink
- Glassmorphism, blur decorativo, glow
- Cards redondeadas genéricas con sombra flotante
- 3 feature cards en fila como hero
- Bounce/elastic easing
- Íconos que no sean intencionales (nada de clipart)

**Excepción puntual (2026-08-15):** el hero tiene un backlight ámbar (`--accent`)
muy sutil, tipo luz de estudio fotográfico, detrás del producto — técnicamente un
"glow" pero acotado a ese único lugar, a intensidad mínima (no debe leerse como
protagonista ni distraer de la foto). No es luz verde para usar glow en otras
partes del sitio; cualquier otro uso se evalúa caso a caso.

### Referencias (por qué las elegimos)
- **[Ciao Energy](https://www.ciaoenergy.com/)** — loader cinemático, producto como pieza gráfica central, reveal de comparación, riel de navegación lateral. Hecho por el estudio SKAALD (Paris).
- **Portfolio SKAALD**: [Lithosquare](https://www.skaald.com/projects/lithosquare), [Ovni](https://www.skaald.com/projects/ovni), [Efficiant](https://www.skaald.com/projects/efficiant) — mismo nivel de producción, más ejemplos del mismo estudio.
- **[Nothin' (noth.in)](https://www.noth.in/#works)** — estudio creativo de París. Referencia clave para el hero: objetos flotando en fondo negro absoluto con iluminación de render (metal, foil, texturas), sin foto de producto "de catálogo" visible. Confirma el approach de imagen tratada + parallax/tilt en CSS en vez de WebGL real-time — el look de "render 3D" se logra con la imagen en sí (buena iluminación, fondo removido), no con un motor 3D en el navegador.
- **Apple (AirPods Pro, product pages)** — el estándar del mecanismo "producto reacciona al scroll": canvas fijo reproduciendo una secuencia de imágenes atada al scroll.
- **Awwwards**: [scroll-driven storytelling](https://www.awwwards.com/inspiration/scroll-driven-storytelling-synapser-studio), [canvas parallax](https://www.awwwards.com/inspiration/scroll-driven-narrative-with-canvas-parallax-dire-watt).

### Anti-referencias (evitar activamente)
- Dribbble genérico
- Marketplaces de templates (ThemeForest: "Perfume Mania", "Astra Inessa" y similares)
- Cualquier output default de v0/Lovable/Bolt sin spec — generan lo mismo que todos.

### Mecanismos (implementados sobre la base vieja, ver rama de backup)

1. **Loader cinemático** — pantalla negra, logo, contador 0→100%, fade a hero. (ref: Ciao Energy)
2. **Hero con producto + zoom/parallax en scroll** — implementado con rotación automática entre 3 fotos + tilt al mouse (CSS transform, sin WebGL).
3. **Riel de navegación lateral fijo** — botones circulares por sección, el activo se resalta. (ref: Ciao Energy)
4. **Reveal de comparación** — tachar lo malo, mostrar lo bueno.
5. **Grilla de producto sin cards genéricas** — líneas finas, sin sombra, sin border-radius grande.
6. **Botón magnético** en CTAs principales.

### Panel de administración (Sanity)
Campos del schema de producto: nombre, marca, categoría (árabe/Natura/nicho), precio, stock, fotos, descripción, notas olfativas (opcional). Diseñado para que la clienta lo complete sin ayuda.
