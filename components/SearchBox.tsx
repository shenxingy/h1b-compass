"use client";

import { useState, useRef, useEffect } from "react";

export interface MsaOption {
  msaCode: string;
  name: string;
}

interface Props {
  options: MsaOption[];
  onSelect: (msaCode: string) => void;
  placeholder?: string;
}

export function SearchBox({ options, onSelect, placeholder = "Search metro area..." }: Props) {
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [highlighted, setHighlighted] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const filtered =
    query.length < 2
      ? []
      : options
          .filter((o) => o.name.toLowerCase().includes(query.toLowerCase()))
          .slice(0, 10);

  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (!containerRef.current?.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, []);

  function select(opt: MsaOption) {
    onSelect(opt.msaCode);
    setQuery(opt.name);
    setOpen(false);
  }

  function onKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") { setQuery(""); setOpen(false); return; }
    if (!open || filtered.length === 0) return;
    if (e.key === "ArrowDown") { e.preventDefault(); setHighlighted((h) => Math.min(h + 1, filtered.length - 1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setHighlighted((h) => Math.max(h - 1, 0)); }
    else if (e.key === "Enter") { e.preventDefault(); if (filtered[highlighted]) select(filtered[highlighted]); }
  }

  return (
    <div ref={containerRef} className="relative w-full">
      <div className="relative">
        {/* Search icon */}
        <svg
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-400 pointer-events-none"
          viewBox="0 0 20 20" fill="currentColor"
        >
          <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" />
        </svg>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); setHighlighted(0); }}
          onFocus={() => { if (query.length >= 2) setOpen(true); }}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="w-full pl-8 pr-7 py-1.5 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent"
        />
        {query && (
          <button
            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            onClick={() => { setQuery(""); setOpen(false); inputRef.current?.focus(); }}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 20 20" fill="currentColor">
              <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z" />
            </svg>
          </button>
        )}
      </div>

      {open && filtered.length > 0 && (
        <ul className="absolute top-full mt-1 w-full max-h-60 overflow-auto bg-white border border-gray-200 rounded-lg shadow-lg z-[500] py-1">
          {filtered.map((opt, i) => (
            <li
              key={opt.msaCode}
              className={`px-3 py-1.5 text-sm cursor-pointer ${
                i === highlighted ? "bg-blue-50 text-blue-900" : "text-gray-700 hover:bg-gray-50"
              }`}
              onPointerDown={(e) => { e.preventDefault(); select(opt); }}
              onPointerEnter={() => setHighlighted(i)}
            >
              {opt.name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
