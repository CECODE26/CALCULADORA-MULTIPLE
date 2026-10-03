"use client";

import { useSyncExternalStore } from "react";
import { readRecentTools } from "@/lib/storage";
import { findTool } from "@/tools/registry";
import { ToolCard } from "./ToolCard";

const subscribe = () => () => {};
let cache: { raw: string; list: string[] } = { raw: "", list: [] };
function snapshot(): string[] {
  const list = readRecentTools();
  const raw = list.join(",");
  if (raw !== cache.raw) cache = { raw, list };
  return cache.list;
}
const empty: string[] = [];

/** "Usadas recientemente": solo slugs guardados en este navegador. */
export function RecentTools() {
  const slugs = useSyncExternalStore(subscribe, snapshot, () => empty);
  const tools = slugs.map((s) => findTool(s)).filter((t) => t !== undefined);
  if (tools.length === 0) return null;
  return (
    <section className="section" aria-labelledby="recent-title">
      <div className="section__head">
        <h2 id="recent-title">Usadas recientemente</h2>
      </div>
      <ul className="card-grid card-grid--4">
        {tools.slice(0, 4).map((t) => (
          <li key={t.slug}>
            <ToolCard tool={{ slug: t.slug, name: t.name, icon: t.icon }} compact />
          </li>
        ))}
      </ul>
    </section>
  );
}
