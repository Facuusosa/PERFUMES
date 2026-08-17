import Image from "next/image";
import { Button } from "@/components/ui/button";

const SPECS = [
  { label: "Volumen", value: "100 ML" },
  { label: "Familia", value: "Floral" },
  { label: "Origen", value: "Árabe" },
] as const;

export function HeroEsencial() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center overflow-hidden px-6 py-16 sm:flex-row sm:items-stretch sm:px-0 sm:py-0"
      style={{ backgroundColor: "#5c3430" }}
    >
      <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.07]" aria-hidden>
        <defs>
          <pattern id="hex" width="56" height="97" patternUnits="userSpaceOnUse" patternTransform="scale(1)">
            <path
              d="M28 0 56 16 56 48 28 64 0 48 0 16Z M28 32 56 48 56 80 28 97 0 80 0 48Z"
              fill="none"
              stroke="#f3ede4"
              strokeWidth="1"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hex)" />
      </svg>

      <div className="relative flex w-full items-center justify-center sm:w-1/2 sm:min-h-screen">
        <div className="relative aspect-square w-full max-w-md">
          <Image
            src="/hero/hero-3-now-women.webp"
            alt="Rave Now Women"
            fill
            sizes="(min-width: 640px) 40vw, 90vw"
            priority
            className="object-contain drop-shadow-[0_30px_40px_rgba(0,0,0,0.35)]"
          />
        </div>
      </div>

      <div className="relative flex w-full flex-col justify-center gap-6 py-12 sm:w-1/2 sm:px-16 sm:py-0">
        <p className="font-sans text-xs tracking-[0.3em] text-[#f3ede4]/70 uppercase">A&amp;G — Reventa verificada</p>
        <h1 className="font-heading text-4xl italic tracking-tight text-[#f3ede4] sm:text-6xl">Now Women</h1>

        <div className="grid grid-cols-3 divide-x divide-[#f3ede4]/20 border border-[#f3ede4]/20">
          {SPECS.map((spec) => (
            <div key={spec.label} className="flex flex-col items-center gap-1 px-2 py-3 text-center">
              <span className="font-sans text-[0.65rem] tracking-[0.2em] text-[#f3ede4]/60 uppercase">
                {spec.label}
              </span>
              <span className="font-sans text-sm text-[#f3ede4]">{spec.value}</span>
            </div>
          ))}
        </div>

        <p className="max-w-md font-sans text-base leading-relaxed text-[#f3ede4]/75">
          Inspirado en fragancias florales contemporáneas. Original, verificado y con envío en 48hs — sin la
          incertidumbre habitual de la reventa.
        </p>

        <Button
          variant="outline"
          size="lg"
          className="w-fit border-[#f3ede4]/40 bg-transparent text-[#f3ede4] hover:bg-[#f3ede4]/10 hover:text-[#f3ede4]"
        >
          Agregar al carrito
        </Button>
      </div>
    </main>
  );
}
