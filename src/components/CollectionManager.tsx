"use client";

import { useState } from "react";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import type { Collection } from "@/lib/types";

function GripIcon() {
  return (
    <svg
      width="10"
      height="14"
      viewBox="0 0 10 14"
      fill="currentColor"
      className="shrink-0"
    >
      <circle cx="2" cy="2" r="1.5" />
      <circle cx="8" cy="2" r="1.5" />
      <circle cx="2" cy="7" r="1.5" />
      <circle cx="8" cy="7" r="1.5" />
      <circle cx="2" cy="12" r="1.5" />
      <circle cx="8" cy="12" r="1.5" />
    </svg>
  );
}

function SortableCollectionItem({
  col,
  isSelected,
  isDropTarget,
  onSelect,
  onRemove,
}: {
  col: Collection;
  isSelected: boolean;
  isDropTarget: boolean;
  onSelect: () => void;
  onRemove: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: col.id, data: { type: "collection" } });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`flex items-center gap-0.5 rounded-md transition-colors ${
        isDragging ? "opacity-40" : ""
      } ${
        isDropTarget
          ? "ring-1 ring-blue-500/60 bg-blue-950/40"
          : ""
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab p-1 text-zinc-700 hover:text-zinc-400 active:cursor-grabbing"
        title="Drag to reorder"
      >
        <GripIcon />
      </div>
      <button
        onClick={onSelect}
        className={`flex-1 rounded-md px-2 py-1.5 text-left text-sm transition-colors ${
          isSelected
            ? "bg-zinc-800 text-white"
            : isDropTarget
            ? "text-blue-300"
            : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
        }`}
      >
        {col.name}
      </button>
      <button
        onClick={onRemove}
        className="p-1 text-xs text-zinc-600 transition-colors hover:text-red-400"
      >
        &times;
      </button>
    </div>
  );
}

interface CollectionManagerProps {
  collections: Collection[];
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  onAdd: (name: string) => void;
  onRemove: (id: string) => void;
  dropTargetId?: string | null;
}

export function CollectionManager({
  collections,
  selectedId,
  onSelect,
  onAdd,
  onRemove,
  dropTargetId,
}: CollectionManagerProps) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd(name.trim());
    setName("");
  };

  return (
    <div className="space-y-1">
      <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-zinc-500">
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

      <SortableContext
        items={collections.map((c) => c.id)}
        strategy={verticalListSortingStrategy}
      >
        {collections.map((col) => (
          <SortableCollectionItem
            key={col.id}
            col={col}
            isSelected={selectedId === col.id}
            isDropTarget={dropTargetId === col.id}
            onSelect={() => onSelect(col.id)}
            onRemove={() => onRemove(col.id)}
          />
        ))}
      </SortableContext>

      <div className="mt-3 flex gap-1">
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
