# DESIGN.md

## Paleta (grounded en algo real, no inventada)
Sacada de tono de vidrio/ámbar de frasco de perfume, no de un generador de paletas.

- `--bg: #0b0a08` — negro cálido (nunca #000 puro)
- `--bg-2: #141210` — superficie secundaria
- `--fg: #f3ede4` — texto principal, hueso
- `--fg-muted: #a89e8f` — texto secundario
- `--accent: #b5652d` — ámbar, único color de acento

## Tipografía
- Display/editorial: **Fraunces** (serif, itálica en momentos clave)
- UI/cuerpo: **Space Grotesk**
- Nunca Inter. Nunca system-ui como default visible.

## Nunca (anti-patrones, explícitos)
- Gradiente purple→blue o purple→pink
- Glassmorphism, blur decorativo, glow
- Cards redondeadas genéricas con sombra flotante
- 3 feature cards en fila como hero
- Bounce/elastic easing
- Íconos que no sean intencionales (nada de clipart)

## Referencias (por qué las elegimos)
- **[Ciao Energy](https://www.ciaoenergy.com/)** — loader cinemático, producto como pieza gráfica central, reveal de comparación, riel de navegación lateral. Hecho por el estudio SKAALD (Paris).
- **Portfolio SKAALD**: [Lithosquare](https://www.skaald.com/projects/lithosquare), [Ovni](https://www.skaald.com/projects/ovni), [Efficiant](https://www.skaald.com/projects/efficiant) — mismo nivel de producción, más ejemplos del mismo estudio.
- **[Nothin' (noth.in)](https://www.noth.in/#works)** — estudio creativo de París. Referencia clave para el hero: objetos flotando en fondo negro absoluto con iluminación de render (metal, foil, texturas), sin foto de producto "de catálogo" visible. Confirma el approach de imagen tratada + parallax/tilt en CSS en vez de WebGL real-time — el look de "render 3D" se logra con la imagen en sí (buena iluminación, fondo removido), no con un motor 3D en el navegador.
- **Apple (AirPods Pro, product pages)** — el estándar del mecanismo "producto reacciona al scroll": canvas fijo reproduciendo una secuencia de imágenes atada al scroll.
- **Awwwards**: [scroll-driven storytelling](https://www.awwwards.com/inspiration/scroll-driven-storytelling-synapser-studio), [canvas parallax](https://www.awwwards.com/inspiration/scroll-driven-narrative-with-canvas-parallax-dire-watt).

## Anti-referencias (evitar activamente)
- Dribbble genérico
- Marketplaces de templates (ThemeForest: "Perfume Mania", "Astra Inessa" y similares)
- Cualquier output default de v0/Lovable/Bolt sin spec — generan lo mismo que todos.

## Mecanismos a implementar (en orden de prioridad)

1. **Loader cinemático** — pantalla negra, logo, contador 0→100%, fade a hero. (ref: Ciao Energy)
2. **Hero con producto + zoom/parallax en scroll** — fase 1: foto fija con zoom/parallax. Fase 2 (cuando haya fotos reales del producto): secuencia de imágenes tipo Apple. No usar 3D real-time (WebGL) como base, es sobre-ingeniería para este catálogo.
3. **Riel de navegación lateral fijo** — botones circulares por sección, el activo se resalta. (ref: Ciao Energy)
4. **Reveal de comparación** — tachar lo malo, mostrar lo bueno. Adaptado a confianza de reventa (NO a fórmula de fabricante, la clienta no fabrica nada):
   - "Reventa sin garantía ✕" → "Producto verificado"
   - "Esperar semanas ✕" → "Envío en 48hs"
   - "Sin devolución ✕" → "Cambios sin drama"
5. **Grilla de producto sin cards genéricas** — líneas finas, sin sombra, sin border-radius grande. (ya implementado en playground v1)
6. **Botón magnético** en CTAs principales. (ya implementado en playground v1)

## Panel de administración (Sanity)
Campos del schema de producto: nombre, marca, categoría (árabe/Natura/nicho), precio, stock, fotos, descripción, notas olfativas (opcional). Diseñado para que la clienta lo complete sin ayuda.
