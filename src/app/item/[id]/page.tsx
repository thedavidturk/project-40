"use client";

import { use, useState, useEffect } from "react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import { useAppData } from "@/lib/hooks/useAppData";
import { PILLARS, CONTENT_TYPE_LABELS } from "@/lib/constants";

export default function ItemDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const {
    data,
    saveItem,
    unsaveItem,
    starItem,
    unstarItem,
    setNote,
    markSeen,
    setTakeaway,
  } = useAppData();

  const item = data.items[id];
  const state = data.itemStates[id];

  const [noteText, setNoteText] = useState(state?.note ?? "");
  const [takeawayText, setTakeawayText] = useState(state?.takeaway ?? "");

  useEffect(() => {
    setNoteText(state?.note ?? "");
  }, [state?.note]);

  useEffect(() => {
    setTakeawayText(state?.takeaway ?? "");
  }, [state?.takeaway]);

  // Auto-mark seen when visiting item detail
  useEffect(() => {
    if (item && !(state?.seen)) {
      markSeen(id);
    }
  }, [id, item, state?.seen, markSeen]);

  if (!item) {
    return (
      <div className="space-y-4">
        <Link
          href="/"
          className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
        >
          &larr; Back
        </Link>
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-sm text-zinc-500">Item not found.</p>
        </div>
      </div>
    );
  }

  const pillar = PILLARS[item.pillar];
  const isSaved = state?.saved ?? false;
  const isStarred = state?.starred ?? false;

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link
        href="/"
        className="text-sm text-zinc-500 transition-colors hover:text-zinc-300"
      >
        &larr; Back to Dashboard
      </Link>

      <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-6">
        {/* Header */}
        <div className="mb-4 flex items-start gap-3">
          <div
            className="mt-1 h-4 w-1 rounded-full"
            style={{ backgroundColor: pillar.color }}
          />
          <div className="flex-1">
            <div className="mb-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-zinc-500">
              <span style={{ color: pillar.color }}>{pillar.label}</span>
              <span>&middot;</span>
              <span>{item.sourceName}</span>
              <span>&middot;</span>
              <span>{CONTENT_TYPE_LABELS[item.type]}</span>
              <span>&middot;</span>
              <span>
                {formatDistanceToNow(new Date(item.publishedAt), {
                  addSuffix: true,
                })}
              </span>
            </div>
            <h1 className="text-lg font-bold text-white">{item.title}</h1>
          </div>
        </div>

        {/* Score breakdown */}
        <div className="mb-4 flex items-center gap-3 rounded-md bg-zinc-800 p-3">
          <span className="text-xs font-medium text-zinc-400">
            Signal Score
          </span>
          <span
            className={`rounded-full px-3 py-1 text-sm font-bold ${
              item.score >= 70
                ? "bg-emerald-900/50 text-emerald-400"
                : item.score >= 40
                  ? "bg-amber-900/50 text-amber-400"
                  : "bg-zinc-700 text-zinc-400"
            }`}
          >
            {item.score}/100
          </span>
        </div>

        {/* Summary */}
        {item.summary && (
          <p className="mb-4 text-sm leading-relaxed text-zinc-300">
            {item.summary}
          </p>
        )}

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className="rounded bg-zinc-800 px-2 py-0.5 text-xs font-medium text-zinc-400"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Actions */}
        <div className="mb-6 flex flex-wrap gap-2">
          <button
            onClick={() => (isSaved ? unsaveItem(id) : saveItem(id))}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isSaved
                ? "bg-blue-900/50 text-blue-400"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isSaved ? "Saved" : "Save"}
          </button>
          <button
            onClick={() => (isStarred ? unstarItem(id) : starItem(id))}
            className={`rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${
              isStarred
                ? "bg-amber-900/50 text-amber-400"
                : "bg-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            {isStarred ? "Starred" : "Star"}
          </button>
          <a
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => markSeen(id)}
            className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-400 transition-colors hover:text-zinc-200"
          >
            Open Original
          </a>
        </div>

        {/* Takeaway */}
        <div className="mb-4">
          <label className="mb-2 block text-xs font-medium text-zinc-500">
            Takeaway
          </label>
          <input
            type="text"
            value={takeawayText}
            onChange={(e) => setTakeawayText(e.target.value)}
            onBlur={() => setTakeaway(id, takeawayText.trim())}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                setTakeaway(id, takeawayText.trim());
                (e.target as HTMLInputElement).blur();
              }
            }}
            placeholder="One-line takeaway..."
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
          />
        </div>

        {/* Notes */}
        <div>
          <label className="mb-2 block text-xs font-medium text-zinc-500">
            Notes
          </label>
          <textarea
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            onBlur={() => setNote(id, noteText)}
            rows={4}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-zinc-500"
            placeholder="Add your notes about this item..."
          />
        </div>
      </div>
    </div>
  );
}
