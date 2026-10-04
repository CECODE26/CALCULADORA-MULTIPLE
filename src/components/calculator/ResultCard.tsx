import type { ReactNode } from "react";

interface ResultCardProps {
  label: string;
  value: string;
  note?: ReactNode;
  tone?: "default" | "negative";
  children?: ReactNode;
  /** Cambiar esta clave vuelve a reproducir la animación de aparición */
  animationKey?: string;
}

/** Resultado principal destacado. Se anuncia a lectores de pantalla. */
export function ResultCard({ label, value, note, tone = "default", children, animationKey }: ResultCardProps) {
  return (
    <section className="result-card animate-in" data-tone={tone} aria-live="polite" key={animationKey}>
      <p className="result-card__label">{label}</p>
      <p className="result-card__value">{value}</p>
      {note ? <p className="result-card__note">{note}</p> : null}
      {children}
    </section>
  );
}
