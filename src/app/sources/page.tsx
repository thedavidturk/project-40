"use client";

import { useAppData } from "@/lib/hooks/useAppData";
import { SourceManager } from "@/components/SourceManager";

export default function SourcesPage() {
  const { data, updateSource, addSource, removeSource } = useAppData();

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Sources</h1>
      <SourceManager
        sources={data.sources}
        onUpdate={updateSource}
        onAdd={addSource}
        onRemove={removeSource}
      />
    </div>
  );
}
