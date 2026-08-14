"use client";

import Image from "next/image";
import { useEffect, useLayoutEffect, useState } from "react";

const BACKDROP_IMAGES = [
  "/hero/preloader-1-yara-exclusive.webp",
  "/hero/preloader-2-qimmah.webp",
];

const COUNT_DURATION_MS = 2200;
const CROSSFADE_INTERVAL_MS = 1600;
const DOOR_SLIDE_MS = 800;
const CONTENT_FADE_MS = 300;
const SESSION_KEY = "ag-loader-shown";

export function Preloader() {
  const [count, setCount] = useState(0);
  const [activeImage, setActiveImage] = useState(0);
  const [done, setDone] = useState(false);
  const [hidden, setHidden] = useState(false);
  const [skip, setSkip] = useState(false);

  useLayoutEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) {
      queueMicrotask(() => {
        setSkip(true);
        setHidden(true);
      });
      return;
    }
    sessionStorage.setItem(SESSION_KEY, "1");
  }, []);

  useEffect(() => {
    if (skip) return;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const duration = prefersReducedMotion ? 0 : COUNT_DURATION_MS;

    const start = performance.now();
    let frame: number;

    const tick = (now: number) => {
      const elapsed = now - start;
      const progress = duration === 0 ? 1 : Math.min(1, elapsed / duration);
      setCount(Math.round(progress * 100));
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      } else {
        setDone(true);
      }
    };

    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [skip]);

  useEffect(() => {
    if (done || skip) return;
    const interval = setInterval(() => {
      setActiveImage((i) => (i + 1) % BACKDROP_IMAGES.length);
    }, CROSSFADE_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [done, skip]);

  useEffect(() => {
    if (!done) return;
    const timeout = setTimeout(() => setHidden(true), DOOR_SLIDE_MS + 100);
    return () => clearTimeout(timeout);
  }, [done]);

  if (hidden) return null;

  return (
    <div className="fixed inset-0 z-50" aria-hidden={done}>
      <div
        className={`absolute inset-y-0 left-0 w-1/2 bg-background transition-transform ease-[cubic-bezier(0.83,0,0.17,1)] ${
          done ? "-translate-x-full" : "translate-x-0"
        }`}
        style={{ transitionDuration: `${DOOR_SLIDE_MS}ms` }}
      />
      <div
        className={`absolute inset-y-0 right-0 w-1/2 bg-background transition-transform ease-[cubic-bezier(0.83,0,0.17,1)] ${
          done ? "translate-x-full" : "translate-x-0"
        }`}
        style={{ transitionDuration: `${DOOR_SLIDE_MS}ms` }}
      />

      <div
        className={`absolute inset-0 flex flex-col items-center justify-center gap-6 transition-opacity ease-out ${
          done ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
        style={{ transitionDuration: `${CONTENT_FADE_MS}ms` }}
      >
        <p className="font-heading text-6xl italic tracking-tight text-foreground sm:text-8xl">
          A&G
        </p>
        <div className="relative h-40 w-32 sm:h-52 sm:w-40">
          {BACKDROP_IMAGES.map((src, i) => (
            <Image
              key={src}
              src={src}
              alt=""
              fill
              sizes="200px"
              priority={i === 0}
              className={`object-contain drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)] transition-opacity duration-[1600ms] ease-in-out ${
                i === activeImage ? "opacity-100" : "opacity-0"
              }`}
            />
          ))}
        </div>
        <p className="font-sans text-sm tabular-nums tracking-[0.3em] text-muted-foreground">
          {String(count).padStart(3, "0")}%
        </p>
      </div>
    </div>
  );
}
