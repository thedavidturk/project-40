import { NextResponse } from "next/server";
import Parser from "rss-parser";
import { normalizeUrl } from "@/lib/normalizeUrl";
import { computeScore } from "@/lib/scoring";
import { assignTags } from "@/lib/tagger";
import type { Source, FeedItem, ContentType, PillarId } from "@/lib/types";

const parser = new Parser({
  timeout: 10000,
  headers: {
    "User-Agent": "PillarsRadar/1.0",
  },
  customFields: {
    item: [
      ["media:content", "mediaContent"],
      ["media:thumbnail", "mediaThumbnail"],
    ],
  },
});

interface IngestRequest {
  sources: Source[];
}

function detectType(url: string, feedUrl: string): ContentType {
  if (url.includes("youtube.com") || url.includes("youtu.be") || feedUrl.includes("youtube.com")) return "youtube";
  if (url.includes("reddit.com") || feedUrl.includes("reddit.com")) return "reddit";
  if (url.includes("twitter.com") || url.includes("x.com")) return "twitter";
  return "article";
}

function makeId(url: string): string {
  // Simple hash from normalized URL
  let hash = 0;
  for (let i = 0; i < url.length; i++) {
    const char = url.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return Math.abs(hash).toString(36);
}

async function fetchFeed(
  source: Source
): Promise<FeedItem[]> {
  const feed = await parser.parseURL(source.url);
  const items: FeedItem[] = [];

  for (const entry of feed.items ?? []) {
    const rawUrl = entry.link ?? entry.guid ?? "";
    if (!rawUrl) continue;

    const url = normalizeUrl(rawUrl);
    const title = (entry.title ?? "").trim();
    const summary = (
      entry.contentSnippet ??
      entry.content ??
      entry.summary ??
      ""
    )
      .replace(/<[^>]*>/g, "")
      .slice(0, 300)
      .trim();

    const publishedAt =
      entry.isoDate ?? entry.pubDate ?? new Date().toISOString();
    const type = detectType(url, source.url);
    const pillar: PillarId = source.pillar;
    const score = computeScore(title, summary, pillar, type, publishedAt);
    const tags = assignTags(title, summary, pillar);
    const id = makeId(url);

    // Extract image URL from common RSS media fields
    const entryAny = entry as unknown as Record<string, unknown>;
    const enclosure = entryAny.enclosure as { url?: string; type?: string } | undefined;
    const mediaContent = entryAny.mediaContent as { $?: { url?: string } } | undefined;
    const mediaThumbnail = entryAny.mediaThumbnail as { $?: { url?: string } } | undefined;
    const imageUrl =
      (enclosure?.type?.startsWith("image/") ? enclosure.url : undefined) ??
      mediaContent?.$?.url ??
      mediaThumbnail?.$?.url;

    items.push({
      id,
      title,
      url,
      summary,
      ...(imageUrl ? { imageUrl } : {}),
      sourceId: source.id,
      sourceName: source.name,
      pillar,
      type,
      tags,
      score,
      publishedAt,
      fetchedAt: new Date().toISOString(),
    });
  }

  return items;
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IngestRequest;
    const sources = body.sources?.filter((s) => s.enabled) ?? [];

    if (sources.length === 0) {
      return NextResponse.json({ items: [] });
    }

    const results = await Promise.allSettled(
      sources.map((s) => fetchFeed(s))
    );

    const allItems: FeedItem[] = [];
    const seen = new Set<string>();

    for (const result of results) {
      if (result.status === "fulfilled") {
        for (const item of result.value) {
          if (!seen.has(item.id)) {
            seen.add(item.id);
            allItems.push(item);
          }
        }
      }
    }

    // Sort by score descending
    allItems.sort((a, b) => b.score - a.score);

    return NextResponse.json({ items: allItems });
  } catch (error) {
    console.error("Ingest error:", error);
    return NextResponse.json(
      { error: "Failed to ingest feeds" },
      { status: 500 }
    );
  }
}
