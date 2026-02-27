import { CACHE_TTL_MS, MAX_STORED_ITEMS, STORAGE_KEY } from "./constants";
import type { AppData, FeedItem, ItemState, Collection } from "./types";
import { SEED_SOURCES } from "./seedSources";

function defaultData(): AppData {
  return {
    sources: [...SEED_SOURCES],
    items: {},
    itemStates: {},
    collections: [],
    lastFetchedAt: null,
  };
}

export function loadData(): AppData {
  if (typeof window === "undefined") return defaultData();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultData();
    const parsed = JSON.parse(raw) as AppData;
    // Ensure seed sources exist
    const existingIds = new Set(parsed.sources.map((s) => s.id));
    for (const seed of SEED_SOURCES) {
      if (!existingIds.has(seed.id)) parsed.sources.push(seed);
    }
    return parsed;
  } catch {
    return defaultData();
  }
}

export function saveData(data: AppData): void {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

export function isCacheStale(data: AppData): boolean {
  if (!data.lastFetchedAt) return true;
  return Date.now() - new Date(data.lastFetchedAt).getTime() > CACHE_TTL_MS;
}

export function mergeItems(existing: AppData, newItems: FeedItem[]): AppData {
  const updated = { ...existing, items: { ...existing.items } };
  for (const item of newItems) {
    updated.items[item.id] = item;
  }
  updated.lastFetchedAt = new Date().toISOString();
  return updated;
}

export function updateItemState(
  data: AppData,
  itemId: string,
  patch: Partial<ItemState>
): AppData {
  const current = data.itemStates[itemId] ?? {
    saved: false,
    starred: false,
    skipped: false,
    note: "",
    collections: [],
  };
  return {
    ...data,
    itemStates: {
      ...data.itemStates,
      [itemId]: { ...current, ...patch },
    },
  };
}

export function addCollection(data: AppData, name: string): AppData {
  const col: Collection = {
    id: crypto.randomUUID(),
    name,
    createdAt: new Date().toISOString(),
  };
  return { ...data, collections: [...data.collections, col] };
}

export function removeCollection(data: AppData, collectionId: string): AppData {
  // Remove collection and references from item states
  const collections = data.collections.filter((c) => c.id !== collectionId);
  const itemStates = { ...data.itemStates };
  for (const [id, state] of Object.entries(itemStates)) {
    if (state.collections.includes(collectionId)) {
      itemStates[id] = {
        ...state,
        collections: state.collections.filter((c) => c !== collectionId),
      };
    }
  }
  return { ...data, collections, itemStates };
}

export function pruneOldItems(data: AppData): AppData {
  const entries = Object.entries(data.items);
  if (entries.length <= MAX_STORED_ITEMS) return data;

  // Keep all saved/starred items, prune oldest unsaved
  const saved = new Set<string>();
  for (const [id, state] of Object.entries(data.itemStates)) {
    if (state.saved || state.starred) saved.add(id);
  }

  const unsaved = entries
    .filter(([id]) => !saved.has(id))
    .sort(
      ([, a], [, b]) =>
        new Date(b.fetchedAt).getTime() - new Date(a.fetchedAt).getTime()
    );

  const keep = entries.filter(([id]) => saved.has(id));
  const remaining = MAX_STORED_ITEMS - keep.length;
  keep.push(...unsaved.slice(0, Math.max(0, remaining)));

  return {
    ...data,
    items: Object.fromEntries(keep),
  };
}
