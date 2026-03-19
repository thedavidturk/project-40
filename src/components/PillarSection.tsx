"use client";

import { useState } from "react";
import type { FeedItem, ItemState, PillarId } from "@/lib/types";
import { PILLARS } from "@/lib/constants";
import { ItemCard } from "./ItemCard";

interface PillarSectionProps {
  pillarId: PillarId;
  items: FeedItem[];
  itemStates: Record<string, ItemState>;
  activeItemId?: string | null;
  selectedIds?: Set<string>;
  onToggleSelect?: (id: string) => void;
  onSelectAllInSection?: (ids: string[]) => void;
  onSave: (id: string) => void;
  onStar: (id: string) => void;
  onSkip: (id: string) => void;
  onMarkSeen?: (id: string) => void;
  onSetTakeaway?: (id: string, text: string) => void;
}

export function PillarSection({
  pillarId,
  items,
  itemStates,
  activeItemId,
  selectedIds,
  onToggleSelect,
  onSelectAllInSection,
  onSave,
  onStar,
  onSkip,
  onMarkSeen,
  onSetTakeaway,
}: PillarSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pillar = PILLARS[pillarId];

  if (items.length === 0) return null;

  const unseenCount = items.filter(
    (item) => !(itemStates[item.id]?.seen)
  ).length;

  const sectionSelectedCount = selectedIds
    ? items.filter((item) => selectedIds.has(item.id)).length
    : 0;
  const allSectionSelected = sectionSelectedCount === items.length && items.length > 0;
  const selectionVisible = selectedIds ? selectedIds.size > 0 : false;

  return (
    <section>
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="mb-3 flex w-full items-center gap-2 text-left"
      >
        <div
          className="h-3 w-3 rounded-sm"
          style={{ backgroundColor: pillar.color }}
        />
        <h2 className="text-sm font-bold text-zinc-100">{pillar.label}</h2>
        <span className="rounded-full bg-zinc-800 px-2 py-0.5 text-[10px] font-medium text-zinc-400">
          {items.length}
        </span>
        {unseenCount > 0 && (
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-bold text-white"
            style={{ backgroundColor: pillar.color }}
          >
            {unseenCount} new
          </span>
        )}
        {onSelectAllInSection && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onSelectAllInSection(items.map((i) => i.id));
            }}
            className="ml-auto mr-2 rounded px-2 py-0.5 text-[10px] text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
          >
            {allSectionSelected ? `Deselect ${items.length}` : `Select ${items.length}`}
          </button>
        )}
        <span className={`text-xs text-zinc-600 ${onSelectAllInSection ? "" : "ml-auto"}`}>
          {collapsed ? "+" : "−"}
        </span>
      </button>

      {!collapsed && (
        <div className="space-y-2">
          {items.map((item) => (
            <ItemCard
              key={item.id}
              item={item}
              state={itemStates[item.id]}
              isActive={activeItemId === item.id}
              isSelected={selectedIds?.has(item.id)}
              selectionVisible={selectionVisible}
              onToggleSelect={onToggleSelect ? () => onToggleSelect(item.id) : undefined}
              onSave={() => onSave(item.id)}
              onStar={() => onStar(item.id)}
              onSkip={() => onSkip(item.id)}
              onMarkSeen={() => onMarkSeen?.(item.id)}
              onSetTakeaway={(text) => onSetTakeaway?.(item.id, text)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
