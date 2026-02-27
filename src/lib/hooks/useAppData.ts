"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { AppData, FeedItem, Source, ItemState } from "@/lib/types";
import {
  loadData,
  saveData,
  isCacheStale,
  mergeItems,
  updateItemState as updateItemStateFn,
  addCollection as addCollectionFn,
  removeCollection as removeCollectionFn,
  pruneOldItems,
} from "@/lib/storage";

async function fetchIngest(sources: Source[]): Promise<FeedItem[]> {
  const res = await fetch("/api/ingest", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sources }),
  });
  if (!res.ok) throw new Error("Ingest failed");
  const data = await res.json();
  return data.items as FeedItem[];
}

export function useAppData() {
  const [data, setData] = useState<AppData>(() => loadData());
  const dataRef = useRef(data);
  dataRef.current = data;

  // Persist to localStorage on change
  useEffect(() => {
    saveData(data);
  }, [data]);

  const shouldFetch = isCacheStale(data);

  const { isLoading, isFetching } = useQuery({
    queryKey: ["ingest"],
    queryFn: () => fetchIngest(dataRef.current.sources),
    enabled: shouldFetch,
    select: (newItems) => {
      // Merge and update state
      const merged = mergeItems(dataRef.current, newItems);
      const pruned = pruneOldItems(merged);
      setData(pruned);
      return pruned;
    },
  });

  const refreshFeeds = useCallback(() => {
    // Force re-fetch by clearing lastFetchedAt
    setData((prev) => ({ ...prev, lastFetchedAt: null }));
  }, []);

  const updateItemState = useCallback(
    (itemId: string, patch: Partial<ItemState>) => {
      setData((prev) => updateItemStateFn(prev, itemId, patch));
    },
    []
  );

  const saveItem = useCallback(
    (itemId: string) => updateItemState(itemId, { saved: true }),
    [updateItemState]
  );

  const unsaveItem = useCallback(
    (itemId: string) => updateItemState(itemId, { saved: false }),
    [updateItemState]
  );

  const starItem = useCallback(
    (itemId: string) => updateItemState(itemId, { starred: true }),
    [updateItemState]
  );

  const unstarItem = useCallback(
    (itemId: string) =>
      updateItemState(itemId, { starred: false }),
    [updateItemState]
  );

  const skipItem = useCallback(
    (itemId: string) => updateItemState(itemId, { skipped: true }),
    [updateItemState]
  );

  const setNote = useCallback(
    (itemId: string, note: string) => updateItemState(itemId, { note }),
    [updateItemState]
  );

  const toggleItemCollection = useCallback(
    (itemId: string, collectionId: string) => {
      setData((prev) => {
        const state = prev.itemStates[itemId] ?? {
          saved: false,
          starred: false,
          skipped: false,
          note: "",
          collections: [],
        };
        const has = state.collections.includes(collectionId);
        return updateItemStateFn(prev, itemId, {
          collections: has
            ? state.collections.filter((c) => c !== collectionId)
            : [...state.collections, collectionId],
        });
      });
    },
    []
  );

  const addCollection = useCallback((name: string) => {
    setData((prev) => addCollectionFn(prev, name));
  }, []);

  const removeCollection = useCallback((collectionId: string) => {
    setData((prev) => removeCollectionFn(prev, collectionId));
  }, []);

  const updateSource = useCallback((sourceId: string, patch: Partial<Source>) => {
    setData((prev) => ({
      ...prev,
      sources: prev.sources.map((s) =>
        s.id === sourceId ? { ...s, ...patch } : s
      ),
    }));
  }, []);

  const addSource = useCallback((source: Source) => {
    setData((prev) => ({
      ...prev,
      sources: [...prev.sources, source],
    }));
  }, []);

  const removeSource = useCallback((sourceId: string) => {
    setData((prev) => ({
      ...prev,
      sources: prev.sources.filter((s) => s.id !== sourceId),
    }));
  }, []);

  const items = Object.values(data.items);

  return {
    data,
    items,
    isLoading: isLoading && shouldFetch,
    isFetching,
    refreshFeeds,
    saveItem,
    unsaveItem,
    starItem,
    unstarItem,
    skipItem,
    setNote,
    toggleItemCollection,
    addCollection,
    removeCollection,
    updateSource,
    addSource,
    removeSource,
    updateItemState,
  };
}
