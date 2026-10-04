import type { ReactNode } from "react";
import { Icon } from "./Icon";

/** Bloque desplegable nativo (<details>), accesible sin JavaScript. */
export function Disclosure({ summary, children, defaultOpen }: { summary: ReactNode; children: ReactNode; defaultOpen?: boolean }) {
  return (
    <details className="details" open={defaultOpen}>
      <summary>
        <span>{summary}</span>
        <Icon name="chevronDown" size={18} />
      </summary>
      <div className="details__body">{children}</div>
    </details>
  );
}
