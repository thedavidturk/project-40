"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import type { FeedItem, ItemState } from "@/lib/types";
import { PILLARS, CONTENT_TYPE_LABELS } from "@/lib/constants";

interface ItemCardProps {
  item: FeedItem;
  state: ItemState | undefined;
  isActive?: boolean;
  isSelected?: boolean;
  selectionVisible?: boolean;
  onToggleSelect?: () => void;
  onSave: () => void;
  onStar: () => void;
  onSkip: () => void;
  onMarkSeen?: () => void;
  onSetTakeaway?: (text: string) => void;
}

export function ItemCard({
  item,
  state,
  isActive,
  isSelected,
  selectionVisible,
  onToggleSelect,
  onSave,
  onStar,
  onSkip,
  onMarkSeen,
  onSetTakeaway,
}: ItemCardProps) {
  const pillar = PILLARS[item.pillar];
  const isSaved = state?.saved ?? false;
  const isStarred = state?.starred ?? false;
  const isSeen = state?.seen ?? false;
  const takeaway = state?.takeaway ?? "";
  const [takeawayInput, setTakeawayInput] = useState(takeaway);
  const [showTakeawayInput, setShowTakeawayInput] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const freshness = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
  });

  const handleTitleClick = () => {
    onMarkSeen?.();
  };

  const handleTakeawaySubmit = () => {
    const trimmed = takeawayInput.trim();
    onSetTakeaway?.(trimmed);
    if (!trimmed) setShowTakeawayInput(false);
  };

  const togglePreview = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setShowPreview((v) => !v);
  };

  return (
    <div
      data-item-id={item.id}
      className={`group relative flex gap-3 rounded-lg border p-4 transition-colors ${
        isSelected
          ? "border-zinc-600 bg-zinc-800/60 ring-1 ring-zinc-600/50"
          : isActive
            ? "border-zinc-500 bg-zinc-900/50 ring-1 ring-zinc-500"
            : "border-zinc-800 bg-zinc-900/50 hover:border-zinc-700"
      }`}
    >
      {/* Checkbox — visible on hover or when selection mode is active */}
      {onToggleSelect && (
        <div className="flex shrink-0 items-start pt-0.5">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleSelect();
            }}
            className={`flex h-4 w-4 items-center justify-center rounded border transition-all ${
              isSelected
                ? "border-zinc-400 bg-zinc-400"
                : selectionVisible
                  ? "border-zinc-600 bg-transparent hover:border-zinc-400"
                  : "border-zinc-700 bg-transparent opacity-0 group-hover:opacity-100 hover:border-zinc-500"
            }`}
            aria-label={isSelected ? "Deselect item" : "Select item"}
          >
            {isSelected && (
              <svg className="h-2.5 w-2.5 text-zinc-900" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
        </div>
      )}

      {/* Pillar color stripe — wider + dot for unseen */}
      <div className="relative flex shrink-0 flex-col items-center">
        <div
          className={`rounded-full ${isSeen ? "w-1" : "w-1.5"}`}
          style={{
            backgroundColor: pillar.color,
            height: "100%",
            opacity: isSeen ? 0.4 : 1,
          }}
        />
        {!isSeen && (
          <div
            className="absolute -top-1 h-2 w-2 rounded-full"
            style={{ backgroundColor: pillar.color }}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        {/* Top row: source + type + time */}
        <div className="mb-1 flex items-center gap-2 text-xs text-zinc-500">
          <span className="font-medium" style={{ color: pillar.color }}>
            {item.sourceName}
          </span>
          <span>&middot;</span>
          <span>{CONTENT_TYPE_LABELS[item.type]}</span>
          <span>&middot;</span>
          <span>{freshness}</span>
        </div>

        {/* Title — links to the original source */}
        <a
          href={item.url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={handleTitleClick}
          className={`mb-1 block text-sm font-semibold leading-snug underline underline-offset-2 ${
            isSeen
              ? "text-zinc-400 decoration-zinc-700 hover:text-zinc-300 hover:decoration-zinc-600"
              : "text-zinc-100 decoration-zinc-700 hover:text-white hover:decoration-zinc-500"
          }`}
        >
          {item.title}
        </a>

        {/* Summary (collapsed: 2-line clamp) + expand toggle */}
        {item.summary && (
          <div className="mb-2">
            <p className="line-clamp-2 text-xs leading-relaxed text-zinc-400">
              {item.summary}
            </p>
            <button
              onClick={togglePreview}
              className="mt-1 flex items-center gap-1 text-[10px] text-zinc-600 transition-colors hover:text-zinc-400"
            >
              <span
                className="inline-block transition-transform duration-200"
                style={{ transform: showPreview ? "rotate(90deg)" : "rotate(0deg)" }}
              >
                ▸
              </span>
              {showPreview ? "Collapse preview" : "Expand preview"}
            </button>
          </div>
        )}

        {/* Inline preview panel — smooth expand/collapse via CSS grid */}
        <div
          style={{
            display: "grid",
            gridTemplateRows: showPreview ? "1fr" : "0fr",
            transition: "grid-template-rows 280ms ease",
          }}
        >
          <div className="overflow-hidden">
            <div className="mb-3 mt-1 rounded-lg border border-zinc-800 bg-zinc-950/60 p-3">
              {/* Article image */}
              {item.imageUrl && (
                <div className="mb-3 overflow-hidden rounded-md">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={item.imageUrl}
                    alt=""
                    className="h-40 w-full object-cover"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              )}

              {/* Full description */}
              {item.summary && (
                <p className="mb-3 text-xs leading-relaxed text-zinc-300">
                  {item.summary}
                </p>
              )}

              {/* Read full article CTA */}
              <a
                href={item.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={handleTitleClick}
                className="inline-flex items-center gap-1.5 rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-100 transition-colors hover:border-zinc-600 hover:bg-zinc-700 hover:text-white"
              >
                Read Full Article
                <span className="text-zinc-400">↗</span>
              </a>
            </div>
          </div>
        </div>

        {/* Tags + Score */}
        <div className="flex items-center gap-2">
          <div className="flex flex-wrap gap-1">
            {item.tags.slice(0, 4).map((tag) => (
              <span
                key={tag}
                className="rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400"
              >
                {tag}
              </span>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            {/* Score badge */}
            <span
              className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                item.score >= 70
                  ? "bg-emerald-900/50 text-emerald-400"
                  : item.score >= 40
                    ? "bg-amber-900/50 text-amber-400"
                    : "bg-zinc-800 text-zinc-500"
              }`}
            >
              {item.score}
            </span>
          </div>
        </div>

        {/* Takeaway display / input */}
        {takeaway && !showTakeawayInput ? (
          <div className="mt-2 flex items-center gap-2 rounded bg-zinc-800/70 px-2 py-1">
            <span className="flex-1 text-xs text-zinc-300 italic">
              {takeaway}
            </span>
            <button
              onClick={() => {
                onSetTakeaway?.("");
                setTakeawayInput("");
              }}
              className="text-xs text-zinc-500 hover:text-zinc-300"
              title="Clear takeaway"
            >
              &times;
            </button>
            <button
              onClick={() => setShowTakeawayInput(true)}
              className="text-xs text-zinc-500 hover:text-zinc-300"
              title="Edit takeaway"
            >
              Edit
            </button>
          </div>
        ) : showTakeawayInput || (!takeaway && onSetTakeaway) ? (
          <div className="mt-2">
            <input
              type="text"
              value={takeawayInput}
              onChange={(e) => setTakeawayInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleTakeawaySubmit();
                  setShowTakeawayInput(false);
                }
                if (e.key === "Escape") {
                  setTakeawayInput(takeaway);
                  setShowTakeawayInput(false);
                }
              }}
              onBlur={() => {
                if (showTakeawayInput) {
                  handleTakeawaySubmit();
                  setShowTakeawayInput(false);
                }
              }}
              placeholder="Quick takeaway... (Enter to save)"
              className="w-full rounded border border-zinc-700 bg-zinc-800 px-2 py-1 text-xs text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
            />
          </div>
        ) : null}
      </div>

      {/* Actions — always visible */}
      <div className="flex shrink-0 flex-col gap-1">
        <button
          onClick={onSave}
          title={isSaved ? "Unsave" : "Save"}
          className={`rounded px-2 py-1.5 text-xs transition-colors ${
            isSaved
              ? "bg-blue-900/50 text-blue-400"
              : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          }`}
        >
          {isSaved ? "Saved" : "Save"}
        </button>
        <button
          onClick={onStar}
          title={isStarred ? "Unstar" : "Star"}
          className={`rounded px-2 py-1.5 text-xs transition-colors ${
            isStarred
              ? "bg-amber-900/50 text-amber-400"
              : "text-zinc-500 hover:bg-zinc-800 hover:text-zinc-300"
          }`}
        >
          {isStarred ? "Starred" : "Star"}
        </button>
        <button
          onClick={onSkip}
          title="Skip"
          className="rounded px-2 py-1.5 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
