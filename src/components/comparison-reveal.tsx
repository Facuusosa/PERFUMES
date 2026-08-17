import { Check, X } from "lucide-react";

const ROWS = [
  { bad: "Reventa sin garantía", good: "Producto verificado" },
  { bad: "Esperar semanas", good: "Envío en 48hs" },
  { bad: "Sin devolución", good: "Cambios sin drama" },
] as const;

export function ComparisonReveal() {
  return (
    <section
      id="comparacion"
      className="flex min-h-screen flex-col items-center justify-center gap-16 bg-background px-6 py-24"
    >
      <h2 className="max-w-xl text-center font-heading text-3xl italic tracking-tight text-foreground sm:text-5xl">
        Reventa, sin las dudas de siempre
      </h2>

      <div className="w-full max-w-xl divide-y divide-border">
        {ROWS.map((row) => (
          <div key={row.good} className="flex items-center justify-between gap-6 py-6">
            <span className="flex items-center gap-3 font-sans text-base text-muted-foreground line-through decoration-muted-foreground/50 sm:text-lg">
              <X className="size-4 shrink-0 text-muted-foreground" aria-hidden />
              {row.bad}
            </span>
            <span className="flex items-center gap-3 font-sans text-base text-foreground sm:text-lg">
              <Check className="size-4 shrink-0 text-accent" aria-hidden />
              {row.good}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
