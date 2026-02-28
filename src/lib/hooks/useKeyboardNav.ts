"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";
import type { FeedItem } from "@/lib/types";

interface UseKeyboardNavOptions {
  items: FeedItem[];
  onSave: (id: string) => void;
  onStar: (id: string) => void;
  onSkip: (id: string) => void;
  onOpen: (id: string) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
}

export function useKeyboardNav({
  items,
  onSave,
  onStar,
  onSkip,
  onOpen,
  searchInputRef,
}: UseKeyboardNavOptions) {
  const [activeIndex, setActiveIndex] = useState<number>(-1);

  // Reset active index when items change
  useEffect(() => {
    setActiveIndex(-1);
  }, [items.length]);

  const activeItemId = activeIndex >= 0 && activeIndex < items.length
    ? items[activeIndex].id
    : null;

  const scrollToItem = useCallback((index: number) => {
    if (index < 0 || index >= items.length) return;
    const id = items[index].id;
    const el = document.querySelector(`[data-item-id="${id}"]`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [items]);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ignore when typing in input/textarea/contenteditable
      const target = e.target as HTMLElement;
      if (
        target.tagName === "INPUT" ||
        target.tagName === "TEXTAREA" ||
        target.tagName === "SELECT" ||
        target.isContentEditable
      ) {
        return;
      }

      switch (e.key) {
        case "j": {
          e.preventDefault();
          const next = Math.min(activeIndex + 1, items.length - 1);
          setActiveIndex(next);
          scrollToItem(next);
          break;
        }
        case "k": {
          e.preventDefault();
          const prev = Math.max(activeIndex - 1, 0);
          setActiveIndex(prev);
          scrollToItem(prev);
          break;
        }
        case "s": {
          e.preventDefault();
          if (activeItemId) onSave(activeItemId);
          break;
        }
        case "t": {
          e.preventDefault();
          if (activeItemId) onStar(activeItemId);
          break;
        }
        case "x": {
          e.preventDefault();
          if (activeItemId) onSkip(activeItemId);
          break;
        }
        case "o": {
          e.preventDefault();
          if (activeItemId) onOpen(activeItemId);
          break;
        }
        case "/": {
          e.preventDefault();
          searchInputRef.current?.focus();
          break;
        }
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [activeIndex, activeItemId, items, onSave, onStar, onSkip, onOpen, searchInputRef, scrollToItem]);

  return { activeIndex, activeItemId, setActiveIndex };
}
