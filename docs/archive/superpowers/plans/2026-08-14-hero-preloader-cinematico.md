# Hero + Preloader Cinemático Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Construir el primer preloader + hero real del sitio (marca A&G), en variante
cinemática, usando 5 fotos de producto ya disponibles y sin agregar dependencias nuevas.

**Architecture:** Dos componentes cliente autocontenidos (`Preloader`, `Hero`) montados
juntos en `src/app/page.tsx`. `Preloader` es un overlay `fixed` que se desvanece solo tras
un contador de ~2.2s; `Hero` vive debajo desde el principio y queda revelado cuando el
overlay desaparece. Sin librería de animación: contador y crossfade con `useState`/
`useEffect`/`requestAnimationFrame`, tilt al mouse con `transform` CSS atado a
`onMouseMove`.

**Tech Stack:** Next.js 16.3.0 (App Router) + React 19.2.8 + TypeScript + Tailwind CSS v4 +
shadcn/ui (estilo base-ui, ya instalado). No se agrega ninguna dependencia nueva.

**Spec:** `docs/superpowers/specs/2026-08-14-hero-preloader-cinematico-design.md`

## Global Constraints

- Nunca: gradiente purple→blue/pink, glassmorphism, cards con sombra, bounce/elastic
  easing, Inter, system-ui visible (`docs/DESIGN.md`).
- Tipografía: Fraunces (display/serif, itálica en momentos clave) + Space Grotesk (UI).
  Nunca otra fuente.
- Sin WebGL ni motor 3D real-time (Three.js, etc.) — el efecto "3D" se resuelve 100% con
  CSS `transform`/`perspective`.
- Sin dependencias nuevas (no GSAP, no framer-motion/motion, no librería de animación).
- El ámbar (`#b5652d`) es el único acento de **interfaz** (nav, botones, líneas); las fotos
  de producto muestran su color real.
- Fuera de alcance de este plan: fondo transparente de las fotos, riel de navegación
  lateral, secciones 4/5 (catálogo), cualquier integración con Sanity.
- El proyecto no tiene framework de testing configurado (no Jest/Vitest/Playwright en
  `package.json`) — la verificación de cada tarea de UI se hace con el servidor de
  desarrollo + `/browse` (screenshot y checks de DOM), no con tests unitarios.

---

### Task 1: Fuentes y paleta cinemática

**Files:**
- Modify: `src/app/layout.tsx` (reemplazo completo)
- Modify: `src/app/globals.css` (bloque `:root`, elimina `.dark`, corrige `@theme inline`)

**Interfaces:**
- Produces: variables CSS `--background`, `--foreground`, `--card`, `--primary`, `--accent`,
  `--muted-foreground`, clases Tailwind `font-heading` (Fraunces) y `font-sans` (Space
  Grotesk) — consumidas por Task 4 y Task 5.

- [ ] **Step 1: Reemplazar `src/app/layout.tsx` para usar Fraunces + Space Grotesk**

