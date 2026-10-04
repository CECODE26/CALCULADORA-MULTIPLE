import type { ReactNode } from "react";

export function ResultEmpty({ children }: { children?: ReactNode }) {
  return <div className="result-empty">{children ?? "Completa los datos para ver el resultado."}</div>;
}
