"use client";

import { useRef, useState, useCallback, useEffect } from "react";
import { useAppData } from "@/lib/hooks/useAppData";
import { useFilters } from "@/lib/hooks/useFilters";
import { useKeyboardNav } from "@/lib/hooks/useKeyboardNav";
import { FilterBar } from "@/components/FilterBar";
import { PillarSection } from "@/components/PillarSection";
import { DailyBriefing } from "@/components/DailyBriefing";
import { BulkActionBar } from "@/components/BulkActionBar";
import { KeyboardHints } from "@/components/KeyboardHints";
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
    markSeen,
    setTakeaway,
    touchLastChecked,
    updateItemState,
  } = useAppData();

  // Bulk selection state
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const { filters, setFilters, filteredItems } = useFilters(
    items,
    data.itemStates
  );

  const searchInputRef = useRef<HTMLInputElement>(null);

  // Bulk selection helpers
  const toggleSelect = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const selectAllVisible = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const allSelected = ids.every((id) => prev.has(id));
      if (allSelected) return new Set();
      return new Set(ids);
    });
  }, []);

  const selectAllInSection = useCallback((ids: string[]) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      const allSelected = ids.every((id) => next.has(id));
      if (allSelected) {
        ids.forEach((id) => next.delete(id));
      } else {
        ids.forEach((id) => next.add(id));
      }
      return next;
    });
  }, []);

  // Bulk actions
  const handleBulkSave = useCallback(() => {
    selectedIds.forEach((id) => saveItem(id));
    clearSelection();
  }, [selectedIds, saveItem, clearSelection]);

  const handleBulkStar = useCallback(() => {
    selectedIds.forEach((id) => starItem(id));
    clearSelection();
  }, [selectedIds, starItem, clearSelection]);

  const handleBulkSkip = useCallback(() => {
    selectedIds.forEach((id) => skipItem(id));
    clearSelection();
  }, [selectedIds, skipItem, clearSelection]);

  const handleBulkAssignCollection = useCallback((collectionId: string) => {
    selectedIds.forEach((id) => {
      const existing = data.itemStates[id]?.collections ?? [];
      if (!existing.includes(collectionId)) {
        updateItemState(id, { saved: true, collections: [...existing, collectionId] });
      }
    });
    clearSelection();
  }, [selectedIds, data.itemStates, updateItemState, clearSelection]);

  // Dismiss selection on Escape
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape" && selectedIds.size > 0) {
        clearSelection();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [selectedIds, clearSelection]);

  // Build flat item list for keyboard nav (same order as rendered)
  const itemsByPillar = PILLAR_ORDER.map((pillarId) => ({
    pillarId,
    items: filteredItems
      .filter((item) => item.pillar === pillarId)
      .sort((a, b) => b.score - a.score),
  }));

  const flatItems = itemsByPillar.flatMap(({ items: pillarItems }) => pillarItems);

  const handleSave = (id: string) => {
    data.itemStates[id]?.saved ? unsaveItem(id) : saveItem(id);
  };

  const handleStar = (id: string) => {
    data.itemStates[id]?.starred ? unstarItem(id) : starItem(id);
  };

  const handleOpen = (id: string) => {
    const item = data.items[id];
    if (item) {
      markSeen(id);
      window.open(item.url, "_blank", "noopener,noreferrer");
    }
  };

  const { activeItemId } = useKeyboardNav({
    items: flatItems,
    onSave: handleSave,
    onStar: handleStar,
    onSkip: skipItem,
    onOpen: handleOpen,
    searchInputRef,
  });

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

      {!isLoading && (
        <DailyBriefing
          data={data}
          items={items}
          onSave={handleSave}
          onMarkSeen={markSeen}
          onTouchLastChecked={touchLastChecked}
        />
      )}

      <FilterBar
        filters={filters}
        onChange={setFilters}
        itemCount={filteredItems.length}
        searchInputRef={searchInputRef}
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
              activeItemId={activeItemId}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onSelectAllInSection={selectAllInSection}
              onSave={handleSave}
              onStar={handleStar}
              onSkip={skipItem}
              onMarkSeen={markSeen}
              onSetTakeaway={setTakeaway}
            />
          ))}
        </div>
      )}

      <KeyboardHints />

      {selectedIds.size > 0 && (
        <BulkActionBar
          selectedCount={selectedIds.size}
          totalVisible={flatItems.length}
          collections={data.collections}
          allSelected={flatItems.every((item) => selectedIds.has(item.id))}
          onSaveAll={handleBulkSave}
          onStarAll={handleBulkStar}
          onSkipAll={handleBulkSkip}
          onAssignCollection={handleBulkAssignCollection}
          onSelectAll={() => selectAllVisible(flatItems.map((i) => i.id))}
          onClearSelection={clearSelection}
        />
      )}
    </div>
  );
}
