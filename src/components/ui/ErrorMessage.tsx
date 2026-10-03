import { Icon } from "./Icon";
import type { ReactNode } from "react";

interface ErrorMessageProps {
  children: ReactNode;
  tone?: "error" | "warning" | "info";
}

/** Mensaje de error/aviso comprensible y accesible. */
export function ErrorMessage({ children, tone = "error" }: ErrorMessageProps) {
  return (
    <div className={`alert alert--${tone}`} role={tone === "error" ? "alert" : "status"}>
      <Icon name={tone === "info" ? "info" : "alert"} size={18} />
      <div>{children}</div>
    </div>
  );
}
