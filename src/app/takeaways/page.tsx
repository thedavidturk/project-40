"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useAppData } from "@/lib/hooks/useAppData";
import { PILLARS } from "@/lib/constants";

export default function TakeawaysPage() {
  const { data, setTakeaway } = useAppData();

  // Collect items with takeaways
  const itemsWithTakeaways = Object.entries(data.itemStates)
    .filter(([, state]) => state.takeaway)
    .map(([id, state]) => {
      const item = data.items[id];
      if (!item) return null;
      return { item, takeaway: state.takeaway };
    })
    .filter(Boolean) as { item: (typeof data.items)[string]; takeaway: string }[];

  // Sort by publishedAt descending then group by date
  itemsWithTakeaways.sort(
    (a, b) =>
      new Date(b.item.publishedAt).getTime() -
      new Date(a.item.publishedAt).getTime()
  );

  const grouped: Record<string, typeof itemsWithTakeaways> = {};
  for (const entry of itemsWithTakeaways) {
    const dateKey = format(new Date(entry.item.publishedAt), "yyyy-MM-dd");
    if (!grouped[dateKey]) grouped[dateKey] = [];
    grouped[dateKey].push(entry);
  }

  const dateKeys = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Takeaways</h1>

      {dateKeys.length === 0 ? (
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-12 text-center">
          <p className="text-sm text-zinc-500">
            No takeaways yet. Add a quick takeaway on any item card to see it
            here.
          </p>
        </div>
      ) : (
        dateKeys.map((dateKey) => (
          <div key={dateKey}>
            <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-zinc-500">
              {format(new Date(dateKey), "EEEE, MMM d, yyyy")}
            </h2>
            <div className="space-y-2">
              {grouped[dateKey].map(({ item, takeaway }) => {
                const pillar = PILLARS[item.pillar];
                return (
                  <div
                    key={item.id}
                    className="flex gap-3 rounded-lg border border-zinc-800 bg-zinc-900/50 p-3"
                  >
                    <div
                      className="w-1 shrink-0 rounded-full"
                      style={{ backgroundColor: pillar.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <Link
                        href={`/item/${item.id}`}
                        className="text-sm font-medium text-zinc-200 hover:text-white"
                      >
                        {item.title}
                      </Link>
                      <p className="mt-1 text-xs text-zinc-300 italic">
                        {takeaway}
                      </p>
                      <div className="mt-1 flex items-center gap-2">
                        <span
                          className="text-[10px] font-medium"
                          style={{ color: pillar.color }}
                        >
                          {pillar.label}
                        </span>
                        <span className="text-[10px] text-zinc-600">
                          {item.sourceName}
                        </span>
                        <button
                          onClick={() => setTakeaway(item.id, "")}
                          className="ml-auto text-[10px] text-zinc-600 hover:text-zinc-400"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
