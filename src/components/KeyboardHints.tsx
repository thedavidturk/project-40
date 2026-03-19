"use client";

import { useState } from "react";

const SHORTCUTS = [
  { key: "j", desc: "Next item" },
  { key: "k", desc: "Previous item" },
  { key: "s", desc: "Save / Unsave" },
  { key: "t", desc: "Star / Unstar" },
  { key: "x", desc: "Skip item" },
  { key: "o", desc: "Open in new tab" },
  { key: "/", desc: "Focus search" },
  { key: "?", desc: "Toggle this help" },
];

export function KeyboardHints() {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* Fixed button — hidden on touch devices where keyboard shortcuts don't apply */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-4 right-4 z-50 hidden h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-sm font-bold text-zinc-400 shadow-lg transition-colors hover:bg-zinc-700 hover:text-zinc-200 sm:flex"
        title="Keyboard shortcuts"
      >
        ?
      </button>

      {/* Overlay */}
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-xs rounded-lg border border-zinc-700 bg-zinc-900 p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="mb-4 text-sm font-bold text-zinc-100">
              Keyboard Shortcuts
            </h3>
            <div className="space-y-2">
              {SHORTCUTS.map(({ key, desc }) => (
                <div key={key} className="flex items-center gap-3">
                  <kbd className="flex h-6 w-6 items-center justify-center rounded bg-zinc-800 text-xs font-mono font-bold text-zinc-300">
                    {key}
                  </kbd>
                  <span className="text-xs text-zinc-400">{desc}</span>
                </div>
              ))}
            </div>
            <button
              onClick={() => setOpen(false)}
              className="mt-4 w-full rounded-md bg-zinc-800 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
