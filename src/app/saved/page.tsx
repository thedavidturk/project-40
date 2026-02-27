"use client";

import { useState, useMemo } from "react";
import { useAppData } from "@/lib/hooks/useAppData";
import { CollectionManager } from "@/components/CollectionManager";
import { ItemCard } from "@/components/ItemCard";

export default function SavedPage() {
  const {
    data,
    items,
    saveItem,
    unsaveItem,
    starItem,
    unstarItem,
    skipItem,
    addCollection,
    removeCollection,
    toggleItemCollection,
  } = useAppData();

  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );

  const savedItems = useMemo(() => {
    return items.filter((item) => {
      const state = data.itemStates[item.id];
      if (!state?.saved && !state?.starred) return false;
      if (selectedCollection) {
        return state.collections.includes(selectedCollection);
      }
      return true;
    });
  }, [items, data.itemStates, selectedCollection]);

  const handleSave = (id: string) => {
    data.itemStates[id]?.saved ? unsaveItem(id) : saveItem(id);
  };

  const handleStar = (id: string) => {
    data.itemStates[id]?.starred ? unstarItem(id) : starItem(id);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Saved Items</h1>

      <div className="flex flex-col gap-6 sm:flex-row">
        {/* Sidebar */}
        <div className="w-full shrink-0 sm:w-48">
          <CollectionManager
            collections={data.collections}
            selectedId={selectedCollection}
            onSelect={setSelectedCollection}
            onAdd={addCollection}
            onRemove={removeCollection}
          />
        </div>

        {/* Items */}
        <div className="flex-1 space-y-2">
          {savedItems.length === 0 ? (
            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
              <p className="text-sm text-zinc-500">
                {selectedCollection
                  ? "No items in this collection yet."
                  : "No saved items yet. Save items from the dashboard."}
              </p>
            </div>
          ) : (
            savedItems.map((item) => (
              <div key={item.id} className="space-y-1">
                <ItemCard
                  item={item}
                  state={data.itemStates[item.id]}
                  onSave={() => handleSave(item.id)}
                  onStar={() => handleStar(item.id)}
                  onSkip={() => skipItem(item.id)}
                />
                {/* Collection assign */}
                {data.collections.length > 0 && (
                  <div className="flex gap-1 pl-4">
                    {data.collections.map((col) => {
                      const inCol =
                        data.itemStates[item.id]?.collections.includes(
                          col.id
                        ) ?? false;
                      return (
                        <button
                          key={col.id}
                          onClick={() =>
                            toggleItemCollection(item.id, col.id)
                          }
                          className={`rounded px-2 py-0.5 text-[10px] font-medium transition-colors ${
                            inCol
                              ? "bg-blue-900/50 text-blue-400"
                              : "bg-zinc-800 text-zinc-500 hover:text-zinc-300"
                          }`}
                        >
                          {col.name}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