```tsx
import type { Metadata } from "next";
import { Fraunces, Space_Grotesk } from "next/font/google";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  style: ["normal", "italic"],
});

const spaceGrotesk = Space_Grotesk({
  variable: "--font-space-grotesk",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "A&G — Perfumes",
  description: "Perfumes árabes, Natura y nicho. Originalidad, precio y confianza.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="es"
      className={`${fraunces.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
```

- [ ] **Step 2: Reemplazar el bloque `:root` de `src/app/globals.css` con la paleta de `DESIGN.md`, y corregir el mapeo de fuentes en `@theme inline`**

En `@theme inline`, reemplazar estas tres líneas:

```css
  --font-sans: var(--font-sans);
  --font-mono: var(--font-geist-mono);
  --font-heading: var(--font-sans);
```

por:

```css
  --font-sans: var(--font-space-grotesk);
  --font-heading: var(--font-fraunces);
```

(se elimina `--font-mono`: no hay fuente mono requerida por `DESIGN.md` y `Geist_Mono` ya
no se importa; Tailwind cae a su default de `font-mono` si algo lo usa.)

Reemplazar el bloque `:root` completo por:

```css
:root {
  --background: #0b0a08;
  --foreground: #f3ede4;
  --card: #141210;
  --card-foreground: #f3ede4;
  --popover: #141210;
  --popover-foreground: #f3ede4;
  --primary: #b5652d;
  --primary-foreground: #0b0a08;
  --secondary: #141210;
  --secondary-foreground: #f3ede4;
  --muted: #141210;
  --muted-foreground: #a89e8f;
  --accent: #b5652d;
  --accent-foreground: #0b0a08;
  --destructive: oklch(0.577 0.245 27.325);
  --border: color-mix(in oklab, #f3ede4 12%, transparent);
  --input: color-mix(in oklab, #f3ede4 15%, transparent);
  --ring: #b5652d;
  --chart-1: oklch(0.87 0 0);
  --chart-2: oklch(0.556 0 0);
  --chart-3: oklch(0.439 0 0);
  --chart-4: oklch(0.371 0 0);
  --chart-5: oklch(0.269 0 0);
  --radius: 0.625rem;
  --sidebar: #141210;
  --sidebar-foreground: #f3ede4;
  --sidebar-primary: #b5652d;
  --sidebar-primary-foreground: #0b0a08;
  --sidebar-accent: #141210;
  --sidebar-accent-foreground: #f3ede4;
  --sidebar-border: color-mix(in oklab, #f3ede4 12%, transparent);
  --sidebar-ring: #b5652d;
}
```

Eliminar por completo el bloque `.dark { ... }` que sigue a `:root` — la marca es siempre
oscura, no hay toggle de tema, mantenerlo vivo es engañoso para quien lea el archivo
después.

- [ ] **Step 3: Verificar que levanta sin errores**

Run: `npm run lint`
Expected: sin errores (warnings de reglas ya existentes en el scaffold son aceptables, no
introducir nuevas).

- [ ] **Step 4: Verificar visualmente con el servidor de desarrollo**

```bash
npm run dev &
sleep 3
B="$HOME/.claude/skills/gstack/browse/dist/browse"
$B goto http://localhost:3000
$B css body background-color
$B css h1 font-family
```

Expected: `background-color` cercano a `rgb(11, 10, 8)` (`#0b0a08`); `font-family` de
cualquier heading que exista incluye `Fraunces` (todavía no hay `<h1>` real — este check se
repite en Task 6 cuando el hero esté montado, acá solo confirmamos que el server levanta).

- [ ] **Step 5: Commit**

```bash
git add src/app/layout.tsx src/app/globals.css
git commit -m "feat: paleta y tipografia cinematica (Fraunces + Space Grotesk)"
```

---

### Task 2: Aclarar la regla de acento en `docs/DESIGN.md`

**Files:**
- Modify: `docs/DESIGN.md` (sección "Paleta")

**Interfaces:**
- Consumes: nada de tareas anteriores.
- Produces: nada que otras tareas consuman directamente — es la justificación documentada
  de por qué Task 4/5 muestran fotos con color real sobre fondo ámbar/negro.

- [ ] **Step 1: Reemplazar la línea de `--accent` en la sección "Paleta"**

Buscar:

```markdown
- `--accent: #b5652d` — ámbar, único color de acento
```

Reemplazar por:

```markdown
- `--accent: #b5652d` — ámbar, único color de acento **de la interfaz** (nav, botones,
  líneas, hover, focus). No aplica a la fotografía de producto: cada perfume tiene su color
  real (vidrio verde, rosa, dorado...) y se muestra tal cual — cambiarle el color al
  producto rompe la confianza que busca `PRODUCT.md`. En hero/preloader las fotos llevan un
  velo oscuro sutil (CSS, no quemado en la imagen) para convivir con el clima
  cinematográfico sin perder el color real; en la grilla de catálogo van sin velo.
```

- [ ] **Step 2: Commit**

```bash
git add docs/DESIGN.md
git commit -m "docs: aclarar que el acento ambar es de interfaz, no de fotografia de producto"
```

---

### Task 3: Preparar los assets de fotos

**Files:**
- Create: `public/hero/` (5 archivos, ver abajo)
- No modifica código.

**Interfaces:**
- Produces: rutas públicas `/hero/preloader-1-yara-exclusive.png`,
  `/hero/preloader-2-qimmah.png`, `/hero/hero-1-odyssey.png`,
  `/hero/hero-2-art-of-universe.png`, `/hero/hero-3-now-women.png` — consumidas por Task 4
  y Task 5.

- [ ] **Step 1: Mover y renombrar las 5 fotos usables**

```bash
mkdir -p public/hero
mv "fotos-clienta/ChatGPT Image 14 ago 2026, 01_08_54.png" public/hero/preloader-1-yara-exclusive.png
mv "fotos-clienta/ChatGPT Image 14 ago 2026, 01_23_10.png" public/hero/preloader-2-qimmah.png
mv "fotos-clienta/ChatGPT Image 14 ago 2026, 00_54_36.png" public/hero/hero-1-odyssey.png
mv "fotos-clienta/ChatGPT Image 14 ago 2026, 01_06_13.png" public/hero/hero-2-art-of-universe.png
mv "fotos-clienta/ChatGPT Image 14 ago 2026, 01_10_32.png" public/hero/hero-3-now-women.png
```

No se toca `ChatGPT Image 14 ago 2026, 01_12_35.png` (Yara Elixir, texto roto — se descarta,
queda en `fotos-clienta/` sin usar) ni las fotos reales de la clienta (JPGs) — esas son de
un frente de trabajo aparte.

- [ ] **Step 2: Verificar**

Run: `ls public/hero`
Expected:
```
hero-1-odyssey.png
hero-2-art-of-universe.png
hero-3-now-women.png
preloader-1-yara-exclusive.png
preloader-2-qimmah.png
```

- [ ] **Step 3: Commit**

```bash
git add public/hero "fotos-clienta/ChatGPT Image 14 ago 2026, 01_12_35.png"
git commit -m "chore: mover fotos ChatGPT usables a public/hero con nombres limpios"
```

(el `git add` de la foto descartada es solo porque `git mv` la deja registrada como borrada
del path viejo si `git status` la marca — si `git status` no muestra cambios en esa foto,
omitir ese archivo del `add`.)

---

### Task 4: Componente `Preloader`

**Files:**
- Create: `src/components/preloader.tsx`

**Interfaces:**
- Consumes: `--background`, `--foreground`, `--muted-foreground`, `font-heading`,
  `font-sans` (Task 1); `/hero/preloader-1-yara-exclusive.png`,
  `/hero/preloader-2-qimmah.png` (Task 3).
- Produces: `export function Preloader(): JSX.Element` — consumido por Task 6.

- [ ] **Step 1: Crear `src/components/preloader.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useState } from "react";

const BACKDROP_IMAGES = [
  "/hero/preloader-1-yara-exclusive.png",
  "/hero/preloader-2-qimmah.png",
];

const COUNT_DURATION_MS = 2200;
const CROSSFADE_INTERVAL_MS = 1600;
const FADE_OUT_MS = 700;

export function Preloader() {
  const [count, setCount] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = Math.min(1, elapsed / COUNT_DURATION_MS);
      setCount(Math.round(progress * 100));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveImage((i) => (i + 1) % BACKDROP_IMAGES.length);
    }, CROSSFADE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!done) return;
    const timeout = setTimeout(() => setHidden(true), FADE_OUT_MS + 200);
    return () => clearTimeout(timeout);
  }, [done]);

  if (hidden) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex flex-col items-center justify-center bg-background transition-opacity ease-out ${
        done ? "pointer-events-none opacity-0" : "opacity-100"
      }`}
      style={{ transitionDuration: `${FADE_OUT_MS}ms` }}
      aria-hidden={done}
    >
      {BACKDROP_IMAGES.map((src, i) => (
        <Image
          key={src}
          src={src}
          alt=""
          fill
          sizes="100vw"
          priority={i === 0}
          className={`object-cover object-center transition-opacity duration-[1600ms] ease-in-out ${
            i === activeImage ? "opacity-20" : "opacity-0"
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-background/40 via-background/70 to-background" />

      <div className="relative flex flex-col items-center gap-6">
        <p className="font-heading text-5xl italic tracking-tight text-foreground sm:text-7xl">
          A&G
        </p>
        <p className="font-sans text-sm tabular-nums tracking-[0.3em] text-muted-foreground">
          {String(count).padStart(3, "0")}%
        </p>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sin errores nuevos.

- [ ] **Step 3: Montar temporalmente en `page.tsx` para verificar aislado**

Editar `src/app/page.tsx` (contenido temporal, se reemplaza en Task 6):

```tsx
import { Preloader } from "@/components/preloader";

export default function Home() {
  return <Preloader />;
}
```

- [ ] **Step 4: Verificar con `/browse`**

```bash
npm run dev &
sleep 3
B="$HOME/.claude/skills/gstack/browse/dist/browse"
$B goto http://localhost:3000
$B console --errors
$B screenshot /tmp/preloader-t0.png
sleep 3
$B screenshot /tmp/preloader-t3.png
$B text
```

Expected: `console --errors` vacío; `preloader-t0.png` muestra "A&G" + "000%" sobre fondo
oscuro; `preloader-t3.png` ya no muestra el overlay (contador llegó a 100% y se desvaneció);
`text` ya no incluye "A&G" ni el contador en el segundo screenshot (el `div` se desmontó).

- [ ] **Step 5: Commit**

```bash
git add src/components/preloader.tsx src/app/page.tsx
git commit -m "feat: componente Preloader con contador y crossfade de fondo"
```

---

### Task 5: Componente `Hero` con tilt al mouse

**Files:**
- Create: `src/components/hero.tsx`

**Interfaces:**
- Consumes: mismas variables/clases de Task 1; `/hero/hero-1-odyssey.png`,
  `/hero/hero-2-art-of-universe.png`, `/hero/hero-3-now-women.png` (Task 3).
- Produces: `export function Hero(): JSX.Element` — consumido por Task 6.

- [ ] **Step 1: Crear `src/components/hero.tsx`**

```tsx
"use client";

import Image from "next/image";
import { useEffect, useRef, useState, type MouseEvent } from "react";

const HERO_IMAGES = [
  { src: "/hero/hero-1-odyssey.png", alt: "Armaf Odyssey" },
  { src: "/hero/hero-2-art-of-universe.png", alt: "Lattafa Pride Art of Universe" },
  { src: "/hero/hero-3-now-women.png", alt: "Rave Now Women" },
];

const ROTATE_INTERVAL_MS = 4500;
const MAX_TILT_DEG = 10;

export function Hero() {
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % HERO_IMAGES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, []);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage) return;
    const rect = stage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -MAX_TILT_DEG, y: px * MAX_TILT_DEG });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6">
      <div className="relative z-10 mb-10 max-w-xl text-center">
        <h1 className="font-heading text-4xl italic tracking-tight text-foreground sm:text-6xl">
          A&G
        </h1>
        <p className="mt-4 font-sans text-base text-muted-foreground sm:text-lg">
          Perfumes árabes, Natura y nicho. Originalidad verificada, envío en 48hs.
        </p>
      </div>

      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="relative flex h-[50vh] w-full max-w-md items-center justify-center"
        style={{
          perspective: "1000px",
          backgroundImage:
            "radial-gradient(circle at center, transparent 35%, var(--background) 85%)",
        }}
      >
        {HERO_IMAGES.map((image, i) => (
          <div
            key={image.src}
            className={`absolute inset-0 flex items-center justify-center ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
            style={{
              transform:
                i === active
                  ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                  : undefined,
              transition: "opacity 700ms ease-in-out, transform 150ms ease-out",
            }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(min-width: 768px) 28rem, 90vw"
              priority={i === 0}
              className="object-contain brightness-90 drop-shadow-[0_40px_60px_rgba(0,0,0,0.6)]"
            />
          </div>
        ))}
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Lint**

