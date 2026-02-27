import { PILLAR_KEYWORDS } from "./constants";
import type { PillarId, ContentType } from "./types";

const SOURCE_WEIGHTS: Record<ContentType, number> = {
  youtube: 25,
  article: 20,
  reddit: 15,
  twitter: 10,
  other: 10,
};

export function computeScore(
  title: string,
  summary: string,
  pillar: PillarId,
  type: ContentType,
  publishedAt: string
): number {
  const recency = recencyScore(publishedAt);
  const sourceWeight = SOURCE_WEIGHTS[type];
  const keyword = keywordScore(title, summary, pillar);
  return Math.round(Math.min(100, recency + sourceWeight + keyword));
}

function recencyScore(publishedAt: string): number {
  const ageMs = Date.now() - new Date(publishedAt).getTime();
  const ageHours = ageMs / (1000 * 60 * 60);
  if (ageHours < 1) return 50;
  if (ageHours < 6) return 40;
  if (ageHours < 24) return 30;
  if (ageHours < 72) return 20;
  if (ageHours < 168) return 10;
  return 5;
}

function keywordScore(title: string, summary: string, pillar: PillarId): number {
  const text = `${title} ${summary}`.toLowerCase();
  const keywords = PILLAR_KEYWORDS[pillar];
  let matches = 0;
  for (const kw of keywords) {
    if (text.includes(kw)) matches++;
  }
  // Cap at 20 points, scale by number of matches
  return Math.min(20, matches * 4);
}
