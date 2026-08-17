"use client";

import Image from "next/image";
import { LightRays } from "@/components/light-rays";
import {
  ViewTransition,
  startTransition,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type MouseEvent,
} from "react";

const HERO_IMAGES = [
  { src: "/hero/hero-1-odyssey.webp", alt: "Armaf Odyssey" },
  { src: "/hero/hero-2-art-of-universe.webp", alt: "Lattafa Pride Art of Universe" },
  { src: "/hero/hero-3-now-women.webp", alt: "Rave Now Women" },
] as const;

const SCATTER = [
  { top: "40%", left: "37%", size: 92, rotate: -9 },
  { top: "59%", left: "61%", size: 74, rotate: 7 },
  { top: "45%", left: "60%", size: 82, rotate: -4 },
] as const;

const LOGO_LETTERS = ["A", "&", "G"] as const;
const INTRO_DURATION_MS = 1900;
const ROTATE_INTERVAL_MS = 4500;
const MAX_TILT_DEG = 10;
const SESSION_KEY = "ag-loader-shown";

interface HeroProps {
  /** Premium: intro con letras del logo y fotos apareciendo (ref: noth.in). Cinemático: arranca directo. */
  withIntro?: boolean;
  /** En modo demo (presentación de tiers) se ignora sessionStorage: el intro repite cada vez que se activa este tier. */
  demoMode?: boolean;
}

export function Hero({ withIntro = false, demoMode = false }: HeroProps) {
  const [phase, setPhase] = useState<"loading" | "loaded">("loading");
  const [active, setActive] = useState(0);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [skip, setSkip] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(false);
  const stageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setReducedMotion(window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }, []);

  useLayoutEffect(() => {
    if (!withIntro) {
      setSkip(true);
      setPhase("loaded");
      return;
    }
    if (!demoMode && sessionStorage.getItem(SESSION_KEY)) {
      setSkip(true);
      setPhase("loaded");
      return;
    }
    if (!demoMode) sessionStorage.setItem(SESSION_KEY, "1");
  }, [withIntro, demoMode]);

  useEffect(() => {
    if (skip) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const duration = prefersReducedMotion ? 0 : INTRO_DURATION_MS;

    const timeout = setTimeout(() => {
      startTransition(() => setPhase("loaded"));
    }, duration);

    return () => clearTimeout(timeout);
  }, [skip]);

  useEffect(() => {
    if (phase !== "loaded") return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    if (prefersReducedMotion) return;

    const interval = setInterval(() => {
      setActive((i) => (i + 1) % HERO_IMAGES.length);
    }, ROTATE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [phase]);

  function handleMouseMove(event: MouseEvent<HTMLDivElement>) {
    const stage = stageRef.current;
    if (!stage || phase !== "loaded") return;
    const rect = stage.getBoundingClientRect();
    const px = (event.clientX - rect.left) / rect.width - 0.5;
    const py = (event.clientY - rect.top) / rect.height - 0.5;
    setTilt({ x: py * -MAX_TILT_DEG, y: px * MAX_TILT_DEG });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  const loading = phase === "loading";

  return (
    <main
      id="hero"
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-background px-6"
    >
      {loading && <div className="fixed inset-0 z-40 bg-background" aria-hidden />}

      {!loading && withIntro && (
        <div
          className="pointer-events-none absolute top-0 left-1/2 h-20 w-40 -translate-x-1/2 sm:h-28 sm:w-64"
          style={{
            clipPath: "polygon(30% 0%, 70% 0%, 92% 100%, 8% 100%)",
            background: "linear-gradient(180deg, #cdeaf2 0%, rgba(205,234,242,0.15) 100%)",
          }}
          aria-hidden
        />
      )}

      {!loading && (
        <LightRays
          className="absolute inset-0"
          raysOrigin="top-center"
          raysColor={withIntro ? "#a9d8e0" : "#ffffff"}
          raysSpeed={1}
          lightSpread={withIntro ? 0.85 : 1}
          rayLength={2.5}
          fadeDistance={1.2}
          saturation={1}
          noiseAmount={0}
        />
      )}

      {!loading && withIntro && (
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-40 opacity-40"
          style={{
            background: "radial-gradient(60% 100% at 50% 100%, rgba(169,216,224,0.25), transparent 70%)",
          }}
          aria-hidden
        />
      )}

      <ViewTransition name="ag-logo" share="text-morph">
        <p
          className={
            loading
              ? "fixed inset-x-0 top-[27%] z-50 text-center font-heading text-6xl italic tracking-tight text-foreground sm:text-8xl"
              : "relative z-10 font-heading text-4xl italic tracking-tight text-foreground sm:text-6xl"
          }
        >
          {loading
            ? LOGO_LETTERS.map((letter, i) => (
                <span
                  key={i}
                  className="inline-block"
                  style={
                    reducedMotion
                      ? undefined
                      : { animation: "letter-in 700ms ease-out both", animationDelay: `${i * 160}ms` }
                  }
                >
                  {letter}
                </span>
              ))
            : "A&G"}
        </p>
      </ViewTransition>

      {!loading && (
        <ViewTransition>
          <p className="relative z-10 mb-10 max-w-xl text-center font-sans text-base text-muted-foreground sm:text-lg">
            Perfumes árabes, Natura y nicho. Originalidad verificada, envío en 48hs.
          </p>
        </ViewTransition>
      )}

      <div
        ref={stageRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        className={
          loading
            ? "fixed inset-0 z-50"
            : "relative flex h-[50vh] w-full max-w-md items-center justify-center"
        }
        style={loading ? undefined : { perspective: "1000px" }}
      >
        {HERO_IMAGES.map((image, i) => {
          const scatter = SCATTER[i];
          const isActive = i === active;
          return (
            <ViewTransition key={image.src} name={`hero-photo-${i}`} share="morph">
              <div
                className={
                  loading
                    ? "fixed"
                    : `absolute inset-0 flex items-center justify-center ${
                        isActive ? "opacity-100" : "opacity-0"
                      }`
                }
                style={
                  loading
                    ? ({
                        top: scatter.top,
                        left: scatter.left,
                        width: scatter.size,
                        height: scatter.size,
                        transform: `translate(-50%, -50%) rotate(${scatter.rotate}deg)`,
                        ...(reducedMotion
                          ? {}
                          : {
                              "--object-rotate": `${scatter.rotate}deg`,
                              animation: "object-in 900ms ease-out both",
                              animationDelay: `${480 + i * 220}ms`,
                            }),
                      } as React.CSSProperties)
                    : {
                        transform: isActive
                          ? `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`
                          : undefined,
                        transition:
                          "opacity 700ms ease-in-out, transform 150ms ease-out",
                      }
                }
              >
                <div
                  className="relative h-full w-full"
                  style={
                    !loading && withIntro && !reducedMotion
                      ? { animation: `float-bob ${3200 + i * 400}ms ease-in-out infinite` }
                      : undefined
                  }
                >
                  <Image
                    src={image.src}
                    alt={image.alt}
                    fill
                    sizes={loading ? "100px" : "(min-width: 768px) 28rem, 90vw"}
                    priority={i === 0}
                    className="object-contain brightness-90 drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]"
                  />
                </div>
              </div>
            </ViewTransition>
          );
        })}
      </div>
    </main>
  );
}