Run: `npm run lint`
Expected: sin errores nuevos.

- [ ] **Step 3: Montar temporalmente en `page.tsx` para verificar aislado**

```tsx
import { Hero } from "@/components/hero";

export default function Home() {
  return <Hero />;
}
```

- [ ] **Step 4: Verificar con `/browse`**

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
$B goto http://localhost:3000
$B console --errors
$B screenshot /tmp/hero-centro.png
$B hover 'section > div:last-child'
$B css 'section > div:last-child > div:first-child' transform
$B screenshot /tmp/hero-tilt.png
```

Expected: `console --errors` vacío; `transform` después del `hover` distinto de `none`
(el tilt respondió al mouse); `hero-tilt.png` muestra la imagen activa levemente inclinada
respecto a `hero-centro.png`.

- [ ] **Step 5: Commit**

```bash
git add src/components/hero.tsx src/app/page.tsx
git commit -m "feat: componente Hero con rotacion de fotos y tilt al mouse"
```

---

### Task 6: Integrar Preloader + Hero en la página real

**Files:**
- Modify: `src/app/page.tsx` (reemplazo completo)

**Interfaces:**
- Consumes: `Preloader` (Task 4), `Hero` (Task 5).

- [ ] **Step 1: Reemplazar `src/app/page.tsx`**

```tsx
import { Hero } from "@/components/hero";
import { Preloader } from "@/components/preloader";

