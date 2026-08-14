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
