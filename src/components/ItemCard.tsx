"use client";

import { formatDistanceToNow } from "date-fns";
import type { FeedItem, ItemState } from "@/lib/types";
import { PILLARS, CONTENT_TYPE_LABELS } from "@/lib/constants";

interface ItemCardProps {
  item: FeedItem;
  state: ItemState | undefined;
  onSave: () => void;
  onStar: () => void;
  onSkip: () => void;
}

export function ItemCard({ item, state, onSave, onStar, onSkip }: ItemCardProps) {
  const pillar = PILLARS[item.pillar];
  const isSaved = state?.saved ?? false;
  const isStarred = state?.starred ?? false;
  const freshness = formatDistanceToNow(new Date(item.publishedAt), {
    addSuffix: true,
  });

  return (
    <div className="group relative flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 transition-colors hover:border-zinc-700">
      {/* Pillar color stripe */}
      <div
        className="w-1 shrink-0 rounded-full"
        style={{ backgroundColor: pillar.color }}
      />

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
          className="mb-1 block text-sm font-semibold leading-snug text-zinc-100 underline decoration-zinc-700 underline-offset-2 hover:text-white hover:decoration-zinc-500"
        >
          {item.title}
        </a>

        {/* Summary */}
        {item.summary && (
          <p className="mb-2 line-clamp-2 text-xs leading-relaxed text-zinc-400">
            {item.summary}
          </p>
        )}

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
      </div>

      {/* Actions — always visible */}
      <div className="flex shrink-0 flex-col gap-1">
        <button
          onClick={onSave}
          title={isSaved ? "Unsave" : "Save"}
          className={`rounded p-1 text-xs transition-colors ${
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
          className={`rounded p-1 text-xs transition-colors ${
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
          className="rounded p-1 text-xs text-zinc-500 transition-colors hover:bg-zinc-800 hover:text-zinc-300"
        >
          Skip
        </button>
      </div>
    </div>
  );
}
