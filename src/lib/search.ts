import type { ToolEntry } from "@/tools/registry";

/** Normaliza texto: minúsculas, sin tildes, sin signos. */
export function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/%/g, " porcentaje ")
    .replace(/[^a-z0-9ñ\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

const STOPWORDS = new Set([
  "de", "del", "la", "el", "los", "las", "un", "una", "unos", "y", "o", "a", "en", "para", "por", "con",
  "mi", "mis", "que", "como", "cuanto", "cuanta", "cuantos", "calcular", "calculadora", "calculo", "se",
  "es", "al", "lo", "me", "quiero", "necesito", "saber", "sacar",
]);

function tokens(text: string): string[] {
  return normalize(text)
    .split(" ")
    .filter((t) => t.length > 0 && !STOPWORDS.has(t));
}

/** Distancia de Levenshtein acotada (para tolerar errores de escritura). */
function withinOneEdit(a: string, b: string): boolean {
  if (a === b) return true;
  const la = a.length;
  const lb = b.length;
  if (Math.abs(la - lb) > 1) return false;
  let i = 0;
  let j = 0;
  let edits = 0;
  while (i < la && j < lb) {
    if (a[i] === b[j]) {
      i++;
      j++;
      continue;
    }
    if (++edits > 1) return false;
    if (la > lb) i++;
    else if (lb > la) j++;
    else {
      i++;
      j++;
    }
  }
  return edits + (la - i) + (lb - j) <= 1;
}

/** Variantes simples singular/plural. */
function stem(t: string): string {
  if (t.length > 4 && t.endsWith("es")) return t.slice(0, -2);
  if (t.length > 3 && t.endsWith("s")) return t.slice(0, -1);
  return t;
}

interface Indexed {
  tool: ToolEntry;
  phrases: string[];
  words: Set<string>;
}

function buildIndex(list: readonly ToolEntry[]): Indexed[] {
  return list.map((tool) => {
    const phrases = [tool.name, tool.h1, ...tool.keywords].map(normalize);
    const words = new Set<string>();
    for (const p of phrases) for (const w of p.split(" ")) if (w && !STOPWORDS.has(w)) words.add(stem(w));
    return { tool, phrases, words };
  });
}

export interface SearchResult {
  tool: ToolEntry;
  score: number;
}

export function searchTools(query: string, list: readonly ToolEntry[], limit = 6): SearchResult[] {
  const q = normalize(query);
  if (q.length === 0) return [];
  const qTokens = tokens(query).map(stem);
  const index = buildIndex(list);

  const results: SearchResult[] = [];
  for (const item of index) {
    let score = 0;
    for (const phrase of item.phrases) {
      if (phrase === q) score = Math.max(score, 100);
      else if (phrase.startsWith(q)) score = Math.max(score, 60);
      else if (q.length >= 3 && phrase.includes(q)) score = Math.max(score, 40);
    }
    for (const t of qTokens) {
      if (item.words.has(t)) {
        score += 20;
        continue;
      }
      let matched = false;
      for (const w of item.words) {
        if (t.length >= 3 && w.startsWith(t)) {
          score += 12;
          matched = true;
          break;
        }
      }
      if (matched) continue;
      if (t.length >= 4) {
        for (const w of item.words) {
          if (w.length >= 4 && withinOneEdit(t, w)) {
            score += 8;
            break;
          }
        }
      }
    }
    if (score > 0) {
      if (item.tool.popular) score += 1;
      results.push({ tool: item.tool, score });
    }
  }
  return results.sort((a, b) => b.score - a.score).slice(0, limit);
}
