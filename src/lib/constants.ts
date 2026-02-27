import type { PillarId, ContentType } from "./types";

export const PILLARS: Record<PillarId, { label: string; color: string; bgClass: string; textClass: string }> = {
  "ai-health": {
    label: "AI + Health",
    color: "#10b981",
    bgClass: "bg-emerald-500",
    textClass: "text-emerald-400",
  },
  "tech-news": {
    label: "Tech News",
    color: "#3b82f6",
    bgClass: "bg-blue-500",
    textClass: "text-blue-400",
  },
  "finance-tools": {
    label: "Finance Tools",
    color: "#f59e0b",
    bgClass: "bg-amber-500",
    textClass: "text-amber-400",
  },
};

export const CONTENT_TYPE_LABELS: Record<ContentType, string> = {
  youtube: "YouTube",
  article: "Article",
  reddit: "Reddit",
  twitter: "X / Twitter",
  other: "Other",
};

export const PILLAR_KEYWORDS: Record<PillarId, string[]> = {
  "ai-health": [
    "ai", "artificial intelligence", "machine learning", "llm", "gpt", "claude", "openai", "anthropic",
    "health", "longevity", "fitness", "nutrition", "sleep", "biohacking", "supplement", "exercise",
    "wearable", "biomarker", "zone 2", "vo2max", "cgm", "peptide", "nad+", "rapamycin",
    "deep learning", "neural network", "transformer", "diffusion", "agent", "agi",
  ],
  "tech-news": [
    "startup", "saas", "product launch", "funding", "acquisition", "ipo", "tech",
    "apple", "google", "microsoft", "meta", "amazon", "nvidia", "software", "hardware",
    "cybersecurity", "cloud", "devops", "api", "open source", "developer", "programming",
    "robotics", "quantum", "semiconductor", "chip",
  ],
  "finance-tools": [
    "finance", "fintech", "banking", "investing", "trading", "stock", "etf", "bond",
    "crypto", "bitcoin", "ethereum", "defi", "yield", "dividend", "portfolio",
    "budgeting", "automation", "accounting", "tax", "revenue", "profit", "cash flow",
    "stripe", "plaid", "quickbooks", "mint",
  ],
};

export const CACHE_TTL_MS = 60 * 60 * 1000; // 1 hour
export const HIGH_SIGNAL_THRESHOLD = 50;
export const STORAGE_KEY = "pillars-radar-data";
export const MAX_STORED_ITEMS = 2000;