export default function Home() {
  return (
    <>
      <Preloader />
      <Hero />
    </>
  );
}
```

- [ ] **Step 2: Verificar la página completa con `/browse`**

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
$B goto http://localhost:3000
$B console --errors
$B screenshot /tmp/pagina-completa-t0.png
sleep 3
$B screenshot /tmp/pagina-completa-t3.png
$B responsive /tmp/pagina-responsive
```

Expected: `console --errors` vacío en ambos momentos; a t0 se ve el preloader, a t3 ya se ve
el hero con una foto de producto; los 3 screenshots responsive (mobile/tablet/desktop) no
muestran overflow horizontal ni texto cortado.

- [ ] **Step 3: Commit**

```bash
git add src/app/page.tsx
git commit -m "feat: montar Preloader + Hero en la pagina de inicio"
```

---

### Task 7: QA visual contra referencias

**Files:**
- No modifica código directamente — ajustes puntuales sobre `src/components/preloader.tsx`
  y `src/components/hero.tsx` si el screenshot loop encuentra algo que corregir.

- [ ] **Step 1: Capturar el estado actual**

```bash
B="$HOME/.claude/skills/gstack/browse/dist/browse"
$B goto http://localhost:3000
$B prettyscreenshot --cleanup /tmp/ag-actual.png
```

