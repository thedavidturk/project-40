"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AppData, FeedItem, Source, ItemState } from "@/lib/types";
import {
  loadData,
  saveData,
  isCacheStale,
  mergeItems,
  updateItemState as updateItemStateFn,
  addCollection as addCollectionFn,
  removeCollection as removeCollectionFn,
  reorderCollections as reorderCollectionsFn,
  pruneOldItems,
  defaultData,
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
  // Start with defaults to avoid hydration mismatch, then load from localStorage in useEffect
  const [data, setData] = useState<AppData>(defaultData);
  const [hydrated, setHydrated] = useState(false);
  const [isFetching, setIsFetching] = useState(false);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Hydrate from localStorage after mount
  useEffect(() => {
    const stored = loadData();
    // Initialize lastCheckedAt on first ever hydration
    if (!stored.lastCheckedAt) {
      stored.lastCheckedAt = new Date().toISOString();
    }
    setData(stored);
    setHydrated(true);
  }, []);

  // Persist to localStorage on change (skip the initial default)
  useEffect(() => {
    if (hydrated) {
      saveData(data);
    }
  }, [data, hydrated]);

  // Fetch feeds when cache is stale
  useEffect(() => {
    if (!hydrated) return;
    if (!isCacheStale(dataRef.current)) return;

    let cancelled = false;
    setIsFetching(true);

    fetchIngest(dataRef.current.sources)
      .then((newItems) => {
        if (cancelled) return;
        setData((prev) => {
          const merged = mergeItems(prev, newItems);
          return pruneOldItems(merged);
        });
      })
      .catch((err) => {
        console.error("Feed fetch failed:", err);
      })
      .finally(() => {
        if (!cancelled) setIsFetching(false);
      });

    return () => {
      cancelled = true;
    };
  }, [hydrated]);

  const refreshFeeds = useCallback(() => {
    const current = dataRef.current;
    setIsFetching(true);

    fetchIngest(current.sources)
      .then((newItems) => {
        setData((prev) => {
          const merged = mergeItems(prev, newItems);
          return pruneOldItems(merged);
        });
      })
      .catch((err) => {
        console.error("Feed refresh failed:", err);
      })
      .finally(() => {
        setIsFetching(false);
      });
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

  const markSeen = useCallback(
    (itemId: string) => updateItemState(itemId, { seen: true }),
    [updateItemState]
  );

  const setTakeaway = useCallback(
    (itemId: string, takeaway: string) => updateItemState(itemId, { takeaway }),
    [updateItemState]
  );

  const touchLastChecked = useCallback(() => {
    setData((prev) => ({ ...prev, lastCheckedAt: new Date().toISOString() }));
  }, []);

  const toggleItemCollection = useCallback(
    (itemId: string, collectionId: string) => {
      setData((prev) => {
        const state = prev.itemStates[itemId] ?? {
          saved: false,
          starred: false,
          skipped: false,
          seen: false,
          note: "",
          takeaway: "",
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

  const reorderCollections = useCallback((orderedIds: string[]) => {
    setData((prev) => reorderCollectionsFn(prev, orderedIds));
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
    isLoading: !hydrated,
    isFetching,
    refreshFeeds,
    saveItem,
    unsaveItem,
    starItem,
    unstarItem,
    skipItem,
    setNote,
    markSeen,
    setTakeaway,
    touchLastChecked,
    toggleItemCollection,
    addCollection,
    removeCollection,
    reorderCollections,
    updateSource,
    addSource,
    removeSource,
    updateItemState,
  };
}
