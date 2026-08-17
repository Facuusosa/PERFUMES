"use client";

import Image from "next/image";
import Link from "next/link";
import { LightRays } from "@/components/light-rays";
import { ShoppingBag, Menu, X } from "lucide-react";
import { useEffect, useRef, useState, type MouseEvent } from "react";

const HERO_IMAGES = [
  { src: "/hero/hero-1-odyssey.webp", alt: "Armaf Odyssey", label: "Odyssey Limited" },
  { src: "/hero/hero-2-art-of-universe.webp", alt: "Lattafa Pride Art of Universe", label: "Art of Universe" },
  { src: "/hero/hero-3-now-women.webp", alt: "Rave Now Women", label: "Now Women" },
] as const;

const NAV_LINKS = [
  { href: "#hero", label: "Inicio" },
  { href: "#coleccion", label: "Colección" },
  { href: "#nosotros", label: "Nosotros" },
  { href: "#contacto", label: "Contacto" },
] as const;

const ROTATE_INTERVAL_MS = 5000;
const MAX_TILT_DEG = 8;

interface HeroProps {
  /** Premium: haz de luz concentrado + arena cálida abajo. Cinemático: luz más amplia, sin arena. */
  withIntro?: boolean;
  demoMode?: boolean;
}

export function Hero({ withIntro = false }: HeroProps) {
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [reducedMotion, setReducedMotion] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useEffect(() => {
    if (reducedMotion) return;
    const interval = setInterval(() => {
      setActive((i) => (i + 1) % HERO_IMAGES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [reducedMotion]);

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

  const current = HERO_IMAGES[active];

  return (
    <main id="hero" className="relative min-h-screen overflow-hidden bg-background">
      <LightRays
        className="absolute inset-0"
        raysOrigin="top-center"
        raysColor={withIntro ? "#f3ede4" : "#ffffff"}
        raysSpeed={1}
        lightSpread={withIntro ? 0.4 : 1}
        rayLength={withIntro ? 3 : 2.5}
        fadeDistance={1.2}
        saturation={1}
        noiseAmount={0}
      />

      {withIntro && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-56 opacity-70"
          style={{
            background: "radial-gradient(60% 100% at 62% 100%, rgba(243,237,228,0.4), transparent 70%)",
          }}
          aria-hidden
        />
      )}

      {/* Degradado que protege la legibilidad del texto, sin importar qué muestre el haz en ese momento */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: "linear-gradient(to right, rgba(11,10,8,0.85) 0%, rgba(11,10,8,0.45) 40%, transparent 68%)",
        }}
        aria-hidden
      />

      <nav className="relative z-30 flex items-center justify-between px-6 py-5 sm:px-10">
        <p className="font-heading text-lg font-medium tracking-tight text-foreground sm:text-xl">
          A&amp;G <span className="text-accent">Gisela</span>
        </p>

        <div className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="font-sans text-sm tracking-wide text-foreground/80 uppercase transition-colors hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
        </div>

        <div className="hidden items-center gap-4 md:flex">
          <button type="button" aria-label="Carrito" className="text-foreground/90 hover:text-foreground">
            <ShoppingBag className="h-5 w-5" strokeWidth={1.5} />
          </button>
          <Link
            href="#coleccion"
            className="rounded-full bg-foreground px-5 py-2 font-sans text-xs font-medium tracking-wide text-background uppercase transition-transform hover:scale-105"
          >
            Ver colección
          </Link>
        </div>

        <button
          type="button"
          aria-label="Menú"
          className="text-foreground md:hidden"
          onClick={() => setMenuOpen((v) => !v)}
        >
          {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed inset-0 z-40 flex flex-col items-center justify-center gap-8 bg-background/98 backdrop-blur-xl md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="font-heading text-3xl italic text-foreground/90 hover:text-foreground"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="#coleccion"
            onClick={() => setMenuOpen(false)}
            className="mt-4 rounded-full bg-foreground px-8 py-3 font-sans text-sm font-medium text-background"
          >
            Ver colección
          </Link>
        </div>
      )}

      <div className="relative z-10 mx-auto flex min-h-[calc(100vh-88px)] max-w-7xl flex-col justify-between px-6 pt-8 pb-10 sm:px-10">
        <div className="max-w-xl">
          <p className="mb-4 flex items-center gap-2 font-sans text-xs tracking-[0.25em] text-accent uppercase sm:mb-6">
            <span className="h-px w-6 bg-accent/60" />
            Perfumería árabe · Envíos a todo el país
          </p>
          <h1 className="font-heading text-4xl leading-[1.05] tracking-tight text-foreground sm:text-6xl md:text-7xl">
            El aroma
            <br />
            <span className="text-accent italic">que te precede.</span>
          </h1>
        </div>

        <div className="max-w-md">
          <p className="mb-6 font-sans text-base leading-relaxed text-muted-foreground sm:text-lg">
            Fragancias que dejan una impresión antes de que llegues. Descubrí tu próxima firma olfativa.
          </p>
          <Link
            href="#coleccion"
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 font-sans text-sm font-medium tracking-wide text-background uppercase transition-transform hover:scale-105"
          >
            Explorar aromas
          </Link>
        </div>

        <div className="mt-10 flex items-center justify-between border-t border-foreground/15 pt-4 font-sans text-xs tracking-[0.2em] text-muted-foreground uppercase">
          <span>
            {String(active + 1).padStart(2, "0")} — {current.label}
          </span>
          <span className="hidden sm:inline">Deslizá para descubrir</span>
        </div>
      </div>

      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className="pointer-events-none absolute inset-y-0 right-0 z-[5] hidden w-[55%] items-center justify-center sm:flex"
        style={{ perspective: "1000px" }}
      >
        {HERO_IMAGES.map((image, i) => (
          <div
            key={image.src}
            className={`absolute inset-0 flex items-center justify-center transition-opacity duration-1000 ease-in-out ${
              i === active ? "opacity-100" : "opacity-0"
            }`}
          >
            <div
              className="relative h-[60%] w-[70%]"
              style={{
                transform:
                  i === active
                    ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg) ${!reducedMotion ? "" : ""}`
                    : undefined,
                transition: "transform 150ms ease-out",
                animation: !reducedMotion ? `float-bob ${3600 + i * 300}ms ease-in-out infinite` : undefined,
              }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                sizes="45vw"
                priority={i === 0}
                className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.5)]"
              />
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