- [ ] **Step 2: Capturar las referencias**

```bash
$B goto https://www.ciaoenergy.com/
$B prettyscreenshot --cleanup /tmp/ref-ciaoenergy.png
$B goto https://www.noth.in/#works
$B prettyscreenshot --cleanup /tmp/ref-nothin.png
```

- [ ] **Step 3: Leer los 3 PNG con la herramienta Read y comparar**

Criterio de `docs/superpowers/specs/2026-08-14-hero-preloader-cinematico-design.md`: mismo
nivel de pulido y de mecanismo (timing del loader, sensación del tilt, jerarquía
tipográfica) — no clon literal del layout.

Puntos concretos a chequear contra las referencias:
- Jerarquía tipográfica: el logo "A&G" ¿tiene el mismo peso visual que el nombre de marca en
  las referencias, o se ve chico/perdido?
- Timing: ¿2.2s de contador + 700ms de fade se siente cinemático o apurado/lento comparado
  con Ciao Energy?
- El velo oscuro sobre las fotos (Task 2) ¿logra que los 5 colores distintos de producto se
  sientan "una colección", como los objetos de Nothin' sobre fondo negro?

- [ ] **Step 4: Ajustar y volver a capturar hasta que no haya brechas obvias**

Iterar sobre `preloader.tsx`/`hero.tsx` (constantes de timing, tamaños de fuente, opacidad
del velo) y repetir Steps 1 y 3 hasta que la comparación no muestre una brecha obvia de
calidad frente a las referencias.

- [ ] **Step 5: Commit final si hubo ajustes**

```bash
git add src/components/preloader.tsx src/components/hero.tsx
git commit -m "polish: ajustes de timing y jerarquia tras QA visual contra referencias"
```
