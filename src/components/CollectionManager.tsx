"use client";

import { useState } from "react";
import type { Collection } from "@/lib/types";

interface CollectionManagerProps {
  collections: Collection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
}

export function CollectionManager({
  collections,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
}: CollectionManagerProps) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  };

  return (
    <div className="space-y-3">
      <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-500">
        Collections
      </h3>

      <button
        onClick={() => onSelect(null)}
        className={`w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
          selectedId === null
            ? "bg-zinc-800 text-white"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
        }`}
      >
        All Saved
      </button>

      {collections.map((col) => (
        <div key={col.id} className="flex items-center gap-1">
          <button
            onClick={() => onSelect(col.id)}
            className={`flex-1 rounded-md px-3 py-1.5 text-left text-sm transition-colors ${
              selectedId === col.id
                ? "bg-zinc-800 text-white"
                : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
            }`}
          >
            {col.name}
          </button>
          <button
            onClick={() => onRemove(col.id)}
            className="p-1 text-xs text-zinc-600 transition-colors hover:text-red-400"
          >
            &times;
          </button>
        </div>
      ))}

      <div className="flex gap-1">
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
          placeholder="New collection..."
          className="flex-1 rounded-md border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
        />
        <button
          onClick={handleAdd}
          className="rounded-md bg-zinc-700 px-2 py-1 text-xs text-zinc-300 transition-colors hover:bg-zinc-600"
        >
          Add
        </button>
      </div>
    </div>
  );
}
