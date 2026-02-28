import { z } from "zod";

export const PillarId = z.enum(["ai-health", "tech-news", "finance-tools"]);
export type PillarId = z.infer<typeof PillarId>;

export const ContentType = z.enum(["youtube", "article", "reddit", "twitter", "other"]);
export type ContentType = z.infer<typeof ContentType>;

export const SourceSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  url: z.string().url(),
  pillar: PillarId,
  type: ContentType,
  enabled: z.boolean(),
});
export type Source = z.infer<typeof SourceSchema>;

export const FeedItemSchema = z.object({
  id: z.string(),
  title: z.string(),
  url: z.string(),
  summary: z.string(),
  sourceId: z.string(),
  sourceName: z.string(),
  pillar: PillarId,
  type: ContentType,
  tags: z.array(z.string()),
  score: z.number().min(0).max(100),
  publishedAt: z.string(),
  fetchedAt: z.string(),
});
export type FeedItem = z.infer<typeof FeedItemSchema>;

export const ItemStateSchema = z.object({
  saved: z.boolean().default(false),
  starred: z.boolean().default(false),
  skipped: z.boolean().default(false),
  seen: z.boolean().default(false),
  note: z.string().default(""),
  takeaway: z.string().default(""),
  collections: z.array(z.string()).default([]),
});
export type ItemState = z.infer<typeof ItemStateSchema>;

export const CollectionSchema = z.object({
  id: z.string(),
  name: z.string().min(1),
  createdAt: z.string(),
});
export type Collection = z.infer<typeof CollectionSchema>;

export const FilterStateSchema = z.object({
  pillars: z.array(PillarId).default([]),
  types: z.array(ContentType).default([]),
  timeRange: z.enum(["1h", "6h", "24h", "7d", "30d", "all"]).default("24h"),
  highSignalOnly: z.boolean().default(false),
  newOnly: z.boolean().default(false),
  search: z.string().default(""),
});
export type FilterState = z.infer<typeof FilterStateSchema>;

export const AppDataSchema = z.object({
  sources: z.array(SourceSchema),
  items: z.record(z.string(), FeedItemSchema),
  itemStates: z.record(z.string(), ItemStateSchema),
  collections: z.array(CollectionSchema),
  lastFetchedAt: z.string().nullable(),
  lastCheckedAt: z.string().nullable(),
});
export type AppData = z.infer<typeof AppDataSchema>;
