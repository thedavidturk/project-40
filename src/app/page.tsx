"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import { useFilters } from "@/lib/hooks/useFilters";
import { FilterBar } from "@/components/FilterBar";
import { PillarSection } from "@/components/PillarSection";
import { Skeleton } from "@/components/Skeleton";
import type { PillarId } from "@/lib/types";

const PILLAR_ORDER: PillarId[] = ["ai-health", "tech-news", "finance-tools"];

export default function DashboardPage() {
  const {
    data,
    items,
    isLoading,
    isFetching,
    refreshFeeds,
    saveItem,
    unsaveItem,
    starItem,
    unstarItem,
    skipItem,
  } = useAppData();

  const { filters, setFilters, filteredItems } = useFilters(
    items,
    data.itemStates
  );

  const itemsByPillar = PILLAR_ORDER.map((pillarId) => ({
    pillarId,
    items: filteredItems
      .filter((item) => item.pillar === pillarId)
      .sort((a, b) => b.score - a.score),
  }));

  const handleSave = (id: string) => {
    data.itemStates[id]?.saved ? unsaveItem(id) : saveItem(id);
  };

  const handleStar = (id: string) => {
    data.itemStates[id]?.starred ? unstarItem(id) : starItem(id);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">Dashboard</h1>
        <button
          onClick={refreshFeeds}
          disabled={isFetching}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700 disabled:opacity-50"
        >
          {isFetching ? "Refreshing..." : "Refresh Feeds"}
        </button>
      </div>

      <FilterBar
        filters={filters}
        onChange={setFilters}
        itemCount={filteredItems.length}
      />

      {isLoading ? (
        <Skeleton count={6} />
      ) : filteredItems.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-sm text-zinc-500">
            {items.length === 0
              ? "No items yet. Feeds will load automatically."
              : "No items match your filters. Try adjusting them."}
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {itemsByPillar.map(({ pillarId, items: pillarItems }) => (
            <PillarSection
              key={pillarId}
              pillarId={pillarId}
              items={pillarItems}
              itemStates={data.itemStates}
              onSave={handleSave}
              onStar={handleStar}
              onSkip={skipItem}
            />
          ))}
        </div>
      )}
    </div>
  );
}
