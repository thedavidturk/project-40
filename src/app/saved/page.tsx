"use client";

import { useState, useMemo } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useDraggable,
  useSensor,
  useSensors,
  closestCenter,
  type DragEndEvent,
  type DragOverEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { useAppData } from "@/lib/hooks/useAppData";
import { CollectionManager } from "@/components/CollectionManager";
import { ItemCard } from "@/components/ItemCard";

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

function DraggableItemWrapper({
  id,
  children,
}: {
  id: string;
  children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id,
    data: { type: "item" },
  });

  return (
    <div
      ref={setNodeRef}
      className={`flex items-start gap-1 transition-opacity ${isDragging ? "opacity-40" : ""}`}
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-2 cursor-grab p-1 text-zinc-700 hover:text-zinc-400 active:cursor-grabbing"
        title="Drag to assign to a collection"
      >
        <GripIcon />
      </div>
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}

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
    reorderCollections,
    toggleItemCollection,
  } = useAppData();

  const [selectedCollection, setSelectedCollection] = useState<string | null>(
    null
  );
  const [dropTargetId, setDropTargetId] = useState<string | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeType, setActiveType] = useState<"item" | "collection" | null>(
    null
  );

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } })
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

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id as string);
    setActiveType(event.active.data.current?.type ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (
      active.data.current?.type === "item" &&
      over?.data.current?.type === "collection"
    ) {
      setDropTargetId(over.id as string);
    } else {
      setDropTargetId(null);
    }
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setDropTargetId(null);
    setActiveId(null);
    setActiveType(null);

    if (!over || active.id === over.id) return;

    const fromType = active.data.current?.type;
    const toType = over.data.current?.type;

    if (fromType === "collection" && toType === "collection") {
      const ids = data.collections.map((c) => c.id);
      const oldIndex = ids.indexOf(active.id as string);
      const newIndex = ids.indexOf(over.id as string);
      if (oldIndex !== -1 && newIndex !== -1) {
        reorderCollections(arrayMove(ids, oldIndex, newIndex));
      }
    } else if (fromType === "item" && toType === "collection") {
      const itemId = active.id as string;
      const collectionId = over.id as string;
      const alreadyIn =
        data.itemStates[itemId]?.collections.includes(collectionId) ?? false;
      if (!alreadyIn) {
        toggleItemCollection(itemId, collectionId);
      }
    }
  }

  const activeItemTitle =
    activeType === "item"
      ? (data.items[activeId ?? ""]?.title ?? null)
      : null;
  const activeCollectionName =
    activeType === "collection"
      ? (data.collections.find((c) => c.id === activeId)?.name ?? null)
      : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
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
              dropTargetId={dropTargetId}
            />
          </div>

          {/* Items */}
          <div className="flex-1 space-y-2">
            {data.collections.length > 0 && savedItems.length > 0 && (
              <p className="text-xs text-zinc-600">
                Drag items to a collection in the sidebar to assign them.
              </p>
            )}
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
                <DraggableItemWrapper key={item.id} id={item.id}>
                  <div className="space-y-1">
                    <ItemCard
                      item={item}
                      state={data.itemStates[item.id]}
                      onSave={() => handleSave(item.id)}
                      onStar={() => handleStar(item.id)}
                      onSkip={() => skipItem(item.id)}
                    />
                    {/* Collection assign pills */}
                    {data.collections.length > 0 && (
                      <div className="flex flex-wrap gap-1 pl-2">
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
                </DraggableItemWrapper>
              ))
            )}
          </div>
        </div>
      </div>

      <DragOverlay dropAnimation={null}>
        {activeType === "item" && activeItemTitle && (
          <div className="max-w-sm rounded-md border border-zinc-600 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 shadow-2xl ring-1 ring-white/10">
            {activeItemTitle}
          </div>
        )}
        {activeType === "collection" && activeCollectionName && (
          <div className="rounded-md border border-zinc-600 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-200 shadow-2xl ring-1 ring-white/10">
            {activeCollectionName}
          </div>
        )}
      </DragOverlay>
    </DndContext>
  );
}
