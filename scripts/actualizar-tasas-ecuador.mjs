#!/usr/bin/env node
/**
 * Actualiza src/data/tasas-ecuador-bce.json a partir del archivo del Banco
 * Central del Ecuador con las operaciones de crédito concedidas por entidad
 * (tma_desde_200801.csv, separado por ";" y con coma decimal).
 *
 * Uso:
 *   node scripts/actualizar-tasas-ecuador.mjs ruta/tma_desde_200801.csv [AAAA-MM]
 *
 * Sin mes, toma el último mes del archivo. Para cada entidad de
 * src/data/entidades-ecuador.json (por RUC) y cada segmento de crédito,
 * guarda la tasa efectiva promedio ponderada por monto, el número de
 * operaciones y el monto total. El criterio de qué se muestra en el
 * simulador está en src/data/tasas-ecuador.ts.
 */
import { createReadStream, readFileSync, writeFileSync } from "node:fs";
import { createInterface } from "node:readline";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const [csvPath, monthArg] = process.argv.slice(2);
if (!csvPath) {
  console.error("Uso: node scripts/actualizar-tasas-ecuador.mjs ruta/tma_desde_200801.csv [AAAA-MM]");
  process.exit(1);
}
if (monthArg && !/^\d{4}-\d{2}$/.test(monthArg)) {
  console.error("El mes debe tener el formato AAAA-MM.");
  process.exit(1);
}

const entities = JSON.parse(readFileSync(join(root, "src/data/entidades-ecuador.json"), "utf8"));
const rucs = new Set(entities.map((e) => e.ruc));
const num = (s) => Number(String(s).replace(",", "."));

/** month → ruc → segmento → { m: monto, w: Σ tasa·monto, ops } */
const byMonth = new Map();
let header = null;
const lines = createInterface({ input: createReadStream(csvPath, "utf8"), crlfDelay: Infinity });
for await (const line of lines) {
  if (!header) {
    header = line.replace(/^﻿/, "").split(";");
    for (const col of ["fecha", "ruc", "segmento_credito", "monto_total", "numero_operaciones", "tasa_activa_efectiva"]) {
      if (!header.includes(col)) throw new Error(`Falta la columna ${col}; ¿es el archivo correcto?`);
    }
    continue;
  }
  const month = line.slice(0, 7);
  if (monthArg && month !== monthArg) continue;
  const c = line.split(";");
  const ruc = c[header.indexOf("ruc")];
  if (!rucs.has(ruc)) continue;
  const monto = num(c[header.indexOf("monto_total")]);
  const rate = num(c[header.indexOf("tasa_activa_efectiva")]);
  const ops = num(c[header.indexOf("numero_operaciones")]);
  if (!Number.isFinite(monto) || !Number.isFinite(rate) || monto <= 0) continue;
  const seg = c[header.indexOf("segmento_credito")];
  if (!byMonth.has(month)) byMonth.set(month, new Map());
  const m = byMonth.get(month);
  if (!m.has(ruc)) m.set(ruc, {});
  const s = (m.get(ruc)[seg] ??= { m: 0, w: 0, ops: 0 });
  s.m += monto;
  s.w += rate * monto;
  s.ops += Number.isFinite(ops) ? ops : 0;
}

const month = monthArg ?? [...byMonth.keys()].sort().at(-1);
const data = byMonth.get(month);
if (!data) {
  console.error(`No hay datos de ${monthArg ?? "ningún mes"} para las entidades listadas.`);
  process.exit(1);
}
const lenders = {};
for (const e of entities) {
  const segs = data.get(e.ruc) ?? {};
  lenders[e.id] = Object.fromEntries(
    Object.entries(segs)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([seg, s]) => [seg, { effectiveRate: Math.round((s.w / s.m) * 100) / 100, operations: s.ops, amount: Math.round(s.m) }]),
  );
}
const out = { month, file: csvPath.split(/[\\/]/).at(-1), lenders };
writeFileSync(join(root, "src/data/tasas-ecuador-bce.json"), JSON.stringify(out, null, 2) + "\n");
console.log(`Tasas de ${month} guardadas en src/data/tasas-ecuador-bce.json`);
