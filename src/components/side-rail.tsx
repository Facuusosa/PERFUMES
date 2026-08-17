"use client";

import { useEffect, useState } from "react";

const SECTIONS = [
  { id: "hero", label: "Inicio" },
  { id: "comparacion", label: "Comparación" },
] as const;

export function SideRail() {
  const [activeId, setActiveId] = useState<string>(SECTIONS[0].id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.find((entry) => entry.isIntersecting);
        if (visible) setActiveId(visible.target.id);
      },
      { threshold: 0.5 }
    );
    SECTIONS.forEach(({ id }) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, []);

  return (
    <nav
      aria-label="Navegación de sección"
      className="fixed top-1/2 right-6 z-40 flex -translate-y-1/2 flex-col gap-4"
    >
      {SECTIONS.map((section) => (
        <a
          key={section.id}
          href={`#${section.id}`}
          aria-current={activeId === section.id ? "true" : undefined}
          aria-label={section.label}
          className={`size-2.5 rounded-full border transition-colors ${
            activeId === section.id
              ? "border-accent bg-accent"
              : "border-muted-foreground/50 bg-transparent hover:border-foreground"
          }`}
        />
      ))}
    </nav>
  );
}
