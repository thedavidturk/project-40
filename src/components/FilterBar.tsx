"use client";

import { useEffect, useState, type RefObject } from "react";
import type { FilterState, PillarId, ContentType } from "@/lib/types";
import { PILLARS, CONTENT_TYPE_LABELS } from "@/lib/constants";

const TIME_OPTIONS: { value: FilterState["timeRange"]; label: string }[] = [
  { value: "1h", label: "1h" },
  { value: "6h", label: "6h" },
  { value: "24h", label: "24h" },
  { value: "7d", label: "7d" },
  { value: "30d", label: "30d" },
  { value: "all", label: "All" },
];

interface FilterBarProps {
  filters: FilterState;
  onChange: (filters: FilterState) => void;
  itemCount: number;
  searchInputRef?: RefObject<HTMLInputElement | null>;
}

export function FilterBar({ filters, onChange, itemCount, searchInputRef }: FilterBarProps) {
  const [searchInput, setSearchInput] = useState(filters.search);

  useEffect(() => {
    const t = setTimeout(() => {
      if (searchInput !== filters.search) {
        onChange({ ...filters, search: searchInput });
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchInput, filters, onChange]);

  const togglePillar = (p: PillarId) => {
    const pillars = filters.pillars.includes(p)
      ? filters.pillars.filter((x) => x !== p)
      : [...filters.pillars, p];
    onChange({ ...filters, pillars });
  };

  const toggleType = (t: ContentType) => {
    const types = filters.types.includes(t)
      ? filters.types.filter((x) => x !== t)
      : [...filters.types, t];
    onChange({ ...filters, types });
  };

  return (
    <div className="space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <div className="flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Pillar toggles */}
        <div className="flex gap-1.5">
          {(Object.entries(PILLARS) as [PillarId, (typeof PILLARS)[PillarId]][]).map(
            ([id, pillar]) => {
              const active = filters.pillars.includes(id);
              return (
                <button
                  key={id}
                  onClick={() => togglePillar(id)}
                  className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                    active
                      ? `text-white`
                      : "border border-zinc-700 text-zinc-400 hover:border-zinc-600"
                  }`}
                  style={active ? { backgroundColor: pillar.color } : undefined}
                >
                  {pillar.label}
                </button>
              );
            }
          )}
        </div>

        {/* Divider */}
        <div className="hidden h-5 w-px bg-zinc-700 sm:block" />

        {/* Type toggles */}
        <div className="flex gap-1.5">
          {(
            Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]
          ).map(([type, label]) => {
            const active = filters.types.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? "bg-zinc-700 text-white"
                    : "border border-zinc-700 text-zinc-400 hover:border-zinc-600"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {/* Divider */}
        <div className="hidden h-5 w-px bg-zinc-700 sm:block" />

        {/* Time range */}
        <div className="flex gap-1">
          {TIME_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => onChange({ ...filters, timeRange: opt.value })}
              className={`rounded-md px-2 py-1 text-xs font-medium transition-colors ${
                filters.timeRange === opt.value
                  ? "bg-zinc-700 text-white"
                  : "text-zinc-500 hover:text-zinc-300"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* High signal toggle */}
        <button
          onClick={() =>
            onChange({ ...filters, highSignalOnly: !filters.highSignalOnly })
          }
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            filters.highSignalOnly
              ? "bg-amber-600 text-white"
              : "border border-zinc-700 text-zinc-400 hover:border-zinc-600"
          }`}
        >
          High Signal
        </button>

        {/* New only toggle */}
        <button
          onClick={() =>
            onChange({ ...filters, newOnly: !filters.newOnly })
          }
          className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
            filters.newOnly
              ? "bg-emerald-600 text-white"
              : "border border-zinc-700 text-zinc-400 hover:border-zinc-600"
          }`}
        >
          New Only
        </button>
      </div>

      <div className="flex items-center gap-3">
        {/* Search */}
        <input
          ref={searchInputRef}
          type="text"
          placeholder="Search items..."
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 outline-none focus:border-zinc-500"
        />
        <span className="text-xs text-zinc-500">{itemCount} items</span>
      </div>
    </div>
  );
}
