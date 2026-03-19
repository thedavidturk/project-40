"use client";

import { useState, useRef, useEffect } from "react";
import type { Collection } from "@/lib/types";

interface BulkActionBarProps {
  selectedCount: number;
  totalVisible: number;
  collections: Collection[];
  allSelected: boolean;
  onSaveAll: () => void;
  onStarAll: () => void;
  onSkipAll: () => void;
  onAssignCollection: (collectionId: string) => void;
  onSelectAll: () => void;
  onClearSelection: () => void;
}

export function BulkActionBar({
  selectedCount,
  totalVisible,
  collections,
  allSelected,
  onSaveAll,
  onStarAll,
  onSkipAll,
  onAssignCollection,
  onSelectAll,
  onClearSelection,
}: BulkActionBarProps) {
  const [showCollections, setShowCollections] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowCollections(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-1.5 rounded-2xl border border-zinc-700 bg-zinc-950/95 px-4 py-2.5 shadow-2xl shadow-black/60 ring-1 ring-white/5 backdrop-blur-sm">
        {/* Selected count badge */}
        <span className="rounded-full bg-zinc-700 px-2.5 py-0.5 text-xs font-bold text-zinc-100 tabular-nums">
          {selectedCount}
        </span>
        <span className="text-xs text-zinc-500">selected</span>

        <div className="mx-2 h-4 w-px bg-zinc-800" />

        {/* Select / deselect all visible */}
        <button
          onClick={onSelectAll}
          className="rounded-lg px-2.5 py-1 text-xs text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          {allSelected ? "Deselect all" : `Select all ${totalVisible}`}
        </button>

        <div className="mx-1 h-4 w-px bg-zinc-800" />

        {/* Save all */}
        <button
          onClick={onSaveAll}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-blue-400 transition-colors hover:bg-blue-950/60 hover:text-blue-300"
        >
          Save all
        </button>

        {/* Star all */}
        <button
          onClick={onStarAll}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-amber-400 transition-colors hover:bg-amber-950/60 hover:text-amber-300"
        >
          Star all
        </button>

        {/* Skip all */}
        <button
          onClick={onSkipAll}
          className="rounded-lg px-2.5 py-1 text-xs font-medium text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-zinc-200"
        >
          Skip all
        </button>

        {/* Assign to collection */}
        {collections.length > 0 && (
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setShowCollections(!showCollections)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium text-emerald-400 transition-colors hover:bg-emerald-950/60 hover:text-emerald-300"
            >
              Add to collection
              <svg
                className={`h-3 w-3 transition-transform ${showCollections ? "rotate-180" : ""}`}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </button>
            {showCollections && (
              <div className="absolute bottom-full left-0 mb-2 min-w-40 overflow-hidden rounded-xl border border-zinc-700 bg-zinc-900 py-1 shadow-2xl shadow-black/50">
                {collections.map((col) => (
                  <button
                    key={col.id}
                    onClick={() => {
                      onAssignCollection(col.id);
                      setShowCollections(false);
                    }}
                    className="flex w-full items-center px-3 py-2 text-left text-xs text-zinc-300 transition-colors hover:bg-zinc-800 hover:text-zinc-100"
                  >
                    <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500/60" />
                    {col.name}
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        <div className="mx-1 h-4 w-px bg-zinc-800" />

        {/* Clear selection */}
        <button
          onClick={onClearSelection}
          title="Clear selection (Escape)"
          className="flex h-6 w-6 items-center justify-center rounded-lg text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
