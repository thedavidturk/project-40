"use client";

import { useState } from "react";
import type { FeedItem, ItemState, PillarId } from "@/lib/types";
import { PILLARS } from "@/lib/constants";
import { ItemCard } from "./ItemCard";

interface PillarSectionProps {
  pillarId: PillarId;
  items: FeedItem[];
  itemStates: Record<string, ItemState>;
  onSave: (id: string) => void;
  onStar: (id: string) => void;
  onSkip: (id: string) => void;
}

export function PillarSection({
  pillarId,
  items,
  itemStates,
  onSave,
  onStar,
  onSkip,
}: PillarSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const pillar = PILLARS[pillarId];

  if (items.length === 0) return null;

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
        <span className="ml-auto text-xs text-zinc-600">
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
              onSave={() => onSave(item.id)}
              onStar={() => onStar(item.id)}
              onSkip={() => onSkip(item.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
}
