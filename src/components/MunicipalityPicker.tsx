"use client";

import { useMemo, useState } from "react";
import { MUNICIPALITIES } from "@/lib/municipalities";

export function MunicipalityPicker({
  name,
  defaultSelectedIds = [],
}: {
  name: string;
  defaultSelectedIds?: string[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Set<string>>(
    new Set(defaultSelectedIds),
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = q
      ? MUNICIPALITIES.filter((m) => m.label.toLowerCase().includes(q))
      : MUNICIPALITIES;
    return list.slice(0, 50);
  }, [search]);

  function toggle(id: string) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const selectedMunicipalities = MUNICIPALITIES.filter((m) =>
    selected.has(m.id),
  );

  return (
    <div className="flex flex-col gap-2">
      <input type="hidden" name={name} value={[...selected].join(",")} />

      {selectedMunicipalities.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {selectedMunicipalities.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => toggle(m.id)}
              className="rounded-full bg-black px-3 py-1 text-xs text-white dark:bg-white dark:text-black"
            >
              {m.label} ✕
            </button>
          ))}
        </div>
      )}

      <input
        type="text"
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        placeholder="Sök kommun..."
        className="rounded border border-black/[.1] px-3 py-2 text-sm dark:border-white/[.15] dark:bg-transparent"
      />

      <div className="max-h-40 overflow-y-auto rounded border border-black/[.1] p-2 dark:border-white/[.15]">
        {filtered.map((m) => (
          <label key={m.id} className="flex items-center gap-2 py-0.5 text-sm">
            <input
              type="checkbox"
              checked={selected.has(m.id)}
              onChange={() => toggle(m.id)}
            />
            {m.label}
          </label>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-zinc-500">
            Ingen kommun matchade sökningen.
          </p>
        )}
      </div>
    </div>
  );
}
