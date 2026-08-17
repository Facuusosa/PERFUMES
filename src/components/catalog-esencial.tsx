import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Product {
  slug: string;
  name: string;
  brand: string;
  category: string;
  ml: number;
  bg: string;
  image: string;
  motif: "compass" | "constellation" | "hexagon";
}

const PRODUCTS: Product[] = [
  {
    slug: "odyssey",
    name: "Odyssey",
    brand: "Armaf",
    category: "Árabe",
    ml: 100,
    bg: "#1e3a46",
    image: "/hero/hero-1-odyssey.webp",
    motif: "compass",
  },
  {
    slug: "art-of-universe",
    name: "Art of Universe",
    brand: "Lattafa Pride",
    category: "Nicho",
    ml: 100,
    bg: "#141f3a",
    image: "/hero/hero-2-art-of-universe.webp",
    motif: "constellation",
  },
  {
    slug: "now-women",
    name: "Now Women",
    brand: "Rave",
    category: "Natura",
    ml: 100,
    bg: "#5c3430",
    image: "/hero/hero-3-now-women.webp",
    motif: "hexagon",
  },
];

function Motif({ type }: { type: Product["motif"] }) {
  if (type === "compass") {
    return (
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-[0.1]" aria-hidden>
        <circle cx="100" cy="100" r="70" fill="none" stroke="#f3ede4" strokeWidth="1" />
        <circle cx="100" cy="100" r="46" fill="none" stroke="#f3ede4" strokeWidth="1" />
        <path d="M100 18v24M100 158v24M18 100h24M158 100h24" stroke="#f3ede4" strokeWidth="1" />
        <path d="M100 60 108 100 100 140 92 100Z" fill="none" stroke="#f3ede4" strokeWidth="1.2" />
      </svg>
    );
  }
  if (type === "constellation") {
    return (
      <svg viewBox="0 0 200 200" className="absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden>
        <circle cx="140" cy="150" r="18" fill="none" stroke="#f3ede4" strokeWidth="1" />
        <ellipse cx="140" cy="150" rx="30" ry="7" fill="none" stroke="#f3ede4" strokeWidth="1" />
        <path
          d="M30 40 42 44 30 48 26 60 22 48 10 44 22 40 26 28Z"
          fill="none"
          stroke="#f3ede4"
          strokeWidth="1"
        />
        <circle cx="55" cy="90" r="2" fill="#f3ede4" />
        <circle cx="80" cy="60" r="1.6" fill="#f3ede4" />
        <circle cx="35" cy="120" r="1.6" fill="#f3ede4" />
        <circle cx="160" cy="60" r="1.6" fill="#f3ede4" />
        <circle cx="170" cy="100" r="2" fill="#f3ede4" />
      </svg>
    );
  }
  return (
    <svg className="absolute inset-0 h-full w-full opacity-[0.1]" aria-hidden>
      <defs>
        <pattern id={`hex-${type}`} width="42" height="73" patternUnits="userSpaceOnUse">
          <path
            d="M21 0 42 12 42 36 21 48 0 36 0 12Z M21 24 42 36 42 60 21 73 0 60 0 36Z"
            fill="none"
            stroke="#f3ede4"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#hex-${type})`} />
    </svg>
  );
}

export function CatalogEsencial() {
  return (
    <main className="min-h-screen bg-background px-6 py-20 sm:px-10">
      <header className="mx-auto mb-14 max-w-3xl text-center">
        <p className="mb-3 font-sans text-xs tracking-[0.3em] text-muted-foreground uppercase">A&amp;G</p>
        <h1 className="font-heading text-4xl italic tracking-tight text-foreground sm:text-5xl">
          Perfumes árabes, Natura y nicho.
        </h1>
        <p className="mx-auto mt-4 max-w-xl font-sans text-base text-muted-foreground">
          Originalidad verificada, envío en 48hs.
        </p>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-4 sm:grid-cols-3">
        {PRODUCTS.map((p) => (
          <article
            key={p.slug}
            className="relative flex flex-col overflow-hidden"
            style={{ backgroundColor: p.bg }}
          >
            <Motif type={p.motif} />
            <div className="relative flex h-64 items-center justify-center p-8">
              <div className="relative h-full w-full">
                <Image
                  src={p.image}
                  alt={p.name}
                  fill
                  sizes="(min-width: 640px) 33vw, 90vw"
                  className="object-contain drop-shadow-[0_20px_24px_rgba(0,0,0,0.4)]"
                />
              </div>
            </div>

            <div className="relative flex flex-1 flex-col gap-4 px-6 pb-8">
              <div>
                <p className="font-sans text-xs tracking-[0.2em] text-[#f3ede4]/60 uppercase">
                  {p.brand} — {p.category}
                </p>
                <h2 className="font-heading text-2xl italic tracking-tight text-[#f3ede4]">{p.name}</h2>
              </div>

              <span className="w-fit border border-[#f3ede4]/25 px-3 py-1 font-sans text-xs text-[#f3ede4]/80">
                {p.ml} ML
              </span>

              <Button
                variant="outline"
                className="mt-auto w-full border-accent/60 bg-transparent text-[#f3ede4] hover:bg-accent/15 hover:text-[#f3ede4]"
              >
                Agregar al carrito
              </Button>
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
