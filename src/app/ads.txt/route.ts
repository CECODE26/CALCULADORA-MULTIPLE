import { siteConfig } from "@/config/site";

/**
 * ads.txt generado a partir de la configuración. Si AdSense no está
 * configurado, responde 404 para no publicar datos inventados.
 */
export const dynamic = "force-static";

export function GET() {
  const client = siteConfig.ads.clientId;
  if (!client) return new Response("Not found", { status: 404 });
  const publisher = client.replace(/^ca-/, "");
  return new Response(`google.com, ${publisher}, DIRECT, f08c47fec0942fa0\n`, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
