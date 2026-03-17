import birdsData from "../data/birds.json";
import type { Bird } from "../types";

const allBirds = birdsData as Bird[];
const birdMap = new Map(allBirds.map((b) => [b.id, b]));

export function getAllBirds(): Bird[] {
  return allBirds;
}

export function getBirdById(id: string): Bird | undefined {
  return birdMap.get(id);
}

export function getBirdsByRegion(region: string): Bird[] {
  return allBirds.filter((b) => b.region === region);
}

export function getRegions(): string[] {
  return [...new Set(allBirds.map((b) => b.region))];
}

export function getBirdCount(): number {
  return allBirds.length;
}

export function getRegionBirdCounts(): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const bird of allBirds) {
    counts[bird.region] = (counts[bird.region] || 0) + 1;
  }
  return counts;
}
