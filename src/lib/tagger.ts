import { PILLAR_KEYWORDS } from "./constants";
import type { PillarId } from "./types";

const TAG_RULES: { pattern: RegExp; tag: string }[] = [
  { pattern: /\b(tutorial|how[ -]to|guide|walkthrough)\b/i, tag: "tutorial" },
  { pattern: /\b(launch|released|announces?|introducing)\b/i, tag: "launch" },
  { pattern: /\b(review|comparison|vs\.?|versus)\b/i, tag: "review" },
  { pattern: /\b(breaking|urgent|just in)\b/i, tag: "breaking" },
  { pattern: /\b(research|study|paper|findings)\b/i, tag: "research" },
  { pattern: /\b(opinion|editorial|take|rant)\b/i, tag: "opinion" },
  { pattern: /\b(tool|app|software|platform)\b/i, tag: "tool" },
  { pattern: /\b(funding|raised|series [a-e]|seed|acquisition)\b/i, tag: "funding" },
  { pattern: /\b(open[ -]source|github|repo)\b/i, tag: "open-source" },
  { pattern: /\b(podcast|episode|interview)\b/i, tag: "podcast" },
];

export function assignTags(title: string, summary: string, pillar: PillarId): string[] {
  const text = `${title} ${summary}`;
  const tags: string[] = [];

  // Rule-based tags
  for (const rule of TAG_RULES) {
    if (rule.pattern.test(text)) {
      tags.push(rule.tag);
    }
  }

  // Add matching pillar keywords as tags (top 3)
  const keywords = PILLAR_KEYWORDS[pillar];
  const lowerText = text.toLowerCase();
  const matched = keywords.filter((kw) => lowerText.includes(kw));
  for (const kw of matched.slice(0, 3)) {
    if (!tags.includes(kw)) tags.push(kw);
  }

  return tags.slice(0, 6);
}
