import { ImageResponse } from "next/og";
import { siteConfig } from "@/config/site";

export const alt = `${siteConfig.name}: calculadoras gratuitas`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/** Imagen social por defecto, generada en build (sin archivos binarios en el repo). */
export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 80,
          background: "#f7f7f4",
          color: "#1b1e1c",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 72, height: 72, borderRadius: 18, background: "#0b6b4d", display: "flex" }} />
          <div style={{ fontSize: 44, fontWeight: 700 }}>{siteConfig.name}</div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 700, lineHeight: 1.1, maxWidth: 960 }}>
            Calculadoras gratuitas de finanzas, negocios y trabajo
          </div>
          <div style={{ fontSize: 32, color: "#565c58" }}>Resultados claros y con la fórmula explicada</div>
        </div>
      </div>
    ),
    size,
  );
}
