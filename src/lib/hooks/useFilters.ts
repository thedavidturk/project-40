"use client";

import { useMemo, useState } from "react";
import type { FeedItem, FilterState, ItemState } from "@/lib/types";
import { HIGH_SIGNAL_THRESHOLD } from "@/lib/constants";

const TIME_RANGES: Record<FilterState["timeRange"], number> = {
  "1h": 1 * 60 * 60 * 1000,
  "6h": 6 * 60 * 60 * 1000,
  "24h": 24 * 60 * 60 * 1000,
  "7d": 7 * 24 * 60 * 60 * 1000,
  "30d": 30 * 24 * 60 * 60 * 1000,
  all: Infinity,
};

export function useFilters(
  items: FeedItem[],
  itemStates: Record<string, ItemState>
) {
  const [filters, setFilters] = useState<FilterState>({
    pillars: [],
    types: [],
    timeRange: "24h",
    highSignalOnly: false,
    newOnly: false,
    search: "",
  });

  const filteredItems = useMemo(() => {
    const now = Date.now();
    const maxAge = TIME_RANGES[filters.timeRange];
    const searchLower = filters.search.toLowerCase();

    return items.filter((item) => {
      // Skip skipped items
      const state = itemStates[item.id];
      if (state?.skipped) return false;

      // New only filter
      if (filters.newOnly && state?.seen) return false;

      // Pillar filter
      if (filters.pillars.length > 0 && !filters.pillars.includes(item.pillar))
        return false;

      // Type filter
      if (filters.types.length > 0 && !filters.types.includes(item.type))
        return false;

      // Time range
      if (maxAge !== Infinity) {
        const age = now - new Date(item.publishedAt).getTime();
        if (age > maxAge) return false;
      }

      // High signal
      if (filters.highSignalOnly && item.score < HIGH_SIGNAL_THRESHOLD)
        return false;

      // Search
      if (searchLower) {
        const text =
          `${item.title} ${item.summary} ${item.tags.join(" ")}`.toLowerCase();
        if (!text.includes(searchLower)) return false;
      }

      return true;
    });
  }, [items, itemStates, filters]);

  return { filters, setFilters, filteredItems };
}
