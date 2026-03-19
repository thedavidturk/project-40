"use client";

import { formatDistanceToNow } from "date-fns";
import type { AppData, FeedItem, PillarId } from "@/lib/types";
import { PILLARS } from "@/lib/constants";

interface DailyBriefingProps {
  data: AppData;
  items: FeedItem[];
  onSave: (id: string) => void;
  onMarkSeen: (id: string) => void;
  onTouchLastChecked: () => void;
}

export function DailyBriefing({
  data,
  items,
  onSave,
  onMarkSeen,
  onTouchLastChecked,
}: DailyBriefingProps) {
  // Top 8 items from last 24h by score
  const now = Date.now();
  const last24h = items.filter(
    (item) => now - new Date(item.publishedAt).getTime() < 24 * 60 * 60 * 1000
  );
  const topPicks = last24h
    .sort((a, b) => b.score - a.score)
    .slice(0, 8);

  // Pillar stats
  const pillarStats = (Object.keys(PILLARS) as PillarId[]).map((pillarId) => {
    const pillarItems = last24h.filter((item) => item.pillar === pillarId);
    const newSinceCheck = data.lastCheckedAt
      ? pillarItems.filter(
          (item) =>
            new Date(item.fetchedAt).getTime() >
            new Date(data.lastCheckedAt!).getTime()
        ).length
      : pillarItems.length;
    return {
      pillarId,
      total: pillarItems.length,
      newCount: newSinceCheck,
    };
  });

  const lastChecked = data.lastCheckedAt
    ? formatDistanceToNow(new Date(data.lastCheckedAt), { addSuffix: true })
    : "Never";

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 space-y-4">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-sm font-bold text-zinc-100">
          Today&apos;s Top Picks
        </h2>
        <div className="flex items-center gap-3">
          <span className="text-xs text-zinc-500">
            Last checked: {lastChecked}
          </span>
          <button
            onClick={onTouchLastChecked}
            className="rounded-md bg-zinc-800 px-2.5 py-1 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
          >
            Mark as Checked
          </button>
        </div>
      </div>

      {/* Pillar stats bar */}
      <div className="flex flex-wrap gap-3">
        {pillarStats.map(({ pillarId, total, newCount }) => {
          const pillar = PILLARS[pillarId];
          return (
            <div
              key={pillarId}
              className="flex items-center gap-1.5 text-xs"
            >
              <div
                className="h-2 w-2 rounded-sm"
                style={{ backgroundColor: pillar.color }}
              />
              <span className="text-zinc-400">
                {pillar.label}: {total}
              </span>
              {newCount > 0 && (
                <span
                  className="rounded-full px-1.5 py-0.5 text-[10px] font-bold text-white"
                  style={{ backgroundColor: pillar.color }}
                >
                  {newCount} new
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Top picks list */}
      {topPicks.length === 0 ? (
        <p className="text-xs text-zinc-500">No items from the last 24 hours.</p>
      ) : (
        <div className="space-y-1">
          {topPicks.map((item) => {
            const pillar = PILLARS[item.pillar];
            const isSaved = data.itemStates[item.id]?.saved ?? false;
            return (
              <div
                key={item.id}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 transition-colors hover:bg-zinc-800/50"
              >
                <div
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: pillar.color }}
                />
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => onMarkSeen(item.id)}
                  className="min-w-0 flex-1 truncate text-xs font-medium text-zinc-200 hover:text-white"
                >
                  {item.title}
                </a>
                <span
                  className={`shrink-0 rounded-full px-1.5 py-0.5 text-[10px] font-bold ${
                    item.score >= 70
                      ? "bg-emerald-900/50 text-emerald-400"
                      : item.score >= 40
                        ? "bg-amber-900/50 text-amber-400"
                        : "bg-zinc-800 text-zinc-500"
                  }`}
                >
                  {item.score}
                </span>
                <button
                  onClick={() => onSave(item.id)}
                  className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium transition-colors ${
                    isSaved
                      ? "bg-blue-900/50 text-blue-400"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
