"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Icon } from "@/components/ui/Icon";
import { liveTools } from "@/tools/registry";
import { getCategory } from "@/config/categories";
import { searchTools } from "@/lib/search";
import { track } from "@/lib/analytics";

const SUGGESTIONS = ["préstamo", "margen", "IVA", "porcentaje", "descuento", "horas", "ahorro"];

interface SearchToolsProps {
  label?: string;
  autoFocus?: boolean;
  showSuggestions?: boolean;
}

/**
 * Buscador de herramientas tipo combobox (WAI-ARIA 1.2).
 * Entiende sinónimos, ignora tildes y tolera pequeñas erratas.
 */
export function SearchTools({ label = "¿Qué necesitas calcular?", autoFocus, showSuggestions = true }: SearchToolsProps) {
  const router = useRouter();
  const id = useId();
  const listId = `${id}-list`;
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);

  const tools = useMemo(() => liveTools(), []);
  const results = useMemo(() => searchTools(query, tools), [query, tools]);
  const showList = open && query.trim().length > 0;

  function go(slug: string) {
    track("search_used", { search_term: query, selected_tool: slug, results_count: results.length });
    setOpen(false);
    router.push(`/${slug}`);
  }

  function onChange(v: string) {
    setQuery(v);
    setOpen(true);
    setActive(0);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setOpen(true);
      setActive((a) => Math.min(a + 1, Math.max(results.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(a - 1, 0));
    } else if (e.key === "Enter") {
      const r = results[active];
      if (r) {
        e.preventDefault();
        go(r.tool.slug);
      }
    } else if (e.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="search">
      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <label htmlFor={id} className="field__label" style={{ display: "block", marginBottom: 8, fontSize: "1rem" }}>
          {label}
        </label>
        <div className="search__box">
          <Icon name="search" size={20} />
          <input
            ref={inputRef}
            id={id}
            className="search__input"
            type="search"
            role="combobox"
            aria-expanded={showList}
            aria-controls={listId}
            aria-autocomplete="list"
            aria-activedescendant={showList && results[active] ? `${listId}-${active}` : undefined}
            placeholder="Ej.: préstamo, margen, IVA…"
            autoComplete="off"
            enterKeyHint="search"
            autoFocus={autoFocus}
            value={query}
            maxLength={80}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={onKeyDown}
            onFocus={() => setOpen(true)}
            onBlur={() => window.setTimeout(() => setOpen(false), 150)}
          />
          {query ? (
            <button
              type="button"
              className="search__clear"
              aria-label="Borrar búsqueda"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              <Icon name="close" size={18} />
            </button>
          ) : null}
        </div>
      </form>
      {showList ? (
        <ul className="search__list" id={listId} role="listbox" aria-label="Herramientas encontradas">
          {results.length === 0 ? (
            <li className="search__empty" role="option" aria-selected="false" aria-disabled="true">
              No encontramos una herramienta para «{query}». Prueba con otra palabra o mira{" "}
              <Link href="/herramientas">todas las herramientas</Link>.
            </li>
          ) : (
            results.map((r, i) => (
              <li
                key={r.tool.slug}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                className="search__option"
                onMouseDown={(e) => {
                  e.preventDefault();
                  go(r.tool.slug);
                }}
                onMouseEnter={() => setActive(i)}
              >
                <span className="search__option-icon">
                  <Icon name={r.tool.icon} size={18} />
                </span>
                <span>
                  <span className="search__option-name">{r.tool.name}</span>
                  <span className="search__option-cat">{getCategory(r.tool.category)?.name}</span>
                </span>
              </li>
            ))
          )}
        </ul>
      ) : null}
      {showSuggestions ? (
        <div className="search__suggestions">
          <span>Populares:</span>
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              type="button"
              className="chip"
              onClick={() => {
                onChange(s);
                inputRef.current?.focus();
              }}
            >
              {s}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}
