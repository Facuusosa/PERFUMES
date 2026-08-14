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

      <div className="relative flex flex-col items-center gap-8">
        <p className="font-heading text-6xl italic tracking-tight text-foreground sm:text-8xl lg:text-9xl">
          A&G
        </p>
        <p className="font-sans text-sm tabular-nums tracking-[0.3em] text-muted-foreground">
          {String(count).padStart(3, "0")}%
        </p>
      </div>
    </div>
  );
}
