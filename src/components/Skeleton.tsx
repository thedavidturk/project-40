"use client";

export function Skeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="animate-pulse rounded-lg border border-zinc-800 bg-zinc-900/50 p-4"
        >
          <div className="flex gap-3">
            <div className="h-full w-1 rounded-full bg-zinc-800" />
            <div className="flex-1 space-y-2">
              <div className="flex gap-2">
                <div className="h-3 w-20 rounded bg-zinc-800" />
                <div className="h-3 w-12 rounded bg-zinc-800" />
                <div className="h-3 w-16 rounded bg-zinc-800" />
              </div>
              <div className="h-4 w-3/4 rounded bg-zinc-800" />
              <div className="h-3 w-full rounded bg-zinc-800" />
              <div className="flex gap-1">
                <div className="h-4 w-12 rounded bg-zinc-800" />
                <div className="h-4 w-14 rounded bg-zinc-800" />
                <div className="h-4 w-10 rounded bg-zinc-800" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
