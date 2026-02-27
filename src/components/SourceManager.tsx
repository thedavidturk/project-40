"use client";

import { useState } from "react";
import type { Source, PillarId, ContentType } from "@/lib/types";
import { PILLARS, CONTENT_TYPE_LABELS } from "@/lib/constants";

interface SourceManagerProps {
  sources: Source[];
  onUpdate: (sourceId: string, patch: Partial<Source>) => void;
  onAdd: (source: Source) => void;
  onRemove: (sourceId: string) => void;
}

export function SourceManager({
  sources,
  onUpdate,
  onAdd,
  onRemove,
}: SourceManagerProps) {
  const [showAdd, setShowAdd] = useState(false);
  const [name, setName] = useState("");
  const [url, setUrl] = useState("");
  const [pillar, setPillar] = useState<PillarId>("ai-health");
  const [type, setType] = useState<ContentType>("article");
  const [error, setError] = useState("");

  const handleAdd = () => {
    if (!name.trim()) return setError("Name is required");
    try {
      new URL(url);
    } catch {
      return setError("Invalid URL");
    }

    onAdd({
      id: crypto.randomUUID(),
      name: name.trim(),
      url,
      pillar,
      type,
      enabled: true,
    });
    setName("");
    setUrl("");
    setError("");
    setShowAdd(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-bold text-zinc-100">
          Sources ({sources.length})
        </h2>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="rounded-md bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 transition-colors hover:bg-zinc-700"
        >
          {showAdd ? "Cancel" : "Add Source"}
        </button>
      </div>

      {showAdd && (
        <div className="space-y-3 rounded-lg border border-zinc-700 bg-zinc-900 p-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Name</label>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                placeholder="e.g. TechCrunch"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                RSS Feed URL
              </label>
              <input
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none focus:border-zinc-500"
                placeholder="https://..."
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">
                Pillar
              </label>
              <select
                value={pillar}
                onChange={(e) => setPillar(e.target.value as PillarId)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none"
              >
                {(Object.entries(PILLARS) as [PillarId, (typeof PILLARS)[PillarId]][]).map(
                  ([id, p]) => (
                    <option key={id} value={id}>
                      {p.label}
                    </option>
                  )
                )}
              </select>
            </div>
            <div>
              <label className="mb-1 block text-xs text-zinc-500">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as ContentType)}
                className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-sm text-zinc-100 outline-none"
              >
                {(
                  Object.entries(CONTENT_TYPE_LABELS) as [ContentType, string][]
                ).map(([t, label]) => (
                  <option key={t} value={t}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {error && <p className="text-xs text-red-400">{error}</p>}
          <button
            onClick={handleAdd}
            className="rounded-md bg-blue-600 px-4 py-1.5 text-xs font-medium text-white transition-colors hover:bg-blue-500"
          >
            Add Source
          </button>
        </div>
      )}

      <div className="overflow-hidden rounded-lg border border-zinc-800">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-zinc-800 bg-zinc-900/50">
            <tr>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500">
                Active
              </th>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500">
                Name
              </th>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500">
                Pillar
              </th>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500">
                Type
              </th>
              <th className="px-4 py-2 text-xs font-medium text-zinc-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {sources.map((source) => (
              <tr
                key={source.id}
                className="transition-colors hover:bg-zinc-900/50"
              >
                <td className="px-4 py-2">
                  <button
                    onClick={() =>
                      onUpdate(source.id, { enabled: !source.enabled })
                    }
                    className={`h-4 w-8 rounded-full transition-colors ${
                      source.enabled ? "bg-emerald-600" : "bg-zinc-700"
                    }`}
                  >
                    <div
                      className={`h-3 w-3 rounded-full bg-white transition-transform ${
                        source.enabled ? "translate-x-4" : "translate-x-0.5"
                      }`}
                    />
                  </button>
                </td>
                <td className="px-4 py-2 text-zinc-100">{source.name}</td>
                <td className="px-4 py-2">
                  <span
                    className="text-xs font-medium"
                    style={{ color: PILLARS[source.pillar].color }}
                  >
                    {PILLARS[source.pillar].label}
                  </span>
                </td>
                <td className="px-4 py-2 text-xs text-zinc-400">
                  {CONTENT_TYPE_LABELS[source.type]}
                </td>
                <td className="px-4 py-2 text-right">
                  {!source.id.startsWith("seed-") && (
                    <button
                      onClick={() => onRemove(source.id)}
                      className="text-xs text-zinc-500 transition-colors hover:text-red-400"
                    >
                      Remove
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
