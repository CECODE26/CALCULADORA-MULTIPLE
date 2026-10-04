"use client";

import { setConsent, thirdPartiesConfigured } from "./consent";

/** Permite volver a mostrar el aviso para cambiar la decisión. */
export function ConsentSettingsLink() {
  if (!thirdPartiesConfigured) return null;
  return (
    <button
      type="button"
      onClick={() => setConsent("unset")}
      style={{ background: "none", border: 0, padding: 0, color: "inherit", cursor: "pointer", font: "inherit" }}
    >
      Preferencias de cookies
    </button>
  );
}
