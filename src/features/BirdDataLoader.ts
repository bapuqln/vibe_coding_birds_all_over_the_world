import regionIndex from "../data/bird-regions/index.json";
import type { Bird } from "../types";
import { getAllBirds } from "../systems/BirdSystem";

type RegionIndexFile = {
  regions: { id: string; file: string }[];
};

const index = regionIndex as RegionIndexFile;
const regionCache = new Map<string, Bird[]>();

export async function loadBirdIndex(): Promise<RegionIndexFile> {
  return index;
}

export async function loadRegion(regionId: string): Promise<Bird[]> {
  if (regionCache.has(regionId)) {
    return regionCache.get(regionId)!;
  }

  try {
    const mod = await import(/* @vite-ignore */ `../data/bird-regions/${regionId}.json`);
    const raw = mod.default as unknown;
    if (Array.isArray(raw) && raw.length > 0) {
      regionCache.set(regionId, raw as Bird[]);
      return raw as Bird[];
    }
  } catch {
    /* use monolithic fallback */
  }

  const fallback = getAllBirds().filter((b) => b.region === regionId);
  regionCache.set(regionId, fallback);
  return fallback;
}

export function getAllLoadedBirds(): Bird[] {
  const merged: Bird[] = [];
  for (const birds of regionCache.values()) {
    merged.push(...birds);
  }
  return merged;
}

export function isRegionLoaded(regionId: string): boolean {
  return regionCache.has(regionId);
}
