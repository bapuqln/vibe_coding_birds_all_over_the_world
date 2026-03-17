import type { CachedExplanation } from "../types";

const CACHE_PREFIX = "bird-guide-cache-";
const INDEX_KEY = "bird-guide-cache-index";
const MAX_ENTRIES = 200;

function getIndex(): string[] {
  try {
    const raw = localStorage.getItem(INDEX_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveIndex(index: string[]) {
  try {
    localStorage.setItem(INDEX_KEY, JSON.stringify(index));
  } catch { /* quota exceeded */ }
}

export function getCachedExplanation(birdId: string): CachedExplanation | null {
  try {
    const raw = localStorage.getItem(CACHE_PREFIX + birdId);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CachedExplanation;
    if (parsed.text && parsed.textZh) {
      const index = getIndex();
      const filtered = index.filter((id) => id !== birdId);
      filtered.push(birdId);
      saveIndex(filtered);
      return parsed;
    }
    return null;
  } catch {
    return null;
  }
}

export function setCachedExplanation(
  birdId: string,
  text: string,
  textZh: string,
) {
  const entry: CachedExplanation = { text, textZh, timestamp: Date.now() };

  try {
    const index = getIndex();
    const filtered = index.filter((id) => id !== birdId);
    filtered.push(birdId);

    while (filtered.length > MAX_ENTRIES) {
      const evicted = filtered.shift();
      if (evicted) {
        localStorage.removeItem(CACHE_PREFIX + evicted);
      }
    }

    localStorage.setItem(CACHE_PREFIX + birdId, JSON.stringify(entry));
    saveIndex(filtered);
  } catch { /* quota exceeded */ }
}

export function clearExplanationCache() {
  const index = getIndex();
  for (const id of index) {
    localStorage.removeItem(CACHE_PREFIX + id);
  }
  localStorage.removeItem(INDEX_KEY);
}
