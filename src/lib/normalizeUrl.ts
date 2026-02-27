export function normalizeUrl(raw: string): string {
  try {
    const url = new URL(raw);
    // Strip UTM and tracking params
    const trackingPrefixes = ["utm_", "ref", "fbclid", "gclid", "mc_", "s_"];
    for (const key of [...url.searchParams.keys()]) {
      if (trackingPrefixes.some((p) => key.startsWith(p))) {
        url.searchParams.delete(key);
      }
    }
    // Remove www prefix
    url.hostname = url.hostname.replace(/^www\./, "");
    // Remove trailing slash
    let normalized = url.toString();
    if (normalized.endsWith("/")) {
      normalized = normalized.slice(0, -1);
    }
    return normalized;
  } catch {
    return raw;
  }
}
