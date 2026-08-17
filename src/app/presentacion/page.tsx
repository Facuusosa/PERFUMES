"use client";

import { useEffect, useState } from "react";
import { Hero } from "@/components/hero";
import { CatalogEsencial } from "@/components/catalog-esencial";
import { ComparisonReveal } from "@/components/comparison-reveal";
import { SideRail } from "@/components/side-rail";

type Tier = "esencial" | "cinematico" | "premium";

const TIERS: { id: Tier; label: string; blurb: string }[] = [
  { id: "esencial", label: "Esencial", blurb: "Catálogo con el color real de cada perfume" },
  { id: "cinematico", label: "Cinemático", blurb: "Rayo de luz a pantalla completa + tilt" },
  { id: "premium", label: "Premium", blurb: "Intro con logo y fotos + comparación + navegación lateral" },
];

const PRICE_KEY = "ag-presentacion-precios";

export default function PresentacionPage() {
  const [tier, setTier] = useState<Tier>("esencial");
  const [prices, setPrices] = useState<Record<Tier, string>>({
    esencial: "150.000 + perfume",
    cinematico: "250.000 + perfume",
    premium: "400.000 + perfume",
  });

  useEffect(() => {
    const saved = localStorage.getItem(PRICE_KEY);
    if (saved) setPrices(JSON.parse(saved));
  }, []);

  function updatePrice(id: Tier, value: string) {
    const next = { ...prices, [id]: value };
    setPrices(next);
    localStorage.setItem(PRICE_KEY, JSON.stringify(next));
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="fixed inset-x-0 top-0 z-50 flex flex-wrap items-center justify-center gap-2 border-b border-border bg-background/95 px-4 py-3 backdrop-blur-sm sm:gap-4">
        {TIERS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTier(t.id)}
            className={`flex flex-col items-center gap-1 rounded-md border px-3 py-1.5 text-left transition-colors ${
              tier === t.id
                ? "border-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <span className="font-sans text-sm font-medium">{t.label}</span>
            <span className="hidden font-sans text-xs text-muted-foreground sm:block">{t.blurb}</span>
          </button>
        ))}
        <label className="flex items-center gap-2 font-sans text-sm text-muted-foreground">
          $
          <input
            value={prices[tier]}
            onChange={(e) => updatePrice(tier, e.target.value)}
            placeholder="precio"
            inputMode="numeric"
            className="w-24 border-b border-border bg-transparent px-1 py-0.5 text-foreground outline-none focus:border-accent"
          />
        </label>
      </div>

      <div key={tier} className="pt-14">
        {tier === "esencial" && <CatalogEsencial />}
        {tier === "cinematico" && <Hero demoMode />}
        {tier === "premium" && (
          <>
            <Hero withIntro demoMode />
            <ComparisonReveal />
            <SideRail />
          </>
        )}
      </div>
    </div>
  );
}
